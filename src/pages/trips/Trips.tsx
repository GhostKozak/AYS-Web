import { tripApi } from "../../api/tripApi";
import CrudPage from "../common/CrudPage";
import TripCardList from "./components/TripCardList";
import TripTable from "./components/TripTable";
import { useTrips } from "../../hooks/useTrips";
import { useCompanies } from "../../hooks/useCompanies";
import { useDrivers } from "../../hooks/useDrivers";
import { useVehicles } from "../../hooks/useVehicles";
import type { TFunction } from "i18next";

const getTripTableSettingsOptions = (t: TFunction) => [
  { key: "time_range", title: t("Trips.TIME_RANGE") },
  { key: "driver", title: t("Trips.DRIVER") },
  { key: "driver_phone", title: t("Trips.PHONE_NUMBER") },
  { key: "company", title: t("Trips.COMPANY_NAME") },
  { key: "vehicle", title: t("Trips.LICENSE_PLATE") },
  { key: "unload_status", title: t("Trips.UNLOAD_STATUS") },
  { key: "has_gps_tracking", title: t("Trips.GPS_TRACKING") },
  { key: "location", title: t("Trips.LOCATION") },
  { key: "seal_number", title: t("Trips.SEAL_NUMBER") },
  { key: "status", title: t("Trips.VERIFICATION_STATUS") },
  { key: "field_photo_path", title: t("Trips.FIELD_PHOTO") },
  { key: "field_verified_at", title: t("Trips.FIELD_VERIFIED_AT") },
  { key: "createdAt", title: t("Table.CREATED_AT") },
  { key: "updatedAt", title: t("Table.UPDATED_AT") },
  { key: "action", title: t("Table.ACTIONS") },
];
import TripModal from "./components/TripModal";
import { exportTripsToExcel } from "../../utils/excel.utils";

function Trips() {
  const { trips, total, isLoading, isError, refetch, createTrip, updateTrip, deleteTrip, page, setPage, pageSize, setPageSize, search, setSearch } = useTrips({ paginated: true, pageSize: 10 });
  const { companies } = useCompanies();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();

  return (
    <CrudPage
      breadcrumbKey="Breadcrumbs.TRIPS"
      searchPlaceholderKey="Trips.SEARCH"
      addButtonKey="Trips.ADD_BUTTON"
      deleteSuccessKey="Trips.DELETE_SUCCESS"
      createSuccessKey="Trips.CREATE_SUCCESS"
      updateSuccessKey="Trips.UPDATE_SUCCESS"
      data={trips}
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
      onDeleteItem={deleteTrip}
      filterFn={(trip, searchText) =>
        !!(trip.company?.name?.toLowerCase().includes(searchText) ||
        trip.driver?.full_name?.toLowerCase().includes(searchText) ||
        trip.driver?.phone_number?.includes(searchText) ||
        trip.vehicle?.licence_plate?.toLowerCase().includes(searchText))
      }
      exportFn={exportTripsToExcel}
      exportAllFn={async (s) => {
        const res = await tripApi.getAll({ search: s || undefined });
        exportTripsToExcel(res.items);
      }}
      onFormSubmit={async (values, selectedRecord) => {
        const payload = {
          driver: values.driver,
          company: values.company,
          vehicle: values.vehicle,
          driver_full_name: values.driver_full_name,
          driver_phone_number: values.driver_phone_number,
          departure_time: values.departure_time,
          arrival_time: values.arrival_time,
          unload_status: values.unload_status,
          has_gps_tracking: values.has_gps_tracking,
          is_in_temporary_parking_lot: values.is_in_temporary_parking_lot,
          is_in_parking_lot: values.is_in_parking_lot,
          parked_at: values.parked_at,
          is_trip_canceled: values.is_trip_canceled,
          notes: values.notes,
        };
        if (selectedRecord) {
          await updateTrip({ id: selectedRecord._id, ...payload });
        } else {
          await createTrip(payload);
        }
      }}
      Table={TripTable}
      CardList={TripCardList}
      ModalComponent={TripModal}
      modalExtraProps={{ companies, drivers, vehicles } as any}
      getSettingsOptions={getTripTableSettingsOptions}
      defaultVisibleColumns={["time_range", "driver", "company", "vehicle", "unload_status", "status", "location", "action"]}
      settingsKey="trips"
      mobileBreakpoint={1024}
      tableExtraProps={{
        setSearch
      }}
    />
  );
}

export default Trips;
