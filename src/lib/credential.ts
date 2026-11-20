/**
 * Pure credential logic (no network, no wallet) so it is easy to unit-test.
 *
 * Flow:  Credential JSON --canonicalize--> SHA-256 (bytes32) --> SkillPassRegistry.issue(hash) on Avalanche.
 * Verify: re-hash the credential JSON, read registry.records(hash) and check
 *         issuer == credential.issuer and the record is not revoked.
 */


export interface Credential {
  v: 1;
  issuer: string; // issuer wallet (0x address, lowercase)
  studentName: string;
  studentWallet?: string; // optional 0x address
  title: string; // e.g. "Avalanche Bootcamp - Completion"
  event: string; // e.g. "UniHackFest 2026"
  skills: string[];
  evidence: string; // free text / links
  aiSummary: string;
  aiScore: number; // 0..100
  issuedAt: string; // ISO date
}

export interface StoredCredential {
  credential: Credential;
  txHash: string;
  savedAt: string;
}

/** Deterministic JSON: object keys sorted recursively, no whitespace. */
export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 of the canonical JSON as a 0x-prefixed bytes32 (what is stored on-chain). */
export async function hashCredential(c: Credential): Promise<`0x${string}`> {
  const bytes = new TextEncoder().encode(canonicalize(c));
  return `0x${toHex(await crypto.subtle.digest("SHA-256", bytes))}`;
}

export const isAddress = (a: string) => /^0x[0-9a-fA-F]{40}$/.test(a);

function b64urlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
}

export function encodeShare(c: Credential, txHash: string): string {
  const q = new URLSearchParams({ tx: txHash, c: b64urlEncode(JSON.stringify(c)) });
  return `#/verify?${q.toString()}`;
}

export function decodeShare(hash: string): { credential: Credential; txHash: string } | null {
  try {
    const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
    const q = new URLSearchParams(query);
    const tx = q.get("tx") ?? "";
    const c = q.get("c");
    if (!c) return null;
    const credential = JSON.parse(b64urlDecode(c)) as Credential;
    return isCredential(credential) ? { credential, txHash: tx } : null;
  } catch {
    return null;
  }
}

export function isCredential(x: unknown): x is Credential {
  if (!x || typeof x !== "object") return false;
  const c = x as Record<string, unknown>;
  return (
    c.v === 1 &&
    typeof c.issuer === "string" &&
    typeof c.studentName === "string" &&
    typeof c.title === "string" &&
    typeof c.event === "string" &&
    Array.isArray(c.skills) &&
    c.skills.every((s) => typeof s === "string") &&
    typeof c.evidence === "string" &&
    typeof c.aiSummary === "string" &&
    typeof c.aiScore === "number" &&
    typeof c.issuedAt === "string"
  );
}

export type VerifyStatus = "valid" | "revoked" | "not-found" | "issuer-mismatch";

export interface ChainRecord {
  issuer: string;
  issuedAt: number; // unix seconds
  revoked: boolean;
}

export interface VerifyResult {
  status: VerifyStatus;
  hash: string;
  record: ChainRecord | null;
}

/** Compare a credential against the on-chain record found for its hash (null = no record). */
export async function verifyAgainstChain(credential: Credential, record: ChainRecord | null): Promise<VerifyResult> {
  const hash = await hashCredential(credential);
  if (!record) return { status: "not-found", hash, record };
  if (record.issuer.toLowerCase() !== credential.issuer.toLowerCase()) return { status: "issuer-mismatch", hash, record };
  if (record.revoked) return { status: "revoked", hash, record };
  return { status: "valid", hash, record };
}

export function shortAddr(a: string): string {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
