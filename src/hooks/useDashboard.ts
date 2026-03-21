import { useMemo } from "react";
import type { DailyStat, TripType } from "../types";
import { useTranslation } from "react-i18next";
import { getTopResultsWithOthers } from "../utils/stats.utils";
import { getNow, isSameDay, isSameMonth, getLast7Days } from "../utils/date.utils";

const STATUS_COLORS: Record<string, string> = {
  WAITING: "#faad14", // Sarı
  COMPLETED: "#52c41a", // Yeşil
  UNLOADED: "#13c2c2", // Camgöbeği
  CANCELED: "#ff4d4f", // Kırmızı
  UNKNOWN: "#d9d9d9", // Gri
};

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
      const dateStr = arrivalDate.toISOString().split("T")[0];

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

export const useCompanyStats = (trips: TripType[]) => {
  const { t } = useTranslation();
  const { companyCounts } = useDashboardMetrics(trips);

  return useMemo(() => {
    const formatted = Object.entries(companyCounts)
      .map(([id, value]) => ({ id, value }))
      .sort((a, b) => b.value - a.value);
    return getTopResultsWithOthers(formatted, 5, t("Common.OTHERS"));
  }, [companyCounts, t]);
};

export const useMonthCompanyStats = (trips: TripType[]) => {
  const { t } = useTranslation();
  const { monthCompanyCounts } = useDashboardMetrics(trips);

  return useMemo(() => {
    const formatted = Object.entries(monthCompanyCounts).map(([id, value]) => ({ id, value }));
    if (!formatted.length) return [{ id: t("Common.NO_DATA_THIS_MONTH"), value: 1 }];
    return getTopResultsWithOthers(formatted, 5, t("Common.OTHERS"));
  }, [monthCompanyCounts, t]);
};

export const useVehicleUnloadStats = (trips: TripType[]) => {
  const { t } = useTranslation();
  const { unloadCounts } = useDashboardMetrics(trips);

  return useMemo(() => {
    const formatted = Object.entries(unloadCounts).map(([id, value]) => ({
      id: t(`Trips.STATUS_${id}`),
      value,
      color: STATUS_COLORS[id] || STATUS_COLORS.UNKNOWN,
    }));
    if (!formatted.length) return [{ id: t("Table.NO_DATA"), value: 1, color: STATUS_COLORS["UNKNOWN"] }];
    return formatted;
  }, [unloadCounts, t]);
};

export const useDailyTripStats = (trips: TripType[]) => {
  const { dailyStats } = useDashboardMetrics(trips);
  return dailyStats;
};

export const useCalendarStats = (trips: TripType[]) => {
  const { calendarMap } = useDashboardMetrics(trips);
  return useMemo(() => {
    return Object.entries(calendarMap).map(([day, value]) => ({ day, value }));
  }, [calendarMap]);
};