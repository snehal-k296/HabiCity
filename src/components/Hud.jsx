// Phase 3/5 — small persistent status bar (gold + streak), not a full stat sheet.
export default function Hud({ gold, streak, isActiveToday, onOpenShop, onOpenFriends, onLogout }) {
  return (
    <div className="hud" role="banner">
      <div className="hud-stat" title="Gold">
        🪙 <span>{gold}</span>
      </div>
      <div className="hud-stat" title="Daily streak">
        {isActiveToday ? "🔥" : "💤"} <span>{streak}</span>
      </div>
      <button className="hud-button" onClick={onOpenShop}>
        🏪 Shop
      </button>
      <button className="hud-button" onClick={onOpenFriends}>
        👥 Friends
      </button>
      <button className="hud-button hud-logout" onClick={onLogout}>
        Log out
      </button>
    </div>
  );
}
