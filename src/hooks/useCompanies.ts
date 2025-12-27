import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "../api/companyApi";
import { type CompanyType, type CreateCompanyPayload } from "../types";

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading, isError } = useQuery<CompanyType[]>({
    queryKey: ["companies"],
    queryFn: companyApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyPayload) => companyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateCompanyPayload>) => companyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: companyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  return {
    companies,
    isLoading,
    isError,
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
  };
};