import { useState } from "react";
import type { Address } from "viem";
import { evaluateEvidence, type Evaluation } from "../lib/api";
import { encodeShare, isAddress, type Credential } from "../lib/credential";
import { FAUCET_URL, explorerTx, issueOnChain } from "../lib/chain";
import { saveCredential } from "../lib/storage";
import { CredentialCard } from "./CredentialCard";

const DEMO = {
  studentName: "Nguyen Van A",
  title: "Avalanche dApp Builder",
  event: "Team1 UniHack 2026",
  evidence:
    "Built and deployed a Solidity registry contract on Avalanche Fuji with a React frontend and Core wallet. Implemented credential issuing and revocation, tested 12 cases and verified 3 transactions on Snowtrace. Led a team of 2, shipped the demo in 48 hours. Repo: https://github.com/example/skillpass",
};

export function IssuePage({ account, connect }: { account: Address | null; connect: () => void }) {
  const [form, setForm] = useState({ studentName: "", studentWallet: "", title: "", event: "Team1 UniHack 2026", evidence: "" });
  const [ev, setEv] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState<"" | "ai" | "tx">("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ txHash: string; link: string; credential: Credential } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [k]: e.target.value });
    if (k === "evidence" || k === "title") setEv(null); // evidence changed -> re-evaluate
  };

  const run = async (kind: typeof busy, fn: () => Promise<void>) => {
    setBusy(kind);
    setError("");
    try {
      await fn();
    } catch (e) {
      const err = e as { shortMessage?: string; message?: string };
      setError(err.shortMessage || err.message || "Something went wrong");
    } finally {
      setBusy("");
    }
  };

  const evaluate = () => run("ai", async () => setEv(await evaluateEvidence(form)));

  const issue = () =>
    run("tx", async () => {
      if (!account || !ev) return;
      const wallet = form.studentWallet.trim();
      if (wallet && !isAddress(wallet)) throw new Error("Student wallet must be a 0x… address.");
      const credential: Credential = {
        v: 1,
        issuer: account.toLowerCase(),
        studentName: form.studentName.trim(),
        studentWallet: wallet ? wallet.toLowerCase() : undefined,
        title: form.title.trim(),
        event: form.event.trim(),
        skills: ev.skills,
        evidence: form.evidence.trim(),
        aiSummary: ev.summary,
        aiScore: ev.score,
        issuedAt: new Date().toISOString(),
      };
      const txHash = await issueOnChain(credential, account);
      saveCredential({ credential, txHash, savedAt: new Date().toISOString() });
      setResult({ txHash, credential, link: `${window.location.origin}${window.location.pathname}${encodeShare(credential, txHash)}` });
    });

  const ready = form.studentName.trim() && form.title.trim() && form.evidence.trim().length >= 10;

  return (
    <div className="grid">
      <section className="card">
        <h2>Issue a credential</h2>
        <p className="hint">Organisers / mentors / universities issue; the AI scores the evidence; Avalanche makes it tamper-proof.</p>

        <label>Student name<input value={form.studentName} onChange={set("studentName")} placeholder="Nguyen Van A" /></label>
        <label>Student wallet <i>(optional, 0x…)</i><input value={form.studentWallet} onChange={set("studentWallet")} placeholder="0x…" /></label>
        <div className="row">
          <label>Credential title<input value={form.title} onChange={set("title")} placeholder="Avalanche dApp Builder" /></label>
          <label>Event / course<input value={form.event} onChange={set("event")} /></label>
        </div>
        <label>Evidence <i>(what the student did + links)</i>
          <textarea rows={6} value={form.evidence} onChange={set("evidence")} placeholder="Describe the work, results and add GitHub / demo links…" />
        </label>

        <div className="actions">
          <button className="ghost" onClick={() => setForm({ ...DEMO, studentWallet: "" })}>Fill demo data</button>
          <button disabled={!ready || busy !== ""} onClick={evaluate}>{busy === "ai" ? "Evaluating…" : "① Evaluate with AI"}</button>
        </div>

        {ev && (
          <div className="ai">
            <b>AI score: {ev.score}/100</b> <span className="pill">{ev.source === "ai" ? "Claude" : "offline rubric"}</span>
            <p>{ev.summary}</p>
            <p className="hint">{ev.rationale}</p>
            <div className="chips">{ev.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </div>
        )}

        <div className="actions">
          <a className="btn-link" href={FAUCET_URL} target="_blank" rel="noreferrer">Get test AVAX ↗</a>
          {account ? (
            <button disabled={!ev || busy !== ""} onClick={issue}>{busy === "tx" ? "Confirm in wallet…" : "② Sign & issue on Avalanche"}</button>
          ) : (
            <button onClick={connect}>Connect wallet first</button>
          )}
        </div>
        {error && <p className="err">⚠ {error}</p>}
      </section>

      <section className="card">
        <h2>Result</h2>
        {!result && <p className="hint">The issued credential, its transaction and a verification link will appear here.</p>}
        {result && (
          <>
            <CredentialCard c={result.credential} />
            <p><a href={explorerTx(result.txHash)} target="_blank" rel="noreferrer">View transaction on Snowtrace ↗</a></p>
            <label>Verification link (share with employers)
              <input readOnly value={result.link} onFocus={(e) => e.target.select()} />
            </label>
            <div className="actions">
              <button className="ghost" onClick={() => navigator.clipboard?.writeText(result.link)}>Copy link</button>
              <button onClick={() => (window.location.href = result.link)}>Open verifier</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
