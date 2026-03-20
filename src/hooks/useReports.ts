import { useQuery } from "@tanstack/react-query";
import { reportApi, type ReportPeriod } from "../api/reportApi";

export const useTopCompanies = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'top-companies', period],
    queryFn: () => reportApi.getTopCompanies(period),
  });
};

export const useUnloadWaiting = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'unload-waiting', period],
    queryFn: () => reportApi.getUnloadWaiting(period),
  });
};

export const useStatusDistribution = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'status-distribution', period],
    queryFn: () => reportApi.getStatusDistribution(period),
  });
};

export const useAverageTurnaround = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'average-turnaround', period],
    queryFn: () => reportApi.getAverageTurnaround(period),
  });
};

export const useReportTrend = (period: ReportPeriod = 'month') => {
  return useQuery({
    queryKey: ['reports', 'trend', period],
    queryFn: () => reportApi.getTrend(period),
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['reports', 'dashboard-summary'],
    queryFn: () => reportApi.getDashboardSummary(),
  });
};
