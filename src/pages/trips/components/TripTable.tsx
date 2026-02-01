import { Table, Tag, Popconfirm, Button, Space, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { UserRole, type TripType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import {
  formatLicencePlate,
  formatPhoneNumber,
  getUniqueOptions,
} from "../../../utils";
import { useMemo } from "react";
import type { ColumnType } from "antd/lib/table";
import { hasRole } from "../../../utils/auth.utils";

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

  const filters = useMemo(() => {
    return {
      driverName: getUniqueOptions(trips, (t) => t.driver?.full_name),
      driverPhone: getUniqueOptions(
        trips,
        (t) => t.driver?.phone_number,
        formatPhoneNumber,
      ),
      company: getUniqueOptions(trips, (t) => t.company?.name),
      vehicle: getUniqueOptions(
        trips,
        (t) => t.vehicle?.licence_plate,
        formatLicencePlate,
      ),
      arrivalDate: Array.from(
        new Set(
          trips
            .map((t) =>
              t.arrival_time
                ? new Date(t.arrival_time).toLocaleDateString("tr-TR")
                : null,
            )
            .filter((date): date is string => date !== null),
        ),
      ).map((date) => ({ text: date, value: date })),
    };
  }, [trips]);

  interface AuthenticatedColumnType extends ColumnType<TripType> {
    visible?: boolean;
  }

  const columns = useMemo(() => {
    const allColumns: AuthenticatedColumnType[] = [
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
        filters: filters.arrivalDate,
        onFilter: (value, record) => {
          if (!record.arrival_time) return false;
          return (
            new Date(record.arrival_time).toLocaleDateString("tr-TR") === value
          );
        },
        filterSearch: true,
        width: 150,
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
        width: 150,
      },
      {
        title: t("Trips.FULL_NAME"),
        dataIndex: ["driver", "full_name"],
        key: "driver",
        filters: filters.driverName,
        onFilter: (value, record) => record.driver.full_name === value,
        filterSearch: true,
      },
      {
        title: t("Trips.PHONE_NUMBER"),
        dataIndex: ["driver", "phone_number"],
        key: "driver_phone",
        render: (phoneNumber: string) => formatPhoneNumber(phoneNumber) || "-",
        filters: filters.driverPhone,
        onFilter: (value, record) => record.driver.phone_number === value,
        filterSearch: true,
      },
      {
        title: t("Trips.COMPANY_NAME"),
        dataIndex: ["company", "name"],
        key: "company",
        filters: filters.company,
        onFilter: (value, record) => record.company.name === value,
        filterSearch: true,
      },
      {
        title: t("Trips.LICENSE_PLATE"),
        dataIndex: ["vehicle", "licence_plate"],
        key: "vehicle",
        render: (plate: string) => (plate ? formatLicencePlate(plate) : "-"),
        filters: filters.vehicle,
        onFilter: (value, record) => record.vehicle.licence_plate === value,
        filterSearch: true,
      },
      {
        title: t("Trips.UNLOAD_STATUS"),
        dataIndex: "unload_status",
        key: "unload_status",
        render: (val: string) => (val ? t(`Trips.STATUS_${val}`) : "-"),
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
        filters: [
          { text: t("Common.YES"), value: true },
          { text: t("Common.NO"), value: false },
        ],
        onFilter: (value, record) => record.has_gps_tracking === value,
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
        filters: [
          { text: "Kesik", value: true },
          { text: t("Common.NO"), value: false },
        ],
        onFilter: (value, record) =>
          record.is_in_temporary_parking_lot === value,
      },
      {
        title: t("Trips.TRIP_CANCELED"),
        dataIndex: "is_trip_canceled",
        key: "is_trip_canceled",
        render: (val: boolean) =>
          val ? <Tag color="red">{t("Common.CANCEL")}</Tag> : null,
        filters: [
          { text: "İptal", value: true },
          { text: t("Common.NO"), value: false },
        ],
        onFilter: (value, record) => record.is_trip_canceled === value,
      },
      {
        title: t("Table.ACTIONS"),
        key: "action",
        fixed: "right",
        width: 200,
        visible: hasRole([UserRole.ADMIN, UserRole.EDITOR]),
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
                      plate: record.vehicle?.licence_plate
                        ? formatLicencePlate(record.vehicle.licence_plate)
                        : "",
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

    return allColumns.filter((col) => col.visible !== false);
  }, []);

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
        showExpandColumn: true,
        expandRowByClick: true,
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
