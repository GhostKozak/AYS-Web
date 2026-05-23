import { useCrud } from "./useCrud";
import { vehicleApi } from "../api/vehicleApi";
import { type CreateVehiclePayload, type VehicleType } from "../types";

export const useVehicles = () => {
  const { data, total, isLoading, isError, refetch, create, update, remove, page, setPage, pageSize, setPageSize, search, setSearch } = useCrud<
    VehicleType,
    CreateVehiclePayload
  >(vehicleApi, {
    queryKey: ["vehicles"],
    staleTime: 1000 * 60 * 10,
    pagination: { pageSize: 10 },
  });

  return {
    vehicles: data,
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
    createVehicle: create,
    updateVehicle: update,
    deleteVehicle: remove,
  };
};
