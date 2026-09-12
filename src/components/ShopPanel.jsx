import { useState } from "react";
import { SHOP_ITEMS } from "../lib/shopItems";
import { purchaseDecoration } from "../lib/gamedata";
import SidePanel from "./SidePanel";

export default function ShopPanel({ uid, gold, decorations, onClose }) {
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function handleBuy(item) {
    setError("");
    setBusyId(item.id);
    try {
      await purchaseDecoration(uid, item, gold);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SidePanel onClose={onClose} ariaLabel="Shop">
      <div className="panel-header">
        <div className="panel-heading">
          <span className="panel-heading-icon">🏪</span>
          <div>
            <h3>Shop</h3>
            <p className="panel-subtitle">🪙 {gold} gold</p>
          </div>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close shop">
          ✕
        </button>
      </div>
      {error && <p className="inline-error">{error}</p>}
      <ul className="shop-items">
        {SHOP_ITEMS.map((item) => {
          const owned = decorations?.some((d) => d.id === item.id);
          return (
            <li key={item.id}>
              <span className="shop-icon">{item.icon}</span>
              <span className="shop-name">{item.name}</span>
              <span className="shop-cost">{item.cost}g</span>
              <button disabled={owned || gold < item.cost || busyId === item.id} onClick={() => handleBuy(item)}>
                {owned ? "Owned" : busyId === item.id ? "..." : "Buy"}
              </button>
            </li>
          );
        })}
      </ul>
      {decorations?.length > 0 && (
        <div className="owned-decorations" aria-label="Your decorations">
          {decorations.map((d, i) => (
            <span key={i} title={d.name}>
              {SHOP_ITEMS.find((s) => s.id === d.id)?.icon}
            </span>
          ))}
        </div>
      )}
    </SidePanel>
  );
}
