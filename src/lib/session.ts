import { createHmac, timingSafeEqual } from "crypto";
import { COOKIE_NAME, MAX_AGE_SEC } from "@/lib/gallery-session/constants";

export type SessionPayload = {
  folderName: string;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be set to a string of at least 16 characters");
  }
  return secret;
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function sign(message: string): string {
  return createHmac("sha256", getSecret()).update(message).digest("base64url");
}

export function createSessionToken(folderName: string): string {
  const payload: SessionPayload = {
    folderName,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = encodePayload(payload);
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function parseSessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (
      typeof payload.folderName !== "string" ||
      payload.folderName.length === 0 ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, MAX_AGE_SEC };
