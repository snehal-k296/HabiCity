import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { deriveLevel } from "../lib/progression";
import { getArchetype, stageForLevel, VARIANT_ACCENTS } from "../lib/archetypes";
import { plotVariant } from "../lib/villageLayout";
import { todayStr } from "../lib/progression";

// How to use real art instead of emoji:
// Drop a PNG at  public/sprites/<archetype>/stage-<0..3>.png
// e.g.           public/sprites/library/stage-2.png
// That's it — no code or import changes needed. This component tries to
// load that image; if it 404s (because you haven't added it yet), it falls
// back to the archetype's emoji automatically. Recommended size: a square
// transparent PNG, 128x128 or 256x256.
function useSpriteImage(archetypeKey, stage) {
  const src = `/sprites/${archetypeKey}/stage-${stage}.png`;
  const [failedSrc, setFailedSrc] = useState(null);
  return { src, failed: failedSrc === src, markFailed: () => setFailedSrc(src) };
}

const DRAG_THRESHOLD_PX = 5; // below this, a pointer-down+up counts as a click, not a drag

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function VillagePlot({ domain, isOpen, isCelebrating, onToggle, canvasRef, onMove }) {
  const { level } = deriveLevel(domain.totalXp);
  const archetype = getArchetype(domain.archetype);
  const stage = stageForLevel(level);
  const sprite = archetype.stages[stage];
  const spriteImg = useSpriteImage(domain.archetype, stage);
  const variantIndex = plotVariant(domain.plotSeed);
  const accent = VARIANT_ACCENTS[variantIndex % VARIANT_ACCENTS.length];
  const activeToday = domain.lastActiveDate === todayStr();

  // Local drag state — while dragging, the plot follows the pointer visually
  // via dragPos; on release we persist the final spot and clear it.
  const [dragPos, setDragPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const movedPastThreshold = useRef(false);

  function handlePointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return; // left click / touch only
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointerStart.current = { x: e.clientX, y: e.clientY };
    movedPastThreshold.current = false;
  }

  function handlePointerMove(e) {
    if (!canvasRef?.current) return;
    // Only start dragging once the pointer has actually moved — this is
    // what lets a plain tap still open the popover instead of always
    // being swallowed as a (zero-distance) drag.
    if (e.buttons === 0 && !isDragging) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (!movedPastThreshold.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      movedPastThreshold.current = true;
      setIsDragging(true);
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = clamp(((e.clientX - rect.left) / rect.width) * 100, 3, 97);
    const yPct = clamp(((e.clientY - rect.top) / rect.height) * 100, 6, 97);
    setDragPos({ x: xPct, y: yPct });
  }

  function handlePointerUp() {
    if (movedPastThreshold.current && dragPos) {
      onMove?.(domain.id, dragPos.x, dragPos.y);
    } else {
      onToggle();
    }
    setIsDragging(false);
    setDragPos(null);
    movedPastThreshold.current = false;
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  }

  const posX = dragPos ? dragPos.x : domain.plotX;
  const posY = dragPos ? dragPos.y : domain.plotY;

  return (
    <motion.button
      className={`village-plot ${isOpen ? "village-plot-open" : ""} ${isDragging ? "village-plot-dragging" : ""}`}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        borderColor: accent,
        background: `${archetype.color}26`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      animate={
        isCelebrating
          ? { scale: [1, 1.35, 1], boxShadow: ["0 0 0 rgba(244,196,48,0)", "0 0 0 8px rgba(244,196,48,0.55)", "0 0 0 rgba(244,196,48,0)"] }
          : { scale: isDragging ? 1.12 : 1 }
      }
      transition={{ duration: isDragging ? 0.05 : 0.7 }}
      aria-label={`${domain.name}, level ${level} ${archetype.label}. Press Enter to open, or drag to move.`}
    >
      <span className="plot-shadow" aria-hidden="true" />
      {spriteImg.failed ? (
        <span className="plot-sprite">{sprite}</span>
      ) : (
        <img
          key={spriteImg.src}
          src={spriteImg.src}
          alt=""
          className="plot-sprite-img"
          onError={spriteImg.markFailed}
        />
      )}
      <span className="plot-glow" style={{ opacity: activeToday ? 1 : 0.15 }}>
        🔥
      </span>
      <span className="plot-label">{domain.name}</span>
      <span className="plot-level">Lv {level}</span>
    </motion.button>
  );
}
