import { useEffect, useState } from "react";
import { watchAuthState } from "../lib/auth";

// Gives any component the current logged-in user (or null), and whether
// we're still checking on first load.
export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = "still checking"
  useEffect(() => {
    const unsubscribe = watchAuthState(setUser);
    return unsubscribe;
  }, []);
  return { user, loading: user === undefined };
}
