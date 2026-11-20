import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  isAddressEqual,
  zeroAddress,
  type Address,
  type EIP1193Provider,
} from "viem";
import { avalancheFuji } from "viem/chains";
import registry from "../contract/SkillPassRegistry.json";
import { hashCredential, isAddress, type ChainRecord, type Credential } from "./credential";

export const CHAIN = avalancheFuji; // Avalanche C-Chain testnet, chainId 43113
export const RPC_URL = import.meta.env.VITE_FUJI_RPC || "https://api.avax-test.network/ext/bc/C/rpc";
export const REGISTRY_ADDRESS = (import.meta.env.VITE_REGISTRY_ADDRESS || "") as Address | "";
export const TRUSTED_ISSUERS: string[] = (import.meta.env.VITE_TRUSTED_ISSUERS || "")
  .split(",")
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean);
export const FAUCET_URL = "https://team1vn.xyz/faucet.html";

export const publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC_URL) });

export const explorerTx = (h: string) => `https://testnet.snowtrace.io/tx/${h}`;
export const explorerAddr = (a: string) => `https://testnet.snowtrace.io/address/${a}`;

const abi = registry.abi as never;

function provider(): EIP1193Provider {
  const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  if (!eth) throw new Error("No wallet found. Install Core Wallet or MetaMask.");
  return eth;
}

function requireRegistry(): Address {
  if (!REGISTRY_ADDRESS) throw new Error("Registry contract not configured. Deploy it and set VITE_REGISTRY_ADDRESS (see README).");
  return REGISTRY_ADDRESS;
}

/** Ask the wallet for an account and make sure it is on Avalanche Fuji. */
export async function connectWallet(): Promise<Address> {
  const eth = provider();
  const [account] = (await eth.request({ method: "eth_requestAccounts" })) as Address[];
  const hexId = `0x${CHAIN.id.toString(16)}`;
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
  } catch (e) {
    if ((e as { code?: number }).code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexId,
            chainName: "Avalanche Fuji Testnet",
            nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: ["https://testnet.snowtrace.io"],
          },
        ],
      });
    } else throw e;
  }
  return account;
}

/** issue(hash, student) on the registry. Returns the transaction hash once mined. */
export async function issueOnChain(credential: Credential, account: Address): Promise<string> {
  const address = requireRegistry();
  const wallet = createWalletClient({ account, chain: CHAIN, transport: custom(provider()) });
  const student = credential.studentWallet && isAddress(credential.studentWallet) ? (credential.studentWallet as Address) : zeroAddress;
  const hash = await hashCredential(credential);
  const txHash = await wallet.writeContract({ address, abi, functionName: "issue", args: [hash, student] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") throw new Error("Transaction reverted.");
  return txHash;
}

export async function revokeOnChain(credential: Credential, account: Address): Promise<string> {
  const address = requireRegistry();
  const wallet = createWalletClient({ account, chain: CHAIN, transport: custom(provider()) });
  const txHash = await wallet.writeContract({ address, abi, functionName: "revoke", args: [await hashCredential(credential)] });
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/** Read-only lookup (no wallet needed). Returns null if the hash was never issued. */
export async function readRecord(hash: `0x${string}`): Promise<ChainRecord | null> {
  const address = requireRegistry();
  const [issuer, issuedAt, revoked] = (await publicClient.readContract({
    address,
    abi,
    functionName: "records",
    args: [hash],
  })) as [Address, bigint, boolean];
  if (isAddressEqual(issuer, zeroAddress)) return null;
  return { issuer, issuedAt: Number(issuedAt), revoked };
}
