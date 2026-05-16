import { App, Button, Flex, Layout, Space, Popconfirm } from "antd";
import Search from "antd/es/input/Search";
import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTranslation } from "react-i18next";

import {
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies";
import { useDrivers } from "../../hooks/useDrivers";
import DriverModal from "./components/DriverModal";
import { USER_ROLES, type DriverType } from "../../types";
import DriverTable, { getDriverTableSettingsOptions } from "./components/DriverTable";
import { useTableSettings } from "../../hooks/useTableSettings";
import TableSettingsModal from "../../components/TableSettingsModal";
import { useIsMobile } from "../../hooks/useIsMobile";
import DriverCardList from "./components/DriverCardList";
import { exportDriversToExcel } from "../../utils/excel.utils";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useAuth } from "../../hooks/useAuth";

function Drivers() {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const defaultDriverTableSettings = React.useMemo(
    () => ({
      visibleColumns: getDriverTableSettingsOptions(t).map((column) => String(column.key)),
      fontSize: "normal" as const,
    }),
    [t],
  );

  const { settings: driverTableSettings, saveSettings: saveDriverTableSettings, resetSettings: resetDriverTableSettings } =
    useTableSettings("drivers", defaultDriverTableSettings);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("q") ?? "";
  const setSearchText = (val: string) =>
    setSearchParams(val ? { q: val } : {}, { replace: true });

  usePageTitle(t("Breadcrumbs.DRIVERS"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DriverType | undefined>(
    undefined,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { drivers, isLoading, createDriver, updateDriver, deleteDriver } =
    useDrivers();
  const { companies } = useCompanies();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const handleExport = () => {
    exportDriversToExcel(filteredDrivers);
  };

  const handleDelete = async (record: DriverType) => {
    try {
      await deleteDriver(record._id);
      notification.success({
        title: t("Common.SUCCESS"),
        description: t("Drivers.DELETE_SUCCESS", { name: record.full_name }),
      });
      setSelectedRowKeys(prev => prev.filter(key => key !== record._id));
    } catch (error: any) {
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
        selectedRowKeys.map((id) => deleteDriver(id.toString()))
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      notification.success({
        title: t("Common.SUCCESS"),
        description: t("Common.BULK_DELETE_SUCCESS", { count: successCount }),
      });
      setSelectedRowKeys([]);
    } catch (error: any) {
      notification.error({
        title: t("Common.ERROR"),
        description: t("Errors.DELETE_FAILED"),
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };


  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: DriverType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: {
    full_name: string;
    phone_number: string;
    company: string;
  }) => {
    try {
      const payload = {
        full_name: values.full_name,
        phone_number: values.phone_number,
        company: values.company,
      };

      if (selectedRecord) {
        await updateDriver({ id: selectedRecord._id, ...payload });
        notification.info({
          title: t("Audit.DETAILS"),
          description: t("Drivers.UPDATE_SUCCESS", { name: values.full_name }),
        });
      } else {
        await createDriver(payload);
        notification.success({
          title: t("Common.SUCCESS"),
          description: t("Drivers.CREATE_SUCCESS", { name: values.full_name }),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || t("Errors.OPERATION_FAILED");
      notification.error({ title: t("Common.ERROR"), description: errMsg });
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchText) return true;
    return (
      driver.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.phone_number.includes(searchText)
    );
  });

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: 0, marginBottom: 10 }}
      >
        <h1 style={{ margin: 0 }}>{t("Breadcrumbs.DRIVERS")}</h1>
        <Flex gap={12} align="center">
          <Button icon={<SettingOutlined />} onClick={() => setIsSettingsOpen(true)}>
            {t("TableSettings.TITLE", "Table Settings")}
          </Button>
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
      </Flex>
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t("Drivers.SEARCH")}
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
              {isMobile ? t("Common.ADD") : t("Drivers.ADD_BUTTON")}
            </Button>
          </Space>
        </RoleGuard>
      </Flex>
      {isMobile ? (
        <DriverCardList
          drivers={filteredDrivers}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <DriverTable
          drivers={filteredDrivers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={isAdmin ? {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          } : undefined}
          settings={driverTableSettings}
        />
      )}
      <TableSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(nextSettings) => {
          saveDriverTableSettings(nextSettings);
          setIsSettingsOpen(false);
        }}
        onReset={() => {
          resetDriverTableSettings();
          setIsSettingsOpen(false);
        }}
        settings={driverTableSettings}
        columns={getDriverTableSettingsOptions(t)}
      />
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
        companies={companies}
      />
    </Layout>
  );
}

export default Drivers;
