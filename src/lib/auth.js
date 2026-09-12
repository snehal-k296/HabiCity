// Phase 1d — thin wrapper around Firebase Auth (email/password).
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { ensureUserDoc } from "./gamedata";

export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(cred.user.uid, cred.user.email); // create their character sheet
  return cred.user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(cred.user.uid, cred.user.email); // no-op if it already exists
  return cred.user;
}

export function logOut() {
  return signOut(auth);
}

// Calls `callback(user | null)` whenever auth state changes, and returns the
// unsubscribe function.
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
