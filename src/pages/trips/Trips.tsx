import { Button, Flex, Layout, message, notification } from "antd";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import type { TripType } from "../../types";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTrips } from "../../hooks/useTrips";
import TripTable from "./components/TripTable";
import Search from "antd/es/input/Search";
import TripCardList from "./components/TripCardList";
import TripModal from "./components/TripModal";

import { useCompanies } from "../../hooks/useCompanies";
import { useVehicles } from "../../hooks/useVehicles";
import { useDrivers } from "../../hooks/useDrivers";

function Trips() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TripType | undefined>(
    undefined
  );

  const { trips, isLoading, createTrip, updateTrip, deleteTrip } = useTrips();
  const isMobile = useIsMobile();
  const { companies } = useCompanies();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();
  const queryClient = useQueryClient();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: TripType) => {
    try {
      await deleteTrip(record._id);
      messageApi.warning(<span>Sefer firması başarıyla silindi.</span>);
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
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
    inputName: string;
    inputPhone: string;
    inputCompany: string;
    inputVehicle: string;
    inputDriver?: string;
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
        driver: values.inputDriver, // Backend ID bekliyorsa
        company: values.inputCompany, // Backend ID bekliyorsa
        vehicle: values.inputVehicle, // Backend ID bekliyorsa
        driver_full_name: values.inputName,
        driver_phone_number: values.inputPhone,
        // Eksik alanlar eklendi:
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
        messageApi.info(
          <span>
            <strong>{values.inputName}</strong> güncellendi.
          </span>
        );
      } else {
        await createTrip(payload);
        messageApi.success(
          <span>
            <strong>{values.inputName}</strong> eklendi.
          </span>
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message?.toString() ||
        "Beklenmedik bir hata oluştu.";
      openErrorNotification(errorMsg);
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
      {messageContextHolder}
      {notificationContextHolder}
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Companies.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> {isMobile ? "Ekle" : "Sefer Ekle"}
        </Button>
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
