/**
 * Runtime helpers — Stripe, SMTP and email-toggle settings cached from DB.
 * Refreshed via /api/admin/settings PUT.
 */
const prisma = require("../db");

let _stripe = null;
let _stripeSettings = {};
let _smtpConfig = null;
let _awsSettings = {};

function loadEnvDefaults(prefix, fields) {
  const defaults = {};
  for (const [settingKey, envKey] of Object.entries(fields)) {
    if (process.env[envKey] !== undefined) {
      defaults[settingKey] = process.env[envKey];
    }
  }
  return defaults;
}

async function loadSettingsGroup(group, defaults = {}) {
  const rows = await prisma.setting.findMany({ where: { group } });
  const map = { ...defaults };
  for (const row of rows) map[row.key] = row.value;
  return map;
}

// ── Stripe ──────────────────────────────────────────────────────
async function loadStripeSettings() {
  return loadSettingsGroup("stripe", {
    stripe_mode: process.env.STRIPE_MODE || "test",
    stripe_test_publishable_key: process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "",
    stripe_test_secret_key: process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "",
    stripe_test_webhook_secret: process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "",
    stripe_live_publishable_key: process.env.STRIPE_LIVE_PUBLISHABLE_KEY || "",
    stripe_live_secret_key: process.env.STRIPE_LIVE_SECRET_KEY || "",
    stripe_live_webhook_secret: process.env.STRIPE_LIVE_WEBHOOK_SECRET || "",
    stripe_monthly_amount_cents: process.env.STRIPE_MONTHLY_AMOUNT_CENTS || "40000",
    stripe_monthly_months: process.env.STRIPE_MONTHLY_MONTHS || "6",
    stripe_upfront_amount_cents: process.env.STRIPE_UPFRONT_AMOUNT_CENTS || "200000",
    stripe_upfront_savings_label: process.env.STRIPE_UPFRONT_SAVINGS_LABEL || "Save $400",
    stripe_monthly_price_id: process.env.STRIPE_MONTHLY_PRICE_ID || "",
  });
}

async function refreshStripe() {
  const s = await loadStripeSettings();
  _stripeSettings = s;
  const mode = s.stripe_mode || "test";
  const secretKey =
    mode === "live" ? s.stripe_live_secret_key : s.stripe_test_secret_key;
  if (secretKey) {
    _stripe = require("stripe")(secretKey);
  } else {
    _stripe = null;
  }
  return _stripe;
}

function getStripe() {
  return _stripe;
}

function getStripeSettings() {
  return _stripeSettings;
}

// ── SMTP ────────────────────────────────────────────────────────
async function loadSmtpSettings() {
  return loadSettingsGroup("smtp", {
    smtp_host: process.env.SMTP_HOST || "",
    smtp_port: process.env.SMTP_PORT || "465",
    smtp_secure: process.env.SMTP_SECURE || "true",
    smtp_user: process.env.SMTP_USER || "",
    smtp_pass: process.env.SMTP_PASS || "",
    smtp_from: process.env.SMTP_FROM || "",
    smtp_reply_to: process.env.SMTP_REPLY_TO || process.env.SMTP_FROM || "",
  });
}

async function refreshSmtp() {
  _smtpConfig = await loadSmtpSettings();
  try { require("../email/mailer").resetTransporter(); } catch {}
  return _smtpConfig;
}

function getSmtpConfig() {
  return _smtpConfig;
}

// ── AWS runtime ──────────────────────────────────────────────────
async function loadAwsSettings() {
  return loadSettingsGroup(
    "aws",
    loadEnvDefaults("aws", {
      aws_region: "AWS_REGION",
      aws_kms_key_id: "AWS_KMS_KEY_ID",
      aws_s3_bucket: "AWS_S3_BUCKET",
      aws_access_key_id: "AWS_ACCESS_KEY_ID",
      aws_secret_access_key: "AWS_SECRET_ACCESS_KEY",
    })
  );
}

function applyAwsSettings(settings) {
  _awsSettings = settings;

  const envMap = {
    aws_region: "AWS_REGION",
    aws_kms_key_id: "AWS_KMS_KEY_ID",
    aws_s3_bucket: "AWS_S3_BUCKET",
    aws_access_key_id: "AWS_ACCESS_KEY_ID",
    aws_secret_access_key: "AWS_SECRET_ACCESS_KEY",
  };

  for (const [settingKey, envKey] of Object.entries(envMap)) {
    const value = settings[settingKey];
    if (value) process.env[envKey] = value;
    else delete process.env[envKey];
  }
}

async function refreshAwsRuntime() {
  const settings = await loadAwsSettings();
  applyAwsSettings(settings);
  try { require("../services/encryption").resetConfig(); } catch {}
  try { require("../services/secureStorage").resetConfig(); } catch {}
  return settings;
}

function getAwsSettings() {
  return _awsSettings;
}

// ── Email toggle ────────────────────────────────────────────────
async function isEmailEnabled(slug) {
  const keyMap = {
    "lead-autoresponse":   "email_lead_enabled",
    "checkout-welcome":    "email_checkout_enabled",
    "monthly-invoice-paid":"email_monthly_paid_enabled",
    "program-completed":   "email_completed_enabled",
    "payment-failed":      "email_payment_failed_enabled",
  };
  const settingKey = keyMap[slug];
  if (!settingKey) return false;
  const row = await prisma.setting.findUnique({ where: { key: settingKey } });
  return row?.value === "true";
}

// ── Boot ────────────────────────────────────────────────────────
async function boot() {
  await refreshStripe();
  await refreshSmtp();
  await refreshAwsRuntime();
  console.log("[runtime] Stripe mode:", _stripeSettings.stripe_mode || "test");
  console.log("[runtime] SMTP host:", _smtpConfig?.smtp_host || "(not set)");
  const encMode = process.env.AWS_KMS_KEY_ID ? "kms" : (process.env.ENCRYPTION_KEY ? "local-aes" : "(none)");
  console.log("[runtime] Encryption mode:", encMode);
  const stoMode = process.env.AWS_S3_BUCKET ? "s3" : "local-disk";
  console.log("[runtime] Document storage:", stoMode);
}

module.exports = {
  boot,
  refreshStripe,
  refreshSmtp,
  refreshAwsRuntime,
  getStripe,
  getStripeSettings,
  getSmtpConfig,
  getAwsSettings,
  isEmailEnabled,
};
