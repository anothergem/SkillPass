import type { StoredCredential } from "./credential";

const KEY = "skillpass:credentials";

export function loadCredentials(): StoredCredential[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCredential(item: StoredCredential) {
  try {
    const all = loadCredentials().filter((c) => c.txHash !== item.txHash);
    localStorage.setItem(KEY, JSON.stringify([item, ...all]));
  } catch {
    /* storage unavailable: the share link still works */
  }
}
