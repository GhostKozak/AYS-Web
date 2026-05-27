import { useMemo } from "react";
import type { DailyStat, TripType } from "../types";
import { useTranslation } from "react-i18next";
import { getNow, isSameDay, isSameMonth, getLast7Days, toLocalDateString } from "../utils/date.utils";

export const useDashboardMetrics = (trips: TripType[]) => {
  const { t } = useTranslation();

  return useMemo(() => {
    const metrics = {
      companyCounts: {} as Record<string, number>,
      monthCompanyCounts: {} as Record<string, number>,
      unloadCounts: {} as Record<string, number>,
      dailyStats: getLast7Days().map((d) => ({
        date: d.dateStr,
        dayName: d.dayName,
        WAITING: 0,
        COMPLETED: 0,
        UNLOADED: 0,
        CANCELED: 0,
        UNKNOWN: 0,
      })) as DailyStat[],
      calendarMap: {} as Record<string, number>,
    };

    if (!trips?.length) return metrics;

    const now = getNow();
    const dayIndexMap = metrics.dailyStats.reduce((acc, day, index) => {
      acc[day.date] = index;
      return acc;
    }, {} as Record<string, number>);

    trips.forEach((trip) => {
      // 1. Company Stats (All time)
      const companyName = trip.company?.name || t("Common.UNKNOWN_COMPANY");
      metrics.companyCounts[companyName] = (metrics.companyCounts[companyName] || 0) + 1;

      if (!trip.arrival_time) return;
      const arrivalDate = new Date(trip.arrival_time);
      const dateStr = toLocalDateString(arrivalDate);

      // 2. Monthly Company Stats
      if (isSameMonth(arrivalDate, now)) {
        metrics.monthCompanyCounts[companyName] = (metrics.monthCompanyCounts[companyName] || 0) + 1;
      }

      // 3. Today's Unload Stats
      if (isSameDay(arrivalDate, now)) {
        const status = trip.unload_status || "UNKNOWN";
        metrics.unloadCounts[status] = (metrics.unloadCounts[status] || 0) + 1;
      }

      // 4. Daily Trends (Last 7 Days)
      const dailyIndex = dayIndexMap[dateStr];
      if (dailyIndex !== undefined) {
        const status = (trip.unload_status?.toUpperCase() || "UNKNOWN") as keyof DailyStat;
        if (typeof metrics.dailyStats[dailyIndex][status] === "number") {
          (metrics.dailyStats[dailyIndex][status] as number)++;
        } else {
          metrics.dailyStats[dailyIndex].UNKNOWN++;
        }
      }

      // 5. Calendar Activity
      metrics.calendarMap[dateStr] = (metrics.calendarMap[dateStr] || 0) + 1;
    });

    return metrics;
  }, [trips, t]);
};