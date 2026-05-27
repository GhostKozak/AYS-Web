import { App, Button, Flex, Layout, Space, Popconfirm } from "antd";
import Search from "antd/es/input/Search";
import React, { useState, useMemo, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { USER_ROLES, type TableSettings } from "../../types";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTableSettings } from "../../hooks/useTableSettings";
import { useAuth } from "../../hooks/useAuth";
import { safeErrorMessage } from "../../utils";
import TableSettingsModal from "../../components/TableSettingsModal";
import { RoleGuard } from "../../components/auth/RoleGuard";
import ErrorState from "../../components/common/ErrorState";
import {
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { TFunction } from "i18next";
import type { TableRowSelection } from "antd/es/table/interface";

export type SettingsOption = { key: string; title: string };

type CrudPageProps<T extends { _id: string }> = {
  breadcrumbKey: string;
  searchPlaceholderKey: string;
  addButtonKey: string;

  deleteSuccessKey: string;
  createSuccessKey: string;
  updateSuccessKey: string;
  updateNotificationTitleKey?: string;

  data: T[];
  total?: number;
  page?: number;
  setPage?: (page: number) => void;
  pageSize?: number;
  setPageSize?: (pageSize: number) => void;
  search?: string;
  setSearch?: (search: string) => void;

  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onDeleteItem: (id: string) => Promise<any>;

  filterFn: (item: T, searchText: string) => boolean;
  exportFn: (items: T[]) => void;
  exportAllFn?: (search?: string) => Promise<void>;
  onFormSubmit: (values: any, selectedRecord?: T) => Promise<void>;

  Table: React.ComponentType<{
    items: T[];
    isLoading: boolean;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    rowSelection?: TableRowSelection<T>;
    settings?: TableSettings;
    total?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number, pageSize: number) => void;
  }>;

  CardList: React.ComponentType<{
    items: T[];
    isLoading: boolean;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
  }>;

  ModalComponent: React.ComponentType<any>;

  modalExtraProps?: Record<string, unknown>;
  tableExtraProps?: Record<string, unknown>;

  getSettingsOptions: (t: TFunction) => SettingsOption[];
  defaultVisibleColumns: string[];
  settingsKey: string;
  mobileBreakpoint?: number;
};

