import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

export type ReportPeriod = 'today' | 'month' | 'year' | 'all';

export const reportApi = {
  getTopCompanies: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.TOP_COMPANIES, { params: { period } });
    return response.data;
  },

  getUnloadWaiting: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.UNLOAD_WAITING, { params: { period } });
    return response.data;
  },

  getStatusDistribution: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.STATUS_DISTRIBUTION, { params: { period } });
    return response.data;
  },

  getAverageTurnaround: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.AVERAGE_TURNAROUND, { params: { period } });
    return response.data;
  },

  getTrend: async (period: ReportPeriod = 'month') => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.TREND, { params: { period } });
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.DASHBOARD_SUMMARY);
    return response.data;
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
