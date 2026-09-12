// Friends & leaderboard layer.
//
// Design note: /users/{uid} stays fully private (only the owner can read
// it — see firestore.rules). To let friends see each other's progress
// without opening that up, every user also gets a small MIRRORED doc at
// /publicProfiles/{uid} containing only what's needed for the friends list
// and leaderboard (display name, friend code, total XP, streak). Any
// authenticated user can read (but never write) someone else's public
// profile. Whenever XP changes, we write to both docs in the same batch —
// see completeTask() in gamedata.js.
//
// Simplification for this scope: adding someone by code is one-directional,
// like following — not a mutual "friend request" with an accept step.
// Firestore's security rules only allow writing to your OWN /users/{uid}
// doc (correctly — otherwise anyone could edit anyone's data), so a single
// "add" action can never also write to the other person's doc. If they add
// your code back too, you naturally end up on each other's lists. A true
// mutual accept/decline flow is a good next step, but needs either a
// separate "friend requests" collection or a Cloud Function — see README.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { userDocRef } from "./gamedata";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easier to read aloud

export function generateFriendCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function publicProfileRef(uid) {
  return doc(db, "publicProfiles", uid);
}

// Called once from ensureUserDoc() the first time a user's character sheet
// is created. Safe to call repeatedly — no-op if it already exists.
export async function ensurePublicProfile(uid, { displayName, friendCode }) {
  const ref = publicProfileRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName,
      friendCode,
      totalXp: 0,
      streak: 0,
      lastActiveDate: null,
    });
  }
}

export function subscribeToPublicProfile(uid, callback) {
  return onSnapshot(publicProfileRef(uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

// Backfill for accounts created before friend codes existed. Safe to call
// on every load — it's a no-op once the fields are present. Returns the
// (possibly newly-created) friendCode so the caller can use it right away.
export async function ensureFriendCode(uid, userDoc, publicProfile) {
  if (userDoc?.friendCode) return userDoc.friendCode;

  const friendCode = generateFriendCode();
  const displayName = userDoc?.displayName || publicProfile?.displayName || "Explorer";

  await updateDoc(userDocRef(uid), {
    friendCode,
    friends: userDoc?.friends ?? [],
    totalXp: userDoc?.totalXp ?? 0,
    displayName,
  });

  await setDoc(
    publicProfileRef(uid),
    {
      friendCode,
      displayName,
      totalXp: publicProfile?.totalXp ?? userDoc?.totalXp ?? 0,
      streak: publicProfile?.streak ?? userDoc?.streak ?? 0,
      lastActiveDate: publicProfile?.lastActiveDate ?? null,
    },
    { merge: true }
  );

  return friendCode;
}
// Looks up a uid by friend code and adds them to YOUR OWN friends list.
// This is intentionally one-directional (like following, not a mutual
// "accept" flow) — Firestore's security rules only let you write to your
// own /users/{uid} doc, so we can never also write to theirs. If they add
// your code back, you'll show up on each other's lists naturally.
// Throws a friendly error if the code doesn't match anyone, matches
// yourself, or you've already added them.
export async function addFriendByCode(uid, rawCode) {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) throw new Error("Enter a friend code first.");

  const q = query(collection(db, "publicProfiles"), where("friendCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No one has that friend code.");

  const friendDoc = snap.docs[0];
  const friendUid = friendDoc.id;
  if (friendUid === uid) throw new Error("That's your own code!");

  const myRef = userDocRef(uid);
  const mySnap = await getDoc(myRef);
  const myFriends = mySnap.data()?.friends ?? [];
  if (myFriends.includes(friendUid)) throw new Error("You've already added them.");

  await updateDoc(myRef, { friends: arrayUnion(friendUid) });

  return { friendUid, displayName: friendDoc.data().displayName };
}

// Only ever touches your own doc, for the same reason as addFriendByCode.
export async function removeFriend(uid, friendUid) {
  await updateDoc(userDocRef(uid), { friends: arrayRemove(friendUid) });
}

// Top N players by total XP, for the global leaderboard tab.
export function subscribeToLeaderboard(callback, topN = 20) {
  const q = query(collection(db, "publicProfiles"), orderBy("totalXp", "desc"), limit(topN));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
