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
      message: t("Errors.OPERATION_FAILED"),
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: VehicleType) => {
    try {
      await deleteVehicle(record._id);
      messageApi.success(
        <span>
          {t("Vehicles.DELETE_SUCCESS", { plate: record.licence_plate })}
        </span>
      );
    } catch (error) {
      messageApi.error(t("Errors.DELETE_FAILED"));
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
            {t("Vehicles.UPDATE_SUCCESS", { plate: values.inputLicencePlate })}
          </span>
        );
      } else {
        await createVehicle({
          licence_plate: values.inputLicencePlate,
          vehicle_type: values.inputVehicleType,
        });
        messageApi.success(
          <span>
            {t("Vehicles.CREATE_SUCCESS", { plate: values.inputLicencePlate })}
          </span>
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message?.toString() ||
        t("Errors.UNEXPECTED_ERROR");
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
          placeholder={t("Vehicles.SEARCH")}
          allowClear
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Common.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined />{" "}
          {isMobile ? t("Common.ADD") : t("Vehicles.ADD_BUTTON")}
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