function CrudPage<T extends { _id: string }>({
  breadcrumbKey,
  searchPlaceholderKey,
  addButtonKey,

  deleteSuccessKey,
  createSuccessKey,
  updateSuccessKey,
  updateNotificationTitleKey = "Common.INFO",

  data,
  total: serverTotal,
  page,
  setPage,
  pageSize,
  setPageSize,
  setSearch: setServerSearch,
  isLoading,
  isError,
  refetch,
  onDeleteItem,

  filterFn,
  exportFn,
  exportAllFn,
  onFormSubmit,

  Table,
  CardList,
  ModalComponent,

  getSettingsOptions,
  defaultVisibleColumns,
  settingsKey,
  mobileBreakpoint = 768,
  modalExtraProps,
  tableExtraProps,
}: CrudPageProps<T>) {
  const { t } = useTranslation();
  const { notification } = App.useApp();

  const isPaginated = page !== undefined && setPage !== undefined && setPageSize !== undefined;

  const [localSearchParams, setLocalSearchParams] = useSearchParams();
  const localSearchText = localSearchParams.get("q") ?? "";
  const debouncedLocalSearch = useDebounce(localSearchText, 300);

  const [pendingPaginatedSearch, setPendingPaginatedSearch] = useState("");
  const debouncedPendingSearch = useDebounce(pendingPaginatedSearch, 350);

  useEffect(() => {
    if (isPaginated) {
      setPage!(1);
      setServerSearch!(debouncedPendingSearch);
    }
  }, [debouncedPendingSearch, isPaginated, setPage, setServerSearch]);

  const debouncedSearch = isPaginated ? debouncedPendingSearch : debouncedLocalSearch;

  const handleSearchChange = isPaginated
    ? (val: string) => setPendingPaginatedSearch(val)
    : (val: string) => setLocalSearchParams(val ? { q: val } : {}, { replace: true });

  const handleSearchSubmit = isPaginated
    ? (val: string) => {
        setPendingPaginatedSearch(val);
        setPage!(1);
        setServerSearch!(val);
      }
    : (val: string) => setLocalSearchParams(val ? { q: val } : {}, { replace: true });

  usePageTitle(t(breadcrumbKey));

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const defaultSettings = useMemo(
    () => ({
      visibleColumns: defaultVisibleColumns,
      fontSize: "normal" as const,
    }),
    [defaultVisibleColumns],
  );
  const { settings, saveSettings, resetSettings } =
    useTableSettings(settingsKey, defaultSettings);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [page]);

  const isMobile = useIsMobile(mobileBreakpoint);
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const handleExport = () => {
    if (isPaginated && exportAllFn) {
      exportAllFn(debouncedSearch);
    } else {
      exportFn(filtered);
    }
  };

  const handleDelete = async (record: T) => {
    try {
      await onDeleteItem(record._id);
      notification.success({
        title: t("Common.SUCCESS"),
        description: t(deleteSuccessKey),
      });
      setSelectedRowKeys((prev) => prev.filter((key) => key !== record._id));
    } catch {
      notification.error({
        title: t("Common.ERROR"),
        description: t("Errors.DELETE_FAILED"),
      });
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const results = await Promise.allSettled(
      selectedRowKeys.map((id) => onDeleteItem(id.toString())),
    );
    const successCount = results.filter(
      (r) => r.status === "fulfilled",
    ).length;
    const failCount = results.filter((r) => r.status === "rejected").length;
    if (failCount > 0) {
      notification.warning({
        title: t("Common.WARNING"),
        description: t("Common.BULK_DELETE_PARTIAL", {
          success: successCount,
          failed: failCount,
        }),
      });
    } else {
      notification.success({
        title: t("Common.SUCCESS"),
        description: t("Common.BULK_DELETE_SUCCESS", { count: successCount }),
      });
    }
    setSelectedRowKeys([]);
    setIsBulkDeleting(false);
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: T) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      await onFormSubmit(values, selectedRecord);
      if (selectedRecord) {
        notification.info({
          title: t(updateNotificationTitleKey),
          description: t(updateSuccessKey),
        });
      } else {
        notification.success({
          title: t("Common.SUCCESS"),
          description: t(createSuccessKey),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errMsg = safeErrorMessage(error, t("Errors.OPERATION_FAILED"));
      notification.error({
        title: t("Common.ERROR"),
        description: errMsg,
      });
    }
  };

  const filtered = useMemo(() => {
    if (isPaginated) return data;
    if (!debouncedSearch) return data;
    const lowerSearch = debouncedSearch.toLowerCase();
    return data.filter((item) => filterFn(item, lowerSearch));
  }, [data, debouncedSearch, filterFn, isPaginated]);

  if (isError) {
    return (
      <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
        <ErrorState onRetry={() => refetch()} />
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: 0, marginBottom: 10 }}
      >
        <h1 style={{ margin: 0 }}>{t(breadcrumbKey)}</h1>
        <Flex gap={12} align="center">
          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsSettingsOpen(true)}
          >
            {t("TableSettings.TITLE", "Table Settings")}
          </Button>
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              style={{ backgroundColor: "#217346" }}
              onClick={handleExport}
            >
              {t("Common.EXPORT_EXCEL")}
            </Button>
          </RoleGuard>
        </Flex>
      </Flex>
      <Flex gap={isMobile ? 10 : 25} style={{ marginBottom: 20 }}>
        <Search
          placeholder={t(searchPlaceholderKey)}
          allowClear
          value={isPaginated ? pendingPaginatedSearch : localSearchText}
          enterButton={
            !isMobile && (
              <>
                <SearchOutlined /> {t("Common.SEARCH")}
              </>
            )
          }
          size="large"
          onSearch={handleSearchSubmit}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EDITOR]}>
          <Space>
            {selectedRowKeys.length > 0 && isAdmin && (
              <Popconfirm
                title={t("Common.BULK_DELETE_CONFIRM_TITLE")}
                description={t("Common.BULK_DELETE_CONFIRM_DESC", {
                  count: selectedRowKeys.length,
                })}
                onConfirm={handleBulkDelete}
                okText={t("Common.YES")}
                cancelText={t("Common.NO")}
              >
                <Button
                  color="danger"
                  variant="solid"
                  size="large"
                  loading={isBulkDeleting}
                >
                  <DeleteOutlined />{" "}
                  {t("Common.BULK_DELETE", { count: selectedRowKeys.length })}
                </Button>
              </Popconfirm>
            )}
            <Button
              color="cyan"
              variant="solid"
              size="large"
              onClick={handleAdd}
            >
              <PlusOutlined />{" "}
              {isMobile ? t("Common.ADD") : t(addButtonKey)}
            </Button>
          </Space>
        </RoleGuard>
      </Flex>
      {isMobile ? (
        <CardList
          items={filtered}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <Table
          items={filtered}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          settings={settings}
          total={serverTotal}
          page={page}
          pageSize={pageSize}
          onPageChange={isPaginated ? ((p: number, ps: number) => { setPage!(p); setPageSize!(ps); }) : undefined}
          rowSelection={
            isAdmin
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }
              : undefined
          }
          {...tableExtraProps}
        />
      )}
      <TableSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(nextSettings) => {
          saveSettings(nextSettings);
          setIsSettingsOpen(false);
        }}
        onReset={() => {
          resetSettings();
          setIsSettingsOpen(false);
        }}
        settings={settings}
        columns={getSettingsOptions(t)}
        tableId={settingsKey}
      />
      <ModalComponent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
        {...modalExtraProps}
      />
    </Layout>
  );
}

export default CrudPage;
