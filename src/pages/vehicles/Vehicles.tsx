import { Button, Flex, Layout, message, notification } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import VehicleModal from "./components/VehicleModal";
import Search from "antd/es/input/Search";
import {
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useVehicles } from "../../hooks/useVehicles";
import type { VehicleType, VehicleTypeEnum } from "../../types";
import VehicleTable from "./components/VehicleTable";
import { useIsMobile } from "../../hooks/useIsMobile";
import VehicleCardList from "./components/VehicleCardList";

function Vehicles() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<VehicleType | undefined>(
    undefined
  );

  const { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle } =
    useVehicles();
  const isMobile = useIsMobile();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: VehicleType) => {
    try {
      await deleteVehicle(record._id);
      messageApi.warning(
        <span>
          <strong>{record.licence_plate}</strong> plakalı araç başarıyla
          silindi.
        </span>
      );
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
    }
  };

  const handleFormSubmit = async (values: {
    inputLicencePlate: string;
    inputVehicleType: VehicleTypeEnum;
  }) => {
    try {
      if (selectedRecord) {
        await updateVehicle({
          id: selectedRecord._id,
          licence_plate: values.inputLicencePlate,
          vehicle_type: values.inputVehicleType,
        });
        messageApi.info(
          <span>
            <strong>{values.inputLicencePlate}</strong> plakalı araç başarıyla
            düzenlendi.
          </span>
        );
      } else {
        await createVehicle({
          licence_plate: values.inputLicencePlate,
          vehicle_type: values.inputVehicleType,
        });
        messageApi.success(
          <span>
            <strong>{values.inputLicencePlate}</strong> plakalı araç başarıyla
            eklendi.
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

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: VehicleType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchText) return true;
    return vehicle.licence_plate
      .toLowerCase()
      .includes(searchText.toLowerCase());
  });

  return (
    <Layout style={{ padding: isMobile ? "0 16px" : "0 50px" }}>
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
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> Araç Ekle
        </Button>
      </Flex>
      {isMobile ? (
        <VehicleCardList
          vehicles={filteredVehicles}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
      />
    </Layout>
  );
}

export default Vehicles;
