"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckIcon,
} from "@/components/ui/dropdown-menu";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useAutoThemeSchedule, themeForCurrentTime } from "@/lib/use-auto-theme-schedule";

export function ThemeToggle() {
  const hasMounted = useHasMounted();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [autoSchedule, setAutoSchedule] = useAutoThemeSchedule();

  if (!hasMounted) return <Button variant="ghost" size="icon" />;

  const TriggerIcon = autoSchedule ? Clock : resolvedTheme === "dark" ? Moon : Sun;

  function choose(mode: "light" | "dark" | "system") {
    setAutoSchedule(false);
    setTheme(mode);
  }

  function chooseAuto() {
    setAutoSchedule(true);
    setTheme(themeForCurrentTime());
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Téma beállítása">
          <TriggerIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => choose("light")}>
          <Sun className="h-4 w-4" /> Világos
          <span className="ml-auto">
            <DropdownMenuCheckIcon active={!autoSchedule && theme === "light"} />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => choose("dark")}>
          <Moon className="h-4 w-4" /> Sötét
          <span className="ml-auto">
            <DropdownMenuCheckIcon active={!autoSchedule && theme === "dark"} />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => choose("system")}>
          <Monitor className="h-4 w-4" /> Rendszer
          <span className="ml-auto">
            <DropdownMenuCheckIcon active={!autoSchedule && theme === "system"} />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={chooseAuto}>
          <Clock className="h-4 w-4" /> Automatikus (6–18 világos)
          <span className="ml-auto">
            <DropdownMenuCheckIcon active={autoSchedule} />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
