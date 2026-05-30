import { useState, useEffect } from "react";
import { useCrud } from "./useCrud";
import { tripApi } from "../api/tripApi";
import { type CreateTripPayload, type TripType } from "../types";
import { socket } from "../utils/socket";

interface UseTripsOptions {
  paginated?: boolean;
  pageSize?: number;
}

export const useTrips = (options?: UseTripsOptions) => {
  const [pollingInterval, setPollingInterval] = useState<number | false>(
    socket.connected ? false : 30000,
  );

  useEffect(() => {
    const updateInterval = () => {
      setPollingInterval(socket.connected ? false : 30000);
    };

    socket.on("connect", updateInterval);
    socket.on("disconnect", updateInterval);
    updateInterval();

    return () => {
      socket.off("connect", updateInterval);
      socket.off("disconnect", updateInterval);
    };
  }, []);

  const pagination = options?.paginated ? { pageSize: options.pageSize ?? 10 } : undefined;

  const { data, total, isLoading, isError, refetch, create, update, remove, page, setPage, pageSize, setPageSize, search, setSearch } = useCrud<
    TripType,
    CreateTripPayload
  >(tripApi, {
    queryKey: ["trips"],
    refetchInterval: pollingInterval,
    pagination,
  });

  return {
    trips: data,
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
    createTrip: create,
    updateTrip: update,
    deleteTrip: remove,
  };
};
