import { Table, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { USER_ROLES, type CompanyType, type TableSettings } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { getUniqueOptions } from "../../../utils";
import { useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";

export const getCompanyTableSettingsOptions = (t: TFunction) => [
  { key: "name", title: t("Companies.COMPANY_NAME", "Company Name") },
  { key: "createdAt", title: t("Table.CREATED_AT", "Created At") },
  { key: "updatedAt", title: t("Table.UPDATED_AT", "Updated At") },
  { key: "deleted", title: t("Table.STATUS", "Status") },
  { key: "action", title: t("Table.ACTIONS", "Actions") },
];

type Props = {
  companies: CompanyType[];
  isLoading: boolean;
  onEdit: (c: CompanyType) => void;
  onDelete: (c: CompanyType) => void;
  rowSelection?: TableRowSelection<CompanyType>;
  settings?: TableSettings;
};

interface AuthenticatedColumnType extends ColumnType<CompanyType> {
  visible?: boolean;
}

export default function CompaniesTable({
  companies,
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
      name: getUniqueOptions(companies, (company) => company.name),
    };
  }, [companies]);

  const fontSize = settings?.fontSize ?? "normal";
  const fontSizeMap: Record<string, string> = {
    small: "12px",
    normal: "14px",
    large: "20px",
  };
  const tableFontSize = fontSizeMap[fontSize] ?? fontSizeMap.normal;

  const columns = useMemo(() => {
    const allColumns: AuthenticatedColumnType[] = [
      {
        title: t("Companies.COMPANY_NAME"),
        dataIndex: "name",
        key: "name",
        filters: filters.name,
        onFilter: (value, record) => record.name === value,
        filterSearch: true,
      },
      {
        title: t("Table.CREATED_AT"),
        dataIndex: "createdAt",
        key: "createdAt",
        visible: canEdit,
        render: (d: string) => new Date(d).toLocaleString("tr-TR"),
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        responsive: ["lg"],
      },
      {
        title: t("Table.UPDATED_AT"),
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (d: string) => new Date(d).toLocaleString("tr-TR"),
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
  }, [t, filters, onEdit, onDelete, canEdit, settings]);

  return (
    <div style={{ fontSize: tableFontSize }}>
      <Table
        style={{ fontSize: tableFontSize, lineHeight: 1.5 }}
        components={{
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
        }}
        columns={columns}
        dataSource={companies}
        loading={isLoading}
        rowKey="_id"
        rowSelection={rowSelection}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} ${t("Companies.TOTAL")}`,
        }}
      />
    </div>
  );
}
