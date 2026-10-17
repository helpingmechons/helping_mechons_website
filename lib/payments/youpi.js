/**
 * lib/payments/youpi.js — server-only helpers for the YouPI PG gateway.
 *
 * YouPI PG (https://github.com/gxurav1710/YouPI-PG) is a SELF-HOSTED UPI
 * gateway: 0% fees, money lands straight in the NGO's bank account, and
 * payments are confirmed by reading the bank's credit SMS / email.
 * It runs on our own always-on machine (NOT on Vercel) — see README
 * "YouPI PG setup". This file is only the website side of the contract:
 *
 *   1. createYoupiPayment()  → POST {YOUPI_API_URL}/api/v1/payments
 *                              returns a hosted checkoutUrl we redirect to.
 *   2. verifyYoupiSignature() → checks the HMAC-SHA256 on incoming webhooks
 *                              (X-Gateway-Signature: sha256=<hex>, computed
 *                              over the raw body with the merchant webhook
 *                              secret).
 *   3. getYoupiPayment()     → GET  {YOUPI_API_URL}/api/v1/payments/:id
 *                              used as a fallback if a webhook is missed.
 *   4. applyYoupiOutcome()   → the ONE place a YouPI donation changes state.
 *                              Both the webhook and the status poller call it.
 *
 * Never import this from a client component.
 */
import crypto from "node:crypto";
import { revalidatePublicPages } from "@/lib/revalidate";
import { sendEmail, donationApprovedEmail } from "@/lib/email/mailer";

const API_URL        = (process.env.YOUPI_API_URL || "").replace(/\/+$/, "");
const MERCHANT_ID    = process.env.YOUPI_MERCHANT_ID || "";
const WEBHOOK_SECRET = process.env.YOUPI_WEBHOOK_SECRET || "";

export function isYoupiConfigured() {
  return Boolean(API_URL && WEBHOOK_SECRET);
}

/** Our order id → donation id. orderId is "HM-<donationId>", but the gateway
 *  appends "-R1234" when it re-creates a session, so strip that too. */
export function donationIdFromOrderId(orderId) {
  const m = /^HM-([0-9a-f-]{36})(?:-R\d+)?$/i.exec(String(orderId || ""));
  return m ? m[1] : null;
}

const toPaise = (rupees) => Math.round(Number(rupees) * 100);

