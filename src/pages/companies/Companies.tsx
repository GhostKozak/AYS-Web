import CrudPage from "../common/CrudPage";
import CompanyCardList from "./components/CompanyCardList";
import { useCompanies } from "../../hooks/useCompanies";
import CompanyTable, { getCompanyTableSettingsOptions } from "./components/CompanyTable";
import CompanyModal from "./components/CompanyModal";
import { exportCompaniesToExcel } from "../../utils/excel.utils";

function Companies() {
  const { companies, total, isLoading, isError, refetch, createCompany, updateCompany, deleteCompany, page, setPage, pageSize, setPageSize, search, setSearch } = useCompanies();

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
    />
  );
}

export default Companies;
