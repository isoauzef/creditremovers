/**
 * Credit Removers — API server
 * Express + Prisma + Stripe + AWS KMS/S3.
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();

const prisma = require("./db");
const { boot, getStripe, getStripeSettings, isEmailEnabled } = require("./helpers/runtime");
const { encryptField } = require("./services/encryption");
const secureStorage = require("./services/secureStorage");
const adminRoutes = require("./routes/admin");
const { router: customerRoutes } = require("./routes/customer");

// ── Required env (fail fast in prod) ────────────────────────────
const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  for (const k of ["JWT_SECRET", "CUSTOMER_JWT_SECRET", "DATABASE_URL"]) {
    if (!process.env[k]) {
      console.error(`[boot] FATAL: ${k} is required in production.`);
      process.exit(1);
    }
  }
} else {
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "dev_admin_secret_change_me";
  if (!process.env.CUSTOMER_JWT_SECRET) process.env.CUSTOMER_JWT_SECRET = "dev_customer_secret_change_me";
}

const app = express();
const PORT = Number(process.env.API_PORT || process.env.PORT || 3001);
const buildDirectory = path.join(__dirname, "..", "build");

app.set("trust proxy", 1);

// ═══════════ Stripe webhook (raw body — must be before json) ═══
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(400).send("Stripe not configured");

  const settings = getStripeSettings();
  const mode = settings.stripe_mode || "test";
  const whSecret = mode === "live" ? settings.stripe_live_webhook_secret : settings.stripe_test_webhook_secret;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], whSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err.message);
    return res.status(400).send("Webhook signature verification failed");
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await prisma.checkoutSubmission.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { paymentStatus: "paid", totalPaidCents: pi.amount_received || pi.amount },
        });
        const sub = await prisma.checkoutSubmission.findFirst({ where: { stripePaymentIntentId: pi.id } });
        if (sub && await isEmailEnabled("checkout-welcome")) {
          require("./email/mailer").sendCheckoutWelcome(sub).catch(() => {});
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const inv = event.data.object;
        const subId = inv.subscription;
        if (subId) {
          const submission = await prisma.checkoutSubmission.findFirst({
            where: { stripeSubscriptionId: subId },
          });
          if (submission) {
            const updated = await prisma.checkoutSubmission.update({
              where: { id: submission.id },
              data: {
                monthsBilled: { increment: 1 },
                totalPaidCents: { increment: inv.amount_paid || 0 },
                paymentStatus: "active",
              },
            });
            const isFirst = updated.monthsBilled === 1;
            if (isFirst && await isEmailEnabled("checkout-welcome")) {
              require("./email/mailer").sendCheckoutWelcome(updated).catch(() => {});
            } else if (!isFirst && await isEmailEnabled("monthly-invoice-paid")) {
              require("./email/mailer").sendMonthlyPaid(updated).catch(() => {});
            }
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object;
        if (inv.subscription) {
          await prisma.checkoutSubmission.updateMany({
            where: { stripeSubscriptionId: inv.subscription },
            data: { paymentStatus: "past_due" },
          });
          const sub = await prisma.checkoutSubmission.findFirst({ where: { stripeSubscriptionId: inv.subscription } });
          if (sub && await isEmailEnabled("payment-failed")) {
            require("./email/mailer").sendPaymentFailed(sub).catch(() => {});
          }
        }
        break;
      }
      case "subscription_schedule.completed": {
        const sched = event.data.object;
        await prisma.checkoutSubmission.updateMany({
          where: { stripeSubscriptionScheduleId: sched.id },
          data: { paymentStatus: "completed" },
        });
        const sub = await prisma.checkoutSubmission.findFirst({ where: { stripeSubscriptionScheduleId: sched.id } });
        if (sub && await isEmailEnabled("program-completed")) {
          require("./email/mailer").sendProgramCompleted(sub).catch(() => {});
        }
        break;
      }
      case "subscription_schedule.canceled":
      case "customer.subscription.deleted": {
        const obj = event.data.object;
        const where = obj.id?.startsWith("sub_sched_")
          ? { stripeSubscriptionScheduleId: obj.id }
          : { stripeSubscriptionId: obj.id };
        await prisma.checkoutSubmission.updateMany({ where, data: { paymentStatus: "canceled" } });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error:", err);
  }
  res.json({ received: true });
});

// ═══════════ Standard middleware ═══════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false, // SPA + Stripe.js need permissive CSP; tune later
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: isProd ? (process.env.PUBLIC_ORIGIN || true) : true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Rate limiters ───────────────────────────────────────────────
const tightLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const authLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

// ═══════════ Health ═════════════════════════════════════════════
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ═══════════ Public: page content / settings ═══════════════════
app.get("/api/page-content/:page", async (req, res) => {
  try {
    const rows = await prisma.pageContent.findMany({ where: { page: req.params.page } });
    const result = {};
    for (const r of rows) result[r.section] = r.content;
    return res.json(result);
  } catch {
    return res.status(500).json({ message: "Failed to load" });
  }
});

app.get("/api/settings/public", async (_req, res) => {
  try {
    const rows = await prisma.setting.findMany({ where: { group: "site" } });
    const result = {};
    for (const r of rows) result[r.key] = r.value;
    return res.json(result);
  } catch {
    return res.status(500).json({ message: "Failed to load" });
  }
});

// ═══════════ Public: contact / lead form ═══════════════════════
app.post("/api/contact", tightLimiter, async (req, res) => {
  const {
    firstName, lastName, email, phone, state,
    creditScoreRange, negativeItemsCount, notes, source,
  } = req.body || {};

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ message: "First name, last name, email and phone are required." });
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        firstName: String(firstName).slice(0, 100),
        lastName: String(lastName).slice(0, 100),
        email: String(email).toLowerCase().trim().slice(0, 200),
        phone: String(phone).slice(0, 50),
        state: state ? String(state).slice(0, 50) : null,
        creditScoreRange: creditScoreRange ? String(creditScoreRange).slice(0, 50) : null,
        negativeItemsCount: negativeItemsCount ? String(negativeItemsCount).slice(0, 50) : null,
        notes: notes ? String(notes).slice(0, 2000) : null,
        source: source ? String(source).slice(0, 100) : null,
      },
    });

    if (await isEmailEnabled("lead-autoresponse")) {
      try {
        const { sendLeadAutoresponse } = require("./email/mailer");
        sendLeadAutoresponse({ firstName, lastName, email, phone, state }).catch(() => {});
      } catch (e) {
        console.error("[email] lead autoresponse failed:", e.message);
      }
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[contact] save failed:", err);
    return res.status(500).json({ message: "Could not save submission." });
  }
});

// ═══════════ Public: news ══════════════════════════════════════
app.get("/api/news", async (_req, res) => {
  const articles = await prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, title: true, excerpt: true, coverImageUrl: true,
      author: true, publishedAt: true,
    },
  });
  return res.json(articles);
});

app.get("/api/news/:slug", async (req, res) => {
  const article = await prisma.newsArticle.findUnique({ where: { slug: req.params.slug } });
  if (!article || !article.published) return res.status(404).json({ message: "Not found" });
  return res.json(article);
});

// ═══════════ Public: Stripe pricing ════════════════════════════
app.get("/api/stripe-publishable-key", (_req, res) => {
  const settings = getStripeSettings();
  const mode = settings.stripe_mode || "test";
  const pk = mode === "live" ? settings.stripe_live_publishable_key : settings.stripe_test_publishable_key;
  if (!pk) return res.status(500).json({ message: "Stripe not configured" });
  return res.json({ publishableKey: pk });
});

app.get("/api/checkout/pricing", (_req, res) => {
  const s = getStripeSettings();
  return res.json({
    monthlyAmountCents: Number(s.stripe_monthly_amount_cents) || 40000,
    monthlyMonths: Number(s.stripe_monthly_months) || 3,
    upfrontAmountCents: Number(s.stripe_upfront_amount_cents) || 100000,
    upfrontSavingsLabel: s.stripe_upfront_savings_label || "Save $200",
  });
});

// ═══════════ Checkout: submit (with file uploads + SSN) ═════════
const checkoutUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (_req, file, cb) => {
    if (/\.(pdf|png|jpg|jpeg|webp|heic|heif)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("Only PDF, PNG, JPG, WEBP, HEIC files accepted."));
  },
});

app.post(
  "/api/checkout/submit",
  tightLimiter,
  checkoutUpload.fields([{ name: "idDoc", maxCount: 1 }, { name: "billDoc", maxCount: 1 }]),
  async (req, res) => {
    const b = req.body || {};
    const required = [
      "firstName", "lastName", "email", "phone",
      "addressLine1", "city", "state", "zip",
      "dateOfBirth", "ssn",
      "paymentPlan",
    ];
    for (const k of required) {
      if (!b[k]) return res.status(400).json({ message: `Missing field: ${k}` });
    }
    if (!["monthly", "upfront"].includes(b.paymentPlan)) {
      return res.status(400).json({ message: "Invalid paymentPlan" });
    }
    // ID + bill uploads are now optional (clients can upload later in dashboard)

    try {
      const ssnRaw = String(b.ssn).replace(/[^0-9]/g, "");
      if (ssnRaw.length !== 9) return res.status(400).json({ message: "Invalid SSN format." });

      // Encrypt SSN
      const ssnEnc = await encryptField(ssnRaw);

      // Upload documents (optional)
      const idFile = req.files?.idDoc?.[0] || null;
      const billFile = req.files?.billDoc?.[0] || null;

      const idDocKey = idFile
        ? await secureStorage.putObject({
            prefix: "id-docs",
            originalName: idFile.originalname,
            mimeType: idFile.mimetype,
            buffer: idFile.buffer,
          })
        : null;
      const billDocKey = billFile
        ? await secureStorage.putObject({
            prefix: "utility-bills",
            originalName: billFile.originalname,
            mimeType: billFile.mimetype,
            buffer: billFile.buffer,
          })
        : null;

      const submission = await prisma.checkoutSubmission.create({
        data: {
          firstName: String(b.firstName).slice(0, 100),
          lastName: String(b.lastName).slice(0, 100),
          email: String(b.email).toLowerCase().trim().slice(0, 200),
          phone: String(b.phone).slice(0, 50),
          addressLine1: String(b.addressLine1).slice(0, 300),
          addressLine2: b.addressLine2 ? String(b.addressLine2).slice(0, 300) : null,
          city: String(b.city).slice(0, 120),
          state: String(b.state).slice(0, 50),
          zip: String(b.zip).slice(0, 20),
          dateOfBirth: new Date(b.dateOfBirth),

          ssnCiphertext: ssnEnc.ciphertext,
          ssnEncryptedDek: ssnEnc.encryptedDek,
          ssnIv: ssnEnc.iv,
          ssnAuthTag: ssnEnc.authTag,
          ssnLast4: ssnRaw.slice(-4),

          idDocS3Key: idDocKey,
          idDocFilename: idFile?.originalname || null,
          idDocMimeType: idFile?.mimetype || null,

          billDocS3Key: billDocKey,
          billDocFilename: billFile?.originalname || null,
          billDocMimeType: billFile?.mimetype || null,

          signatureName: b.signatureName ? String(b.signatureName).slice(0, 200) : `${b.firstName} ${b.lastName}`.trim().slice(0, 200),
          signatureDate: b.signatureDate ? new Date(b.signatureDate) : new Date(),
          signatureDataUrl: b.signatureDataUrl ? String(b.signatureDataUrl).slice(0, 500_000) : "",
          authConsent: b.authConsent === "true" || b.authConsent === true,

          paymentPlan: b.paymentPlan,
          paymentStatus: "pending",
        },
      });

      return res.json({ ok: true, submissionId: submission.id });
    } catch (err) {
      console.error("[checkout] submit failed:", err);
      return res.status(500).json({ message: "Could not save your application. Please try again." });
    }
  }
);

// ═══════════ Checkout: create payment (upfront) ═════════════════
app.post("/api/checkout/create-payment-intent", tightLimiter, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ message: "Stripe not configured" });

  const { submissionId } = req.body || {};
  if (!submissionId) return res.status(400).json({ message: "Missing submissionId" });

  try {
    const submission = await prisma.checkoutSubmission.findUnique({ where: { id: Number(submissionId) } });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.paymentPlan !== "upfront") {
      return res.status(400).json({ message: "Submission is not an upfront plan." });
    }

    const s = getStripeSettings();
    const amount = Number(s.stripe_upfront_amount_cents) || 200000;

    let customerId = submission.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: submission.email,
        name: `${submission.firstName} ${submission.lastName}`.trim(),
        metadata: { submissionId: String(submission.id) },
      });
      customerId = customer.id;
    }

    const pi = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { submissionId: String(submission.id), plan: "upfront" },
    });

    await prisma.checkoutSubmission.update({
      where: { id: submission.id },
      data: {
        stripeCustomerId: customerId,
        stripePaymentIntentId: pi.id,
      },
    });

    return res.json({ clientSecret: pi.client_secret, customerId });
  } catch (err) {
    console.error("[checkout] create-payment-intent:", err);
    return res.status(500).json({ message: err.message || "Could not create payment intent." });
  }
});

// ═══════════ Checkout: create subscription (monthly $400 × 6) ══
app.post("/api/checkout/create-subscription", tightLimiter, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ message: "Stripe not configured" });

  const { submissionId } = req.body || {};
  if (!submissionId) return res.status(400).json({ message: "Missing submissionId" });

  try {
    const submission = await prisma.checkoutSubmission.findUnique({ where: { id: Number(submissionId) } });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.paymentPlan !== "monthly") {
      return res.status(400).json({ message: "Submission is not a monthly plan." });
    }

    const s = getStripeSettings();
    const priceId = s.stripe_monthly_price_id;
    const months = Number(s.stripe_monthly_months) || 3;
    if (!priceId) return res.status(500).json({ message: "Monthly price not configured (stripe_monthly_price_id)." });

    let customerId = submission.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: submission.email,
        name: `${submission.firstName} ${submission.lastName}`.trim(),
        metadata: { submissionId: String(submission.id) },
      });
      customerId = customer.id;
    }

    // Create subscription with payment_behavior=default_incomplete to collect card via PaymentElement
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { submissionId: String(submission.id), plan: "monthly", totalMonths: String(months) },
    });

    // Wrap subscription in a Schedule so it auto-cancels after `months` cycles
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: subscription.id,
    });
    // Update phases to end after `months` iterations and cancel
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "cancel",
      phases: [
        {
          items: [{ price: priceId, quantity: 1 }],
          iterations: months,
        },
      ],
    });

    const invoice = subscription.latest_invoice;
    const pi = invoice && typeof invoice === "object" ? invoice.payment_intent : null;
    const clientSecret = pi && typeof pi === "object" ? pi.client_secret : null;

    await prisma.checkoutSubmission.update({
      where: { id: submission.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionScheduleId: schedule.id,
      },
    });

    return res.json({ clientSecret, subscriptionId: subscription.id, scheduleId: schedule.id, customerId });
  } catch (err) {
    console.error("[checkout] create-subscription:", err);
    return res.status(500).json({ message: err.message || "Could not create subscription." });
  }
});

// ═══════════ Mount routers ═════════════════════════════════════
// Customer routes — keep auth endpoints rate-limited
app.use("/api/customer", (req, res, next) => {
  if (req.path === "/login" || req.path === "/signup" || req.path === "/forgot-password") {
    return authLimiter(req, res, next);
  }
  next();
}, customerRoutes);

// Admin routes — login is public on this router
app.use("/api/admin", (req, res, next) => {
  if (req.path === "/login") return authLimiter(req, res, next);
  next();
}, adminRoutes);

// ═══════════ Static SPA (production build) ══════════════════════
if (fs.existsSync(buildDirectory)) {
  app.use(express.static(buildDirectory));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(buildDirectory, "index.html"));
  });
}

// ═══════════ Error handler ═════════════════════════════════════
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[express] unhandled:", err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large." });
  }
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ═══════════ Start ═════════════════════════════════════════════
(async () => {
  await boot();
  app.listen(PORT, () => {
    console.log(`[boot] Credit Removers API listening on :${PORT}`);
  });
})();
