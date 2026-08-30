import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Reference } from "./types";
import { createReference, listReferences, listRemoved, subscribe } from "./api";

interface VaultState {
  references: Reference[];
  removed: Reference[];
  loading: boolean;
}

/** Live view of the Vault. Re-reads whenever the data seam emits a change. */
export function useVault(): VaultState & { reload: () => void } {
  const [state, setState] = useState<VaultState>({
    references: [],
    removed: [],
    loading: true,
  });

  const reload = useCallback(() => {
    let cancelled = false;
    Promise.all([listReferences(), listRemoved()]).then(([references, removed]) => {
      if (!cancelled) setState({ references, removed, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = reload();
    const unsub = subscribe(() => reload());
    return () => {
      cancel();
      unsub();
    };
  }, [reload]);

  return { ...state, reload };
}

/** Create a blank mount and open it in edit mode. Works from any route. */
export function useCreateReference(): () => Promise<void> {
  const navigate = useNavigate();
  return useCallback(async () => {
    const ref = await createReference();
    navigate(`/r/${ref.slug}?edit=1`);
  }, [navigate]);
}

type ThemeChoice = "system" | "light" | "dark";
const THEME_KEY = "tastevault:theme";

/** Manual light/dark override; defaults to following the OS. */
export function useTheme(): [ThemeChoice, (t: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("theme");
      if (fromUrl === "light" || fromUrl === "dark" || fromUrl === "system") {
        return fromUrl;
      }
      const v = localStorage.getItem(THEME_KEY);
      if (v === "light" || v === "dark" || v === "system") return v;
    } catch {
      /* ignore */
    }
    return "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", choice);
    try {
      localStorage.setItem(THEME_KEY, choice);
    } catch {
      /* ignore */
    }
  }, [choice]);

  return [choice, setChoice];
}
