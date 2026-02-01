import { App, Button, Flex, Layout } from "antd";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { UserRole, type TripType } from "../../types";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTrips } from "../../hooks/useTrips";
import TripTable from "./components/TripTable";
import Search from "antd/es/input/Search";
import TripCardList from "./components/TripCardList";
import TripModal from "./components/TripModal";

import { useCompanies } from "../../hooks/useCompanies";
import { useVehicles } from "../../hooks/useVehicles";
import { useDrivers } from "../../hooks/useDrivers";
import { exportTripsToExcel } from "../../utils/excel.utils";
import { RoleGuard } from "../../components/auth/RoleGuard";

function Trips() {
  const { t } = useTranslation();
  const { message, notification, modal } = App.useApp();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TripType | undefined>(
    undefined,
  );

  const { trips, isLoading, createTrip, updateTrip, deleteTrip } = useTrips();
  const isMobile = useIsMobile(1024);
  const { companies } = useCompanies();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();
  const queryClient = useQueryClient();

  const handleExport = () => {
    exportTripsToExcel(filteredTrips);
  };

  const handleDelete = async (record: TripType) => {
    try {
      await deleteTrip(record._id);
      notification.success({
        message: <span>{t("Trips.DELETE_SUCCESS")}</span>,
      });
    } catch (error) {
      notification.error({ message: t("Errors.DELETE_FAILED") });
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: TripType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: {
    driver_full_name: string;
    driver_phone_number: string;
    company: string;
    vehicle: string;
    driver?: string;
    departure_time?: string;
    arrival_time?: string;
    unload_status?: string;
    has_gps_tracking?: boolean;
    is_in_temporary_parking_lot?: boolean;
    is_trip_canceled?: boolean;
    notes?: string;
  }) => {
    try {
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
        notification.info({
          message: <span>{t("Trips.UPDATE_SUCCESS")}</span>,
        });
      } else {
        await createTrip(payload);
        notification.success({
          message: <span>{t("Trips.CREATE_SUCCESS")}</span>,
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        notification.error({
          message:
            error.response?.data?.message || t("Errors.OPERATION_FAILED"),
        });
      }
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (!searchText) return true;

    return (
      trip.company?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.driver?.full_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      trip.driver?.phone_number?.includes(searchText) ||
      trip.vehicle?.licence_plate
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
    );
  });

  return (
    <Layout style={{ padding: "0 50px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: 0, marginBottom: 10 }}
      >
        <h1>{t("Breadcrumbs.TRIPS")}</h1>
        <RoleGuard allowedRoles={[UserRole.ADMIN]}>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            style={{ backgroundColor: "#217346" }} // Excel yeşili :)
            onClick={handleExport}
          >
            {t("Common.EXPORT_EXCEL")}
          </Button>
        </RoleGuard>
      </Flex>
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t("Trips.SEARCH")}
          allowClear
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Common.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.EDITOR]}>
          <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
            <PlusOutlined />{" "}
            {isMobile ? t("Common.ADD") : t("Trips.ADD_BUTTON")}
          </Button>
        </RoleGuard>
      </Flex>
      {isMobile ? (
        <TripCardList
          trips={filteredTrips}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <TripTable
          trips={filteredTrips as unknown as TripType[]}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      <TripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        onCreated={() => {
          // ensure lists refresh immediately after modal-created items
          try {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          } catch (e) {
            /* ignore */
          }
        }}
        selectedRecord={selectedRecord}
        companies={companies}
        vehicles={vehicles}
        drivers={drivers}
      />
    </Layout>
  );
}

export default Trips;
