import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driverApi";
import { type DriverType } from "../types";

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading, isError } = useQuery<DriverType[]>({
    queryKey: ["drivers"],
    queryFn: driverApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: driverApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; full_name: string; phone_number: string; company: string }) => 
      driverApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: driverApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  return {
    drivers,
    isLoading,
    isError,
    createDriver: createMutation.mutateAsync,
    updateDriver: updateMutation.mutateAsync,
    deleteDriver: deleteMutation.mutateAsync,
  };
};