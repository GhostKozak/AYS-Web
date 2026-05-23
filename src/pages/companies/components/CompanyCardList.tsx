import { Flex, Typography, Space } from "antd";
import EntityCardList from "../../../components/common/EntityCardList";
import { useTranslation } from "react-i18next";
import type { CompanyType } from "../../../types";

type Props = {
  items: CompanyType[];
  isLoading: boolean;
  onEdit: (c: CompanyType) => void;
  onDelete: (c: CompanyType) => void;
};

export default function CompanyCardList({ items, isLoading, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <EntityCardList
      items={items}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      renderTitle={(item) => item.name}
      renderBody={(item) => (
        <Space direction="vertical" style={{ width: "100%" }}>
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
      deleteConfirmTitleKey="Companies.DELETE_CONFIRM_TITLE"
      deleteConfirmDescKey="Companies.DELETE_CONFIRM_DESC"
      deleteConfirmValues={(item) => ({ name: item.name })}
    />
  );
}
