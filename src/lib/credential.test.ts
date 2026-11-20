import { describe, expect, it } from "vitest";
import { canonicalize, decodeShare, encodeShare, hashCredential, isAddress, verifyAgainstChain, type Credential } from "./credential";

const ISSUER = "0x1111111111111111111111111111111111111111";
const base: Credential = {
  v: 1,
  issuer: ISSUER,
  studentName: "Nguyễn Văn A",
  title: "Avalanche dApp Builder",
  event: "Team1 UniHack 2026",
  skills: ["Avalanche", "Solidity"],
  evidence: "Built and deployed a registry on Fuji, https://github.com/x/y",
  aiSummary: "Deployed a registry contract on Fuji.",
  aiScore: 82,
  issuedAt: "2026-11-19T10:00:00.000Z",
};

describe("canonicalize", () => {
  it("sorts keys recursively and ignores undefined", () => {
    expect(canonicalize({ b: 1, a: { d: 2, c: undefined, b: [3, { z: 1, y: 2 }] } })).toBe('{"a":{"b":[3,{"y":2,"z":1}],"d":2},"b":1}');
  });
});

describe("hashCredential", () => {
  it("returns a 0x bytes32 and is stable regardless of key order", async () => {
    const reordered = JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(base).reverse())));
    const h = await hashCredential(base);
    expect(h).toMatch(/^0x[0-9a-f]{64}$/);
    expect(await hashCredential(reordered)).toBe(h);
  });
  it("changes when any field changes", async () => {
    expect(await hashCredential(base)).not.toBe(await hashCredential({ ...base, aiScore: 83 }));
  });
});

describe("isAddress", () => {
  it("validates 0x addresses", () => {
    expect(isAddress(ISSUER)).toBe(true);
    expect(isAddress("0x123")).toBe(false);
    expect(isAddress("So11111111111111111111111111111111111111112")).toBe(false);
  });
});

describe("share link", () => {
  it("round-trips including unicode", () => {
    const out = decodeShare(encodeShare(base, "0xabc"));
    expect(out?.txHash).toBe("0xabc");
    expect(out?.credential).toEqual(base);
  });
  it("returns null for garbage", () => {
    expect(decodeShare("#/verify?tx=a&c=%%%")).toBeNull();
    expect(decodeShare("#/verify")).toBeNull();
  });
});

describe("verifyAgainstChain", () => {
  const rec = { issuer: ISSUER, issuedAt: 1_760_000_000, revoked: false };
  it("accepts a matching, non-revoked record", async () => {
    expect((await verifyAgainstChain(base, rec)).status).toBe("valid");
  });
  it("is case-insensitive on addresses", async () => {
    expect((await verifyAgainstChain(base, { ...rec, issuer: ISSUER.toUpperCase().replace("0X", "0x") })).status).toBe("valid");
  });
  it("reports not-found (tampered or never issued)", async () => {
    expect((await verifyAgainstChain(base, null)).status).toBe("not-found");
  });
  it("detects issuer mismatch", async () => {
    expect((await verifyAgainstChain(base, { ...rec, issuer: "0x2222222222222222222222222222222222222222" })).status).toBe("issuer-mismatch");
  });
  it("detects revocation", async () => {
    expect((await verifyAgainstChain(base, { ...rec, revoked: true })).status).toBe("revoked");
  });
});
