"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  touchActivity,
  clearActivity,
  isInactivityExpired,
  INACTIVITY_TIMEOUT_MS,
} from "@/lib/auth/session";

const CHECK_INTERVAL_MS = 60_000;
const ACTIVITY_THROTTLE_MS = 30_000;

export default function InactivityGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient();
    let lastTouch = 0;

    function recordActivity() {
      const now = Date.now();
      if (now - lastTouch < ACTIVITY_THROTTLE_MS) return;
      lastTouch = now;
      touchActivity();
    }

    async function enforceTimeout() {
      if (!isInactivityExpired()) return;
      clearActivity();
      await supabase.auth.signOut();
      window.location.href = "/auth?reason=timeout";
    }

    if (isInactivityExpired()) {
      enforceTimeout();
      return;
    }

    touchActivity();

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    const interval = setInterval(enforceTimeout, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) => window.removeEventListener(event, recordActivity));
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}

/** Horas do timeout — útil para mensagens na UI */
export const INACTIVITY_TIMEOUT_HOURS = INACTIVITY_TIMEOUT_MS / (60 * 60 * 1000);
