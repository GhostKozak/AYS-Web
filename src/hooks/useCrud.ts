import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { App } from "antd";
import type { PaginatedResponse, PaginationParams } from "../types";
import { useDebounce } from "./useDebounce";

interface CrudApi<T, CreatePayload> {
  getAll: (params?: PaginationParams) => Promise<PaginatedResponse<T>>;
  create: (data: CreatePayload) => Promise<any>;
  update: (id: string, data: Partial<CreatePayload>) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

interface UseCrudOptions {
  queryKey: string[];
  staleTime?: number;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  pagination?: {
    pageSize?: number;
  };
}

export const useCrud = <T, CreatePayload>(
  api: CrudApi<T, CreatePayload>,
  options: UseCrudOptions
) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const { queryKey, staleTime = 1000 * 60 * 5, pagination, ...queryOpts } = options;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize ?? 10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const queryPageKey = pagination ? [...queryKey, "p", page, "s", debouncedSearch, "l", pageSize] : queryKey;
  const queryFn = pagination
    ? () => api.getAll({ limit: pageSize, offset: (page - 1) * pageSize })
    : () => api.getAll({ limit: 10000 });

  const { data: rawData, isLoading, isError, refetch } = useQuery<PaginatedResponse<T>>({
    queryKey: queryPageKey,
    queryFn,
    staleTime,
    ...queryOpts,
  });

  const items = rawData?.items ?? [];
  const total = pagination ? (rawData?.total ?? items.length) : items.length;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreatePayload) => api.create(data),
    onSuccess: invalidate,
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err.message || "An error occurred during the operation");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<CreatePayload>) =>
      api.update(id, payload as Partial<CreatePayload>),
    onSuccess: invalidate,
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err.message || "An error occurred during update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err.message || "An error occurred during delete");
    },
  });

  return {
    data: items,
    total,
    isLoading,
    isError,
    refetch,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: deleteMutation.isPending,
  };
};
