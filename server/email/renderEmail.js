// Render an email template (DB record) against a context object.
// Templates have a structured `content` JSON:
//   {
//     brand: { primary, accent, paper, ink },
//     greetingPrefix: "Hi",
//     paragraphs: ["{{firstName}}, ...", ...],
//     bullets: ["..."],          // optional
//     cta: { label, href },      // optional
//     signature: "..."           // optional
//   }
// Subject and previewText come from the EmailTemplate row directly.

const prisma = require("../db");

function get(obj, keyPath) {
  return keyPath.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

function interpolate(str, ctx) {
  if (!str) return "";
  return String(str).replace(/{{\s*([^}]+)\s*}}/g, (_, token) => {
    const v = get(ctx, token.trim());
    return v === undefined || v === null ? "" : String(v);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function loadTemplate(slug) {
  const tpl = await prisma.emailTemplate.findUnique({ where: { slug } });
  if (!tpl) return null;
  if (!tpl.enabled) return null;
  const content = typeof tpl.content === "string" ? JSON.parse(tpl.content) : tpl.content;
  return { ...tpl, content: content || {} };
}

function buildHtml(content, ctx) {
  const brand = content.brand || {};
  const ink = brand.ink || "#0A1628";
  const paper = brand.paper || "#FBFAF7";
  const accent = brand.accent || "#0F5132";
  const muted = "#475569";

  const greeting = `${content.greetingPrefix || "Hello"} ${ctx.firstName || "there"},`;

  const paragraphsHtml = (content.paragraphs || [])
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${ink};">${interpolate(p, ctx)}</p>`)
    .join("");

  const bulletsHtml = (content.bullets || []).length
    ? `<ul style="margin:0 0 20px;padding-left:20px;color:${ink};font-size:15px;line-height:1.6;">${
        content.bullets.map((b) => `<li style="margin-bottom:8px;">${interpolate(b, ctx)}</li>`).join("")
      }</ul>`
    : "";

  const ctaHtml = content.cta && content.cta.label && content.cta.href
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(interpolate(content.cta.href, ctx))}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:15px;">${escapeHtml(interpolate(content.cta.label, ctx))}</a></p>`
    : "";

  const signatureHtml = content.signature
    ? `<p style="margin:32px 0 0;font-size:15px;line-height:1.6;color:${muted};white-space:pre-wrap;">${escapeHtml(interpolate(content.signature, ctx))}</p>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(ctx.subject || "")}</title></head>
<body style="margin:0;padding:0;background:${paper};font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none!important;visibility:hidden;height:0;width:0;overflow:hidden;color:transparent;">${escapeHtml(ctx.previewText || "")}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${paper};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
        <tr><td style="background:${ink};padding:24px 32px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:600;color:${paper};letter-spacing:0.02em;">Credit Removers</p>
        </td></tr>
        <tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;">
          <p style="margin:0 0 20px;font-size:17px;font-weight:600;color:${ink};">${escapeHtml(greeting)}</p>
          ${paragraphsHtml}
          ${bulletsHtml}
          ${ctaHtml}
          ${signatureHtml}
        </td></tr>
        <tr><td style="background:#F8F8F5;padding:18px 32px;border-top:1px solid #E5E7EB;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:${muted};line-height:1.55;">
          <p style="margin:0 0 6px;">Credit Removers · creditremovers.com · support@creditremovers.com</p>
          <p style="margin:0;">You may cancel this contract without penalty within three (3) business days of signing per the Credit Repair Organizations Act (15 U.S.C. § 1679 et seq.). Past results are not predictive of individual outcomes; we make no guarantees.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildText(content, ctx) {
  const lines = [`${content.greetingPrefix || "Hello"} ${ctx.firstName || "there"},`, ""];
  for (const p of content.paragraphs || []) lines.push(interpolate(p, ctx), "");
  for (const b of content.bullets || []) lines.push(`• ${interpolate(b, ctx)}`);
  if (content.bullets?.length) lines.push("");
  if (content.cta?.label && content.cta?.href) lines.push(`${interpolate(content.cta.label, ctx)}: ${interpolate(content.cta.href, ctx)}`, "");
  if (content.signature) lines.push("", interpolate(content.signature, ctx));
  lines.push("", "Credit Removers · support@creditremovers.com");
  return lines.join("\n");
}

async function renderEmail(slug, ctx) {
  const tpl = await loadTemplate(slug);
  if (!tpl) return null;
  const subject = interpolate(tpl.subject, ctx);
  const previewText = interpolate(tpl.previewText || "", ctx);
  const fullCtx = { ...ctx, subject, previewText };
  const html = buildHtml(tpl.content, fullCtx);
  const text = buildText(tpl.content, fullCtx);
  return { subject, previewText, html, text };
}

module.exports = { renderEmail, loadTemplate };
