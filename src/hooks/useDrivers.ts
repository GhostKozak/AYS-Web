import { useCrud } from "./useCrud";
import { driverApi } from "../api/driverApi";
import { type CreateDriverPayload, type DriverType } from "../types";

export const useDrivers = () => {
  const { data, total, isLoading, isError, refetch, create, update, remove, page, setPage, pageSize, setPageSize, search, setSearch } = useCrud<
    DriverType,
    CreateDriverPayload
  >(driverApi, {
    queryKey: ["drivers"],
    staleTime: 1000 * 60 * 10,
    pagination: { pageSize: 10 },
  });

  return {
    drivers: data,
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
    createDriver: create,
    updateDriver: update,
    deleteDriver: remove,
  };
};
