import { App, Button, Flex, Layout, Space, Popconfirm } from "antd";
import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTranslation } from "react-i18next";
import VehicleModal from "./components/VehicleModal";
import Search from "antd/es/input/Search";
import {
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useVehicles } from "../../hooks/useVehicles";
import { USER_ROLES, type VehicleType, type VehicleTypeEnum } from "../../types";
import VehicleTable from "./components/VehicleTable";
import { useIsMobile } from "../../hooks/useIsMobile";
import VehicleCardList from "./components/VehicleCardList";
import { exportVehiclesToExcel } from "../../utils/excel.utils";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { hasRole } from "../../utils/auth.utils";

function Vehicles() {
  const { t } = useTranslation();
  const { notification } = App.useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("q") ?? "";
  const setSearchText = (val: string) =>
    setSearchParams(val ? { q: val } : {}, { replace: true });

  usePageTitle(t("Breadcrumbs.VEHICLES"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<VehicleType | undefined>(
    undefined,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle } =
    useVehicles();
  const isMobile = useIsMobile();
  const isAdmin = hasRole([USER_ROLES.ADMIN]);

  const handleExport = () => {
    exportVehiclesToExcel(filteredVehicles);
  };

  const handleDelete = async (record: VehicleType) => {
    try {
      await deleteVehicle(record._id);
      notification.success({
        title: t("Common.SUCCESS"),
        description: t("Vehicles.DELETE_SUCCESS", { plate: record.licence_plate }),
      });
      setSelectedRowKeys(prev => prev.filter(key => key !== record._id));
    } catch (error) {
      notification.error({
        title: t("Common.ERROR"),
        description: t("Errors.DELETE_FAILED"),
      });
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        selectedRowKeys.map((id) => deleteVehicle(id.toString()))
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      notification.success({
        title: t("Common.SUCCESS"),
        description: t("Common.BULK_DELETE_SUCCESS", { count: successCount }),
      });
      setSelectedRowKeys([]);
    } catch (error) {
      notification.error({
        title: t("Common.ERROR"),
        description: t("Errors.DELETE_FAILED"),
      });
    } finally {
      setIsBulkDeleting(false);
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
          title: t("Common.INFO"),
          description: t("Vehicles.UPDATE_SUCCESS", {
            plate: values.licence_plate,
          }),
        });
      } else {
        await createVehicle({
          licence_plate: values.licence_plate,
          vehicle_type: values.vehicle_type,
        });
        notification.success({
          title: t("Common.SUCCESS"),
          description: t("Vehicles.CREATE_SUCCESS", {
            plate: values.licence_plate,
          }),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response?.status && [400, 409, 422].includes(error.response.status)) {
        notification.error({
          title: t("Common.ERROR"),
          description: error.response?.data?.message || t("Errors.OPERATION_FAILED"),
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
        <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
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
        <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EDITOR]}>
          <Space>
            {selectedRowKeys.length > 0 && isAdmin && (
              <Popconfirm
                title={t("Common.BULK_DELETE_CONFIRM_TITLE")}
                description={t("Common.BULK_DELETE_CONFIRM_DESC", { count: selectedRowKeys.length })}
                onConfirm={handleBulkDelete}
                okText={t("Common.YES")}
                cancelText={t("Common.NO")}
              >
                <Button color="danger" variant="solid" size="large" loading={isBulkDeleting}>
                  <DeleteOutlined /> {t("Common.BULK_DELETE", { count: selectedRowKeys.length })}
                </Button>
              </Popconfirm>
            )}
            <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
              <PlusOutlined />{" "}
              {isMobile ? t("Common.ADD") : t("Vehicles.ADD_BUTTON")}
            </Button>
          </Space>
        </RoleGuard>
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
          rowSelection={isAdmin ? {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          } : undefined}
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
