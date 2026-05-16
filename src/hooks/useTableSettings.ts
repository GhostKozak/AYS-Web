import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import type { TableSettings } from "../types";

const STORAGE_PREFIX = "table_settings";

const getStorageKey = (userId: string | null, tableId: string) =>
  `${STORAGE_PREFIX}:${userId ?? "guest"}:${tableId}`;

const parseSettings = <T extends TableSettings>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
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
  return parseSettings<T>(localStorage.getItem(getStorageKey(userId, tableId)), fallback);
};

export const writeTableSettings = (
  userId: string | null,
  tableId: string,
  settings: TableSettings,
) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userId, tableId), JSON.stringify(settings));
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
