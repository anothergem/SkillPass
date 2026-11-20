// Compiles contracts/SkillPassRegistry.sol with solc-js -> src/contract/SkillPassRegistry.json (abi + bytecode)
import solc from "solc";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const source = readFileSync("contracts/SkillPassRegistry.sol", "utf8");
const input = {
  language: "Solidity",
  sources: { "SkillPassRegistry.sol": { content: source } },
  settings: { evmVersion: "paris", optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (out.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}
const c = out.contracts["SkillPassRegistry.sol"].SkillPassRegistry;
mkdirSync("src/contract", { recursive: true });
writeFileSync(
  "src/contract/SkillPassRegistry.json",
  JSON.stringify({ abi: c.abi, bytecode: `0x${c.evm.bytecode.object}` }, null, 2),
);
console.log(`Compiled OK: ${c.abi.length} ABI entries, ${c.evm.bytecode.object.length / 2} bytes`);