export async function createYoupiPayment({ donationId, amount, returnUrl, customer, metadata }) {
  const headers = { "Content-Type": "application/json", "Idempotency-Key": donationId };
  if (MERCHANT_ID) headers["X-Merchant-Id"] = MERCHANT_ID;

  const res = await fetch(`${API_URL}/api/v1/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      orderId:  `HM-${donationId}`,
      amount:   Number(amount).toFixed(2),
      currency: "INR",
      returnUrl,
      customer,
      // donationId travels in metadata too, because the gateway may rewrite
      // orderId on retries — metadata comes back untouched in webhooks.
      metadata: { ...metadata, donationId },
    }),
    signal: AbortSignal.timeout(15000),
    cache:  "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`YouPI create payment failed [HTTP ${res.status}]: ${text.slice(0, 300)}`);
  }
  return res.json(); // { paymentId, orderId, amount, amountPaise, status, checkoutUrl }
}

export async function getYoupiPayment(paymentId) {
  const res = await fetch(`${API_URL}/api/v1/payments/${encodeURIComponent(paymentId)}`, {
    signal: AbortSignal.timeout(10000),
    cache:  "no-store",
  });
  if (!res.ok) throw new Error(`YouPI get payment failed [HTTP ${res.status}]`);
  return res.json();
}

/** Constant-time check of "sha256=<hex>" against HMAC(rawBody). */
export function verifyYoupiSignature(rawBody, signatureHeader) {
  if (!WEBHOOK_SECRET || !signatureHeader?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody, "utf8").digest("hex");
  const given    = signatureHeader.slice("sha256=".length);
  if (!/^[0-9a-f]{64}$/i.test(given)) return false;
  return crypto.timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}

/**
 * Applies a gateway outcome to a donation. Idempotent: every state change is
 * a conditional UPDATE on the current status, so a webhook retry racing a
 * status poll can only ever win once (and only the winner writes the ledger
 * and sends the receipt).
 *
 * @param adminSb   service-role Supabase client
 * @param donation  the donations row (must be payment_mode = 'youpi')
 * @param payment   { event|status, paymentId, amountPaise, method }
 *                  — from a signature-verified webhook, or from our own
 *                  server-to-server getYoupiPayment() call. Never from the
 *                  browser.
 * @returns the donation's resulting status
 */
export async function applyYoupiOutcome(adminSb, donation, payment) {
  if (donation.payment_mode !== "youpi") return donation.status;

  const outcome = String(payment.event || payment.status || "").toUpperCase();
  const open    = ["awaiting_payment", "pending"];

  const transition = async (fields, from = open) => {
    const { data } = await adminSb
      .from("donations")
      .update(fields)
      .eq("id", donation.id)
      .in("status", from)
      .select("*, campaigns(title)")
      .maybeSingle();
    return data; // null → someone else already moved it
  };

  if (outcome === "SUCCESS") {
    const method = String(payment.method || "UPI").toUpperCase();
    if (method !== "UPI") {
      // COD / cash-at-counter "succeed" without any money arriving.
      // Not valid for a donation — leave it for an admin to look at.
      await transition({ status: "pending" }, ["awaiting_payment"]);
      console.warn(`YouPI: donation ${donation.id} completed with method ${method}; held for admin review.`);
      return "pending";
    }

    if (Number(payment.amountPaise) !== toPaise(donation.final_amount)) {
      await transition({ status: "pending" }, ["awaiting_payment"]);
      console.warn(`YouPI: amount mismatch on ${donation.id} (got ${payment.amountPaise} paise, expected ${toPaise(donation.final_amount)}); held for admin review.`);
      return "pending";
    }

    const updated = await transition({
      status:          "approved",
      approved_at:     new Date().toISOString(),
      transaction_ref: payment.paymentId || donation.transaction_ref,
    });
    if (!updated) return currentStatus(adminSb, donation.id);

    const receiptAmount = Number(updated.final_amount || updated.amount);
    const campaignTitle = updated.campaigns?.title || null;

    const { error: ledgerErr } = await adminSb.from("ledger_entries").insert({
      type:           "credit",
      amount:         receiptAmount,
      note:           `Donation from ${updated.donor_name} (YouPI UPI, auto-verified)`,
      category:       campaignTitle ? "donation" : "General",
      reference_type: "donation",
      reference_id:   updated.id,
      created_by:     null,
    });
    if (ledgerErr) console.error("YouPI ledger insert error:", ledgerErr.message);

    try {
      const emailContent = donationApprovedEmail({
        donorName: updated.donor_name, amount: receiptAmount, donationId: updated.id, campaignTitle,
      });
      await sendEmail({ to: updated.email, ...emailContent });
      await adminSb.from("email_logs").insert({
        recipient_email: updated.email,
        subject:         emailContent.subject,
        status:          "sent",
        donation_id:     updated.id,
        template_type:   "donation_approved",
      });
    } catch (emailErr) {
      console.error("YouPI receipt email failed:", emailErr.message);
    }

    revalidatePublicPages();
    return "approved";
  }

  if (outcome === "FAILED") {
    // Donor tapped "I've paid" but no bank alert matched within the
    // verification window. They may well have paid — send it to the
    // admin's manual-verification queue rather than rejecting it.
    await transition({ status: "pending" }, ["awaiting_payment"]);
    return "pending";
  }

  if (outcome === "EXPIRED" || outcome === "CANCELLED") {
    await transition({
      status:           "rejected",
      rejection_reason: outcome === "CANCELLED"
        ? "Donor cancelled the UPI checkout"
        : "UPI checkout expired before payment was confirmed",
    }, ["awaiting_payment"]);
    return "rejected";
  }

  return donation.status; // INITIATED / ACTIVE / QUEUED / PROCESSING — still in flight
}

async function currentStatus(adminSb, id) {
  const { data } = await adminSb.from("donations").select("status").eq("id", id).maybeSingle();
  return data?.status || "awaiting_payment";
}

