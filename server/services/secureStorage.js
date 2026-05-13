/**
 * Secure document storage.
 *
 * Production: AWS S3 with SSE-KMS (objects encrypted at rest with the
 * Credit Removers KMS key). Reads are short-lived presigned URLs (60s).
 *
 * Local dev fallback: writes to ./private-uploads/ outside the public web root.
 * Reads are streamed through an authenticated admin endpoint — never served
 * statically.
 *
 * In both modes, ID/bill files NEVER live under public/uploads/.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PRIVATE_DIR = path.join(__dirname, "..", "..", "private-uploads");

let _s3 = null;
let _bucket = null;
let _kmsKeyId = null;

function resetConfig() {
  _s3 = null;
  _bucket = null;
  _kmsKeyId = null;
}

function getMode() {
  if (process.env.AWS_S3_BUCKET) return "s3";
  return "local";
}

function getS3() {
  if (_s3) return _s3;
  if (!process.env.AWS_S3_BUCKET) return null;
  // eslint-disable-next-line global-require
  const { S3Client } = require("@aws-sdk/client-s3");
  _s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
  _bucket = process.env.AWS_S3_BUCKET;
  _kmsKeyId = process.env.AWS_KMS_KEY_ID;
  return _s3;
}

function ensureLocalDir() {
  if (!fs.existsSync(PRIVATE_DIR)) {
    fs.mkdirSync(PRIVATE_DIR, { recursive: true, mode: 0o700 });
  }
}

function newKey(prefix, originalName) {
  const ext = (path.extname(originalName) || "").toLowerCase().replace(/[^.\w]/g, "");
  const random = crypto.randomBytes(16).toString("hex");
  return `${prefix}/${Date.now()}-${random}${ext}`;
}

/** Upload a Buffer (multer memory). Returns the storage key. */
async function putObject({ prefix, originalName, mimeType, buffer }) {
  const key = newKey(prefix, originalName);

  if (getMode() === "s3") {
    // eslint-disable-next-line global-require
    const { PutObjectCommand } = require("@aws-sdk/client-s3");
    const client = getS3();
    await client.send(
      new PutObjectCommand({
        Bucket: _bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: "aws:kms",
        SSEKMSKeyId: _kmsKeyId,
      })
    );
  } else {
    ensureLocalDir();
    const fullPath = path.join(PRIVATE_DIR, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer, { mode: 0o600 });
  }

  return key;
}

/**
 * Generate a short-lived (60s) presigned URL for the object, OR — in local mode —
 * stream the object through the supplied response.
 */
async function getDownloadUrl(key, { expiresInSec = 60 } = {}) {
  if (getMode() === "s3") {
    // eslint-disable-next-line global-require
    const { GetObjectCommand } = require("@aws-sdk/client-s3");
    // eslint-disable-next-line global-require
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
    const client = getS3();
    return await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: _bucket, Key: key }),
      { expiresIn: expiresInSec }
    );
  }
  // local: caller will use streamObject() instead
  return null;
}

/** Local-mode read — for streaming through an authenticated express handler. */
function localPath(key) {
  if (getMode() !== "local") return null;
  return path.join(PRIVATE_DIR, key);
}

/** Best-effort delete (used on submission cancellation). */
async function deleteObject(key) {
  if (getMode() === "s3") {
    // eslint-disable-next-line global-require
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
    const client = getS3();
    await client.send(new DeleteObjectCommand({ Bucket: _bucket, Key: key }));
  } else {
    try {
      fs.unlinkSync(path.join(PRIVATE_DIR, key));
    } catch {
      /* ignore */
    }
  }
}

module.exports = { putObject, getDownloadUrl, localPath, deleteObject, getMode, resetConfig };
