import { driverApi } from "../../api/driverApi";
import CrudPage from "../common/CrudPage";
import DriverCardList from "./components/DriverCardList";
import { useDrivers } from "../../hooks/useDrivers";
import { useCompanies } from "../../hooks/useCompanies";

import DriverTable from "./components/DriverTable";
import type { TFunction } from "i18next";

const getDriverTableSettingsOptions = (t: TFunction) => [
  { key: "full_name", title: t("Drivers.FULL_NAME") },
  { key: "phone_number", title: t("Drivers.PHONE_NUMBER") },
  { key: "tc_number", title: t("Drivers.TC_NUMBER") },
  { key: "createdAt", title: t("Table.CREATED_AT") },
  { key: "deleted", title: t("Table.STATUS") },
  { key: "action", title: t("Table.ACTIONS") },
];
import DriverModal from "./components/DriverModal";
import { exportDriversToExcel } from "../../utils/excel.utils";

function Drivers() {
  const { drivers, total, isLoading, isError, refetch, createDriver, updateDriver, deleteDriver, page, setPage, pageSize, setPageSize, search, setSearch } = useDrivers();
  const { companies } = useCompanies();

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
      exportAllFn={async (s) => {
        const res = await driverApi.getAll({ search: s || undefined });
        exportDriversToExcel(res.items);
      }}
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
      tableExtraProps={{ setSearch }}
    />
  );
}

export default Drivers;
