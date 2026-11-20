export interface Evaluation {
  summary: string;
  skills: string[];
  score: number; // 0..100
  rationale: string;
  source: "ai" | "heuristic";
}

export async function evaluateEvidence(input: { title: string; event: string; evidence: string }): Promise<Evaluation> {
  const r = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `API error ${r.status}`);
  return r.json();
}
