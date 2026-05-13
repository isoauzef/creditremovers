const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const prisma = require("../db");
const { encryptField, decryptField } = require("../services/encryption");
const secureStorage = require("../services/secureStorage");

const router = express.Router();

if (!process.env.JWT_SECRET) {
  console.error("[admin] FATAL: JWT_SECRET environment variable is required.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// ── Login (public) ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  try {
    const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, email: user.email });
  } catch (err) {
    console.error("[admin] login error", err);
    return res.status(500).json({ message: "Login failed." });
  }
});

// ── Auth middleware ─────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    req.adminUser = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

router.use(requireAdmin);

// ── Admin account ───────────────────────────────────────────────
router.put("/account", async (req, res) => {
  const { currentPassword, newEmail, newPassword } = req.body || {};
  if (!currentPassword) return res.status(400).json({ message: "Current password required." });

  try {
    const user = await prisma.adminUser.findUnique({ where: { id: req.adminUser.id } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect." });

    const data = {};
    if (newEmail && newEmail.trim()) data.email = newEmail.toLowerCase().trim();
    if (newPassword && newPassword.length >= 6) data.passwordHash = await bcrypt.hash(newPassword, 12);

    if (Object.keys(data).length === 0) return res.status(400).json({ message: "Nothing to update." });

    const updated = await prisma.adminUser.update({ where: { id: user.id }, data });
    const token = jwt.sign({ id: updated.id, email: updated.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ ok: true, token, email: updated.email });
  } catch (err) {
    console.error("[admin] account update", err);
    return res.status(500).json({ message: "Update failed." });
  }
});

router.get("/me", async (req, res) => {
  const user = await prisma.adminUser.findUnique({
    where: { id: req.adminUser.id },
    select: { id: true, email: true, createdAt: true },
  });
  return res.json(user);
});

// ═══════════ CONTACT SUBMISSIONS (leads) ═══════════════════════
router.get("/contact-submissions", async (_req, res) => {
  const rows = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(rows);
});

router.delete("/contact-submissions/:id", async (req, res) => {
  try {
    await prisma.contactSubmission.delete({ where: { id: Number(req.params.id) } });
    return res.json({ ok: true });
  } catch {
    return res.status(404).json({ message: "Not found" });
  }
});

// ═══════════ CHECKOUT SUBMISSIONS (clients) ═════════════════════
router.get("/checkout-submissions", async (_req, res) => {
  const rows = await prisma.checkoutSubmission.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, customerUserId: true,
      firstName: true, lastName: true, email: true, phone: true,
      addressLine1: true, addressLine2: true, city: true, state: true, zip: true,
      dateOfBirth: true, ssnLast4: true,
      idDocS3Key: true, idDocFilename: true, idDocMimeType: true,
      billDocS3Key: true, billDocFilename: true, billDocMimeType: true,
      signatureName: true, signatureDate: true, authConsent: true,
      paymentPlan: true, paymentStatus: true, monthsBilled: true, totalPaidCents: true,
      stripeSubscriptionId: true, stripeSubscriptionScheduleId: true,
      createdAt: true, updatedAt: true,
    },
  });
  return res.json(rows);
});

router.get("/checkout-submissions/:id", async (req, res) => {
  const row = await prisma.checkoutSubmission.findUnique({
    where: { id: Number(req.params.id) },
    include: { customerUser: { select: { id: true, email: true, firstName: true, lastName: true } } },
  });
  if (!row) return res.status(404).json({ message: "Not found" });

  // Strip raw encrypted blobs from the response — never return them
  const safe = { ...row };
  delete safe.ssnCiphertext;
  delete safe.ssnEncryptedDek;
  delete safe.ssnIv;
  delete safe.ssnAuthTag;
  delete safe.signatureDataUrl;
  return res.json(safe);
});

router.delete("/checkout-submissions/:id", async (req, res) => {
  try {
    const sub = await prisma.checkoutSubmission.findUnique({ where: { id: Number(req.params.id) } });
    if (sub) {
      if (sub.idDocS3Key)  await secureStorage.deleteObject(sub.idDocS3Key).catch(() => {});
      if (sub.billDocS3Key) await secureStorage.deleteObject(sub.billDocS3Key).catch(() => {});
    }
    await prisma.checkoutSubmission.delete({ where: { id: Number(req.params.id) } });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[admin] delete checkout", err);
    return res.status(404).json({ message: "Not found" });
  }
});

// Reveal SSN — audited
router.post("/checkout-submissions/:id/decrypt-ssn", async (req, res) => {
  try {
    const sub = await prisma.checkoutSubmission.findUnique({ where: { id: Number(req.params.id) } });
    if (!sub) return res.status(404).json({ message: "Not found" });
    if (!sub.ssnCiphertext) return res.status(400).json({ message: "No SSN on file" });

    const ssn = await decryptField({
      ciphertext: sub.ssnCiphertext,
      encryptedDek: sub.ssnEncryptedDek,
      iv: sub.ssnIv,
      authTag: sub.ssnAuthTag,
    });

    await prisma.piiAuditLog.create({
      data: {
        adminUserId: req.adminUser.id,
        checkoutSubmissionId: sub.id,
        field: "ssn",
        action: "decrypt",
        ip: req.ip,
        userAgent: (req.header("user-agent") || "").slice(0, 500),
      },
    });

    return res.json({ ssn });
  } catch (err) {
    console.error("[admin] decrypt ssn", err);
    return res.status(500).json({ message: "Decryption failed" });
  }
});

