import { Table, Empty, Tag, Popconfirm, Button, Space, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TripType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
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
        date
          ? new Date(date).toLocaleString("tr-TR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
    },
    {
      title: t("Trips.DEPARTURE_TIME"),
      dataIndex: "departure_time",
      key: "departure_time",
      render: (date: string) =>
        date
          ? new Date(date).toLocaleString("tr-TR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
    },
    {
      title: t("Trips.FULL_NAME"),
      dataIndex: "driver",
      key: "driver",
      render: (driver: any) => driver?.full_name || "-",
    },
    {
      title: t("Trips.PHONE_NUMBER"),
      dataIndex: "driver",
      key: "driver_phone",
      render: (driver: any) => formatPhoneNumber(driver?.phone_number) || "-",
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
      render: (vehicle: any) =>
        formatLicencePlate(vehicle?.licence_plate) || "-",
    },
    {
      title: t("Trips.UNLOAD_STATUS"),
      dataIndex: "unload_status",
      key: "unload_status",
    },
    {
      title: t("Trips.GPS_TRACKING"),
      dataIndex: "has_gps_tracking",
      key: "has_gps_tracking",
      render: (val: boolean) => (
        <Tag color={val ? "green" : "red"}>
          {val ? t("Common.YES") : t("Common.NO")}
        </Tag>
      ),
    },
    {
      title: (
        <Tooltip title={t("Trips.TEMP_PARKING")}>
          <span>KK</span>
        </Tooltip>
      ),
      dataIndex: "is_in_temporary_parking_lot",
      key: "is_in_temporary_parking_lot",
      render: (val: boolean) => (val ? <Tag color="green">Kesik</Tag> : null),
    },
    {
      title: t("Trips.TRIP_CANCELED"),
      dataIndex: "is_trip_canceled",
      key: "is_trip_canceled",
      render: (val: boolean) =>
        val ? <Tag color="red">{t("Common.CANCEL")}</Tag> : null,
    },
    {
      title: t("Table.ACTIONS"),
      key: "action",
      fixed: "right",
      width: 200,
      render: (_: any, record: TripType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("Common.EDIT")}
          </Button>
          <Popconfirm
            title={t("Trips.DELETE_CONFIRM_TITLE")}
            description={
              <span>
                <Trans
                  i18nKey="Trips.DELETE_CONFIRM_DESC"
                  values={{
                    plate:
                      formatLicencePlate(record.vehicle?.licence_plate) || "",
                  }}
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
    Table.EXPAND_COLUMN,
  ];

  return (
    <Table
      columns={columns}
      dataSource={trips}
      loading={isLoading}
      rowKey="_id"
      scroll={{ x: 1500 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} / ${total} ${t("Trips.TOTAL")}`,
      }}
      expandable={{
        expandedRowRender: (record) => (
          <p style={{ margin: 0 }}>
            {t("Trips.NOTES")}: {record.notes}
          </p>
        ),
        rowExpandable: (record) => !!record.notes,
      }}
    />
  );
}
