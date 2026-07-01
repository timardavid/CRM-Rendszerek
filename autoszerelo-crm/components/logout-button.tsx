"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/logout-log", { method: "POST" });
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Kijelentkezés" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
