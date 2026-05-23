import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "../../api/companyApi";
import { driverApi } from "../../api/driverApi";
import { vehicleApi } from "../../api/vehicleApi";
import CrudPage from "../common/CrudPage";
import TripCardList from "./components/TripCardList";
import { useTrips } from "../../hooks/useTrips";
import TripTable, { getTripTableSettingsOptions } from "./components/TripTable";
import TripModal from "./components/TripModal";
import { exportTripsToExcel } from "../../utils/excel.utils";

function Trips() {
  const queryClient = useQueryClient();
  const { trips, total, isLoading, isError, refetch, createTrip, updateTrip, deleteTrip, page, setPage, pageSize, setPageSize, search, setSearch } = useTrips({ paginated: true, pageSize: 10 });
  const { data: companiesData } = useQuery({ queryKey: ["companies", "all"], queryFn: () => companyApi.getAll({ limit: 10000 }) });
  const { data: driversData } = useQuery({ queryKey: ["drivers", "all"], queryFn: () => driverApi.getAll({ limit: 10000 }) });
  const { data: vehiclesData } = useQuery({ queryKey: ["vehicles", "all"], queryFn: () => vehicleApi.getAll({ limit: 10000 }) });
  const companies = companiesData?.items ?? [];
  const drivers = driversData?.items ?? [];
  const vehicles = vehiclesData?.items ?? [];

  const handleCreated = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["companies"] });
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["companies", "all"] });
    queryClient.invalidateQueries({ queryKey: ["drivers", "all"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles", "all"] });
  }, [queryClient]);

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
          is_trip_canceled: values.is_trip_canceled,
          notes: values.notes,
        };
        if (selectedRecord) {
          await updateTrip({ id: selectedRecord._id, ...payload });
        } else {
          await createTrip(payload);
          queryClient.invalidateQueries({ queryKey: ["companies"] });
          queryClient.invalidateQueries({ queryKey: ["drivers"] });
          queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        }
      }}
      Table={TripTable}
      CardList={TripCardList}
      ModalComponent={TripModal}
      modalExtraProps={{ companies, drivers, vehicles, onCreated: handleCreated } as any}
      getSettingsOptions={getTripTableSettingsOptions}
      defaultVisibleColumns={["time_range", "driver", "company", "vehicle", "unload_status", "location", "status", "action"]}
      settingsKey="trips"
      mobileBreakpoint={1024}
    />
  );
}

export default Trips;
