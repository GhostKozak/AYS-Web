import { Table, Empty, Tag, Popconfirm, Button, Space, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TripType } from "../../../types";
import { useTranslation } from "react-i18next";
import { formatLicencePlate, formatPhoneNumber } from "../../../utils";

type Props = {
  trips: TripType[];
  isLoading: boolean;
  onEdit: (c: TripType) => void;
  onDelete: (c: TripType) => void;
};

export default function TripTable({
  trips,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const columns: ColumnsType<TripType> = [
    {
      title: t("Trips.ARRIVAL_TIME"),
      dataIndex: "arrival_time",
      key: "arrival_time",
      render: (date: string) =>
        new Date(date).toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: t("Trips.ARRIVAL_TIME"),
      dataIndex: "departure_time",
      key: "departure_time",
      render: (date: string) =>
        new Date(date).toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: t("Trips.FULL_NAME"),
      dataIndex: "driver",
      key: "driver",
      render: (driver: { _id: string; full_name: string }) =>
        driver?.full_name || "Sürücü bulunamadı",
    },
    {
      title: t("Trips.PHONE_NUMBER"),
      dataIndex: "driver",
      key: "driver_phone",
      render: (driver: { _id: string; phone_number: string }) =>
        formatPhoneNumber(driver?.phone_number) || "Sürücü bulunamadı",
    },
    {
      title: t("Trips.COMPANY_NAME"),
      dataIndex: "company",
      key: "company",
      render: (company: { _id: string; name: string }) =>
        company?.name || "Şirket bulunamadı",
    },
    {
      title: t("Trips.LICENSE_PLATE"),
      dataIndex: "vehicle",
      key: "vehicle",
      render: (vehicle: { _id: string; licence_plate: string }) =>
        formatLicencePlate(vehicle?.licence_plate) || "Şirket bulunamadı",
    },
    {
      title: t("Trips.UNLOAD_STATUS"),
      dataIndex: "unload_status",
      key: "unload_status",
    },
    {
      title: "ATS",
      dataIndex: "has_gps_tracking",
      key: "has_gps_tracking",
      render: (has_gps_tracking: boolean) => {
        const color = has_gps_tracking ? "green" : "red";
        const text = has_gps_tracking ? "Var" : "Yok";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: (
        <Tooltip title="Koridor Kesik">
          <span>KK</span>
        </Tooltip>
      ),
      dataIndex: "is_in_temporary_parking_lot",
      key: "is_in_temporary_parking_lot",
      render: (is_in_temporary_parking_lot: boolean) => {
        const color = is_in_temporary_parking_lot ? "green" : "";
        const text = is_in_temporary_parking_lot ? "Kesik" : "";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("Trips.TRIP_CANCELED"),
      dataIndex: "is_trip_canceled",
      key: "is_trip_canceled",
      render: (is_trip_canceled: boolean) => {
        const color = is_trip_canceled ? "red" : "";
        const text = is_trip_canceled ? t("Trips.CANCEL") : "";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("Drivers.ACTIONS"),
      key: "action",
      render: (_: any, record: TripType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("Companies.EDIT")}
          </Button>
          <Popconfirm
            title="Silme işlemi"
            description="Bu girdiyi silmek istediğinize emin misiniz?"
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
    Table.EXPAND_COLUMN,
  ];

  return (
    <Table
      columns={columns}
      dataSource={trips}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sefer`,
      }}
      expandable={{
        expandedRowRender: (record) => (
          <p style={{ margin: 0 }}>{record.notes}</p>
        ),
        rowExpandable: (record) => !!record.notes && record.notes !== "",
      }}
    />
  );
}
