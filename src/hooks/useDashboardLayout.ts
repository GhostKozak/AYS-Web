import { useState, useCallback } from "react";
import type { Layout } from "react-grid-layout";

type WidgetKey = "weekly" | "live" | "yearly" | "company" | "parkingLot" | "unloaded";
type VisibleWidgets = Record<WidgetKey, boolean>;

const LAYOUT_KEY = "dashboard_layouts";
const VISIBLE_KEY = "dashboard_visible_widgets";

// Using any for the overall layouts object to avoid complex Responsive type conflicts
// while maintaining strictness for individual Layout items where possible.
const DEFAULT_LAYOUT: any = {
  lg: [
    { i: "company", x: 0, y: 0, w: 3, h: 4 },
    { i: "parkingLot", x: 3, y: 0, w: 3, h: 4 },
    { i: "unloaded", x: 6, y: 0, w: 3, h: 4 },
    { i: "live", x: 9, y: 0, w: 3, h: 4 },
    { i: "weekly", x: 0, y: 4, w: 6, h: 4 },
    { i: "yearly", x: 6, y: 4, w: 6, h: 4 },
  ],
  md: [
    { i: "company", x: 0, y: 0, w: 5, h: 4 },
    { i: "parkingLot", x: 5, y: 0, w: 5, h: 4 },
    { i: "unloaded", x: 0, y: 4, w: 5, h: 4 },
    { i: "live", x: 5, y: 4, w: 5, h: 4 },
    { i: "weekly", x: 0, y: 8, w: 10, h: 4 },
    { i: "yearly", x: 0, y: 12, w: 10, h: 4 },
  ],
  sm: [
    { i: "company", x: 0, y: 0, w: 6, h: 4 },
    { i: "parkingLot", x: 0, y: 4, w: 6, h: 4 },
    { i: "unloaded", x: 0, y: 8, w: 6, h: 4 },
    { i: "live", x: 0, y: 12, w: 6, h: 4 },
    { i: "weekly", x: 0, y: 16, w: 6, h: 4 },
    { i: "yearly", x: 0, y: 20, w: 6, h: 5 },
  ],
  xs: [
    { i: "company", x: 0, y: 0, w: 4, h: 4 },
    { i: "parkingLot", x: 0, y: 4, w: 4, h: 4 },
    { i: "unloaded", x: 0, y: 8, w: 4, h: 4 },
    { i: "live", x: 0, y: 12, w: 4, h: 4 },
    { i: "weekly", x: 0, y: 16, w: 4, h: 4 },
    { i: "yearly", x: 0, y: 20, w: 4, h: 5 },
  ],
  xxs: [
    { i: "company", x: 0, y: 0, w: 2, h: 4 },
    { i: "parkingLot", x: 0, y: 4, w: 2, h: 4 },
    { i: "unloaded", x: 0, y: 8, w: 2, h: 4 },
    { i: "live", x: 0, y: 12, w: 2, h: 4 },
    { i: "weekly", x: 0, y: 16, w: 2, h: 4 },
    { i: "yearly", x: 0, y: 20, w: 2, h: 5 },
  ],
};

const DEFAULT_VISIBLE: VisibleWidgets = {
  weekly: true,
  live: true,
  yearly: true,
  company: true,
  parkingLot: true,
  unloaded: true,
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage not available
  }
}

export function useDashboardLayout() {
  const [layouts, setLayouts] = useState<any>(() =>
    readStorage(LAYOUT_KEY, DEFAULT_LAYOUT)
  );
  const [visibleWidgets, setVisibleWidgets] = useState<VisibleWidgets>(() =>
    readStorage(VISIBLE_KEY, DEFAULT_VISIBLE)
  );

  const onLayoutChange = useCallback((_: readonly Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
    writeStorage(LAYOUT_KEY, allLayouts);
  }, []);

  const toggleWidget = useCallback((key: WidgetKey, show: boolean) => {
    setVisibleWidgets((prev) => {
      const next = { ...prev, [key]: show };
      writeStorage(VISIBLE_KEY, next);
      return next;
    });

    if (show) {
      setLayouts((currentLayouts: any) => {
        const newLayouts = { ...currentLayouts };
        Object.keys(DEFAULT_LAYOUT).forEach((bp) => {
          const original = DEFAULT_LAYOUT[bp]?.find(
            (item: any) => item.i === key
          );
          if (original) {
            const current = newLayouts[bp] || [];
            newLayouts[bp] = [...current.filter((item: any) => item.i !== key), original];
          }
        });
        writeStorage(LAYOUT_KEY, newLayouts);
        return newLayouts;
      });
    }
  }, []);

  const resetLayout = useCallback(() => {
    setLayouts({ ...DEFAULT_LAYOUT });
    setVisibleWidgets({ ...DEFAULT_VISIBLE });
    writeStorage(LAYOUT_KEY, DEFAULT_LAYOUT);
    writeStorage(VISIBLE_KEY, DEFAULT_VISIBLE);
  }, []);

  return { layouts, visibleWidgets, onLayoutChange, toggleWidget, resetLayout };
}
