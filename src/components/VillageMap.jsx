import { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { HOUSE_ZONE } from "../lib/villageLayout";
import VillagePlot from "./VillagePlot";
import PlotPopover from "./PlotPopover";

export default function VillageMap({
  domains,
  uid,
  userDoc,
  openDomainId,
  onTogglePlot,
  onOpenHouse,
  celebratingId,
  onLevelUpCheck,
  onAddDomain,
  onMoveDomain,
}) {
  const openDomain = domains.find((d) => d.id === openDomainId);
  const canvasRef = useRef(null);

  return (
    <div className="village-wrap">
      <div className="village-canvas" ref={canvasRef}>
        <div className="village-canvas-texture" aria-hidden="true" />

        <button
          className="village-house"
          style={{ left: `${HOUSE_ZONE.xPct}%`, top: `${HOUSE_ZONE.yPct}%` }}
          onClick={onOpenHouse}
          aria-label="Open your house (shop)"
        >
          <span className="house-shadow" aria-hidden="true" />
          <span className="house-sprite">🏡</span>
          <span className="house-label">Home</span>
        </button>

        {domains.map((domain) => (
          <VillagePlot
            key={domain.id}
            domain={domain}
            isOpen={domain.id === openDomainId}
            isCelebrating={domain.id === celebratingId}
            onToggle={() => onTogglePlot(domain.id)}
            canvasRef={canvasRef}
            onMove={onMoveDomain}
          />
        ))}

        <button className="add-domain-fab" onClick={onAddDomain} aria-label="Plant a new domain">
          <span>🌱</span>
          <span className="add-domain-fab-plus">+</span>
        </button>
      </div>

      <AnimatePresence>
        {openDomain && (
          <PlotPopover
            uid={uid}
            domain={openDomain}
            userDoc={userDoc}
            onClose={() => onTogglePlot(openDomain.id)}
            onLevelUpCheck={onLevelUpCheck}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
