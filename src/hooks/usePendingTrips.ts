import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tripApi } from "../api/tripApi";
import { type TripType } from "../types";
import { socket } from "../utils/socket";

export const usePendingTrips = () => {
  const [pollingInterval, setPollingInterval] = useState<number | false>(30000);

  useEffect(() => {
    const updateInterval = () => {
      if (socket.connected) {
        console.log("[usePendingTrips] WebSocket active: polling disabled");
        setPollingInterval(false);
      } else {
        console.log("[usePendingTrips] WebSocket inactive: polling fallback at 30s");
        setPollingInterval(30000);
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
  });

  return {
    pendingTrips: data,
    isLoading,
    isError,
    refetch,
  };
};
