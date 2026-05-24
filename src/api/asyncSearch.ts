import { socket, connectSocket } from '../utils/socket';
import apiClient from './apiClient';
import type { PaginatedResponse, PaginationParams } from '../types';

export const asyncSearch = async <T>(
  moduleName: string,
  params: PaginationParams
): Promise<PaginatedResponse<T>> => {
  // Ensure socket is connected before starting
  if (!socket.connected) {
    connectSocket();
  }

  try {
    // 1. Send POST request to initiate async search
    const { search, limit, offset, ...extraFilters } = params;
    const response = await apiClient.post('/search/async', {
      module: moduleName,
      search,
      limit: limit ?? 10,
      offset: offset ?? 0,
      ...extraFilters,
    });

    const jobId = response.data.jobId;

    if (!jobId) {
      throw new Error("Arama başlatılamadı: jobId bulunamadı");
    }

    // 2. Wait for the socket event with a fail-fast timeout (3s)
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        console.warn(`Socket search timed out for ${moduleName}, falling back to HTTP GET`);
        httpFallback<T>(moduleName, params).then(resolve).catch(reject);
      }, 3000);

      const onResult = (res: any) => {
        if (res.jobId === jobId) {
          cleanup();
          resolve({
            items: res.data,
            total: res.count,
          });
        }
      };

      const onError = (err: any) => {
        if (err.jobId === jobId) {
          cleanup();
          console.warn(`Socket search error for ${moduleName}, falling back to HTTP GET:`, err);
          httpFallback<T>(moduleName, params).then(resolve).catch(reject);
        }
      };

      const cleanup = () => {
        socket.off('search_result', onResult);
        socket.off('search_error', onError);
        clearTimeout(timeoutId);
      };

      socket.on('search_result', onResult);
      socket.on('search_error', onError);
    });
  } catch (error) {
    console.warn(`Async search POST failed, falling back to HTTP GET for ${moduleName}:`, error);
    return httpFallback<T>(moduleName, params);
  }
};

const httpFallback = async <T>(
  moduleName: string,
  params: PaginationParams
): Promise<PaginatedResponse<T>> => {
  const { limit, offset, search, ...rest } = params;
  const response = await apiClient.get(`/${moduleName}`, {
    params: {
      limit: limit ?? 10,
      offset: offset ?? 0,
      search: search || undefined,
      ...rest,
    },
  });
  return {
    items: response.data.data ?? response.data.items ?? [],
    total: response.data.count ?? response.data.total ?? 0,
  };
};
