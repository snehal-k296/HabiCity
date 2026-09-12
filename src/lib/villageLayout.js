// Deterministic ("procedural") village layout — open land, not a grid.
//
// The trick is the same as before: given the same villageSeed and the same
// domainIndex (1st domain, 2nd domain, ...), assignPlot() ALWAYS returns the
// same spot. That's what "procedural but stable across reloads" means — no
// random draw we have to remember, just math.
//
// Instead of snapping domains to grid cells, plots land anywhere on the open
// meadow (as x/y percentages of the canvas), scattered around the house like
// an actual Stardew farm rather than boxed into a square.

// The house now sits at the true center of the land, as the anchor everything
// else scatters around.
export const HOUSE_ZONE = { xPct: 50, yPct: 50, radiusPct: 16 };

// Usable land — a small margin on every edge so nothing crowds the frame.
const CANVAS = { minX: 6, maxX: 94, minY: 8, maxY: 94 };

// mulberry32 — a tiny, fast, seeded PRNG. Same seed number -> same sequence
// of "random" numbers, forever. This is the whole trick behind determinism.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// Builds the full set of open-land "spawn points" as a loose, jittered
// raster (not a rigid grid — the jitter is what makes it feel like open
// land instead of boxes). The jitter uses a FIXED seed so the shape of the
// meadow is the same for everyone; only the villageSeed-driven shuffle below
// decides which domain lands on which point, so each player's layout still
// differs and never collides.
function buildScatterPoints() {
  const points = [];
  const cols = 7;
  const rows = 5;
  const jitterRng = mulberry32(90210);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const baseX = CANVAS.minX + ((c + 0.5) / cols) * (CANVAS.maxX - CANVAS.minX);
      const baseY = CANVAS.minY + ((r + 0.5) / rows) * (CANVAS.maxY - CANVAS.minY);
      const jitterX = (jitterRng() - 0.5) * 9;
      const jitterY = (jitterRng() - 0.5) * 9;
      const x = Math.min(CANVAS.maxX, Math.max(CANVAS.minX, baseX + jitterX));
      const y = Math.min(CANVAS.maxY, Math.max(CANVAS.minY, baseY + jitterY));
      if (distance(x, y, HOUSE_ZONE.xPct, HOUSE_ZONE.yPct) < HOUSE_ZONE.radiusPct + 10) continue;
      points.push({ x, y });
    }
  }
  return points;
}

const SCATTER_POINTS = buildScatterPoints();

// domainIndex = how many domains already existed before this one (0-based).
export function assignPlot(villageSeed, domainIndex) {
  const rng = mulberry32(Number(villageSeed) || 1);
  const order = [...SCATTER_POINTS];
  // Fisher-Yates shuffle driven by the seeded RNG — a stable permutation
  // per villageSeed, so (seed, index) always lands on the same open-land spot.
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const point = order[domainIndex % order.length];
  return { plotX: point.x, plotY: point.y };
}

// A small deterministic "flavor" roll per plot (e.g. which of 3 flower
// colors to use) — reuses the same seeded PRNG idea, just seeded per-plot
// instead of per-village.
export function plotVariant(plotSeed, variantCount = 3) {
  const rng = mulberry32(Number(plotSeed) || 1);
  return Math.floor(rng() * variantCount);
}
