/**
 * Field-level encryption — AES-256-GCM with KMS envelope encryption.
 *
 * Two modes:
 *  - "kms" (production): each field gets a fresh data encryption key (DEK) generated
 *    by AWS KMS GenerateDataKey. The DEK is used once with AES-256-GCM, then
 *    only the KMS-encrypted ciphertext blob of the DEK is stored alongside the
 *    encrypted data. KMS key never leaves AWS.
 *  - "local" (dev fallback): a static 32-byte master key from env (ENCRYPTION_KEY)
 *    is used directly. Same on-disk format so production data can be re-keyed later.
 *
 * Returns/accepts buffers ready to write to MySQL VARBINARY/BYTES columns.
 */
const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const IV_LEN = 12;        // 96-bit IV recommended for GCM
const AUTH_TAG_LEN = 16;
const KEY_LEN = 32;       // 256-bit

let _kms = null;
let _kmsKeyId = null;

function resetConfig() {
  _kms = null;
  _kmsKeyId = null;
}

function getMode() {
  if (process.env.AWS_KMS_KEY_ID) return "kms";
  return "local";
}

function getKms() {
  if (_kms) return _kms;
  if (!process.env.AWS_KMS_KEY_ID) return null;
  // Lazy-require so dev environments without aws-sdk installed still load
  // eslint-disable-next-line global-require
  const { KMSClient } = require("@aws-sdk/client-kms");
  _kms = new KMSClient({ region: process.env.AWS_REGION || "us-east-1" });
  _kmsKeyId = process.env.AWS_KMS_KEY_ID;
  return _kms;
}

function getLocalKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "Either AWS_KMS_KEY_ID (production) or ENCRYPTION_KEY (development) " +
        "must be set. ENCRYPTION_KEY must be 32 bytes hex (64 chars) or base64."
    );
  }
  let buf;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) buf = Buffer.from(raw, "hex");
  else buf = Buffer.from(raw, "base64");
  if (buf.length !== KEY_LEN) {
    throw new Error(`ENCRYPTION_KEY must decode to exactly ${KEY_LEN} bytes`);
  }
  return buf;
}

/**
 * Encrypt a plaintext string. Returns:
 *   { ciphertext, encryptedDek, iv, authTag }
 * All Buffers. Persist all four to the row.
 */
async function encryptField(plaintext) {
  if (plaintext == null) return null;
  if (typeof plaintext !== "string") plaintext = String(plaintext);

  const iv = crypto.randomBytes(IV_LEN);
  let dek;          // plaintext data encryption key
  let encryptedDek; // ciphertext (KMS-wrapped or null in local mode)

  if (getMode() === "kms") {
    // eslint-disable-next-line global-require
    const { GenerateDataKeyCommand } = require("@aws-sdk/client-kms");
    const client = getKms();
    const out = await client.send(
      new GenerateDataKeyCommand({ KeyId: _kmsKeyId, KeySpec: "AES_256" })
    );
    dek = Buffer.from(out.Plaintext);
    encryptedDek = Buffer.from(out.CiphertextBlob);
  } else {
    dek = getLocalKey();
    encryptedDek = Buffer.from([]); // local mode: no wrapped DEK, master key is implicit
  }

  const cipher = crypto.createCipheriv(ALGO, dek, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Best-effort wipe (V8 may keep references)
  if (getMode() === "kms") dek.fill(0);

  return { ciphertext, encryptedDek, iv, authTag };
}

/**
 * Decrypt the four-tuple back to plaintext string.
 */
async function decryptField({ ciphertext, encryptedDek, iv, authTag }) {
  if (!ciphertext || !iv || !authTag) return null;

  let dek;
  if (getMode() === "kms") {
    // eslint-disable-next-line global-require
    const { DecryptCommand } = require("@aws-sdk/client-kms");
    const client = getKms();
    const out = await client.send(
      new DecryptCommand({ CiphertextBlob: encryptedDek, KeyId: _kmsKeyId })
    );
    dek = Buffer.from(out.Plaintext);
  } else {
    dek = getLocalKey();
  }

  const decipher = crypto.createDecipheriv(ALGO, dek, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

  if (getMode() === "kms") dek.fill(0);
  return plaintext;
}

module.exports = { encryptField, decryptField, getMode, resetConfig };
