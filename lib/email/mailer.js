import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = `"${process.env.SMTP_FROM_NAME || "Helping Mechons"}" <${process.env.SMTP_FROM_EMAIL || "helpingmechons@gmail.com"}>`;

export async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransport();
  const result = await transporter.sendMail({ from: FROM, to, subject, html, text });
  return result;
}

// ── Email Templates ────────────────────────────────────────────────────────────

export function donationReceivedEmail({ donorName, amount, ref }) {
  const subject = "Thank You — Donation Received | Helping Mechons";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f8f9fa; margin:0; padding:0; }
    .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(4,22,39,.08); }
    .header { background:#041627; padding:32px 40px; text-align:center; }
    .header h1 { font-family: Georgia,serif; color:#fff; margin:0; font-size:24px; }
    .header p  { color:#8192a7; margin:8px 0 0; font-size:14px; }
    .body { padding:40px; }
    .body p  { color:#44474c; line-height:1.7; }
    .amount  { background:#f3f4f5; border-left:4px solid #9a442d; padding:16px 24px; border-radius:4px; margin:24px 0; }
    .amount strong { font-size:28px; color:#041627; }
    .cta { text-align:center; margin:32px 0; }
    .cta a { background:#9a442d; color:#fff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:14px; letter-spacing:.05em; }
    .footer { background:#f3f4f5; padding:24px 40px; text-align:center; font-size:12px; color:#74777d; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Helping Mechons</h1>
    <p>Healing Lives, One Mission at a Time</p>
  </div>
  <div class="body">
    <p>Dear <strong>${donorName}</strong>,</p>
    <p>We have received your donation and our team is currently reviewing it. You will receive a confirmation email with your official receipt once the donation is verified and approved.</p>
    <div class="amount">
      <p style="margin:0 0 4px;font-size:12px;color:#74777d;letter-spacing:.05em;text-transform:uppercase;">Donation Amount</p>
      <strong>₹${Number(amount).toLocaleString("en-IN")}</strong>
    </div>
    ${ref ? `<p style="font-size:14px;color:#74777d;">Transaction Reference: <code>${ref}</code></p>` : ""}
    <p>Your generosity is the reason communities receive food, medical care, and education. Thank you for standing with us.</p>
    <div class="cta">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "#"}">Visit Our Website</a>
    </div>
  </div>
  <div class="footer">
    <p>Helping Mechons | helpingmechons@gmail.com</p>
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</div>
</body>
</html>`;
  return { subject, html };
}

export function donationApprovedEmail({ donorName, amount, donationId, campaignTitle }) {
  const subject = "Donation Approved — Official Receipt | Helping Mechons";
  const receiptUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/profile`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f8f9fa; margin:0; padding:0; }
    .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(4,22,39,.08); }
    .header { background:#041627; padding:32px 40px; text-align:center; }
    .header h1 { font-family: Georgia,serif; color:#fff; margin:0; font-size:24px; }
    .badge { display:inline-block; background:#9a442d; color:#fff; padding:4px 16px; border-radius:99px; font-size:12px; font-weight:600; letter-spacing:.08em; margin-top:12px; }
    .body { padding:40px; }
    .body p { color:#44474c; line-height:1.7; }
    .receipt-box { border:1px solid #c4c6cd; border-radius:8px; padding:24px; margin:24px 0; }
    .receipt-box .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #edeeef; font-size:14px; }
    .receipt-box .row:last-child { border-bottom:none; }
    .receipt-box .row .label { color:#74777d; }
    .receipt-box .row .value { color:#041627; font-weight:600; }
    .cta { text-align:center; margin:32px 0; }
    .cta a { background:#9a442d; color:#fff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:14px; letter-spacing:.05em; }
    .footer { background:#f3f4f5; padding:24px 40px; text-align:center; font-size:12px; color:#74777d; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Helping Mechons</h1>
    <span class="badge">✓ Donation Approved</span>
  </div>
  <div class="body">
    <p>Dear <strong>${donorName}</strong>,</p>
    <p>Wonderful news — your donation has been verified and approved! Here is your official receipt.</p>
    <div class="receipt-box">
      <div class="row"><span class="label">Donor Name</span><span class="value">${donorName}</span></div>
      <div class="row"><span class="label">Amount</span><span class="value">₹${Number(amount).toLocaleString("en-IN")}</span></div>
      ${campaignTitle ? `<div class="row"><span class="label">Campaign</span><span class="value">${campaignTitle}</span></div>` : ""}
      <div class="row"><span class="label">Reference ID</span><span class="value">${donationId}</span></div>
      <div class="row"><span class="label">Status</span><span class="value">✓ Approved</span></div>
    </div>
    <p>You can view your full donation history and download receipts from your profile dashboard.</p>
    <div class="cta">
      <a href="${receiptUrl}">View My Donations</a>
    </div>
    <p style="font-size:14px;color:#74777d;text-align:center;">On behalf of every family we serve — thank you. 🙏</p>
  </div>
  <div class="footer">
    <p>Helping Mechons | helpingmechons@gmail.com</p>
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</div>
</body>
</html>`;
  return { subject, html };
}

export function donationRejectedEmail({ donorName, amount, reason }) {
  const subject = "Donation Update | Helping Mechons";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f8f9fa; margin:0; padding:0; }
    .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(4,22,39,.08); }
    .header { background:#041627; padding:32px 40px; text-align:center; }
    .header h1 { font-family: Georgia,serif; color:#fff; margin:0; font-size:24px; }
    .body { padding:40px; }
    .body p { color:#44474c; line-height:1.7; }
    .alert { background:#ffdad6; border-left:4px solid #ba1a1a; padding:16px 24px; border-radius:4px; margin:24px 0; color:#93000a; }
    .cta { text-align:center; margin:32px 0; }
    .cta a { background:#9a442d; color:#fff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:14px; }
    .footer { background:#f3f4f5; padding:24px 40px; text-align:center; font-size:12px; color:#74777d; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header"><h1>Helping Mechons</h1></div>
  <div class="body">
    <p>Dear <strong>${donorName}</strong>,</p>
    <p>We were unable to verify your donation of <strong>₹${Number(amount).toLocaleString("en-IN")}</strong> and it has been marked as rejected by our team.</p>
    ${reason ? `<div class="alert"><strong>Reason:</strong> ${reason}</div>` : ""}
    <p>If you believe this is an error or need assistance, please reply to this email with your transaction proof and we will resolve it within 24 hours.</p>
    <div class="cta"><a href="${process.env.NEXT_PUBLIC_SITE_URL || "#"}/donate">Try Again</a></div>
  </div>
  <div class="footer">
    <p>Helping Mechons | helpingmechons@gmail.com</p>
  </div>
</div>
</body>
</html>`;
  return { subject, html };
}
