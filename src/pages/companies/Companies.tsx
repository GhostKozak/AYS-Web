import CrudPage from "../common/CrudPage";
import CompanyCardList from "./components/CompanyCardList";
import { useCompanies } from "../../hooks/useCompanies";
import CompanyTable from "./components/CompanyTable";
import type { TFunction } from "i18next";

const getCompanyTableSettingsOptions = (t: TFunction) => [
  { key: "name", title: t("Companies.COMPANY_NAME", "Company Name") },
  { key: "createdAt", title: t("Table.CREATED_AT", "Created At") },
  { key: "updatedAt", title: t("Table.UPDATED_AT", "Updated At") },
  { key: "deleted", title: t("Table.STATUS", "Status") },
  { key: "action", title: t("Table.ACTIONS", "Actions") },
];
import CompanyModal from "./components/CompanyModal";
import { exportCompaniesToExcel } from "../../utils/excel.utils";
import { companyApi } from "../../api/companyApi";

function Companies() {
  const { companies, total, isLoading, isError, refetch, createCompany, updateCompany, deleteCompany, page, setPage, pageSize, setPageSize, search, setSearch } = useCompanies();
  // allData fetch removed to prevent 429 errors

  return (
    <CrudPage
      breadcrumbKey="Breadcrumbs.COMPANIES"
      searchPlaceholderKey="Companies.SEARCH"
      addButtonKey="Companies.ADD_BUTTON"
      deleteSuccessKey="Companies.DELETE_SUCCESS"
      createSuccessKey="Companies.CREATE_SUCCESS"
      updateSuccessKey="Companies.UPDATE_SUCCESS"
      data={companies}
      total={total}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      search={search}
      setSearch={setSearch}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      onDeleteItem={deleteCompany}
      filterFn={(company, searchText) =>
        !!(company.name.toLowerCase().includes(searchText))
      }
      exportFn={exportCompaniesToExcel}
      exportAllFn={async (s) => {
        const res = await companyApi.getAll({ search: s || undefined });
        exportCompaniesToExcel(res.items);
      }}
      onFormSubmit={async (values, selectedRecord) => {
        if (selectedRecord) {
          await updateCompany({ id: selectedRecord._id, name: values.name });
        } else {
          await createCompany({ name: values.name });
        }
      }}
      Table={CompanyTable}
      CardList={CompanyCardList}
      ModalComponent={CompanyModal}
      getSettingsOptions={getCompanyTableSettingsOptions}
      defaultVisibleColumns={["name", "createdAt", "updatedAt", "deleted", "action"]}
      settingsKey="companies"
      tableExtraProps={{ setSearch }}
    />
  );
}

export default Companies;
