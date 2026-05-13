const nodemailer = require("nodemailer");
const { renderEmail } = require("./renderEmail");

let cachedTransporter;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  let smtp;
  try {
    const { getSmtpConfig } = require("../helpers/runtime");
    smtp = getSmtpConfig();
  } catch { smtp = null; }

  const host = smtp?.smtp_host || process.env.SMTP_HOST;
  const port = Number(smtp?.smtp_port || process.env.SMTP_PORT) || 465;
  const secure = String(smtp?.smtp_secure ?? process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
  const user = smtp?.smtp_user || process.env.SMTP_USER;
  const pass = smtp?.smtp_pass || process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  return cachedTransporter;
}

function smtpFrom() {
  try {
    const { getSmtpConfig } = require("../helpers/runtime");
    return getSmtpConfig()?.smtp_from || process.env.SMTP_FROM;
  } catch { return process.env.SMTP_FROM; }
}

function smtpReplyTo() {
  try {
    const { getSmtpConfig } = require("../helpers/runtime");
    const cfg = getSmtpConfig();
    return cfg?.smtp_reply_to || process.env.SMTP_REPLY_TO || cfg?.smtp_from || process.env.SMTP_FROM;
  } catch { return process.env.SMTP_REPLY_TO || process.env.SMTP_FROM; }
}

function resetTransporter() { cachedTransporter = null; }

/** Send a templated email by slug. ctx is interpolated into subject/preview/body. */
async function sendTemplate(slug, recipient, ctx = {}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[email] SMTP not configured, skipping ${slug} → ${recipient}`);
    return null;
  }
  if (!recipient) {
    console.warn(`[email] No recipient, skipping ${slug}`);
    return null;
  }
  const rendered = await renderEmail(slug, ctx);
  if (!rendered) {
    console.warn(`[email] Template ${slug} disabled or missing — skipping.`);
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: smtpFrom(),
      to: recipient,
      replyTo: smtpReplyTo(),
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      headers: { "X-CR-Template": slug },
    });
    console.log(`[email] ${slug} → ${recipient} (${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[email] ${slug} → ${recipient} failed:`, err.message);
    return null;
  }
}

// ── Concrete senders ────────────────────────────────────────────
async function sendLeadAutoresponse(lead) {
  return sendTemplate("lead-autoresponse", lead.email, {
    firstName: lead.firstName || "there",
    lastName: lead.lastName || "",
    email: lead.email,
    phone: lead.phone || "",
    state: lead.state || "",
  });
}

async function sendCheckoutWelcome(submission) {
  const fmtMoney = (c) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return sendTemplate("checkout-welcome", submission.email, {
    firstName: submission.firstName,
    lastName: submission.lastName,
    paymentPlan: submission.paymentPlan,
    paymentPlanLabel: submission.paymentPlan === "upfront" ? "Upfront (paid in full)" : "Monthly (6 × $400)",
    totalPaid: fmtMoney(submission.totalPaidCents || 0),
  });
}

async function sendMonthlyPaid(submission) {
  const fmtMoney = (c) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return sendTemplate("monthly-invoice-paid", submission.email, {
    firstName: submission.firstName,
    monthsBilled: submission.monthsBilled,
    monthsRemaining: Math.max(0, 6 - (submission.monthsBilled || 0)),
    totalPaid: fmtMoney(submission.totalPaidCents || 0),
  });
}

async function sendProgramCompleted(submission) {
  const fmtMoney = (c) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return sendTemplate("program-completed", submission.email, {
    firstName: submission.firstName,
    totalPaid: fmtMoney(submission.totalPaidCents || 0),
  });
}

async function sendPaymentFailed(submission) {
  return sendTemplate("payment-failed", submission.email, {
    firstName: submission.firstName,
    monthsBilled: submission.monthsBilled,
  });
}

module.exports = {
  sendTemplate,
  sendLeadAutoresponse,
  sendCheckoutWelcome,
  sendMonthlyPaid,
  sendProgramCompleted,
  sendPaymentFailed,
  resetTransporter,
};
