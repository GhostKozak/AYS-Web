import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanies } from "../../hooks/useCompanies";
import { useDrivers } from "../../hooks/useDrivers";
import { useVehicles } from "../../hooks/useVehicles";
import CrudPage from "../common/CrudPage";
import TripCardList from "./components/TripCardList";
import { useTrips } from "../../hooks/useTrips";
import TripTable, { getTripTableSettingsOptions } from "./components/TripTable";
import TripModal from "./components/TripModal";
import { exportTripsToExcel } from "../../utils/excel.utils";

function Trips() {
  const queryClient = useQueryClient();
  const { trips, isLoading, isError, refetch, createTrip, updateTrip, deleteTrip } = useTrips();
  const { companies } = useCompanies();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();

  const handleCreated = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["companies"] });
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
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
