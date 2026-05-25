import { Table, Tag, Popconfirm, Button, Space, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { USER_ROLES, type CompanyType, type TableSettings } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import { formatDateTime } from "../../../utils";
import { useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";


type Props = {
  items: CompanyType[];
  isLoading: boolean;
  onEdit: (c: CompanyType) => void;
  onDelete: (c: CompanyType) => void;
  rowSelection?: TableRowSelection<CompanyType>;
  settings?: TableSettings;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  tableExtraProps?: any;
};

interface AuthenticatedColumnType extends ColumnType<CompanyType> {
  visible?: boolean;
}

export default function CompaniesTable({
  items: companies,
  isLoading,
  onEdit,
  onDelete,
  rowSelection,
  settings,
  total: serverTotal,
  page: serverPage,
  pageSize: serverPageSize,
  onPageChange,
  tableExtraProps,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.EDITOR;

  const getCustomFilterProps = (
    _dataIndex: string,
    placeholder: string,
    _filterProps: any,
    setGlobalSearch?: (s: string) => void
  ) => {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder={t("Common.SEARCH_PLACEHOLDER", { field: placeholder })}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              if (setGlobalSearch) setGlobalSearch(selectedKeys[0] as string);
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                confirm();
                if (setGlobalSearch) setGlobalSearch(selectedKeys[0] as string);
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              {t("Common.SEARCH", "Ara")}
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                setSelectedKeys([]);
                confirm();
                if (setGlobalSearch) setGlobalSearch("");
              }}
              size="small"
              style={{ width: 90 }}
            >
              {t("Common.RESET", "Sıfırla")}
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
    };
  };

  const fontSize = settings?.fontSize ?? "normal";
  const fontSizeMap: Record<string, string> = {
    small: "12px",
    normal: "14px",
    large: "20px",
  };
  const tableFontSize = fontSizeMap[fontSize] ?? fontSizeMap.normal;

  const tableComponents = useMemo(() => ({
    header: {
      cell: (cellProps: any) => (
        <th
          {...cellProps}
          style={{
            ...cellProps?.style,
            fontSize: tableFontSize,
            lineHeight: 1.5,
          }}
        />
      ),
    },
    body: {
      cell: (cellProps: any) => (
        <td
          {...cellProps}
          style={{
            ...cellProps?.style,
            fontSize: tableFontSize,
            lineHeight: 1.5,
          }}
        />
      ),
    },
  }), [tableFontSize]);

  const columns = useMemo(() => {
    const allColumns: AuthenticatedColumnType[] = [
      {
        title: t("Companies.COMPANY_NAME"),
        dataIndex: "name",
        key: "name",
        ...getCustomFilterProps("name", t("Companies.COMPANY_NAME"), {}, tableExtraProps?.setSearch),
      },
      {
        title: t("Table.CREATED_AT"),
        dataIndex: "createdAt",
        key: "createdAt",
        visible: canEdit,
        render: (d: string) => formatDateTime(d),
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        responsive: ["lg"],
      },
      {
        title: t("Table.UPDATED_AT"),
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (d: string) => formatDateTime(d),
        sorter: (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        responsive: ["lg"],
      },
      {
        title: t("Table.STATUS"),
        dataIndex: "deleted",
        key: "deleted",
        visible: canEdit,
        render: (deleted: boolean) => (
          <Tag color={deleted ? "red" : "green"}>
            {deleted ? t("Common.PASSIVE") : t("Common.ACTIVE")}
          </Tag>
        ),
        filters: [
          { text: t("Common.ACTIVE"), value: false },
          { text: t("Common.PASSIVE"), value: true },
        ],
        onFilter: (value, record) => record.deleted === value,
      },
      {
        title: t("Table.ACTIONS"),
        key: "action",
        visible: canEdit,
        render: (_: any, record: CompanyType) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              {t("Common.EDIT")}
            </Button>
            <Popconfirm
              title={t("Companies.DELETE_CONFIRM_TITLE")}
              description={
                <span>
                  <Trans
                    i18nKey="Companies.DELETE_CONFIRM_DESC"
                    values={{ name: record.name }}
                    components={{ bold: <strong /> }}
                  />
                </span>
              }
              onConfirm={() => onDelete(record)}
              icon={<DeleteOutlined style={{ color: "red" }} />}
            >
              <Button danger type="text">
                {t("Common.DELETE")}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    const filtered = allColumns.filter((col) => col.visible !== false);
    if (settings?.visibleColumns && settings.visibleColumns.length > 0) {
      return filtered.filter((col) => {
        const key = typeof col.key === "string" ? col.key : String(col.key);
        return settings.visibleColumns?.includes(key);
      });
    }
    return filtered;
  }, [t, onEdit, onDelete, canEdit, settings, tableExtraProps]);

  return (
    <div style={{ fontSize: tableFontSize }}>
      <Table
        style={{ fontSize: tableFontSize, lineHeight: 1.5 }}
        components={tableComponents}
        columns={columns}
        dataSource={companies}
        loading={isLoading}
        rowKey="_id"
        rowSelection={rowSelection}
        pagination={serverTotal !== undefined ? {
          current: serverPage ?? 1,
          pageSize: serverPageSize ?? 10,
          total: serverTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} ${t("Companies.TOTAL")}`,
          onChange: onPageChange,
        } : {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} ${t("Companies.TOTAL")}`,
        }}
      />
    </div>
  );
}
