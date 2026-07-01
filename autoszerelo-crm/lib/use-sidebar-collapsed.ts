"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sidebar-collapsed";
const listeners = new Set<() => void>();
let cached = false;
let initialized = false;

function readStorage() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getSnapshot() {
  if (!initialized) {
    cached = readStorage();
    initialized = true;
  }
  return cached;
}

function getServerSnapshot() {
  return false;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setValue(value: boolean) {
  cached = value;
  initialized = true;
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, String(value));
  listeners.forEach((listener) => listener());
}

export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => setValue(!cached), []);
  return [collapsed, toggle] as const;
}
