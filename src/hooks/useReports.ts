import { useQuery } from "@tanstack/react-query";
import { reportApi, type ReportPeriod } from "../api/reportApi";

// Caching constants to reduce API load and prevent "Too Many Requests" (429)
const REPORT_STALE_TIME = 1000 * 60 * 10; // 10 minutes
const REPORT_GC_TIME = 1000 * 60 * 30;    // 30 minutes

// Generic config for all report queries to be as non-aggressive as possible
const REPORT_QUERY_CONFIG = {
  staleTime: REPORT_STALE_TIME,
  gcTime: REPORT_GC_TIME,
  retry: false,               // Do not retry on failure (preventing 429 loop)
  refetchOnWindowFocus: false, // Do not refetch when switching back to tab
};

export const useTopCompanies = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'top-companies', period],
    queryFn: () => reportApi.getTopCompanies(period),
    ...REPORT_QUERY_CONFIG,
  });
};

export const useUnloadWaiting = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'unload-waiting', period],
    queryFn: () => reportApi.getUnloadWaiting(period),
    ...REPORT_QUERY_CONFIG,
  });
};

export const useStatusDistribution = (period: ReportPeriod = 'month', excludeStatus?: string | string[]) => {
  return useQuery({
    queryKey: ['reports', 'status-distribution', period, excludeStatus],
    queryFn: () => reportApi.getStatusDistribution(period, excludeStatus),
    ...REPORT_QUERY_CONFIG,
  });
};

export const useAverageTurnaround = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'average-turnaround', period],
    queryFn: () => reportApi.getAverageTurnaround(period),
    ...REPORT_QUERY_CONFIG,
  });
};

export const useReportTrend = (period: ReportPeriod = 'month', year?: number) => {
  return useQuery({
    queryKey: ['reports', 'trend', period, year],
    queryFn: () => reportApi.getTrend(period, year),
    ...REPORT_QUERY_CONFIG,
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['reports', 'dashboard-summary'],
    queryFn: () => reportApi.getDashboardSummary(),
    ...REPORT_QUERY_CONFIG,
  });
};

export const useParkingLot = (totalCapacity: number = 100) => {
  return useQuery({
    queryKey: ['reports', 'parking-lot', totalCapacity],
    queryFn: () => reportApi.getParkingLotDashboard(totalCapacity),
    ...REPORT_QUERY_CONFIG,
  });
};
