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
import CompanyModal from "./components/CompanyModal";
import CompanyTable, { getCompanyTableSettingsOptions } from "./components/CompanyTable";
import { USER_ROLES, type CompanyType } from "../../types";
import { useTableSettings } from "../../hooks/useTableSettings";
import TableSettingsModal from "../../components/TableSettingsModal";
import { useIsMobile } from "../../hooks/useIsMobile";
import CompanyCardList from "./components/CompanyCardList";
import { exportCompaniesToExcel } from "../../utils/excel.utils";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useAuth } from "../../hooks/useAuth";

function Companies() {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const defaultCompanyTableSettings = React.useMemo(
    () => ({
      visibleColumns: getCompanyTableSettingsOptions(t).map((column) => String(column.key)),
      fontSize: "normal" as const,
    }),
    [t],
  );

  const { settings: companyTableSettings, saveSettings: saveCompanyTableSettings, resetSettings: resetCompanyTableSettings } =
    useTableSettings("companies", defaultCompanyTableSettings);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("q") ?? "";
  const setSearchText = (val: string) =>
    setSearchParams(val ? { q: val } : {}, { replace: true });

  usePageTitle(t("Breadcrumbs.COMPANIES"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CompanyType | undefined>(
    undefined,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { companies, isLoading, createCompany, updateCompany, deleteCompany } =
    useCompanies();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const handleExport = () => {
    exportCompaniesToExcel(filteredCompanies);
  };

  const handleDelete = async (record: CompanyType) => {
    try {
      await deleteCompany(record._id);
      notification.success({
        title: t("Common.SUCCESS"),
        description: t("Companies.DELETE_SUCCESS", { name: record.name }),
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
        selectedRowKeys.map((id) => deleteCompany(id.toString()))
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

  const handleFormSubmit = async (values: { name: string }) => {
    try {
      if (selectedRecord) {
        await updateCompany({ id: selectedRecord._id, name: values.name });
        notification.info({
          title: t("Common.INFO"),
          description: t("Companies.UPDATE_SUCCESS", { name: selectedRecord.name }),
        });
      } else {
        await createCompany({ name: values.name });
        notification.success({
          title: t("Common.SUCCESS"),
          description: t("Companies.CREATE_SUCCESS", { name: values.name }),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || t("Errors.OPERATION_FAILED");
      notification.error({ title: t("Common.ERROR"), description: errMsg });
    }
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: CompanyType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchText) return true;
    return company.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: 0, marginBottom: 10 }}
      >
        <h1 style={{ margin: 0 }}>{t("Breadcrumbs.COMPANIES")}</h1>
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
          placeholder={t("Companies.SEARCH")}
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
              {isMobile ? t("Common.ADD") : t("Companies.ADD_BUTTON")}
            </Button>
          </Space>
        </RoleGuard>
      </Flex>
      {isMobile ? (
        <CompanyCardList
          companies={filteredCompanies}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <CompanyTable
          companies={filteredCompanies}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          rowSelection={isAdmin ? {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          } : undefined}
          settings={companyTableSettings}
        />
      )}
      <TableSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(nextSettings) => {
          saveCompanyTableSettings(nextSettings);
          setIsSettingsOpen(false);
        }}
        onReset={() => {
          resetCompanyTableSettings();
          setIsSettingsOpen(false);
        }}
        settings={companyTableSettings}
        columns={getCompanyTableSettingsOptions(t)}
        tableId="companies"
      />
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
      />
    </Layout>
  );
}

export default Companies;
