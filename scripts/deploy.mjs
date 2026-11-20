// Deploy SkillPassRegistry to Avalanche Fuji.
//   PRIVATE_KEY=0x... node scripts/deploy.mjs
// Get test AVAX first: https://team1vn.xyz/faucet.html  (or the official Avalanche faucet)
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { readFileSync } from "node:fs";

const pk = process.env.PRIVATE_KEY;
if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
  console.error("Set PRIVATE_KEY=0x<64 hex> (use a throwaway testnet key, never a real one).");
  process.exit(1);
}
const { abi, bytecode } = JSON.parse(readFileSync("src/contract/SkillPassRegistry.json", "utf8"));
const account = privateKeyToAccount(pk);
const rpc = process.env.FUJI_RPC || "https://api.avax-test.network/ext/bc/C/rpc";
const pub = createPublicClient({ chain: avalancheFuji, transport: http(rpc) });
const wallet = createWalletClient({ account, chain: avalancheFuji, transport: http(rpc) });

const hash = await wallet.deployContract({ abi, bytecode });
console.log("Deploy tx:", `https://testnet.snowtrace.io/tx/${hash}`);
const receipt = await pub.waitForTransactionReceipt({ hash });
console.log("\nSkillPassRegistry deployed at:", receipt.contractAddress);
console.log(`Contract: https://testnet.snowtrace.io/address/${receipt.contractAddress}`);
console.log("\nPut this in .env:  VITE_REGISTRY_ADDRESS=" + receipt.contractAddress);
