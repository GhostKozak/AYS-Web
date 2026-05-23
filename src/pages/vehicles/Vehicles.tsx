import CrudPage from "../common/CrudPage";
import VehicleCardList from "./components/VehicleCardList";
import { useVehicles } from "../../hooks/useVehicles";
import VehicleTable, { getVehicleTableSettingsOptions } from "./components/VehicleTable";
import VehicleModal from "./components/VehicleModal";
import { exportVehiclesToExcel } from "../../utils/excel.utils";

function Vehicles() {
  const { vehicles, total, isLoading, isError, refetch, createVehicle, updateVehicle, deleteVehicle, page, setPage, pageSize, setPageSize, search, setSearch } = useVehicles();

  return (
    <CrudPage
      breadcrumbKey="Breadcrumbs.VEHICLES"
      searchPlaceholderKey="Vehicles.SEARCH"
      addButtonKey="Vehicles.ADD_BUTTON"
      deleteSuccessKey="Vehicles.DELETE_SUCCESS"
      createSuccessKey="Vehicles.CREATE_SUCCESS"
      updateSuccessKey="Vehicles.UPDATE_SUCCESS"
      data={vehicles}
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
      onDeleteItem={deleteVehicle}
      filterFn={(vehicle, searchText) =>
        !!(vehicle.licence_plate.toLowerCase().includes(searchText))
      }
      exportFn={exportVehiclesToExcel}
      onFormSubmit={async (values, selectedRecord) => {
        if (selectedRecord) {
          await updateVehicle({ id: selectedRecord._id, licence_plate: values.licence_plate, vehicle_type: values.vehicle_type });
        } else {
          await createVehicle({ licence_plate: values.licence_plate, vehicle_type: values.vehicle_type });
        }
      }}
      Table={VehicleTable}
      CardList={VehicleCardList}
      ModalComponent={VehicleModal}
      getSettingsOptions={getVehicleTableSettingsOptions}
      defaultVisibleColumns={["licence_plate", "vehicle_type", "createdAt", "updatedAt", "deleted", "action"]}
      settingsKey="vehicles"
    />
  );
}

export default Vehicles;
