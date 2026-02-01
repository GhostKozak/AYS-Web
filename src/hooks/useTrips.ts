import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripApi } from "../api/tripApi";
import { type CreateTripPayload, type TripType } from "../types";

export const useTrips = () => {
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading, isError, refetch } = useQuery<TripType[]>({
    queryKey: ["trips"],
    queryFn: tripApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 dakika
    refetchInterval: 30000,   // Polling: Her 30 saniyede bir otomatik yenile
    refetchIntervalInBackground: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTripPayload) => tripApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateTripPayload>) => 
      tripApi.update(id, data),
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
    refetch,
    createTrip: createMutation.mutateAsync,
    updateTrip: updateMutation.mutateAsync,
    deleteTrip: deleteMutation.mutateAsync,
  };
};