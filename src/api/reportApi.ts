import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

export type ReportPeriod = 'today' | 'month' | 'year' | 'all';

export interface CompanyStat {
  companyName: string;
  tripCount: number;
}

export interface TrendStat {
  timestamp: string;
  count: number;
}

export interface ActivityStat {
  day: string;
  value: number;
}

export interface DashboardSummary {
  today: {
    totalTrips: number;
    waitingToUnload: number;
    topCompanies: CompanyStat[];
  };
  totalCompanies: number;
  totalDrivers: number;
}

export interface StatusDistributionResponse {
  statuses: Record<string, number>;
  inParkingLot: number;
  canceled: number;
}

export const reportApi = {
  getTopCompanies: async (period: ReportPeriod = 'month'): Promise<CompanyStat[]> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.TOP_COMPANIES, { params: { period } });
    return response.data.data ?? response.data ?? [];
  },

  getUnloadWaiting: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.UNLOAD_WAITING, { params: { period } });
    return response.data.data ?? response.data;
  },

  getStatusDistribution: async (period: ReportPeriod = 'month', excludeStatus?: string | string[]): Promise<StatusDistributionResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.STATUS_DISTRIBUTION, { 
      params: { period, excludeStatus } 
    });
    return response.data.data ?? response.data;
  },

  getAverageTurnaround: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.AVERAGE_TURNAROUND, { params: { period } });
    return response.data.data ?? response.data;
  },

  getTrend: async (period: ReportPeriod = 'month'): Promise<TrendStat[]> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.TREND, { params: { period } });
    return response.data.data ?? response.data ?? [];
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.DASHBOARD_SUMMARY);
    return response.data.data ?? response.data;
  },

  exportExcel: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.EXPORT_EXCEL, {
      params: { period },
      responseType: 'blob'
    });
    return response.data;
  },

  exportPdf: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.EXPORT_PDF, { 
      params: { period },
      responseType: 'blob' 
    });
    return response.data;
  }
};
