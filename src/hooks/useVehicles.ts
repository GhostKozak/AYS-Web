import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleApi } from "../api/vehicleApi";
import { type CreateVehiclePayload, type VehicleType } from "../types";

export const useVehicles = () => {
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading, isError } = useQuery<VehicleType[]>({
    queryKey: ["vehicles"],
    queryFn: vehicleApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehicleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateVehiclePayload>) => vehicleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  return {
    vehicles,
    isLoading,
    isError,
    createVehicle: createMutation.mutateAsync,
    updateVehicle: updateMutation.mutateAsync,
    deleteVehicle: deleteMutation.mutateAsync,
  };
};