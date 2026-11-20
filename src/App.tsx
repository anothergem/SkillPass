import { useEffect, useState } from "react";
import type { Address } from "viem";
import { connectWallet, REGISTRY_ADDRESS, explorerAddr } from "./lib/chain";
import { shortAddr } from "./lib/credential";
import { IssuePage } from "./components/IssuePage";
import { VerifyPage } from "./components/VerifyPage";
import { MyCredentials } from "./components/MyCredentials";

type Tab = "issue" | "verify" | "mine";

function tabFromHash(): Tab {
  const h = window.location.hash;
  if (h.startsWith("#/verify")) return "verify";
  if (h.startsWith("#/mine")) return "mine";
  return "issue";
}

export function App() {
  const [tab, setTab] = useState<Tab>(tabFromHash());
  const [account, setAccount] = useState<Address | null>(null);
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    const on = () => setTab(tabFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const go = (t: Tab) => {
    window.location.hash = `#/${t}`;
    setTab(t);
  };

  const connect = async () => {
    setWalletError("");
    try {
      setAccount(await connectWallet());
    } catch (e) {
      setWalletError((e as Error).message);
    }
  };

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="logo">✓</span>
          <div>
            <h1>SkillPass</h1>
            <small>AI-evaluated · Avalanche-verified student credentials</small>
          </div>
        </div>
        <button onClick={connect}>{account ? `● ${shortAddr(account)}` : "Connect wallet"}</button>
      </header>
      {walletError && <p className="err">⚠ {walletError}</p>}
      {!REGISTRY_ADDRESS && (
        <p className="err">⚠ Registry contract address missing: deploy it and set VITE_REGISTRY_ADDRESS (see README).</p>
      )}

      <nav className="tabs">
        <button className={tab === "issue" ? "on" : ""} onClick={() => go("issue")}>1 · Issue</button>
        <button className={tab === "verify" ? "on" : ""} onClick={() => go("verify")}>2 · Verify</button>
        <button className={tab === "mine" ? "on" : ""} onClick={() => go("mine")}>3 · My credentials</button>
      </nav>

      <main>
        {tab === "issue" && <IssuePage account={account} connect={connect} />}
        {tab === "verify" && <VerifyPage />}
        {tab === "mine" && <MyCredentials account={account} />}
      </main>

      <footer>
        Avalanche Fuji testnet · Only a SHA-256 hash is stored on-chain, no personal data
        {REGISTRY_ADDRESS && <> · <a href={explorerAddr(REGISTRY_ADDRESS)} target="_blank" rel="noreferrer">registry contract</a></>} · Team1 UniHack 2026
      </footer>
    </div>
  );
}
