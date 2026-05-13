/**
 * Customer (paying client) auth & dashboard routes.
 * Uses httpOnly cookie session (separate from admin Bearer JWT).
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");

const router = express.Router();

if (!process.env.CUSTOMER_JWT_SECRET) {
  console.error("[customer] FATAL: CUSTOMER_JWT_SECRET env var required.");
  process.exit(1);
}
const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
const COOKIE_NAME = "cr_customer_session";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

function signSession(user) {
  return jwt.sign({ id: user.id, email: user.email }, CUSTOMER_JWT_SECRET, { expiresIn: "30d" });
}

function requireCustomer(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Not signed in" });
  try {
    req.customer = jwt.verify(token, CUSTOMER_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid session" });
  }
}

// ── Sign up (called from /checkout success popup) ───────────────
router.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName, checkoutSubmissionId } = req.body || {};
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ message: "Email and password (8+ chars) required." });
  }
  try {
    const normalized = email.toLowerCase().trim();
    const existing = await prisma.customerUser.findUnique({ where: { email: normalized } });
    if (existing) return res.status(409).json({ message: "Account already exists. Please sign in." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.customerUser.create({
      data: {
        email: normalized,
        passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
      },
    });

    if (checkoutSubmissionId) {
      // Link the recently-created submission to this customer (best-effort)
      await prisma.checkoutSubmission.updateMany({
        where: { id: Number(checkoutSubmissionId), email: normalized, customerUserId: null },
        data: { customerUserId: user.id },
      });
    }

    const token = signSession(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ ok: true, email: user.email, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error("[customer] signup", err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password required." });
  try {
    const user = await prisma.customerUser.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    await prisma.customerUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = signSession(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ ok: true, email: user.email, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error("[customer] login", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTS);
  return res.json({ ok: true });
});

router.get("/me", requireCustomer, async (req, res) => {
  const user = await prisma.customerUser.findUnique({
    where: { id: req.customer.id },
    select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
  });
  return res.json(user);
});

// ── Dashboard payload ───────────────────────────────────────────
router.get("/dashboard", requireCustomer, async (req, res) => {
  try {
    const user = await prisma.customerUser.findUnique({
      where: { id: req.customer.id },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "Account not found" });

    const submissions = await prisma.checkoutSubmission.findMany({
      where: { customerUserId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        paymentPlan: true, paymentStatus: true,
        monthsBilled: true, totalPaidCents: true,
        createdAt: true,
      },
    });

    const rounds = await prisma.creditReportRound.findMany({
      where: { customerUserId: user.id },
      orderBy: { roundNumber: "desc" },
    });

    return res.json({ user, submissions, rounds });
  } catch (err) {
    console.error("[customer] dashboard", err);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
});

// ── Password reset (email-based, simplified single-step) ────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email required" });
  // Always return success — don't leak account existence.
  try {
    const user = await prisma.customerUser.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (user) {
      const crypto = require("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.customerUser.update({
        where: { id: user.id },
        data: { resetToken: token, resetExpiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      // TODO: send email with reset link (template "password-reset")
      console.log("[customer] reset token for", user.email, ":", token);
    }
  } catch (err) {
    console.error("[customer] forgot-password", err);
  }
  return res.json({ ok: true });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    const user = await prisma.customerUser.findFirst({
      where: { resetToken: token, resetExpiresAt: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.customerUser.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetExpiresAt: null },
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[customer] reset-password", err);
    return res.status(500).json({ message: "Reset failed" });
  }
});

module.exports = { router, requireCustomer };
