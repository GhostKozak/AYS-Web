import { Table, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { USER_ROLES, type VehicleType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import { formatLicencePlate, getUniqueOptions } from "../../../utils";
import { useMemo } from "react";
import type { ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import { useAuth } from "../../../hooks/useAuth";

type Props = {
  vehicles: VehicleType[];
  isLoading: boolean;
  onEdit: (c: VehicleType) => void;
  onDelete: (c: VehicleType) => void;
  rowSelection?: TableRowSelection<VehicleType>;
};

interface AuthenticatedColumnType extends ColumnType<VehicleType> {
  visible?: boolean;
}

export default function VehicleTable({
  vehicles,
  isLoading,
  onEdit,
  onDelete,
  rowSelection,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.EDITOR;

  const filters = useMemo(() => {
    return {
      plate: getUniqueOptions(
        vehicles,
        (v) => v.licence_plate,
        formatLicencePlate,
      ),
      type: getUniqueOptions(vehicles, (v) => v.vehicle_type),
    };
  }, [vehicles]);

  const columns = useMemo(() => {
    const allColumns: AuthenticatedColumnType[] = [
      {
        title: t("Vehicles.LICENSE_PLATE"),
        dataIndex: "licence_plate",
        key: "licence_plate",
        render: formatLicencePlate,
        filters: filters.plate,
        onFilter: (value, record) => record.licence_plate === value,
        filterSearch: true,
      },
      {
        title: t("Vehicles.VEHICLE_TYPE"),
        dataIndex: "vehicle_type",
        key: "vehicle_type",
        render: (val) => (val ? t(`Vehicles.TYPE_${val}`) : "-"),
        filters: filters.type,
        onFilter: (value, record) => record.vehicle_type === value,
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
        key: "deleted",
        dataIndex: "deleted",
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
        render: (_: any, record: VehicleType) => (
          <Space>
            <Button
              type="text"
              onClick={() => onEdit(record)}
              icon={<EditOutlined />}
            >
              {t("Common.EDIT")}
            </Button>
            <Popconfirm
              title={t("Vehicles.DELETE_CONFIRM_TITLE")}
              description={
                <span>
                  <Trans
                    i18nKey="Vehicles.DELETE_CONFIRM_DESC"
                    values={{ plate: formatLicencePlate(record.licence_plate) }}
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

    return allColumns.filter((col) => col.visible !== false);
  }, [t, filters, onEdit, onDelete, canEdit]);

  return (
    <Table
      columns={columns}
      dataSource={vehicles}
      loading={isLoading}
      rowKey="_id"
      rowSelection={rowSelection}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} / ${total} ${t("Vehicles.TOTAL")}`,
      }}
    />
  );
}
