import { TRUSTED_ISSUERS, explorerAddr } from "../lib/chain";
import { shortAddr, type Credential } from "../lib/credential";

export function CredentialCard({ c }: { c: Credential }) {
  const trusted = TRUSTED_ISSUERS.includes(c.issuer.toLowerCase());
  return (
    <article className="cred">
      <div className="cred-head">
        <div>
          <span className="pill">{c.event}</span>
          <h3>{c.title}</h3>
        </div>
        <div className="score" title="AI evidence score">
          <b>{c.aiScore}</b>
          <small>/100</small>
        </div>
      </div>
      <p className="who">
        Awarded to <b>{c.studentName}</b>
        {c.studentWallet && <> · <code>{shortAddr(c.studentWallet)}</code></>}
      </p>
      <p>{c.aiSummary}</p>
      <div className="chips">{c.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      <p className="meta">
        Issuer{" "}
        <a href={explorerAddr(c.issuer)} target="_blank" rel="noreferrer"><code>{shortAddr(c.issuer)}</code></a>{" "}
        {trusted ? <span className="ok">● trusted issuer</span> : <span className="warn">● unverified issuer</span>} ·{" "}
        {new Date(c.issuedAt).toLocaleDateString()}
      </p>
    </article>
  );
}
