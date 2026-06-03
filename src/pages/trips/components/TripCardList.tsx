import { Tag, Flex, Divider, Typography, Space, Popover } from "antd";
import EntityCardList from "../../../components/common/EntityCardList";
import { useTranslation } from "react-i18next";
import { formatLicencePlate, formatDate, formatDateTime } from "../../../utils";
import type { TripType } from "../../../types";

type Props = {
  items: TripType[];
  isLoading: boolean;
  onEdit: (c: TripType) => void;
  onDelete: (c: TripType) => void;
};

export default function TripCardList({ items, isLoading, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <EntityCardList
      items={items}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      renderTitle={(item) => formatLicencePlate(item.vehicle?.licence_plate)}
      renderExtra={(item) =>
        item.status ? (
          <Tag color={item.status === "CONFIRMED" ? "green" : item.status === "CANCELED" ? "red" : "orange"}>
            {t(`Trips.VERIFY_${item.status}`)}
          </Tag>
        ) : (
          <Tag color={item.deleted ? "red" : "green"}>
            {item.deleted ? t("Common.PASSIVE") : t("Common.ACTIVE")}
          </Tag>
        )
      }
      renderBody={(item) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Flex justify="space-between" align="center">
            <Text type="secondary">{t("Trips.FULL_NAME")}:</Text>
            <Text>{item.driver?.full_name}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text type="secondary">{t("Trips.COMPANY_NAME")}:</Text>
            <Text>{item.company?.name}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text type="secondary">{t("Trips.ARRIVAL_TIME")}:</Text>
            <Text>
              {item.arrival_time
                ? formatDate(item.arrival_time)
                : "-"}
            </Text>
          </Flex>
          <Divider size="small" style={{ margin: "8px 0" }} />
          <Flex gap={8} wrap="wrap">
            <Tag color={
              item.unload_status === "UNLOADED" ? "success" :
              item.unload_status === "WAITING" ? "warning" :
              item.unload_status === "UNLOADING" ? "processing" : "default"
            }>
              {t(`Trips.STATUS_${item.unload_status}`)}
            </Tag>
            {item.status && (
              <Tag color={item.status === "CONFIRMED" ? "green" : item.status === "CANCELED" ? "red" : "orange"}>
                {t(`Trips.VERIFY_${item.status}`)}
              </Tag>
            )}
            {item.is_trip_canceled && <Tag color="red">{t("Common.CANCEL")}</Tag>}
            {item.is_in_parking_lot && (
              <Popover
                content={
                  <div style={{ maxWidth: 280 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{t("Trips.PARKING_HISTORY")}</div>
                    {(item.parking_history ?? []).length === 0 ? (
                      <div style={{ fontSize: 12, color: "#888" }}>{t("Common.NO_DATA")}</div>
                    ) : (
                      (item.parking_history ?? []).map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 12, lineHeight: 1.4 }}>
                          <span style={{ color: "#888", flexShrink: 0, minWidth: 16 }}>{i + 1}.</span>
                          <div>
                            <div>{formatDateTime(h.entered_at, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            <div style={{ color: "#1677ff" }}>{h.area}</div>
                            {h.note && <div style={{ color: "#888", fontStyle: "italic" }}>📝 {h.note}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                }
                trigger="click"
                placement="bottom"
              >
                <div style={{ cursor: "pointer" }}>
                  <Tag color="blue">{item.parking_area || t("FieldOps.TAG_PARK")}</Tag>
                </div>
              </Popover>
            )}
          </Flex>
          {item.seal_number && (
            <Flex justify="space-between">
              <Text type="secondary">{t("Trips.SEAL_NUMBER")}:</Text>
              <Text>{item.seal_number}</Text>
            </Flex>
          )}
        </Space>
      )}
      deleteConfirmTitleKey="Trips.DELETE_CONFIRM_TITLE"
      deleteConfirmDescKey="Trips.DELETE_CONFIRM_DESC"
      deleteConfirmValues={(item) => ({ plate: formatLicencePlate(item.vehicle?.licence_plate) || "" })}
    />
  );
}
