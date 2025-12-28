import { Table, Empty, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { VehicleType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import { formatLicencePlate } from "../../../utils";

type Props = {
  vehicles: VehicleType[];
  isLoading: boolean;
  onEdit: (c: VehicleType) => void;
  onDelete: (c: VehicleType) => void;
};

export default function VehicleTable({
  vehicles,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const columns: ColumnsType<VehicleType> = [
    {
      title: t("Vehicles.LICENSE_PLATE"),
      dataIndex: "licence_plate",
      key: "licence_plate",
      render: formatLicencePlate,
    },
    {
      title: t("Vehicles.VEHICLE_TYPE"),
      dataIndex: "vehicle_type",
      key: "vehicle_type",
    },
    {
      title: t("Table.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Table.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Table.STATUS"),
      key: "deleted",
      dataIndex: "deleted",
      render: (deleted: boolean) => (
        <Tag color={deleted ? "red" : "green"}>
          {deleted ? t("Common.PASSIVE") : t("Common.ACTIVE")}
        </Tag>
      ),
    },
    {
      title: t("Table.ACTIONS"),
      key: "action",
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
            okText={t("Common.CONFIRM")}
            cancelText={t("Common.CANCEL")}
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

  return (
    <Table
      columns={columns}
      dataSource={vehicles}
      loading={isLoading}
      rowKey="_id"
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("Table.NO_DATA")}
          />
        ),
      }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} / ${total} ${t("Vehicles.TOTAL")}`,
      }}
    />
  );
}
