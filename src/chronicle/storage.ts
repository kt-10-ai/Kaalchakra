const KEY = "kaalchakra-chronicle-v1";

export function getUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function unlock(ids: string[]): Set<string> {
  const current = getUnlocked();
  for (const id of ids) current.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...current]));
  } catch {
    // localStorage unavailable — chronicle just won't persist this session
  }
  return current;
}
