"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "theme-auto-schedule";
const LIGHT_START_HOUR = 6;
const DARK_START_HOUR = 18;

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

export function themeForCurrentTime() {
  const hour = new Date().getHours();
  return hour >= LIGHT_START_HOUR && hour < DARK_START_HOUR ? "light" : "dark";
}

export function useAutoThemeSchedule() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setEnabled = useCallback((value: boolean) => setValue(value), []);
  return [enabled, setEnabled] as const;
}
