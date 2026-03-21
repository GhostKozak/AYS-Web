import { useCrud } from "./useCrud";
import { driverApi } from "../api/driverApi";
import { type CreateDriverPayload, type DriverType } from "../types";

export const useDrivers = () => {
  const { data, isLoading, isError, create, update, remove } = useCrud<
    DriverType,
    CreateDriverPayload
  >(driverApi, {
    queryKey: ["drivers"],
  });

  return {
    drivers: data,
    isLoading,
    isError,
    createDriver: create,
    updateDriver: update,
    deleteDriver: remove,
  };
};