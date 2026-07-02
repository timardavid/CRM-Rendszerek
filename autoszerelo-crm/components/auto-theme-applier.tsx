"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAutoThemeSchedule, themeForCurrentTime } from "@/lib/use-auto-theme-schedule";

export function AutoThemeApplier() {
  const [enabled] = useAutoThemeSchedule();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!enabled) return;

    function apply() {
      setTheme(themeForCurrentTime());
    }

    const initial = setTimeout(apply, 0);
    const interval = setInterval(apply, 60_000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [enabled, setTheme]);

  return null;
}
