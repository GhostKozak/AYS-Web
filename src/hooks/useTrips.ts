import { useState, useEffect } from "react";
import { useCrud } from "./useCrud";
import { tripApi } from "../api/tripApi";
import { type CreateTripPayload, type TripType } from "../types";
import { socket } from "../utils/socket";

export const useTrips = () => {
  const [pollingInterval, setPollingInterval] = useState<number>(30000);

  useEffect(() => {
    const updateInterval = () => {
      if (socket.connected) {
        console.log("[useTrips] WebSocket active: polling disabled");
        setPollingInterval(0);
      } else {
        console.log("[useTrips] WebSocket inactive: polling fallback at 30s");
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

  const { data, isLoading, isError, refetch, create, update, remove } = useCrud<
    TripType,
    CreateTripPayload
  >(tripApi, {
    queryKey: ["trips"],
    refetchInterval: pollingInterval,
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