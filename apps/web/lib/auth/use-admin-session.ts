"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  touchActivity,
  clearActivity,
  isInactivityExpired,
} from "@/lib/auth/session";

interface AdminSession {
  token: string | null;
  ready: boolean;
}

export function useAdminSession(): AdminSession {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function resolveSession() {
      if (isInactivityExpired()) {
        clearActivity();
        await supabase.auth.signOut();
        window.location.href = "/auth?reason=timeout";
        return;
      }

      touchActivity();
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token ?? null);
      setReady(true);
    }

    resolveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { token, ready };
}

/** Obtém access token atualizado (com refresh automático do Supabase) */
export async function getFreshAccessToken(): Promise<string | null> {
  if (isInactivityExpired()) return null;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  touchActivity();
  return session?.access_token ?? null;
}
