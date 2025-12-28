import {
  List,
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
    <List
      loading={isLoading}
      dataSource={companies}
      locale={{ emptyText: <Empty description={t("Table.NO_DATA")} /> }}
      renderItem={(item) => (
        <List.Item>
          <Card
            style={{ width: "100%" }}
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
                okText={t("Common.YES")}
                cancelText={t("Common.NO")}
                icon={<DeleteOutlined style={{ color: "red" }} />}
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
            <Space direction="vertical" style={{ width: "100%" }}>
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
        </List.Item>
      )}
    />
  );
}
