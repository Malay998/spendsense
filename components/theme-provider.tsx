"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const themes = [
  { id: "midnight", name: "Midnight Lime", mood: "Focused · dark", swatches: ["#0a0d10", "#c6f36a", "#20262b"] },
  { id: "ocean", name: "Ocean Blue", mood: "Calm · cool", swatches: ["#08131d", "#66d9ff", "#173244"] },
  { id: "aurora", name: "Aurora Violet", mood: "Creative · vivid", swatches: ["#110d1b", "#c4a1ff", "#302344"] },
  { id: "rose", name: "Rose Quartz", mood: "Soft · warm", swatches: ["#1b1016", "#ff9bb5", "#3b202d"] },
  { id: "amber", name: "Amber Glow", mood: "Warm · bold", swatches: ["#191108", "#ffc56b", "#3b2a17"] },
  { id: "forest", name: "Forest", mood: "Natural · grounded", swatches: ["#0b1510", "#86e0a0", "#203b2b"] },
  { id: "paper", name: "Paper Light", mood: "Bright · minimal", swatches: ["#f4f3ed", "#477a42", "#e4e6dd"] },
  { id: "mono", name: "Monochrome", mood: "Quiet · minimal", swatches: ["#101112", "#f1f1f1", "#303234"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
type ThemeContextValue = { theme: ThemeId; setTheme: (theme: ThemeId) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "spendsense-theme";

function isTheme(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("midnight");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isTheme(saved)) setThemeState(saved);
    } catch {
      // Storage may be unavailable in private browsing; the default theme still works.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "paper" ? "light" : "dark";
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The current page still updates even if persistence is unavailable.
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
