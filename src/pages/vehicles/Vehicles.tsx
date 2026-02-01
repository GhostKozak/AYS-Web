import { App, Button, Flex, Layout } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import VehicleModal from "./components/VehicleModal";
import Search from "antd/es/input/Search";
import {
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useVehicles } from "../../hooks/useVehicles";
import type { VehicleType, VehicleTypeEnum } from "../../types";
import VehicleTable from "./components/VehicleTable";
import { useIsMobile } from "../../hooks/useIsMobile";
import VehicleCardList from "./components/VehicleCardList";
import { exportVehiclesToExcel } from "../../utils/excel.utils";

function Vehicles() {
  const { t } = useTranslation();
  const { message, notification, modal } = App.useApp();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<VehicleType | undefined>(
    undefined,
  );

  const { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle } =
    useVehicles();
  const isMobile = useIsMobile();

  const handleExport = () => {
    exportVehiclesToExcel(filteredVehicles);
  };

  const handleDelete = async (record: VehicleType) => {
    try {
      await deleteVehicle(record._id);
      notification.success({
        message: (
          <span>
            {t("Vehicles.DELETE_SUCCESS", { plate: record.licence_plate })}
          </span>
        ),
      });
    } catch (error) {
      notification.error({ message: t("Errors.DELETE_FAILED") });
    }
  };

  const handleFormSubmit = async (values: {
    licence_plate: string;
    vehicle_type: VehicleTypeEnum;
  }) => {
    try {
      if (selectedRecord) {
        await updateVehicle({
          id: selectedRecord._id,
          licence_plate: values.licence_plate,
          vehicle_type: values.vehicle_type,
        });
        notification.info({
          message: (
            <span>
              {t("Vehicles.UPDATE_SUCCESS", {
                plate: values.licence_plate,
              })}
            </span>
          ),
        });
      } else {
        await createVehicle({
          licence_plate: values.licence_plate,
          vehicle_type: values.vehicle_type,
        });
        notification.success({
          message: (
            <span>
              {t("Vehicles.CREATE_SUCCESS", {
                plate: values.licence_plate,
              })}
            </span>
          ),
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
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: 0, marginBottom: 10 }}
      >
        <h1>{t("Breadcrumbs.VEHICLES")}</h1>
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          style={{ backgroundColor: "#217346" }} // Excel yeşili :)
          onClick={handleExport}
        >
          {t("Common.EXPORT_EXCEL")}
        </Button>
      </Flex>
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
