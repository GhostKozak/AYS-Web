import { useCrud } from "./useCrud";
import { companyApi } from "../api/companyApi";
import { type CompanyType, type CreateCompanyPayload } from "../types";

export const useCompanies = () => {
  const { data, total, isLoading, isError, refetch, create, update, remove, page, setPage, pageSize, setPageSize, search, setSearch } = useCrud<
    CompanyType,
    CreateCompanyPayload
  >(companyApi, {
    queryKey: ["companies"],
    staleTime: 1000 * 60 * 10,
    pagination: { pageSize: 10 },
  });

  return {
    companies: data,
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
    createCompany: create,
    updateCompany: update,
    deleteCompany: remove,
  };
};
