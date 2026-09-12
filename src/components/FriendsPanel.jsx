import { useEffect, useState } from "react";
import SidePanel from "./SidePanel";
import { deriveLevel } from "../lib/progression";
import {
  subscribeToPublicProfile,
  subscribeToLeaderboard,
  addFriendByCode,
  removeFriend,
  ensureFriendCode,
} from "../lib/social";

export default function FriendsPanel({ uid, userDoc, onClose }) {
  const [tab, setTab] = useState("friends"); // "friends" | "leaderboard"
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [friendProfiles, setFriendProfiles] = useState({}); // { [uid]: profile }
  const [leaderboard, setLeaderboard] = useState(null);

  const friendUids = userDoc?.friends ?? [];

  // Backfill for accounts created before friend codes existed — the live
  // userDoc listener in App.jsx will pick up the write and re-render with
  // the real code once this resolves.
  useEffect(() => {
    if (userDoc && !userDoc.friendCode) {
      ensureFriendCode(uid, userDoc, null).catch(() => {
        setError("Couldn't set up your friend code — try reopening this panel.");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, userDoc?.friendCode]);

  // Subscribe to each friend's public profile so their level/streak stay
  // live-updating, not a one-time snapshot.
  useEffect(() => {
    const unsubs = friendUids.map((fUid) =>
      subscribeToPublicProfile(fUid, (profile) => {
        setFriendProfiles((prev) => ({ ...prev, [fUid]: profile }));
      })
    );
    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendUids.join(",")]);

  useEffect(() => {
    if (tab !== "leaderboard") return;
    const unsub = subscribeToLeaderboard(setLeaderboard);
    return unsub;
  }, [tab]);

  async function handleAddFriend(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await addFriendByCode(uid, code);
      setCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(friendUid) {
    try {
      await removeFriend(uid, friendUid);
    } catch {
      setError("Couldn't remove that friend right now.");
    }
  }

  return (
    <SidePanel onClose={onClose} ariaLabel="Friends">
      <div className="panel-header">
        <div className="panel-heading">
          <span className="panel-heading-icon">👥</span>
          <div>
            <h3>Friends</h3>
            <p className="panel-subtitle">Your code: {userDoc?.friendCode ?? "generating..."}</p>
          </div>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close friends">
          ✕
        </button>
      </div>

      <div className="friends-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "friends"}
          className={`friends-tab ${tab === "friends" ? "friends-tab-active" : ""}`}
          onClick={() => setTab("friends")}
        >
          My Friends
        </button>
        <button
          role="tab"
          aria-selected={tab === "leaderboard"}
          className={`friends-tab ${tab === "leaderboard" ? "friends-tab-active" : ""}`}
          onClick={() => setTab("leaderboard")}
        >
          🏆 Leaderboard
        </button>
      </div>

      {tab === "friends" && (
        <>
          <form className="add-friend-form" onSubmit={handleAddFriend}>
            <input
              placeholder="Enter friend code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              aria-label="Friend code"
            />
            <button type="submit" disabled={busy}>
              {busy ? "..." : "Add"}
            </button>
          </form>
          {error && <p className="inline-error">{error}</p>}

          <ul className="friends-list">
            {friendUids.length === 0 && (
              <li className="task-empty">No friends yet — share your code above with someone!</li>
            )}
            {friendUids.map((fUid) => {
              const profile = friendProfiles[fUid];
              if (!profile) return null;
              const { level } = deriveLevel(profile.totalXp ?? 0);
              return (
                <li key={fUid} className="friend-row">
                  <span className="friend-avatar">🧑‍🌾</span>
                  <div className="friend-info">
                    <span className="friend-name">{profile.displayName}</span>
                    <span className="friend-meta">
                      Lv {level} · 🔥 {profile.streak ?? 0}
                    </span>
                  </div>
                  <button className="friend-remove" onClick={() => handleRemove(fUid)} aria-label={`Remove ${profile.displayName}`}>
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {tab === "leaderboard" && (
        <ul className="leaderboard-list">
          {leaderboard === null && <li className="task-empty">Loading...</li>}
          {leaderboard?.map((profile, i) => {
            const { level } = deriveLevel(profile.totalXp ?? 0);
            const isMe = profile.id === uid;
            return (
              <li key={profile.id} className={`leaderboard-row ${isMe ? "leaderboard-row-me" : ""}`}>
                <span className="leaderboard-rank">{rankBadge(i)}</span>
                <div className="friend-info">
                  <span className="friend-name">
                    {profile.displayName} {isMe && "(you)"}
                  </span>
                  <span className="friend-meta">
                    Lv {level} · {profile.totalXp ?? 0} XP
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SidePanel>
  );
}

function rankBadge(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}
