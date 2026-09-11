import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Reference } from "./types";
import { listReferences, listRemoved, subscribe } from "./api";

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
  const seq = useRef(0);

  const reload = useCallback(() => {
    const n = ++seq.current;
    Promise.all([listReferences(), listRemoved()]).then(([references, removed]) => {
      if (n !== seq.current) return;
      setState({ references, removed, loading: false });
    });
  }, []);

  useEffect(() => {
    reload();
    const unsub = subscribe(reload);
    return () => {
      seq.current += 1;
      unsub();
    };
  }, [reload]);

  return { ...state, reload };
}

/** Open the compose page. Nothing is written until the pin is submitted. */
export function useCreateReference(): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    navigate("/pin");
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
