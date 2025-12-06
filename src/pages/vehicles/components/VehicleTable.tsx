import { Table, Empty, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { VehicleType } from "../../../types";
import { useTranslation } from "react-i18next";
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
      title: t("Vehicles.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Vehicles.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Vehicles.STATUS"),
      key: "deleted",
      dataIndex: "deleted",
      render: (deleted: boolean) => (
        <Tag color={deleted ? "red" : "green"}>
          {deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE")}
        </Tag>
      ),
    },
    {
      title: t("Vehicles.ACTIONS"),
      key: "action",
      render: (_: any, record: VehicleType) => (
        <Space>
          <Button
            type="text"
            onClick={() => onEdit(record)}
            icon={<EditOutlined />}
          >
            {t("Companies.EDIT")}
          </Button>
          <Popconfirm
            title="Silme işlemi"
            description={
              <span>
                <strong>{formatLicencePlate(record.licence_plate)}</strong>{" "}
                plakalı aracı silmek istediğinize emin misiniz?
              </span>
            }
            okText="Onayla"
            cancelText="İptal"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onConfirm={() => onDelete(record)}
          >
            <Button danger type="text">
              {t("Companies.DELETE")}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} araç`,
      }}
    />
  );
}
