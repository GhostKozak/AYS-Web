import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tripApi } from "../api/tripApi";
import { type TripType } from "../types";
import { socket } from "../utils/socket";

export const usePendingTrips = () => {
  const [pollingInterval, setPollingInterval] = useState<number>(30000);

  useEffect(() => {
    const updateInterval = () => {
      if (socket.connected) {
        console.log("[usePendingTrips] WebSocket active: set polling to 30s");
        setPollingInterval(30000);
      } else {
        console.log("[usePendingTrips] WebSocket inactive: active polling fallback at 12s");
        setPollingInterval(12000); // 12 seconds active polling
      }
    };

    socket.on("connect", updateInterval);
    socket.on("disconnect", updateInterval);
    updateInterval(); // Initial check

    return () => {
      socket.off("connect", updateInterval);
      socket.off("disconnect", updateInterval);
    };
  }, []);

  const { data = [], isLoading, isError, refetch } = useQuery<TripType[]>({
    queryKey: ["pending-trips"],
    queryFn: tripApi.getPendingVerification,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: true,
  });

  return {
    pendingTrips: data,
    isLoading,
    isError,
    refetch,
  };
};