// Download ID/Bill doc — presigned URL or local stream
router.get("/checkout-submissions/:id/download/:field", async (req, res) => {
  const { field } = req.params;
  if (!["idDoc", "billDoc"].includes(field)) {
    return res.status(400).json({ message: "Invalid field" });
  }
  try {
    const sub = await prisma.checkoutSubmission.findUnique({ where: { id: Number(req.params.id) } });
    if (!sub) return res.status(404).json({ message: "Not found" });

    const key      = field === "idDoc" ? sub.idDocS3Key      : sub.billDocS3Key;
    const filename = field === "idDoc" ? sub.idDocFilename   : sub.billDocFilename;
    const mime     = field === "idDoc" ? sub.idDocMimeType   : sub.billDocMimeType;
    if (!key) return res.status(404).json({ message: "No document on file" });

    await prisma.piiAuditLog.create({
      data: {
        adminUserId: req.adminUser.id,
        checkoutSubmissionId: sub.id,
        field,
        action: "download",
        ip: req.ip,
        userAgent: (req.header("user-agent") || "").slice(0, 500),
      },
    });

    if (secureStorage.getMode() === "s3") {
      const url = await secureStorage.getDownloadUrl(key, { expiresInSec: 60 });
      return res.json({ url });
    }
    // local mode: stream
    const fullPath = secureStorage.localPath(key);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: "File missing" });
    res.setHeader("Content-Type", mime || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename || "document"}"`);
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    console.error("[admin] download doc", err);
    return res.status(500).json({ message: "Download failed" });
  }
});

// Cancel subscription / schedule (+ optional refund)
router.post("/checkout-submissions/:id/cancel", async (req, res) => {
  const { getStripe } = require("../helpers/runtime");
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ message: "Stripe not configured" });

  try {
    const sub = await prisma.checkoutSubmission.findUnique({ where: { id: Number(req.params.id) } });
    if (!sub) return res.status(404).json({ message: "Not found" });

    if (sub.stripeSubscriptionScheduleId) {
      await stripe.subscriptionSchedules.cancel(sub.stripeSubscriptionScheduleId).catch(() => {});
    } else if (sub.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId).catch(() => {});
    }

    await prisma.checkoutSubmission.update({
      where: { id: sub.id },
      data: { paymentStatus: "canceled" },
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[admin] cancel sub", err);
    return res.status(500).json({ message: err.message || "Cancel failed" });
  }
});

// ═══════════ CREDIT REPORT ROUNDS ═════════════════════════════
router.get("/customers/:customerUserId/credit-rounds", async (req, res) => {
  const rounds = await prisma.creditReportRound.findMany({
    where: { customerUserId: Number(req.params.customerUserId) },
    orderBy: { roundNumber: "desc" },
  });
  return res.json(rounds);
});

router.post("/customers/:customerUserId/credit-rounds", async (req, res) => {
  try {
    const created = await prisma.creditReportRound.create({
      data: { ...req.body, customerUserId: Number(req.params.customerUserId) },
    });
    return res.json(created);
  } catch (err) {
    console.error("[admin] create round", err);
    return res.status(500).json({ message: err.message || "Create failed" });
  }
});

router.put("/credit-rounds/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.customerUserId;
    delete data.createdAt;
    delete data.updatedAt;
    const updated = await prisma.creditReportRound.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Update failed" });
  }
});

router.delete("/credit-rounds/:id", async (req, res) => {
  try {
    await prisma.creditReportRound.delete({ where: { id: Number(req.params.id) } });
    return res.json({ ok: true });
  } catch {
    return res.status(404).json({ message: "Not found" });
  }
});

// ═══════════ NEWS ARTICLES ═════════════════════════════════════
router.get("/news", async (_req, res) => {
  const articles = await prisma.newsArticle.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(articles);
});

router.get("/news/:id", async (req, res) => {
  const article = await prisma.newsArticle.findUnique({ where: { id: Number(req.params.id) } });
  if (!article) return res.status(404).json({ message: "Not found" });
  return res.json(article);
});

router.post("/news", async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.published && !data.publishedAt) data.publishedAt = new Date();
    const created = await prisma.newsArticle.create({ data });
    return res.json(created);
  } catch (err) {
    console.error("[admin] create news", err);
    return res.status(500).json({ message: err.message || "Create failed" });
  }
});

router.put("/news/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.createdAt;
    if (data.published && !data.publishedAt) data.publishedAt = new Date();
    const updated = await prisma.newsArticle.update({ where: { id: Number(req.params.id) }, data });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Update failed" });
  }
});

