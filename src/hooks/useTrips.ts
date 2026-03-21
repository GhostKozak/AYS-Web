import { useCrud } from "./useCrud";
import { tripApi } from "../api/tripApi";
import { type CreateTripPayload, type TripType } from "../types";

export const useTrips = () => {
  const { data, isLoading, isError, refetch, create, update, remove } = useCrud<
    TripType,
    CreateTripPayload
  >(tripApi, {
    queryKey: ["trips"],
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  return {
    trips: data,
    isLoading,
    isError,
    refetch,
    createTrip: create,
    updateTrip: update,
    deleteTrip: remove,
  };
};