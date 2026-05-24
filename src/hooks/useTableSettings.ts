import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import type { TableSettings, TableFontSize } from "../types";
import { shortHash } from "../utils";

const STORAGE_PREFIX = "tbl_stngs";

const VALID_FONT_SIZES: TableFontSize[] = ["small", "normal", "large"];

const isValidSettings = (v: unknown): v is TableSettings => {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  if (s.visibleColumns !== undefined) {
    if (!Array.isArray(s.visibleColumns)) return false;
    if (!s.visibleColumns.every((col) => typeof col === "string")) return false;
  }
  if (s.fontSize !== undefined && !VALID_FONT_SIZES.includes(s.fontSize as TableFontSize)) {
    return false;
  }
  return true;
};

// Use a short hash of userId instead of raw ID to avoid leaking
// internal identifiers in localStorage keys


const getStorageKey = (userId: string | null, tableId: string) => {
  const suffix = userId ? shortHash(userId) : "g";
  return `${STORAGE_PREFIX}:${suffix}:${tableId}`;
};

const parseSettings = <T extends TableSettings>(
  value: string | null,
  fallback: T,
): T => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (!isValidSettings(parsed)) return fallback;
    // Only accept keys that exist in the fallback schema
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(fallback)) {
      if (key in parsed) {
        result[key] = (parsed as Record<string, unknown>)[key];
      }
    }
    return result as T;
  } catch {
    return fallback;
  }
};

export const readTableSettings = <T extends TableSettings>(
  userId: string | null,
  tableId: string,
  fallback: T,
): T => {
  if (typeof window === "undefined") return fallback;
  return parseSettings<T>(
    localStorage.getItem(getStorageKey(userId, tableId)),
    fallback,
  );
};

export const writeTableSettings = (
  userId: string | null,
  tableId: string,
  settings: TableSettings,
) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey(userId, tableId),
    JSON.stringify(settings),
  );
};

export const removeTableSettings = (userId: string | null, tableId: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getStorageKey(userId, tableId));
};

export const useTableSettings = (
  tableId: string,
  defaultSettings: TableSettings,
) => {
  const { user } = useAuth();
  const userId = user?._id ?? null;
  const [settings, setSettings] = useState<TableSettings>(() =>
    readTableSettings(userId, tableId, defaultSettings),
  );

  useEffect(() => {
    setSettings(readTableSettings(userId, tableId, defaultSettings));
  }, [userId, tableId, defaultSettings]);

  const saveSettings = useCallback(
    (nextSettings: TableSettings) => {
      setSettings(nextSettings);
      writeTableSettings(userId, tableId, nextSettings);
    },
    [userId, tableId],
  );

  const resetSettings = useCallback(() => {
    const nextSettings = defaultSettings;
    setSettings(nextSettings);
    removeTableSettings(userId, tableId);
  }, [defaultSettings, userId, tableId]);

  return {
    settings,
    saveSettings,
    resetSettings,
  };
};
