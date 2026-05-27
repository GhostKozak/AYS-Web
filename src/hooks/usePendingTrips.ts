import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tripApi } from "../api/tripApi";
import { type TripType } from "../types";
import { socket } from "../utils/socket";

const PENDING_LIMIT = 200;

interface PendingTripsData {
  pendingTrips: TripType[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const usePendingTrips = (): PendingTripsData => {
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pending-trips"],
    queryFn: async () => {
      const result = await tripApi.getPendingVerification();
      return result;
    },
    refetchInterval: pollingInterval,
    staleTime: 1000 * 60 * 5,
  });
  const safeData = data ?? { data: [], count: 0 };

  return {
    pendingTrips: safeData.data,
    totalCount: safeData.count,
    hasMore: safeData.count > PENDING_LIMIT,
    isLoading,
    isError,
    refetch,
  };
};
