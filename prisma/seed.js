// Credit Removers — DB seed
// Seeds: AdminUser, Settings (stripe/smtp/email/aws/site), EmailTemplates, PageContent.

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@creditremovers.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";

const settings = [
  { key: "stripe_mode", value: process.env.STRIPE_MODE || "test", group: "stripe" },
  {
    key: "stripe_test_publishable_key",
    value: process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "",
    group: "stripe",
  },
  {
    key: "stripe_test_secret_key",
    value: process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "",
    group: "stripe",
  },
  {
    key: "stripe_test_webhook_secret",
    value: process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "",
    group: "stripe",
  },
  { key: "stripe_live_publishable_key", value: process.env.STRIPE_LIVE_PUBLISHABLE_KEY || "", group: "stripe" },
  { key: "stripe_live_secret_key", value: process.env.STRIPE_LIVE_SECRET_KEY || "", group: "stripe" },
  { key: "stripe_live_webhook_secret", value: process.env.STRIPE_LIVE_WEBHOOK_SECRET || "", group: "stripe" },
  { key: "stripe_monthly_amount_cents", value: process.env.STRIPE_MONTHLY_AMOUNT_CENTS || "40000", group: "stripe" },
  { key: "stripe_monthly_months", value: process.env.STRIPE_MONTHLY_MONTHS || "3", group: "stripe" },
  { key: "stripe_upfront_amount_cents", value: process.env.STRIPE_UPFRONT_AMOUNT_CENTS || "100000", group: "stripe" },
  { key: "stripe_upfront_savings_label", value: process.env.STRIPE_UPFRONT_SAVINGS_LABEL || "Save $200", group: "stripe" },
  { key: "stripe_monthly_price_id", value: process.env.STRIPE_MONTHLY_PRICE_ID || "", group: "stripe" },

  { key: "smtp_host", value: process.env.SMTP_HOST || "", group: "smtp" },
  { key: "smtp_port", value: process.env.SMTP_PORT || "465", group: "smtp" },
  { key: "smtp_secure", value: process.env.SMTP_SECURE || "true", group: "smtp" },
  { key: "smtp_user", value: process.env.SMTP_USER || "", group: "smtp" },
  { key: "smtp_pass", value: process.env.SMTP_PASS || "", group: "smtp" },
  {
    key: "smtp_from",
    value: process.env.SMTP_FROM || "Credit Removers <support@creditremovers.com>",
    group: "smtp",
  },
  { key: "smtp_reply_to", value: process.env.SMTP_REPLY_TO || "support@creditremovers.com", group: "smtp" },

  { key: "email_lead_enabled", value: "true", group: "email" },
  { key: "email_checkout_enabled", value: "true", group: "email" },
  { key: "email_monthly_paid_enabled", value: "true", group: "email" },
  { key: "email_completed_enabled", value: "true", group: "email" },
  { key: "email_payment_failed_enabled", value: "true", group: "email" },

  { key: "aws_region", value: process.env.AWS_REGION || "us-east-1", group: "aws" },
  { key: "aws_kms_key_id", value: process.env.AWS_KMS_KEY_ID || "", group: "aws" },
  { key: "aws_s3_bucket", value: process.env.AWS_S3_BUCKET || "", group: "aws" },
  { key: "aws_access_key_id", value: process.env.AWS_ACCESS_KEY_ID || "", group: "aws" },
  { key: "aws_secret_access_key", value: process.env.AWS_SECRET_ACCESS_KEY || "", group: "aws" },

  { key: "site_name", value: process.env.SITE_NAME || "Credit Removers", group: "site" },
  { key: "site_url", value: process.env.SITE_URL || "https://creditremovers.com", group: "site" },
  { key: "site_support_email", value: process.env.SITE_SUPPORT_EMAIL || "support@creditremovers.com", group: "site" },
  { key: "site_support_phone", value: process.env.SITE_SUPPORT_PHONE || "+1 (888) 000-0000", group: "site" },
];

const brand = { ink: "#0A1628", paper: "#FBFAF7", accent: "#0F5132" };

