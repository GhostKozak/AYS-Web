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

const countTripsBy = (trips: TripType[], keyExtractor: (t: TripType) => string | null) => {
  return trips.reduce((acc: Record<string, number>, trip) => {
    const key = keyExtractor(trip);
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});
};

export const useCompanyStats = (trips: TripType[]) => {
  return useMemo(() => {
    if (!trips?.length) return [];

    const counts = countTripsBy(trips, (trip) => trip.company?.name || "Bilinmeyen Firma")

    const formatted = Object.entries(counts)
      .map(([id, value]) => ({id, value}))
      .sort((a, b) => b.value - a.value);
    
    return getTopResultsWithOthers(formatted, 5, "Diğerleri");
  }, [trips]);
};

export const useMonthCompanyStats = (trips: TripType[]) => {
  return useMemo(() => {
    if (!trips?.length) return [{ id: "Veri Yok", value: 1 }];

    const now = getNow();

    const counts = trips.reduce((acc: Record<string, number>, trip) => {
      if (!trip.arrival_time) return acc;

      const arrivalDate = new Date(trip.arrival_time);

      if (isSameMonth(arrivalDate, now)) {
        const name = trip.company?.name || "Bilinmeyen Firma";
        acc[name] = (acc[name] || 0) + 1;
      }

      return acc;
    }, {});

    const formatted = Object.entries(counts).map(([id, value]) => ({ id, value }));

    if (!formatted?.length) return [{ id: "Bu Ay Sefer Yok", value: 1 }];

    return getTopResultsWithOthers(formatted, 5, "Diğerleri");
  }, [trips]);
};

export const useVehicleUnloadStats = (trips: TripType[]) => {
  const {t} = useTranslation();

  return useMemo(() => {
    if (!trips?.length) return [{ id: "Veri Yok", value: 1,color: STATUS_COLORS["UNKNOWN"]  }];
    
    const now = getNow();

    const counts = trips.reduce((acc: Record<string,number>, trip) => {
      if (!trip.arrival_time) return acc;

      const arrivalDate = new Date(trip.arrival_time);
      if (isSameDay(arrivalDate, now)) {
        const status = trip.unload_status;
        acc[status] = (acc[status] || 0) + 1;
      }

      return acc;
    },{});

    const formatted = Object.entries(counts)
      .map(([id, value]) => ({
        id: t(`Trips.STATUS_${id}`),
        value,
        color: STATUS_COLORS[id] || STATUS_COLORS.UNKNOWN
      }));

    if (!formatted?.length) return [{ id: "Araba kaydı yok", value: 1, color: STATUS_COLORS["UNKNOWN"] }];    

    return formatted;
  }, [trips, t]);
} 

export const useDailyTripStats = (trips: TripType[]) => {
  return useMemo(() => {
    const days: DailyStat[] = getLast7Days().map((d) => ({
      date: d.dateStr,
      dayName: d.dayName,
      WAITING: 0,
      COMPLETED: 0,
      UNLOADED: 0,
      CANCELED: 0,
      UNKNOWN: 0,
    }));

    const dayIndexMap = days.reduce((acc, day, index) => {
      acc[day.date] = index;
      return acc;
    }, {} as Record<string, number>);

    trips?.forEach((trip) => {
      if (!trip.arrival_time) return;

      const tripDateStr = new Date(trip.arrival_time).toISOString().split('T')[0];
      
      const status = trip.unload_status ? trip.unload_status.toUpperCase() : "UNKNOWN";
      
      const index = dayIndexMap[tripDateStr];

      if (index !== undefined) {
        if (days[index][status] !== undefined) {
           (days[index][status] as number)++;
        } else {
           days[index].UNKNOWN++;
        }
      }
    });

    return days;
  }, [trips]);
};

export const useCalendarStats = (trips: TripType[]) => {
  return useMemo(() => {
    if (!trips) return [];

    const dayMap = trips.reduce((acc: Record<string, number>, trip) => {
      if (!trip.arrival_time) return acc;
      
      const dateKey = new Date(trip.arrival_time).toISOString().split('T')[0];
      
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dayMap).map(([day, value]) => ({
      day,
      value
    }));
  }, [trips]);
};