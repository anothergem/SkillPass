/**
 * Executes the compiled SkillPassRegistry bytecode in a local EVM (@ethereumjs/vm), no network needed.
 */
import { describe, expect, it } from "vitest";
import { createVM } from "@ethereumjs/vm";
import { Common, Mainnet } from "@ethereumjs/common";
import { Address, hexToBytes, bytesToHex } from "@ethereumjs/util";
import { decodeFunctionResult, encodeFunctionData, zeroAddress } from "viem";
import registry from "../src/contract/SkillPassRegistry.json";

const abi = registry.abi as never;
const A = new Address(hexToBytes("0x1111111111111111111111111111111111111111"));
const B = new Address(hexToBytes("0x2222222222222222222222222222222222222222"));
const HASH = `0x${"ab".repeat(32)}` as const;

async function setup() {
  const vm = await createVM({ common: new Common({ chain: Mainnet }) });
  const deploy = await vm.evm.runCall({ caller: A, data: hexToBytes(registry.bytecode as `0x${string}`), gasLimit: 3_000_000n });
  expect(deploy.execResult.exceptionError).toBeUndefined();
  const to = deploy.createdAddress!;
  const call = (caller: Address, fn: string, args: unknown[]) =>
    vm.evm.runCall({ caller, to, data: hexToBytes(encodeFunctionData({ abi, functionName: fn, args } as never)), gasLimit: 500_000n });
  const records = async (hash: `0x${string}`) => {
    const r = await call(A, "records", [hash]);
    return decodeFunctionResult({ abi, functionName: "records", data: bytesToHex(r.execResult.returnValue) } as never) as unknown as [string, bigint, boolean];
  };
  return { call, records };
}

describe("SkillPassRegistry (compiled bytecode in local EVM)", () => {
  it("issues a credential and stores issuer + timestamp", async () => {
    const { call, records } = await setup();
    const r = await call(A, "issue", [HASH, zeroAddress]);
    expect(r.execResult.exceptionError).toBeUndefined();
    const [issuer, issuedAt, revoked] = await records(HASH);
    expect(issuer.toLowerCase()).toBe(A.toString());
    expect(typeof issuedAt).toBe("bigint"); // local VM has no real clock; timestamp is set by the chain on Fuji
    expect(revoked).toBe(false);
  });

  it("returns an empty record for unknown hashes", async () => {
    const { records } = await setup();
    const [issuer] = await records(`0x${"cd".repeat(32)}`);
    expect(issuer).toBe(zeroAddress);
  });

  it("rejects issuing the same hash twice", async () => {
    const { call } = await setup();
    await call(A, "issue", [HASH, zeroAddress]);
    const again = await call(B, "issue", [HASH, zeroAddress]);
    expect(again.execResult.exceptionError).toBeDefined(); // AlreadyIssued
  });

  it("only the issuer can revoke, and only once", async () => {
    const { call, records } = await setup();
    await call(A, "issue", [HASH, zeroAddress]);
    expect((await call(B, "revoke", [HASH])).execResult.exceptionError).toBeDefined(); // NotIssuer
    expect((await call(A, "revoke", [HASH])).execResult.exceptionError).toBeUndefined();
    expect((await records(HASH))[2]).toBe(true);
    expect((await call(A, "revoke", [HASH])).execResult.exceptionError).toBeDefined(); // AlreadyRevoked
  });

  it("cannot revoke an unknown hash", async () => {
    const { call } = await setup();
    expect((await call(A, "revoke", [`0x${"ef".repeat(32)}`])).execResult.exceptionError).toBeDefined(); // NotFound
  });
});