const emailTemplates = [
  {
    slug: "lead-autoresponse",
    name: "Lead Autoresponse",
    subject: "We received your consultation request, {{firstName}}",
    previewText: "A senior credit analyst will reach out within one business day.",
    content: {
      brand,
      greetingPrefix: "Hi",
      paragraphs: [
        "Thank you for reaching out to Credit Removers. We've received your information and a senior credit analyst will personally review your file before contacting you — typically within one business day.",
        "While you wait, here's what to expect:",
      ],
      bullets: [
        "A free, no-obligation consultation by phone",
        "A line-by-line review of all three bureau reports",
        "A clear written plan with timelines and expected outcomes",
      ],
      signature: "— The Credit Removers Team\nCROA-compliant · Bank-grade KMS encryption",
    },
  },
  {
    slug: "checkout-welcome",
    name: "Welcome / First Payment",
    subject: "Welcome to Credit Removers, {{firstName}}",
    previewText: "Your file is in queue. Here's what happens next.",
    content: {
      brand,
      greetingPrefix: "Welcome,",
      paragraphs: [
        "Your enrollment is complete and your first payment of {{totalPaid}} has been received. Plan: {{paymentPlanLabel}}.",
        "Within 24-48 hours one of our specialists will pull your three-bureau report, mark every actionable line item, and submit the first wave of disputes, validations, and goodwill correspondence on your behalf.",
        "Reminder: Per the Credit Repair Organizations Act you have three (3) business days from signing to cancel without penalty.",
      ],
      bullets: [
        "Forward any letters you receive from the bureaus within 7 days",
        "Avoid disputing the same items independently while we work them",
        "Track every round in real time from your portal",
      ],
      cta: { label: "Open my dashboard", href: "https://creditremovers.com/account" },
      signature: "— The Credit Removers Team",
    },
  },
  {
    slug: "monthly-invoice-paid",
    name: "Monthly Invoice Paid",
    subject: "Month {{monthsBilled}} of 6 — payment received",
    previewText: "Receipt for your {{totalPaid}} cumulative investment.",
    content: {
      brand,
      greetingPrefix: "Hi",
      paragraphs: [
        "We've received this month's payment. You're now on month {{monthsBilled}} of 6, with {{monthsRemaining}} remaining. Total invested to date: {{totalPaid}}.",
        "Your file remains in active dispute. Round summaries appear in your dashboard as bureaus respond — usually every 30-45 days.",
      ],
      cta: { label: "View latest round", href: "https://creditremovers.com/account" },
      signature: "— The Credit Removers Team",
    },
  },
  {
    slug: "program-completed",
    name: "Program Completed",
    subject: "Your 3-month program is complete",
    previewText: "Your subscription has automatically ended. Here's a recap.",
    content: {
      brand,
      greetingPrefix: "Congratulations,",
      paragraphs: [
        "Your three-month engagement with Credit Removers is now complete and your subscription has automatically closed — no further charges will be made.",
        "Total invested: {{totalPaid}}. Your full round-by-round history will remain available in your portal for your records.",
        "If you'd like to continue with another engagement (a new round of disputes, identity-monitoring guidance, or post-cleanup credit-building strategy), reply to this email and we'll set you up.",
      ],
      cta: { label: "Download my summary", href: "https://creditremovers.com/account" },
      signature: "— The Credit Removers Team",
    },
  },
  {
    slug: "payment-failed",
    name: "Payment Failed",
    subject: "We couldn't process your payment",
    previewText: "Action needed: update your card to keep your file active.",
    content: {
      brand,
      greetingPrefix: "Hi",
      paragraphs: [
        "We tried to process this month's payment ({{monthsBilled}} of 3) and it was declined by your bank. Common reasons: expired card, insufficient funds, or a fraud-prevention block.",
        "Your file is paused until we can collect the payment. Please update your card from your portal — we'll automatically retry and resume disputes immediately.",
      ],
      cta: { label: "Update payment method", href: "https://creditremovers.com/account" },
      signature: "— The Credit Removers Team",
    },
  },
];

