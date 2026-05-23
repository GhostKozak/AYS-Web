import { useQuery } from "@tanstack/react-query";
import { companyApi } from "../../api/companyApi";
import CrudPage from "../common/CrudPage";
import DriverCardList from "./components/DriverCardList";
import { useDrivers } from "../../hooks/useDrivers";
import DriverTable, { getDriverTableSettingsOptions } from "./components/DriverTable";
import DriverModal from "./components/DriverModal";
import { exportDriversToExcel } from "../../utils/excel.utils";

function Drivers() {
  const { drivers, total, isLoading, isError, refetch, createDriver, updateDriver, deleteDriver, page, setPage, pageSize, setPageSize, search, setSearch } = useDrivers();
  const { data: companiesData } = useQuery({ queryKey: ["companies", "all"], queryFn: () => companyApi.getAll({ limit: 10000 }) });
  const companies = companiesData?.items ?? [];

  return (
    <CrudPage
      breadcrumbKey="Breadcrumbs.DRIVERS"
      searchPlaceholderKey="Drivers.SEARCH"
      addButtonKey="Drivers.ADD_BUTTON"
      deleteSuccessKey="Drivers.DELETE_SUCCESS"
      createSuccessKey="Drivers.CREATE_SUCCESS"
      updateSuccessKey="Drivers.UPDATE_SUCCESS"
      updateNotificationTitleKey="Audit.DETAILS"
      data={drivers}
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
      onDeleteItem={deleteDriver}
      filterFn={(driver, searchText) =>
        !!(driver.full_name.toLowerCase().includes(searchText) ||
        driver.phone_number.includes(searchText))
      }
      exportFn={exportDriversToExcel}
      onFormSubmit={async (values, selectedRecord) => {
        const payload = {
          full_name: values.full_name,
          phone_number: values.phone_number,
          company: values.company,
        };
        if (selectedRecord) {
          await updateDriver({ id: selectedRecord._id, ...payload });
        } else {
          await createDriver(payload);
        }
      }}
      Table={DriverTable}
      CardList={DriverCardList}
      ModalComponent={DriverModal}
      modalExtraProps={{ companies } as any}
      getSettingsOptions={getDriverTableSettingsOptions}
      defaultVisibleColumns={["full_name", "phone_number", "company", "createdAt", "updatedAt", "deleted", "action"]}
      settingsKey="drivers"
    />
  );
}

export default Drivers;
