import { Table, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { USER_ROLES, type DriverType, type TableSettings } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { formatPhoneNumber, getUniqueOptions } from "../../../utils";
import { useMemo } from "react";
import type { ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import { useAuth } from "../../../hooks/useAuth";

export const getDriverTableSettingsOptions = (t: TFunction) => [
  { key: "full_name", title: t("Drivers.FULL_NAME", "Full Name") },
  { key: "phone_number", title: t("Drivers.PHONE_NUMBER", "Phone Number") },
  { key: "company", title: t("Drivers.COMPANY_NAME", "Company Name") },
  { key: "createdAt", title: t("Table.CREATED_AT", "Created At") },
  { key: "updatedAt", title: t("Table.UPDATED_AT", "Updated At") },
  { key: "deleted", title: t("Table.STATUS", "Status") },
  { key: "action", title: t("Table.ACTIONS", "Actions") },
];

type Props = {
  items: DriverType[];
  isLoading: boolean;
  onEdit: (c: DriverType) => void;
  onDelete: (c: DriverType) => void;
  rowSelection?: TableRowSelection<DriverType>;
  settings?: TableSettings;
};

interface AuthenticatedColumnType extends ColumnType<DriverType> {
  visible?: boolean;
}

export default function DriverTable({
  items: drivers,
  isLoading,
  onEdit,
  onDelete,
  rowSelection,
  settings,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.EDITOR;

  const filters = useMemo(() => {
    return {
      name: getUniqueOptions(drivers, (driver) => driver.full_name),
      phone: getUniqueOptions(
        drivers,
        (driver) => driver.phone_number,
        formatPhoneNumber,
      ),
      company: getUniqueOptions(drivers, (driver) => driver.company?.name),
    };
  }, [drivers]);

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
        title: t("Drivers.FULL_NAME"),
        dataIndex: "full_name",
        key: "full_name",
        filters: filters.name,
        onFilter: (value, record) => record.full_name === value,
        filterSearch: true,
      },
      {
        title: t("Drivers.PHONE_NUMBER"),
        dataIndex: "phone_number",
        key: "phone_number",
        render: formatPhoneNumber,
        filters: filters.phone,
        onFilter: (value, record) => record.phone_number === value,
        filterSearch: true,
      },
      {
        title: t("Drivers.COMPANY_NAME"),
        dataIndex: ["company", "name"],
        key: "company",
        filters: filters.company,
        onFilter: (value, record) => record.company?.name === value,
        filterSearch: true,
      },
      {
        title: t("Table.CREATED_AT"),
        dataIndex: "createdAt",
        key: "createdAt",
        visible: canEdit,
        render: (date: string) => new Date(date).toLocaleString("tr-TR"),
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        responsive: ["lg"],
      },
      {
        title: t("Table.UPDATED_AT"),
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (date: string) => new Date(date).toLocaleString("tr-TR"),
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
        render: (_: any, record: DriverType) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              {t("Common.EDIT")}
            </Button>
            <Popconfirm
              title={t("Drivers.DELETE_CONFIRM_TITLE")}
              description={
                <span>
                  <Trans
                    i18nKey="Drivers.DELETE_CONFIRM_DESC"
                    values={{ name: record.full_name }}
                    components={{ bold: <strong /> }}
                  />
                </span>
              }
              icon={<DeleteOutlined style={{ color: "red" }} />}
              onConfirm={() => onDelete(record)}
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
  }, [t, filters, onEdit, onDelete, canEdit, settings]);

  return (
    <div style={{ fontSize: tableFontSize }}>
      <Table
        style={{ fontSize: tableFontSize, lineHeight: 1.5 }}
        components={tableComponents}
        columns={columns}
        dataSource={drivers}
        loading={isLoading}
        rowKey="_id"
        rowSelection={rowSelection}
        scroll={{ x: 1000 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} ${t("Drivers.TOTAL")}`,
        }}
      />
    </div>
  );
}
