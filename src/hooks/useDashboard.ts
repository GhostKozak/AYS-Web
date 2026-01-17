import { useMemo } from "react";
import type { TripType } from "../types";
import { useTranslation } from "react-i18next";

interface ChartData {
  [key: string]: any
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#8884d8",
];

const STATUS_COLORS: Record<string, string> = {
  WAITING: "#faad14", // Sarı
  COMPLETED: "#52c41a", // Yeşil
  UNLOADED: "#13c2c2", // Camgöbeği
  CANCELED: "#ff4d4f", // Kırmızı
  UNKNOWN: "#d9d9d9", // Gri
};

export const useCompanyStats = (trips: TripType[]) => {

  const companyChartData = useMemo(() => {
    if (!trips || trips.length === 0) return [];

    const counts = trips.reduce((acc: Record<string, number>, trip) => {
      const companyName = trip.company?.name || "Bilinmeyen Firma";

      acc[companyName] = (acc[companyName] || 0) + 1;
      
      return acc;
    }, {});

    const formattedData: ChartData[] = Object.entries(counts).map(([id, value]) => ({
      id,
      value,
    }));

    formattedData.sort((a, b) => b.value - a.value);

    const TOP_COUNT = 5;
    
    if (formattedData.length <= TOP_COUNT) {
      return formattedData;
    }

    const topCompanies = formattedData.slice(0, TOP_COUNT);
    
    const otherCount = formattedData
      .slice(TOP_COUNT)
      .reduce((sum, item) => sum + item.value, 0);

    if (otherCount > 0) {
      topCompanies.push({ name: "Diğerleri", value: otherCount });
    }

    return topCompanies;

  }, [trips]);

  return companyChartData;
};

export const useMonthCompanyStats = (trips: TripType[]) => {
  const d = new Date();
  const targetMonth = d.getMonth();
  const targetYear = d.getFullYear();

  const companyChartData = useMemo(() => {
    if (!trips || trips.length === 0) {
        return [{ id: "Veri Yok", value: 1 }];
    }

    const counts = trips.reduce((acc: Record<string, number>, trip) => {
      const companyName = trip.company?.name || "Bilinmeyen Firma";

      if (!trip.arrival_time) return acc;
      const companyArrivalDate = new Date(trip.arrival_time);

      if (isNaN(companyArrivalDate.getTime())) return acc;

      const companyArrivalMonth = companyArrivalDate.getMonth();
      const companyArrivalYear = companyArrivalDate.getFullYear();

      if (targetMonth === companyArrivalMonth && targetYear === companyArrivalYear) {
        acc[companyName] = (acc[companyName] || 0) + 1;
      }

      return acc;
    }, {});

    const formattedData: ChartData[] = Object.entries(counts).map(([id, value]) => ({
      id,
      value,
    }));

    formattedData.sort((a, b) => b.value - a.value);

    if (formattedData.length === 0) {
      return [{ id: "Bu Ay Sefer Yok", value: 1 }]; 
    }

    const TOP_COUNT = 5;
    
    if (formattedData.length <= TOP_COUNT) {
      return formattedData;
    }

    const topCompanies = formattedData.slice(0, TOP_COUNT);
    
    const otherCount = formattedData
      .slice(TOP_COUNT)
      .reduce((sum, item) => sum + item.value, 0);

    if (otherCount > 0) {
      topCompanies.push({ name: "Diğerleri", value: otherCount });
    }

    return topCompanies;

  }, [trips, targetMonth, targetYear]);

  return companyChartData;
};

export const useVehicleUnloadStats = (trips: TripType[]) => {
  const {t} = useTranslation();
  const d = new Date();
  const targetDay = d.getDay();
  const targetMonth = d.getMonth();
  const targetYear = d.getFullYear();

  const vehicleChartData = useMemo(() => {
    if (!trips || trips.length === 0) {
      return [{ id: "Veri Yok", value: 1 }];
    }

    const counts = trips.reduce((accumulator: Record<string,number>, trip) => {
      const vehicleStatus = trip.unload_status || "-";

      if (!trip.arrival_time) return accumulator;
      const vehicleArrivalDate = new Date(trip.arrival_time);
      
      if (isNaN(vehicleArrivalDate.getTime())) return accumulator;

      const vehicleArrivalMonth = vehicleArrivalDate.getMonth();
      const vehicleArrivalYear = vehicleArrivalDate.getFullYear();
      const vehicleArrivalDay = vehicleArrivalDate.getDay();

      if (targetDay === vehicleArrivalDay && targetMonth === vehicleArrivalMonth && targetYear === vehicleArrivalYear) {
        accumulator[vehicleStatus] = (accumulator[vehicleStatus] || 0) + 1;
      }
      
      return accumulator; 
    },{});

    const formattedData: ChartData[] = Object.entries(counts).map(([id, value]) => ({
      id: t(`Trips.STATUS_${id}`),
      value,
      color: STATUS_COLORS[id] || STATUS_COLORS.UNKNOWN
    }));

    if (formattedData.length === 0) {
      return [{ id: "Araba kaydı yok", value: 1 }]; 
    }

    return formattedData;

  }, [trips, t])

  return vehicleChartData;
}

export const useDailyTripStats = (trips: TripType[]) => {
  const dailyStats = useMemo(() => {
    const days: any[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("tr-TR", { weekday: "short"}),
        WAITING: 0,
        COMPLETED: 0,
        UNLOADED: 0,
        CANCELED: 0,
        UNKNOWN: 0
      });
    }

    trips?.forEach((trip) => {
      if (!trip.arrival_time) return;

      const tripDate = trip.arrival_time.split("T")[0];
      const status = trip.unload_status ? trip.unload_status.toLocaleUpperCase() : "UNKNOWN";

      const dayStat = days.find(d => d.date === tripDate);

      if(dayStat) {
        if (dayStat[status]  !== undefined) {
          dayStat[status]++;
        } else {
          dayStat.UNKNOWN++;
        }
      }
    });

    return days;
  }, [trips]);

  return dailyStats;
}

export const useCalendarStats = (trips: TripType[]) => {
  const calendarData = useMemo(() => {
    if (!trips) return [];

    // 1. Gruplama: { "2026-01-17": 5, "2026-01-18": 2 }
    const dayMap = trips.reduce((acc: Record<string, number>, trip) => {
      if (!trip.arrival_time) return acc;
      
      // Sadece YYYY-MM-DD kısmını alıyoruz
      const dateKey = new Date(trip.arrival_time).toISOString().split('T')[0];
      
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    // 2. Nivo Formatına Çevirme
    return Object.entries(dayMap).map(([day, value]) => ({
      day,
      value
    }));
  }, [trips]);

  return calendarData;
};