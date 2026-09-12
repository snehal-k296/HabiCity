// Phase 1c — Every Firestore read/write in the app lives here. Nothing else
// in the app should call Firestore directly — that keeps all the game rules
// (no double-payouts, no negative gold, etc.) in one auditable place.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { assignPlot } from "./villageLayout";
import { xpForDifficulty, goldForDifficulty, nextStreak, todayStr } from "./progression";
import { inferArchetypeFromName } from "./archetypes";

// ---------- Users ----------

export function userDocRef(uid) {
  return doc(db, "users", uid);
}

// Called on both signup and login. Safe to call repeatedly (idempotent) —
// it only creates the doc the first time.
export async function ensureUserDoc(uid) {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      gold: 0,
      streak: 0,
      lastActiveDate: null,
      villageSeed: Date.now(),
      decorations: [],
      createdAt: serverTimestamp(),
    });
  }
  return ref;
}

export function subscribeToUserDoc(uid, callback) {
  return onSnapshot(userDocRef(uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

// ---------- Domains ----------

function domainsCollectionRef(uid) {
  return collection(db, "users", uid, "domains");
}

export function domainDocRef(uid, domainId) {
  return doc(db, "users", uid, "domains", domainId);
}

// Live-updating list of domains, ordered by creation time (oldest first —
// this order also matches the domainIndex used for plot placement).
export function subscribeToDomains(uid, callback) {
  const q = query(domainsCollectionRef(uid), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const domains = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(domains);
  });
}

export async function createDomain(uid, { name }, existingDomainCount, villageSeed) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new Error("Domain name can't be empty.");

  const { plotX, plotY } = assignPlot(villageSeed, existingDomainCount);
  const plotSeed = Date.now() + Math.floor(Math.random() * 1000);

  return addDoc(domainsCollectionRef(uid), {
    name: trimmed,
    // The building type is read straight off the activity name — no manual
    // picker. See inferArchetypeFromName() for the keyword table.
    archetype: inferArchetypeFromName(trimmed),
    totalXp: 0,
    plotX,
    plotY,
    plotSeed,
    lastActiveDate: null,
    createdAt: serverTimestamp(),
  });
}

// Lets the player drag a plot to a new spot on the open land. Only touches
// position fields — totalXp is untouched, so it stays within the existing
// "XP can never decrease" security rule on domain updates.
export async function updateDomainPosition(uid, domainId, plotX, plotY) {
  await updateDoc(domainDocRef(uid, domainId), { plotX, plotY });
}

// ---------- Tasks ----------

function tasksCollectionRef(uid, domainId) {
  return collection(db, "users", uid, "domains", domainId, "tasks");
}

export function subscribeToTasks(uid, domainId, callback) {
  const q = query(tasksCollectionRef(uid, domainId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function createTask(uid, domainId, { title, difficulty }) {
  const trimmed = (title || "").trim();
  if (!trimmed) throw new Error("Quest title can't be empty.");

  return addDoc(tasksCollectionRef(uid, domainId), {
    title: trimmed,
    difficulty: difficulty || "easy",
    completed: false,
    completedAt: null,
    createdAt: serverTimestamp(),
  });
}

// The one write that matters: completing a task pays out XP + gold, bumps
// the streak, and marks the task done — all in a single atomic batch so it
// either all happens or none of it does.
//
// Guards against double-payout: if the task is already completed, this is a
// no-op (protects against double-clicks or a stale UI state re-firing).
export async function completeTask(uid, domainId, task, currentUserDoc) {
  if (task.completed) return; // already paid out — do nothing

  const xpGain = xpForDifficulty(task.difficulty);
  const goldGain = goldForDifficulty(task.difficulty);
  const today = todayStr();
  const newStreak = nextStreak(currentUserDoc?.streak ?? 0, currentUserDoc?.lastActiveDate ?? null);

  const batch = writeBatch(db);

  const taskRef = doc(db, "users", uid, "domains", domainId, "tasks", task.id);
  batch.update(taskRef, { completed: true, completedAt: serverTimestamp() });

  const domainRef = domainDocRef(uid, domainId);
  batch.update(domainRef, {
    totalXp: increment(xpGain),
    lastActiveDate: today,
  });

  const userRef = userDocRef(uid);
  batch.update(userRef, {
    gold: increment(goldGain),
    streak: newStreak,
    lastActiveDate: today,
  });

  await batch.commit();

  return { xpGain, goldGain, newStreak };
}

export async function deleteTask(uid, domainId, taskId) {
  return deleteDoc(doc(db, "users", uid, "domains", domainId, "tasks", taskId));
}

// ---------- Shop / decorations ----------

export async function purchaseDecoration(uid, item, currentGold) {
  if (currentGold < item.cost) {
    throw new Error("Not enough gold for that.");
  }
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  const decorations = snap.data()?.decorations ?? [];
  await updateDoc(ref, {
    gold: increment(-item.cost),
    decorations: [...decorations, { id: item.id, name: item.name, purchasedAt: Date.now() }],
  });
}
