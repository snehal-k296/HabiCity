import { deriveLevel } from "../lib/progression";
import { getArchetype } from "../lib/archetypes";
import TaskList from "./TaskList";
import SidePanel from "./SidePanel";

export default function PlotPopover({ uid, domain, userDoc, onClose, onLevelUpCheck }) {
  const { level, xpIntoLevel, xpForNextLevel } = deriveLevel(domain.totalXp);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));
  const archetype = getArchetype(domain.archetype);

  return (
    <SidePanel onClose={onClose} ariaLabel={`${domain.name} details`}>
      <div className="panel-header">
        <div className="panel-heading">
          <span className="panel-heading-icon">{archetype.icon}</span>
          <div>
            <h3>{domain.name}</h3>
            <p className="panel-subtitle">{archetype.label}</p>
          </div>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="xp-bar-caption">
        Level {level} — {xpIntoLevel} / {xpForNextLevel} XP
      </p>

      <TaskList uid={uid} domainId={domain.id} userDoc={userDoc} onLevelUpCheck={onLevelUpCheck} />
    </SidePanel>
  );
}