router.delete("/news/:id", async (req, res) => {
  try {
    await prisma.newsArticle.delete({ where: { id: Number(req.params.id) } });
    return res.json({ ok: true });
  } catch {
    return res.status(404).json({ message: "Not found" });
  }
});

// ═══════════ AUDIT LOGS ════════════════════════════════════════
router.get("/audit-logs", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 1000);
  const logs = await prisma.piiAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      adminUser: { select: { id: true, email: true } },
      checkoutSubmission: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  return res.json(logs);
});

// ═══════════ EMAIL TEMPLATES ═══════════════════════════════════
router.get("/email-templates", async (_req, res) => {
  const templates = await prisma.emailTemplate.findMany({ orderBy: { id: "asc" } });
  return res.json(templates);
});

router.get("/email-templates/:slug", async (req, res) => {
  const t = await prisma.emailTemplate.findUnique({ where: { slug: req.params.slug } });
  if (!t) return res.status(404).json({ message: "Not found" });
  return res.json(t);
});

router.put("/email-templates/:slug", async (req, res) => {
  const { name, subject, previewText, content, enabled } = req.body;
  try {
    const updated = await prisma.emailTemplate.update({
      where: { slug: req.params.slug },
      data: {
        ...(name !== undefined && { name }),
        ...(subject !== undefined && { subject }),
        ...(previewText !== undefined && { previewText }),
        ...(content !== undefined && { content }),
        ...(enabled !== undefined && { enabled }),
      },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: "Failed to update" });
  }
});

// ═══════════ SETTINGS ══════════════════════════════════════════
router.get("/settings", async (_req, res) => {
  const settings = await prisma.setting.findMany({ orderBy: { id: "asc" } });
  const grouped = {};
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {};
    grouped[s.group][s.key] = s.value;
  }
  return res.json(grouped);
});

router.put("/settings", async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== "object") return res.status(400).json({ message: "Invalid body" });

  try {
    for (const [key, value] of Object.entries(updates)) {
      const group =
        key.startsWith("stripe_") ? "stripe" :
        key.startsWith("smtp_")   ? "smtp"   :
        key.startsWith("email_")  ? "email"  :
        key.startsWith("aws_") || key.startsWith("kms_") || key.startsWith("s3_") ? "aws" :
        "site";
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group },
      });
    }
    const { refreshStripe, refreshSmtp, refreshAwsRuntime } = require("../helpers/runtime");
    await refreshStripe();
    await refreshSmtp();
    await refreshAwsRuntime();
    return res.json({ ok: true });
  } catch (err) {
    console.error("[admin] settings update", err);
    return res.status(500).json({ message: "Failed to save" });
  }
});

// ═══════════ PAGE CONTENT ══════════════════════════════════════
router.get("/page-content/:page", async (req, res) => {
  const rows = await prisma.pageContent.findMany({ where: { page: req.params.page } });
  const result = {};
  for (const r of rows) result[r.section] = r.content;
  return res.json(result);
});

router.put("/page-content/:page/:section", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "content is required" });
  try {
    const updated = await prisma.pageContent.upsert({
      where: { page_section: { page: req.params.page, section: req.params.section } },
      update: { content },
      create: { page: req.params.page, section: req.params.section, content },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: "Failed to save" });
  }
});

// ═══════════ FILE UPLOAD (logo, favicon, news cover) ═══════════
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(svg|png|jpg|jpeg|ico|webp|gif)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  return res.json({ path: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// ═══════════ CUSTOMERS (paying clients) ════════════════════════
router.get("/customers", async (_req, res) => {
  const customers = await prisma.customerUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      lastLoginAt: true, createdAt: true,
      _count: { select: { checkoutSubmissions: true, creditRounds: true } },
    },
  });
  return res.json(customers);
});

router.get("/customers/:id", async (req, res) => {
  const customer = await prisma.customerUser.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      lastLoginAt: true, createdAt: true,
      checkoutSubmissions: {
        select: {
          id: true, paymentPlan: true, paymentStatus: true,
          monthsBilled: true, totalPaidCents: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      creditRounds: { orderBy: { roundNumber: "desc" } },
    },
  });
  if (!customer) return res.status(404).json({ message: "Not found" });
  return res.json(customer);
});

// ═══════════ STATS ═════════════════════════════════════════════
router.get("/stats", async (_req, res) => {
  const [totalContacts, totalCheckouts, activeClients, completedClients, totalCustomers, totalNews] =
    await Promise.all([
      prisma.contactSubmission.count(),
      prisma.checkoutSubmission.count(),
      prisma.checkoutSubmission.count({ where: { paymentStatus: { in: ["active", "paid"] } } }),
      prisma.checkoutSubmission.count({ where: { paymentStatus: "completed" } }),
      prisma.customerUser.count(),
      prisma.newsArticle.count(),
    ]);
  const paid = await prisma.checkoutSubmission.aggregate({ _sum: { totalPaidCents: true } });
  return res.json({
    totalContacts,
    totalCheckouts,
    activeClients,
    completedClients,
    totalCustomers,
    totalNews,
    revenueCents: paid._sum.totalPaidCents || 0,
  });
});

module.exports = router;
