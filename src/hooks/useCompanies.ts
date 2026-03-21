import { useCrud } from "./useCrud";
import { companyApi } from "../api/companyApi";
import { type CompanyType, type CreateCompanyPayload } from "../types";

export const useCompanies = () => {
  const { data, isLoading, isError, create, update, remove } = useCrud<
    CompanyType,
    CreateCompanyPayload
  >(companyApi, {
    queryKey: ["companies"],
    staleTime: 1000 * 60 * 10, // 10 dakika
  });

  return {
    companies: data,
    isLoading,
    isError,
    createCompany: create,
    updateCompany: update,
    deleteCompany: remove,
  };
};