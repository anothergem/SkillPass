import { describe, expect, it } from "vitest";
import { clampScore, heuristicEvaluate, sanitizeSkills } from "./evaluate";

describe("heuristicEvaluate", () => {
  it("scores rich evidence higher than vague evidence", () => {
    const rich = heuristicEvaluate({
      title: "Avalanche Bootcamp",
      event: "UniHackFest",
      evidence:
        "Built an Avalanche dApp on Fuji with a Solidity contract and a React frontend. Deployed 3 transactions verified on Snowtrace, tested 12 cases. Repo: https://github.com/a/b demo: https://skillpass.vercel.app",
    });
    const vague = heuristicEvaluate({ title: "x", event: "y", evidence: "I attended the event and it was nice." });
    expect(rich.score).toBeGreaterThan(vague.score + 30);
    expect(rich.skills).toContain("Avalanche");
    expect(rich.source).toBe("heuristic");
  });
  it("is deterministic", () => {
    const i = { title: "t", event: "e", evidence: "Built an API with Node and Express: https://x.y 100%" };
    expect(heuristicEvaluate(i)).toEqual(heuristicEvaluate(i));
  });
});

describe("sanitizers", () => {
  it("clamps scores", () => {
    expect(clampScore(150)).toBe(100);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore("abc")).toBe(0);
    expect(clampScore(72.6)).toBe(73);
  });
  it("cleans skill lists (anti-injection)", () => {
    expect(sanitizeSkills(["Avalanche", "<script>alert(1)</script>", "Avalanche", 5])).toEqual(["Avalanche", "scriptalert1/script"]);
    expect(sanitizeSkills("nope")).toEqual([]);
  });
});
