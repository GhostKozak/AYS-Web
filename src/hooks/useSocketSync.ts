import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket, connectSocket } from "../utils/socket";
import type { TripType } from "../types";

export const useSocketSync = (onTripVerified?: (tripId: string) => void) => {
  const queryClient = useQueryClient();
  const onTripVerifiedRef = useRef(onTripVerified);

  useEffect(() => {
    onTripVerifiedRef.current = onTripVerified;
  }, [onTripVerified]);

  useEffect(() => {
    connectSocket();

    const handleTripUpdated = (updatedTrip: TripType) => {
      console.log("[SocketSync] 'trip_updated' received:", updatedTrip);

      // 1. Update all matching trips caches (paginated or direct array)
      queryClient.setQueriesData<any>({ queryKey: ["trips"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((trip: any) =>
              trip._id === updatedTrip._id ? { ...trip, ...updatedTrip } : trip
            ),
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((trip: any) =>
            trip._id === updatedTrip._id ? { ...trip, ...updatedTrip } : trip
          );
        }
        return oldData;
      });

      // 2. Update pending verification trips cache
      queryClient.setQueryData<TripType[]>(["pending-trips"], (oldPending) => {
        if (!oldPending) return oldPending;

        const isStillPending =
          updatedTrip.unload_status === "PENDING" &&
          !updatedTrip.is_trip_canceled;

        if (isStillPending) {
          // Update the trip in pending list if it is still pending
          return oldPending.map((trip) =>
            trip._id === updatedTrip._id ? { ...trip, ...updatedTrip } : trip
          );
        } else {
          // Remove from pending list if it is no longer pending verification
          return oldPending.filter((trip) => trip._id !== updatedTrip._id);
        }
      });

      // 3. Trigger visual glow effect on table row via window custom event
      if (updatedTrip.unload_status !== "PENDING") {
        if (typeof window !== "undefined") {
          console.log("[SocketSync] Dispatching trip-verified event for ID:", updatedTrip._id);
          window.dispatchEvent(
            new CustomEvent("trip-verified", { detail: updatedTrip._id })
          );
        }
        if (onTripVerifiedRef.current) {
          onTripVerifiedRef.current(updatedTrip._id);
        }
      }

      // 4. Force background refetch to guarantee eventual absolute consistency
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["pending-trips"] });
    };

    socket.on("trip_updated", handleTripUpdated);

    // Initial log of connection state
    if (socket.connected) {
      console.log("[SocketSync] Socket is already connected.");
    } else {
      console.log("[SocketSync] Socket is waiting to connect...");
    }

    return () => {
      socket.off("trip_updated", handleTripUpdated);
    };
  }, [queryClient]);
};
