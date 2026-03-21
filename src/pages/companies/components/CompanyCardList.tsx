import {
  Card,
  Tag,
  Popconfirm,
  Button,
  Empty,
  Space,
  Flex,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { CompanyType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";

type Props = {
  companies: CompanyType[];
  isLoading: boolean;
  onEdit: (c: CompanyType) => void;
  onDelete: (c: CompanyType) => void;
};

export default function CompanyCardList({
  companies,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <div style={{ position: "relative" }}>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">{t("Common.LOADING")}</Text>
        </div>
      )}
      {!isLoading && companies.length === 0 && (
        <Empty description={t("Table.NO_DATA")} />
      )}
      {!isLoading && (
        <Flex gap="middle" wrap="wrap">
          {companies.map((item) => (
            <Card
              key={item._id}
              style={{ width: "100%", maxWidth: "400px" }}
              title={item.name}
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(item)}
                  key="edit"
                >
                  {t("Common.EDIT")}
                </Button>,
                <Popconfirm
                  title={t("Companies.DELETE_CONFIRM_TITLE")}
                  description={
                    <span>
                      <Trans
                        i18nKey="Companies.DELETE_CONFIRM_DESC"
                        values={{ name: item.name }}
                        components={{ bold: <strong /> }}
                      />
                    </span>
                  }
                  onConfirm={() => onDelete(item)}
                  icon={<DeleteOutlined style={{ color: "red" }} />}
                  key="delete-confirm"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    key="delete"
                  >
                    {t("Common.DELETE")}
                  </Button>
                </Popconfirm>,
              ]}
              extra={
                <Tag color={item.deleted ? "red" : "green"}>
                  {item.deleted ? t("Common.PASSIVE") : t("Common.ACTIVE")}
                </Tag>
              }
            >
              <Space orientation="vertical" style={{ width: "100%" }}>
                <Flex justify="space-between">
                  <Text type="secondary">{t("Table.CREATED_AT")}:</Text>
                  <Text>
                    {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text type="secondary">{t("Table.UPDATED_AT")}:</Text>
                  <Text>
                    {new Date(item.updatedAt).toLocaleDateString("tr-TR")}
                  </Text>
                </Flex>
              </Space>
            </Card>
          ))}
        </Flex>
      )}
    </div>
  );
}