const pageContent = [
  {
    page: "homepage", section: "hero", content: {
      eyebrow: "CROA-Compliant Credit Repair",
      heading: "Stop disputing the wrong items. We delete what shouldn't be there.",
      subheading: "A senior analyst manually reviews your three-bureau report, then drafts every dispute, validation, and goodwill letter for you. Bank-grade KMS encryption protects your file.",
      primaryCta: { label: "Get my free consultation", href: "#consultation" },
      secondaryCta: { label: "How it works", href: "#how-it-works" },
    },
  },
  {
    page: "homepage", section: "statistics", content: {
      heading: "Numbers we stand behind",
      items: [
        { value: "11+ years", label: "Repairing credit since 2014" },
        { value: "12,400+", label: "Items removed for clients" },
        { value: "+87 pts", label: "Average score lift in 3 months" },
        { value: "98.4%", label: "Client retention through month 3" },
      ],
    },
  },
  {
    page: "homepage", section: "howItWorks", content: {
      heading: "Three steps. Zero noise.",
      steps: [
        { number: "01", title: "Free consultation", body: "A senior analyst reviews your three-bureau report and tells you exactly what we can — and can't — get removed. No upsells." },
        { number: "02", title: "We work the file", body: "We draft, sign, and mail every dispute, validation, and goodwill letter on your behalf. You receive a round summary every 30-45 days." },
        { number: "03", title: "You watch results land", body: "Your portal mirrors what we mirror from the bureaus. No guessing, no canned templates, no monthly mystery." },
      ],
    },
  },
  {
    page: "homepage", section: "leadForm", content: {
      heading: "Get a free consultation",
      subheading: "Takes under 60 seconds. A senior analyst calls you within one business day.",
      submitLabel: "Request my consultation",
      successMessage: "Thanks — we received your request. Watch for a call within one business day.",
    },
  },
  {
    page: "homepage", section: "security", content: {
      heading: "Built like a private bank",
      bullets: [
        "AWS KMS envelope encryption for every Social Security number",
        "AWS S3 SSE-KMS for ID and proof-of-address documents",
        "TLS 1.2+ in transit · presigned, time-boxed URLs for any retrieval",
        "Tamper-evident audit log for every PII access",
      ],
    },
  },
  {
    page: "homepage", section: "faq", content: {
      heading: "Frequently asked",
      items: [
        { q: "How long does it take?", a: "Most clients see meaningful movement by round 2 (around day 60). The full program is three months — long enough to work every viable item to completion." },
        { q: "Do you guarantee results?", a: "Federal law (CROA) prohibits us from guaranteeing outcomes. What we guarantee is the work: every viable item, every round, by name." },
        { q: "Is this legal?", a: "Yes. We are a CROA-registered credit repair organization. You can dispute items yourself for free; we do it for you with processes refined over a decade." },
        { q: "What about my data?", a: "Your SSN is encrypted with AWS KMS envelope encryption. Documents live in S3 with SSE-KMS. Only you and a vetted analyst with logged, audited access ever touch your file." },
      ],
    },
  },
  {
    page: "homepage", section: "crossNav", content: {
      heading: "Already a client?",
      links: [
        { label: "Sign in to your dashboard", href: "/account" },
        { label: "Read the latest from our analysts", href: "/news" },
      ],
    },
  },
  {
    page: "homepage", section: "footer", content: {
      tagline: "Credit Removers · CROA-compliant · KMS-encrypted",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
        { label: "News", href: "/news" },
        { label: "Client portal", href: "/account" },
      ],
      address: "Credit Removers · creditremovers.com · support@creditremovers.com",
      disclaimer: "Past results are not predictive of future outcomes. We make no guarantees. You may cancel within three (3) business days of signing without penalty.",
    },
  },

  {
    page: "checkout", section: "plans", content: {
      heading: "Choose how to pay",
      subheading: "Same scope of work. Pick the cadence that fits your cash flow.",
      monthlyTitle: "Monthly", monthlyAmount: "$400", monthlyCadence: "× 3 months",
      monthlyNote: "Auto-cancels at month 3. Cancel within 3 business days at no cost.",
      upfrontTitle: "Upfront", upfrontAmount: "$1,000", upfrontCadence: "paid in full",
      upfrontNote: "Save $200. One payment, full three-month program.",
    },
  },
  {
    page: "checkout", section: "trust", content: {
      heading: "Why your file is safe with us",
      bullets: [
        "Your SSN is encrypted with AWS KMS envelope encryption — even our database admins can't read it.",
        "Your government ID and proof of address sit in AWS S3 with SSE-KMS at rest.",
        "Card details never touch our servers. Stripe handles them directly.",
        "Every staff access to PII is logged with timestamp, IP, and reason.",
      ],
    },
  },
  {
    page: "checkout", section: "auth", content: {
      heading: "Authorization to act on your behalf",
      body: "By signing below you authorize Credit Removers to communicate with the credit bureaus, furnishers, and creditors named on your file solely for the purpose of disputing inaccurate, unverifiable, or obsolete information under the FCRA. You may revoke this authorization in writing at any time. You retain the right to dispute items yourself, free of charge, by contacting each bureau directly.",
    },
  },
  {
    page: "media", section: "assets", content: {
      navLogo:             "/uploads/A2.jpg",
      footerLogo:          "/uploads/A2.jpg",
      homeHero:            "/uploads/B1.jpg",
      homeSecurity:        "/uploads/B2.jpg",
      homeSocialProof:     "/uploads/B3.jpg",
      homeFaq:             "/uploads/F2.jpg",
      checkoutHero:        "/uploads/C1.jpg",
      checkoutStep1:       "/uploads/C2a.jpg",
      checkoutStep2:       "/uploads/C2b.jpg",
      checkoutStep3:       "/uploads/C2c.jpg",
      checkoutSecurity:    "/uploads/C3.jpg",
      newsHero:            "/uploads/D2.jpg",
      newsArticleFallback: "/uploads/D1.jpg",
      accountLoginBg:      "/uploads/E1.jpg",
      accountEmpty:        "/uploads/E2.jpg",
      errorPage:           "/uploads/F3.jpg",
      paperTexture:        "/uploads/F1.jpg",
    },
  },
];

async function main() {
  console.log("[seed] Admin user…");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, passwordHash },
  });
  console.log(`  → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  console.log("[seed] Settings…");
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { group: s.group },
      create: s,
    });
  }
  console.log(`  → ${settings.length} settings`);

  console.log("[seed] Email templates…");
  for (const t of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: t.slug },
      update: {},
      create: { ...t, enabled: true },
    });
  }
  console.log(`  → ${emailTemplates.length} templates`);

  console.log("[seed] Page content…");
  for (const p of pageContent) {
    await prisma.pageContent.upsert({
      where: { page_section: { page: p.page, section: p.section } },
      update: {},
      create: p,
    });
  }
  console.log(`  → ${pageContent.length} sections`);

  console.log("\n[seed] Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
