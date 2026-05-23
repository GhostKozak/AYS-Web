import { Flex, Divider, Typography, Space } from "antd";
import EntityCardList from "../../../components/common/EntityCardList";
import { useTranslation } from "react-i18next";
import { formatPhoneNumber, formatDate } from "../../../utils";
import type { DriverType } from "../../../types";

type Props = {
  items: DriverType[];
  isLoading: boolean;
  onEdit: (c: DriverType) => void;
  onDelete: (c: DriverType) => void;
};

export default function DriverCardList({ items, isLoading, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <EntityCardList
      items={items}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      renderTitle={(item) => item.full_name}
      renderBody={(item) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Flex justify="space-between">
            <Text type="secondary">{t("Drivers.PHONE_NUMBER")}:</Text>
            <Text>{formatPhoneNumber(item.phone_number)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text type="secondary">{t("Drivers.COMPANY_NAME")}:</Text>
            <Text>{item.company?.name || t("Common.UNKNOWN_COMPANY")}</Text>
          </Flex>
          <Divider size="small" style={{ margin: "8px 0" }} />
          <Flex justify="space-between">
            <Text type="secondary">{t("Table.CREATED_AT")}:</Text>
            <Text>{formatDate(item.createdAt)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text type="secondary">{t("Table.UPDATED_AT")}:</Text>
            <Text>{formatDate(item.updatedAt)}</Text>
          </Flex>
        </Space>
      )}
      deleteConfirmTitleKey="Drivers.DELETE_CONFIRM_TITLE"
      deleteConfirmDescKey="Drivers.DELETE_CONFIRM_DESC"
      deleteConfirmValues={(item) => ({ name: item.full_name })}
    />
  );
}
