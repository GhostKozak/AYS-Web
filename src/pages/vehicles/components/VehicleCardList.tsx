import { Flex, Divider, Typography, Space } from "antd";
import EntityCardList from "../../../components/common/EntityCardList";
import { useTranslation } from "react-i18next";
import { formatLicencePlate } from "../../../utils";
import type { VehicleType } from "../../../types";

type Props = {
  items: VehicleType[];
  isLoading: boolean;
  onEdit: (c: VehicleType) => void;
  onDelete: (c: VehicleType) => void;
};

export default function VehicleCardList({ items, isLoading, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <EntityCardList
      items={items}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      renderTitle={(item) => formatLicencePlate(item.licence_plate)}
      renderBody={(item) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Flex justify="space-between">
            <Text type="secondary">{t("Vehicles.VEHICLE_TYPE")}:</Text>
            <Text>{t(`Vehicles.TYPE_${item.vehicle_type}`)}</Text>
          </Flex>
          <Divider size="small" style={{ margin: "8px 0" }} />
          <Flex justify="space-between">
            <Text type="secondary">{t("Table.CREATED_AT")}:</Text>
            <Text>{new Date(item.createdAt).toLocaleDateString("tr-TR")}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text type="secondary">{t("Table.UPDATED_AT")}:</Text>
            <Text>{new Date(item.updatedAt).toLocaleDateString("tr-TR")}</Text>
          </Flex>
        </Space>
      )}
      deleteConfirmTitleKey="Vehicles.DELETE_CONFIRM_TITLE"
      deleteConfirmDescKey="Vehicles.DELETE_CONFIRM_DESC"
      deleteConfirmValues={(item) => ({ plate: formatLicencePlate(item.licence_plate) })}
    />
  );
}
