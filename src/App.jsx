import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import { logOut } from "./lib/auth";
import { subscribeToUserDoc, subscribeToDomains, createDomain, ensureUserDoc, updateDomainPosition } from "./lib/gamedata";
import { todayStr } from "./lib/progression";
import logoSrc from "./assets/logo.png";
import AuthPage from "./components/AuthPage";
import Hud from "./components/Hud";
import VillageMap from "./components/VillageMap";
import VillageSkeleton from "./components/VillageSkeleton";
import ShopPanel from "./components/ShopPanel";
import NewDomainForm from "./components/NewDomainForm";

import "./App.css";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <VillageSkeleton />;
  if (!user) return <AuthPage />;
  return <Village uid={user.uid} />;
}

function Village({ uid }) {
  const [userDoc, setUserDoc] = useState(null);
  const [domains, setDomains] = useState(null); // null = still loading
  const [openDomainId, setOpenDomainId] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [newDomainOpen, setNewDomainOpen] = useState(false);
  const [celebratingId, setCelebratingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Safety net: if this uid somehow doesn't have a character sheet yet
    // (e.g. an earlier signup attempt failed partway through), create it
    // now instead of hanging on the loading screen forever.
    ensureUserDoc(uid);
    const unsubUser = subscribeToUserDoc(uid, setUserDoc);
    const unsubDomains = subscribeToDomains(uid, setDomains);
    return () => {
      unsubUser();
      unsubDomains();
    };
  }, [uid]);

  function togglePlot(domainId) {
    setOpenDomainId((cur) => (cur === domainId ? null : domainId));
  }

  async function handleCreateDomain({ name }) {
    await createDomain(uid, { name }, domains?.length ?? 0, userDoc?.villageSeed);
  }

  async function handleMoveDomain(domainId, plotX, plotY) {
    try {
      await updateDomainPosition(uid, domainId, plotX, plotY);
    } catch {
      // If this fails (e.g. offline), the next Firestore snapshot will just
      // snap the plot back to its last saved spot — no special handling needed.
    }
  }

  // Called right after completeTask() resolves for the currently-open domain.
  // Shows a floating toast and triggers the in-place celebration animation
  // on that plot (per Phase 5 — celebration happens where the plot is).
  function handleTaskResult(result, domainId) {
    if (!result) return;
    setToast(`+${result.xpGain} XP, +${result.goldGain} gold!`);
    setTimeout(() => setToast(null), 1800);
    setCelebratingId(domainId);
    setTimeout(() => setCelebratingId(null), 900);
  }

  if (domains === null || userDoc === null) {
    return <VillageSkeleton />;
  }

  const isActiveToday = userDoc.lastActiveDate === todayStr();

  return (
    <div className="app-shell">
      <div className="scenery" aria-hidden="true">
        <span className="cloud cloud-1">☁️</span>
        <span className="cloud cloud-2">☁️</span>
      </div>

      <div className="topbar">
        <div className="village-title-wrap">
          <h1 className="village-title"><img src={logoSrc} alt="" className="brand-logo" /> HabiCity</h1>
        </div>
        <Hud
          gold={userDoc.gold ?? 0}
          streak={userDoc.streak ?? 0}
          isActiveToday={isActiveToday}
          onOpenShop={() => setShopOpen(true)}
          onLogout={logOut}
        />
      </div>

      <VillageMap
        domains={domains}
        uid={uid}
        userDoc={userDoc}
        openDomainId={openDomainId}
        onTogglePlot={togglePlot}
        onOpenHouse={() => setShopOpen(true)}
        celebratingId={celebratingId}
        onLevelUpCheck={(result) => handleTaskResult(result, openDomainId)}
        onAddDomain={() => setNewDomainOpen(true)}
        onMoveDomain={handleMoveDomain}
      />

      <AnimatePresence>
        {shopOpen && (
          <ShopPanel
            uid={uid}
            gold={userDoc.gold ?? 0}
            decorations={userDoc.decorations ?? []}
            onClose={() => setShopOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newDomainOpen && (
          <NewDomainForm onCreate={handleCreateDomain} onClose={() => setNewDomainOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </AnimatePresence>

      {domains.length === 0 && (
        <p className="empty-hint">Tap the 🌱 button to plant your first domain.</p>
      )}
    </div>
  );
}
