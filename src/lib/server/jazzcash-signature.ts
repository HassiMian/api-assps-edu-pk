import { createHmac } from "crypto";

/** JazzCash pp_SecureHash — HMAC-SHA256 over sorted non-empty field values. */
export function signJazzCashFields(
  fields: Record<string, string>,
  integritySalt: string
): string {
  const sorted = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] != null && String(fields[k]).trim() !== "")
    .sort();

  const values = sorted.map((k) => String(fields[k]).trim());
  const message = [integritySalt, ...values].join("&");

  return createHmac("sha256", integritySalt).update(message).digest("hex").toUpperCase();
}

export function verifyJazzCashFields(
  fields: Record<string, string>,
  integritySalt: string,
  receivedHash: string
): boolean {
  if (!receivedHash?.trim()) return false;
  const expected = signJazzCashFields(fields, integritySalt);
  return expected === receivedHash.trim().toUpperCase();
}
