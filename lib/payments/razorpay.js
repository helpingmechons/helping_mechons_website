/**
 * lib/payments/razorpay.js — server-only Razorpay helpers.
 * Never import this from a client component.
 */
import crypto from "node:crypto";
import Razorpay from "razorpay";

let rz;
export function getRazorpay() {
  if (!rz) {
    rz = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return rz;
}

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Proves a checkout really paid us, using only server-side facts:
 *  1. razorpay_signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 *     (Razorpay's documented checkout verification), and
 *  2. the payment, fetched from Razorpay's API, belongs to that order and
 *     is authorized/captured.
 *
 * @returns {{ paymentId: string, orderId: string, amountRupees: number }}
 * @throws  if anything doesn't check out
 */
export async function verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!isRazorpayConfigured()) throw new Error("Razorpay is not configured.");
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error("Missing Razorpay payment details.");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const given = String(razorpay_signature);
  if (given.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    throw new Error("Invalid Razorpay signature.");
  }

  const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
  if (payment.order_id !== razorpay_order_id) throw new Error("Payment does not belong to this order.");
  if (!["authorized", "captured"].includes(payment.status)) {
    throw new Error(`Payment is not complete (status: ${payment.status}).`);
  }

  return { paymentId: payment.id, orderId: payment.order_id, amountRupees: Number(payment.amount) / 100 };
}
