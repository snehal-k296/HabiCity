// Phase 1a — Pure game-math functions. No Firebase here, so we can test these
// in complete isolation just by calling them in the browser console.

// How much XP does it take to go from `level` to `level + 1`?
// Non-linear on purpose (each level costs more) — this satisfies the brief's
// "non-linear leveling system" requirement.
export function xpForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

// The single source of truth for a domain's level. We NEVER store "level" as
// its own field and trust it — we always recompute it from totalXp. That way
// there's no way for level and totalXp to drift out of sync.
export function deriveLevel(totalXp) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: xpForLevel(level),
  };
}

// XP awarded per task difficulty.
export const DIFFICULTY_XP = {
  trivial: 10,
  easy: 25,
  medium: 50,
  hard: 100,
  epic: 200,
};

export function xpForDifficulty(difficulty) {
  return DIFFICULTY_XP[difficulty] ?? DIFFICULTY_XP.easy;
}

// Gold reward is half the XP reward, rounded.
export function goldForDifficulty(difficulty) {
  return Math.round(xpForDifficulty(difficulty) * 0.5);
}

// ---- Streak helpers (all operate on "YYYY-MM-DD" strings, local date) ----

export function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isSameDay(a, b) {
  return a === b;
}

export function isConsecutiveDay(prevDateStr, nextDateStr) {
  if (!prevDateStr) return false;
  const prev = new Date(prevDateStr + "T00:00:00");
  const next = new Date(nextDateStr + "T00:00:00");
  const diffDays = Math.round((next - prev) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Given the current streak and the last date the user was active, what's the
// new streak if they're active "today"?
// - Active again on the same day -> streak doesn't change.
// - Active exactly one calendar day after last time -> streak +1.
// - Any bigger gap (or no previous activity at all) -> streak resets to 1.
export function nextStreak(currentStreak, lastActiveDate) {
  const today = todayStr();
  if (isSameDay(lastActiveDate, today)) return currentStreak;
  if (isConsecutiveDay(lastActiveDate, today)) return currentStreak + 1;
  return 1;
}
