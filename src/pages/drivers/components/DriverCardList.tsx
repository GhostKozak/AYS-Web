import {
  List,
  Card,
  Tag,
  Popconfirm,
  Button,
  Empty,
  Space,
  Typography,
  Flex,
  Divider,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { DriverType } from "../../../types";
import { useTranslation } from "react-i18next";
import { formatPhoneNumber } from "../../../utils";

type Props = {
  companies: DriverType[];
  isLoading: boolean;
  onEdit: (c: DriverType) => void;
  onDelete: (c: DriverType) => void;
};

export default function DriverCardList({
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
            title={item.full_name}
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(item)}
                key="edit"
              >
                {t("Companies.EDIT")}
              </Button>,
              <Popconfirm
                title="Sil?"
                onConfirm={() => onDelete(item)}
                okText="Evet"
                cancelText="Hayır"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  key="delete"
                >
                  {t("Companies.DELETE")}
                </Button>
              </Popconfirm>,
            ]}
            extra={
              <Tag color={item.deleted ? "red" : "green"}>
                {item.deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE")}
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Flex justify="space-between">
                <Text type="secondary">Telefon Numarası:</Text>
                <Text>{formatPhoneNumber(item.phone_number)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text type="secondary">Firması:</Text>
                <Text>{item.company.name}</Text>
              </Flex>
              <Divider size="small" />
              <Flex justify="space-between">
                <Text type="secondary">{t("Companies.CREATED_AT")}:</Text>
                <Text>
                  {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text type="secondary">{t("Companies.UPDATED_AT")}:</Text>
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
