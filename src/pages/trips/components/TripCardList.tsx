import { Tag, Flex, Divider, Typography, Space } from "antd";
import EntityCardList from "../../../components/common/EntityCardList";
import { useTranslation } from "react-i18next";
import { formatLicencePlate } from "../../../utils";
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
                ? new Date(item.arrival_time).toLocaleDateString("tr-TR")
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
            {item.is_in_temporary_parking_lot && <Tag color="green">{t("Trips.TEMP_PARKING_SHORT")}</Tag>}
            {item.is_in_parking_lot && !item.is_in_temporary_parking_lot && <Tag color="blue">{t("FieldOps.TAG_PARK")}</Tag>}
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
