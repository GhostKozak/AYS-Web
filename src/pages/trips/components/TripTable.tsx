import { Table, Tag, Popconfirm, Button, Space, Tooltip, Modal, Image, Input } from "antd";
import { DeleteOutlined, EditOutlined, CameraOutlined } from "@ant-design/icons";
import { USER_ROLES, type TripType, type TableSettings } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import {
  formatLicencePlate,
  formatPhoneNumber,
  formatDateTime,
  formatTime,
} from "../../../utils";
import { useMemo, useState, useEffect, useCallback } from "react";
import type { ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import { useAuth } from "../../../hooks/useAuth";


type Props = {
  items: TripType[];
  isLoading: boolean;
  onEdit: (c: TripType) => void;
  onDelete: (c: TripType) => void;
  rowSelection?: TableRowSelection<TripType>;
  settings?: TableSettings;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  setSearch?: (search: string) => void;
};

interface AuthenticatedColumnType extends ColumnType<TripType> {
  visible?: boolean;
}

export default function TripTable({
  items: trips,
  isLoading,
  onEdit,
  onDelete,
  rowSelection,
  settings,
  total: serverTotal,
  page: serverPage,
  pageSize: serverPageSize,
  onPageChange,
  setSearch,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.EDITOR;
  const fontSize = settings?.fontSize ?? "normal";
  const handleFilterSearch = (value: string) => {
    if (setSearch) {
      setSearch(value);
    }
  };

  const getCustomFilterProps = (placeholder: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input.Search
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onSearch={(value) => {
            handleFilterSearch(value);
            confirm();
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          onClick={() => {
            clearFilters?.();
            handleFilterSearch("");
            confirm();
          }}
          size="small"
          style={{ width: 90 }}
        >
          {t("Common.CLEAR", { defaultValue: "Temizle" })}
        </Button>
      </div>
    ),
  });

  const fontSizeMap: Record<string, string> = {
    small: "12px",
    normal: "14px",
    large: "20px",
  };
  const tableFontSize = fontSizeMap[fontSize] ?? fontSizeMap.normal;

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
  const [glowingRowIds, setGlowingRowIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const handleTripVerified = (event: Event) => {
      const tripId = (event as CustomEvent<string>).detail;
      if (tripId) {
        setGlowingRowIds((prev) => new Set(prev).add(tripId));
        setTimeout(() => {
          setGlowingRowIds((prev) => {
            const next = new Set(prev);
            next.delete(tripId);
            return next;
          });
        }, 3500);
      }
    };

    window.addEventListener("trip-verified", handleTripVerified);
    return () => window.removeEventListener("trip-verified", handleTripVerified);
  }, []);

  const getRowClassName = useCallback((record: TripType) => {
    const classes: string[] = [];
    if (record.status === "PENDING") {
      classes.push("row-pending-glow");
    }
    if (glowingRowIds.has(record._id)) {
      classes.push("row-verified-glow");
    }
    return classes.join(" ");
  }, [glowingRowIds]);

  const openPhotoModal = useCallback((photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalOpen(true);
  }, []);

  const columns = useMemo(() => {
    const allColumns: AuthenticatedColumnType[] = [
      {
        title: t("Trips.ARRIVAL_TIME"),
        key: "time_range",
        render: (_: unknown, record) => (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.75em", color: "#52c41a" }}>▼</span>
              <span>
                {record.arrival_time
                  ? formatDateTime(record.arrival_time, {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: "0.75em", color: "#ff4d4f" }}>▲</span>
              <span style={{ color: record.departure_time ? "inherit" : "#888" }}>
                {record.departure_time
                  ? formatDateTime(record.departure_time, {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        ),
        width: 140,
        sorter: (a, b) => new Date(a.arrival_time || 0).getTime() - new Date(b.arrival_time || 0).getTime(),
      },
      {
        title: t("Trips.FULL_NAME"),
        key: "driver",
        render: (_: string, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{record.driver?.full_name || "-"}</div>
            <div style={{ fontSize: "0.85em", color: "#888" }}>
              {formatPhoneNumber(record.driver?.phone_number ?? "") || ""}
            </div>
          </div>
        ),
        ...getCustomFilterProps(t("Trips.SEARCH_DRIVER", { defaultValue: "Şoför Ara" })),
        width: 180,
      },
      {
        title: t("Trips.PHONE_NUMBER"),
        dataIndex: ["driver", "phone_number"],
        key: "driver_phone",
        render: (phoneNumber: string) => formatPhoneNumber(phoneNumber) || "-",
        width: 150,
      },
      {
        title: t("Trips.COMPANY_NAME"),
        dataIndex: ["company", "name"],
        key: "company",
        ...getCustomFilterProps(t("Trips.SEARCH_COMPANY", { defaultValue: "Firma Ara" })),
        width: 200,
      },
      {
        title: t("Trips.LICENSE_PLATE"),
        dataIndex: ["vehicle", "licence_plate"],
        key: "vehicle",
        render: (plate: string) => (plate ? formatLicencePlate(plate) : "-"),
        ...getCustomFilterProps(t("Trips.SEARCH_VEHICLE", { defaultValue: "Araç Ara" })),
      },
      {
        title: t("Trips.UNLOAD_STATUS"),
        dataIndex: "unload_status",
        key: "unload_status",
        render: (val: string) => {
          if (!val) return "-";

          const colorMap: Record<string, string> = {
            WAITING: "warning",
            IN_PROGRESS: "processing",
            UNLOADING: "processing",
            UNLOADED: "success",
            COMPLETED: "success",
            CANCELED: "error",
            PENDING: "warning",
          };

          return (
            <Tag color={colorMap[val] || "default"}>
              {t(`Trips.STATUS_${val}`)}
            </Tag>
          );
        },
        filters: [
          { text: t("Trips.STATUS_WAITING"), value: "WAITING" },
          { text: t("Trips.STATUS_IN_PROGRESS"), value: "IN_PROGRESS" },
          { text: t("Trips.STATUS_UNLOADING"), value: "UNLOADING" },
          { text: t("Trips.STATUS_UNLOADED"), value: "UNLOADED" },
          { text: t("Trips.STATUS_COMPLETED"), value: "COMPLETED" },
          { text: t("Trips.STATUS_CANCELED"), value: "CANCELED" },
          { text: t("Trips.STATUS_PENDING"), value: "PENDING" },
        ],
        onFilter: (value, record) => record.unload_status === value,
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
        sorter: (a, b) => Number(a.has_gps_tracking) - Number(b.has_gps_tracking),
      },
      {
        title: t("Trips.IN_PARKING_LOT"),
        key: "location",
        render: (_: unknown, record) => {
          if (record.is_trip_canceled) {
            return <Tag color="red">{t("Common.CANCEL")}</Tag>;
          }
          if (record.is_in_temporary_parking_lot) {
            return (
              <div>
                <Tag color="green">{t("Trips.TEMP_PARKING_SHORT", { defaultValue: "Interrupted" })}</Tag>
                {record.parked_at && (
                  <div style={{ fontSize: "0.8em", color: "#888" }}>
                    {formatTime(record.parked_at, { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            );
          }
          if (record.is_in_parking_lot) {
            return <Tag color="blue">{t("FieldOps.TAG_PARK")}</Tag>;
          }
          return "-";
        },
        filters: [
          { text: t("Trips.TEMP_PARKING_SHORT", { defaultValue: "Interrupted" }), value: "temp" },
          { text: t("FieldOps.TAG_PARK"), value: "park" },
          { text: t("Common.CANCEL"), value: "canceled" },
        ],
        onFilter: (value, record) => {
          if (value === "temp") return record.is_in_temporary_parking_lot;
          if (value === "park") return record.is_in_parking_lot && !record.is_in_temporary_parking_lot;
          if (value === "canceled") return record.is_trip_canceled;
          return true;
        },
        width: 120,
        sorter: (a, b) => {
          const getOrder = (r: TripType) => {
            if (r.is_trip_canceled) return 0;
            if (r.is_in_temporary_parking_lot) return 1;
            if (r.is_in_parking_lot) return 2;
            return 3;
          };
          return getOrder(a) - getOrder(b);
        },
      },
      {
        title: t("Trips.SEAL_NUMBER"),
        dataIndex: "seal_number",
        key: "seal_number",
        render: (val: string) => val || "-",
        width: 140,
        ...getCustomFilterProps(t("Trips.SEARCH_SEAL", { defaultValue: "Mühür Ara" })),
      },
      {
        title: t("Trips.VERIFICATION_STATUS"),
        dataIndex: "status",
        key: "status",
        render: (val: string) => {
          if (!val) return "-";
          const colorMap: Record<string, string> = {
            PENDING: "orange",
            CONFIRMED: "green",
            CANCELED: "red",
          };
          return (
            <Tag color={colorMap[val] || "default"}>
              {t(`Trips.VERIFY_${val}`)}
            </Tag>
          );
        },
        filters: [
          { text: t("Trips.VERIFY_PENDING"), value: "PENDING" },
          { text: t("Trips.VERIFY_CONFIRMED"), value: "CONFIRMED" },
          { text: t("Trips.VERIFY_CANCELED"), value: "CANCELED" },
        ],
        onFilter: (value, record) => record.status === value,
        width: 130,
        sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
      },
      {
        title: t("Trips.FIELD_PHOTO"),
        dataIndex: "field_photo_path",
        key: "field_photo_path",
        render: (val: string) =>
          val ? (
            <Tooltip title={t("Trips.VIEW_PHOTO")}>
              <Button
                type="text"
                icon={<CameraOutlined style={{ color: "#1890ff" }} />}
                onClick={() => openPhotoModal(val)}
              />
            </Tooltip>
          ) : (
            "-"
          ),
        width: 100,
        filters: [
          { text: t("Common.YES"), value: true },
          { text: t("Common.NO"), value: false },
        ],
        onFilter: (value, record) =>
          value ? !!record.field_photo_path : !record.field_photo_path,
      },
      {
        title: t("Trips.FIELD_VERIFIED_AT"),
        dataIndex: "field_verified_at",
        key: "field_verified_at",
        render: (date: string) =>
          date
            ? formatDateTime(date, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        width: 150,
        filters: [
          { text: t("Common.YES"), value: true },
          { text: t("Common.NO"), value: false },
        ],
        onFilter: (value, record) =>
          value ? !!record.field_verified_at : !record.field_verified_at,
        sorter: (a, b) => new Date(a.field_verified_at || 0).getTime() - new Date(b.field_verified_at || 0).getTime(),
      },
      {
        title: t("Table.CREATED_AT"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) =>
          date
            ? formatDateTime(date, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        width: 150,
        visible: user?.role === USER_ROLES.ADMIN,
        sorter: (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      },
      {
        title: t("Table.UPDATED_AT"),
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (date: string) =>
          date
            ? formatDateTime(date, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        width: 150,
        visible: user?.role === USER_ROLES.ADMIN,
        sorter: (a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime(),
      },
      {
        title: t("Table.ACTIONS"),
        key: "action",
        fixed: "right",
        width: 200,
        visible: canEdit,
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

    const filtered = allColumns.filter((col) => col.visible !== false);
    if (settings?.visibleColumns && settings.visibleColumns.length > 0) {
      return filtered.filter((col) => {
        const key = typeof col.key === "string" ? col.key : String(col.key);
        return settings.visibleColumns?.includes(key);
      });
    }
    return filtered;
  }, [t, onEdit, onDelete, canEdit, settings, user, openPhotoModal, trips]);

  return (
    <div style={{ fontSize: tableFontSize }}>
      <Table
        style={{ fontSize: tableFontSize, lineHeight: 1.5 }}
        components={tableComponents}
        columns={columns}
        dataSource={trips}
        loading={isLoading}
        rowKey="_id"
        rowSelection={rowSelection}
        rowClassName={getRowClassName}
        scroll={{ x: 1500 }}
        pagination={serverTotal !== undefined ? {
          current: serverPage ?? 1,
          pageSize: Math.max(serverPageSize ?? 10, trips.length),
          total: serverTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} ${t("Trips.TOTAL")}`,
          onChange: onPageChange,
        } : {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} ${t("Trips.TOTAL")}`,
        }}
        expandable={{
          showExpandColumn: true,
          expandRowByClick: true,
          expandedRowRender: (record) => (
            <div style={{ margin: 0 }}>
              <p><strong>{t("Trips.NOTES")}:</strong> {record.notes}</p>
              {record.parked_at && (
                <p><strong>{t("Trips.PARKED_AT")}:</strong> {formatDateTime(record.parked_at)}</p>
              )}
              {record.seal_number && (
                <p><strong>{t("Trips.SEAL_NUMBER")}:</strong> {record.seal_number}</p>
              )}
              {record.field_verified_at && (
                <p><strong>{t("Trips.FIELD_VERIFIED_AT")}:</strong> {formatDateTime(record.field_verified_at)}</p>
              )}
            </div>
          ),
          rowExpandable: (record) => !!record.notes || !!record.parked_at || !!record.seal_number || !!record.field_verified_at,
        }}
      />

      <Modal
        title={t("Trips.FIELD_PHOTO_TITLE")}
        open={photoModalOpen}
        onCancel={() => setPhotoModalOpen(false)}
        footer={null}
        width="auto"
      >
        <Image
          src={selectedPhoto}
          alt={t("Trips.FIELD_PHOTO")}
          style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          preview={false}
        />
      </Modal>
    </div>
  );
}
