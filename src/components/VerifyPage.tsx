import { useEffect, useState } from "react";
import { decodeShare, hashCredential, isCredential, verifyAgainstChain, type Credential, type VerifyResult } from "../lib/credential";
import { explorerTx, readRecord } from "../lib/chain";
import { CredentialCard } from "./CredentialCard";

const LABEL: Record<VerifyResult["status"], { text: string; cls: string }> = {
  valid: { text: "✔ Valid — the hash is registered on Avalanche by the stated issuer", cls: "ok-box" },
  revoked: { text: "✖ Revoked — the issuer has withdrawn this credential", cls: "bad-box" },
  "not-found": { text: "✖ Not found — tampered, or never issued", cls: "bad-box" },
  "issuer-mismatch": { text: "✖ Issuer mismatch — registered by a different wallet", cls: "bad-box" },
};

export function VerifyPage() {
  const [txHash, setTxHash] = useState("");
  const [json, setJson] = useState("");
  const [cred, setCred] = useState<Credential | null>(null);
  const [res, setRes] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const verify = async (c: Credential) => {
    setBusy(true);
    setError("");
    setRes(null);
    setCred(c);
    try {
      const record = await readRecord(await hashCredential(c));
      setRes(await verifyAgainstChain(c, record));
    } catch (e) {
      setError((e as { shortMessage?: string }).shortMessage || (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Auto-verify when opened from a share link
  useEffect(() => {
    const d = decodeShare(window.location.hash);
    if (d) {
      setTxHash(d.txHash);
      setJson(JSON.stringify(d.credential, null, 2));
      void verify(d.credential);
    }
  }, []);

  const manual = () => {
    try {
      const parsed = JSON.parse(json);
      if (!isCredential(parsed)) throw new Error("This is not a valid SkillPass credential JSON.");
      void verify(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Verify a credential</h2>
        <p className="hint">Open a share link, or paste the credential JSON. No wallet needed: this is a read-only call to the registry.</p>
        <label>Credential JSON<textarea rows={11} value={json} onChange={(e) => setJson(e.target.value)} placeholder='{"v":1,"issuer":"0x…"}' /></label>
        <div className="actions">
          <button disabled={busy || !json} onClick={manual}>{busy ? "Checking Avalanche…" : "Verify on-chain"}</button>
        </div>
        {error && <p className="err">⚠ {error}</p>}
      </section>

      <section className="card">
        <h2>Verdict</h2>
        {!res && !busy && <p className="hint">The verification result will appear here.</p>}
        {busy && <p className="hint">Reading the registry on Avalanche Fuji…</p>}
        {res && (
          <>
            <div className={LABEL[res.status].cls}>{LABEL[res.status].text}</div>
            {cred && res.status === "valid" && <CredentialCard c={cred} />}
            {res.record && <p className="meta">Recorded on-chain: {new Date(res.record.issuedAt * 1000).toLocaleString()}</p>}
            <p className="meta">
              {txHash && <><a href={explorerTx(txHash)} target="_blank" rel="noreferrer">Transaction ↗</a> · </>}
              hash <code>{res.hash.slice(0, 14)}…</code>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
