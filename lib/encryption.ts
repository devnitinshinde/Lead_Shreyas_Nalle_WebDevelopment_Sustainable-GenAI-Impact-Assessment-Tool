import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 64-char hex (32 bytes)

export function encrypt(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

export function decrypt(encryptedKey: string, iv: string, authTag: string) {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedKey, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
