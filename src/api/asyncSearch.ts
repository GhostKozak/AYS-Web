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
    const { search, limit, offset, ...extraFilters } = params;

    // 1. Register socket listeners BEFORE the POST request
    //    to avoid missing events on fast responses (cache hits).
    const result = await new Promise<PaginatedResponse<T>>((resolve, reject) => {
      let jobId: string | undefined;

      const timeoutId = setTimeout(() => {
        cleanup();
        httpFallback<T>(moduleName, params).then(resolve).catch(reject);
      }, 3000);

      const onResult = (res: any) => {
        if (res.jobId === jobId) {
          cleanup();
          resolve({ items: res.data, total: res.count });
        }
      };

      const onError = (err: any) => {
        if (err.jobId === jobId) {
          cleanup();
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

      // 2. Send POST request to initiate async search
      apiClient
        .post('/search/async', {
          module: moduleName,
          search,
          limit: limit ?? 10,
          offset: offset ?? 0,
          ...extraFilters,
        })
        .then((response) => {
          if (!response.data.jobId) {
            cleanup();
            reject(new Error('Arama başlatılamadı: jobId bulunamadı'));
            return;
          }
          jobId = response.data.jobId;
        })
        .catch((err) => {
          cleanup();
          reject(err);
        });
    });

    return result;
  } catch {
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
    items: response.data.data ?? [],
    total: response.data.count ?? 0,
  };
};
