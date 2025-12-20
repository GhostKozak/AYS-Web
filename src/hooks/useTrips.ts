import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripApi } from "../api/tripApi";
import { type TripType } from "../types";

export const useTrips = () => {
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading, isError } = useQuery<TripType[]>({
    queryKey: ["trips"],
    queryFn: tripApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });

  const createMutation = useMutation({
    mutationFn: tripApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => tripApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tripApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  return {
    trips,
    isLoading,
    isError,
    createTrip: createMutation.mutateAsync,
    updateTrip: updateMutation.mutateAsync,
    deleteTrip: deleteMutation.mutateAsync,
  };
};