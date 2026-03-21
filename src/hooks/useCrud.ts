import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

interface CrudApi<T, CreatePayload> {
  getAll: () => Promise<T[]>;
  create: (data: CreatePayload) => Promise<any>;
  update: (id: string, data: Partial<CreatePayload>) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

interface UseCrudOptions {
  queryKey: string[];
  staleTime?: number;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
}

export const useCrud = <T, CreatePayload>(
  api: CrudApi<T, CreatePayload>,
  options: UseCrudOptions
) => {
  const queryClient = useQueryClient();
  const { queryKey, staleTime = 1000 * 60 * 5, ...queryOpts } = options;

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<T[]>({
    queryKey,
    queryFn: api.getAll,
    staleTime,
    ...queryOpts,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePayload) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<CreatePayload>) =>
      api.update(id, payload as Partial<CreatePayload>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: deleteMutation.isPending,
  };
};
