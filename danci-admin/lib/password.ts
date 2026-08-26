import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedValue: string) {
  const [salt, storedHash] = storedValue.split(":");
  if (!salt || !storedHash) return false;

  const actualHash = scryptSync(password, salt, KEY_LENGTH);
  const expectedHash = Buffer.from(storedHash, "hex");
  return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash);
}
