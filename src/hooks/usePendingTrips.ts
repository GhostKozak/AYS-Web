import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tripApi } from "../api/tripApi";
import { type TripType } from "../types";
import { socket } from "../utils/socket";

export const usePendingTrips = () => {
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

  const { data, isLoading, isError, refetch } = useQuery<TripType[]>({
    queryKey: ["pending-trips"],
    queryFn: async () => {
      const result = await tripApi.getPendingVerification();
      return Array.isArray(result) ? result : result?.items ?? [];
    },
    refetchInterval: pollingInterval,
    staleTime: 1000 * 60 * 5,
  });
  const safeData = data ?? [];

  return {
    pendingTrips: safeData,
    isLoading,
    isError,
    refetch,
  };
};
