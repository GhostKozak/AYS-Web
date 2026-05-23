import { useCompanies } from "../../hooks/useCompanies";
import CrudPage from "../common/CrudPage";
import DriverCardList from "./components/DriverCardList";
import { useDrivers } from "../../hooks/useDrivers";
import DriverTable, { getDriverTableSettingsOptions } from "./components/DriverTable";
import DriverModal from "./components/DriverModal";
import { exportDriversToExcel } from "../../utils/excel.utils";

function Drivers() {
  const { drivers, isLoading, isError, refetch, createDriver, updateDriver, deleteDriver } = useDrivers();
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
