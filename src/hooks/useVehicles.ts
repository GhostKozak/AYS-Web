import { useCrud } from "./useCrud";
import { vehicleApi } from "../api/vehicleApi";
import { type CreateVehiclePayload, type VehicleType } from "../types";

export const useVehicles = () => {
  const { data, isLoading, isError, create, update, remove } = useCrud<
    VehicleType,
    CreateVehiclePayload
  >(vehicleApi, {
    queryKey: ["vehicles"],
  });

  return {
    vehicles: data,
    isLoading,
    isError,
    createVehicle: create,
    updateVehicle: update,
    deleteVehicle: remove,
  };
};