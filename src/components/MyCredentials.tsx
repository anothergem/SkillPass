import { useState } from "react";
import type { Address } from "viem";
import { encodeShare } from "../lib/credential";
import { explorerTx, revokeOnChain } from "../lib/chain";
import { loadCredentials } from "../lib/storage";
import { CredentialCard } from "./CredentialCard";

export function MyCredentials({ account }: { account: Address | null }) {
  const [items] = useState(loadCredentials);
  const [msg, setMsg] = useState("");
  const link = (c: Parameters<typeof encodeShare>[0], tx: string) => `${window.location.origin}${window.location.pathname}${encodeShare(c, tx)}`;

  return (
    <section className="card wide">
      <h2>My credentials</h2>
      <p className="hint">Credentials issued from this browser. Each can be shared as a link anyone can verify on-chain; issuers can revoke.</p>
      {items.length === 0 && <p className="hint">Nothing here yet — issue your first credential in step 1.</p>}
      {msg && <p className="meta">{msg}</p>}
      <div className="list">
        {items.map(({ credential, txHash }) => (
          <div key={txHash}>
            <CredentialCard c={credential} />
            <p className="meta">
              <a href={explorerTx(txHash)} target="_blank" rel="noreferrer">Snowtrace ↗</a> ·{" "}
              <a href={encodeShare(credential, txHash)}>Open verifier</a> ·{" "}
              <button className="link" onClick={() => navigator.clipboard?.writeText(link(credential, txHash))}>Copy link</button>
              {account && account.toLowerCase() === credential.issuer && (
                <> · <button className="link" onClick={async () => {
                  try { setMsg("Revoking…"); await revokeOnChain(credential, account); setMsg("Revoked on-chain."); }
                  catch (e) { setMsg((e as { shortMessage?: string }).shortMessage || (e as Error).message); }
                }}>Revoke</button></>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
