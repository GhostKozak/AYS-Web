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
import { Trans, useTranslation } from "react-i18next";
import { formatPhoneNumber } from "../../../utils";

type Props = {
  drivers: DriverType[];
  isLoading: boolean;
  onEdit: (c: DriverType) => void;
  onDelete: (c: DriverType) => void;
};

export default function DriverCardList({
  drivers,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <List
      loading={isLoading}
      dataSource={drivers}
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
                {t("Common.EDIT")}
              </Button>,
              <Popconfirm
                title={t("Drivers.DELETE_CONFIRM_TITLE")}
                description={
                  <span>
                    <Trans
                      i18nKey="Drivers.DELETE_CONFIRM_DESC"
                      values={{ name: item.full_name }}
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
                <Text type="secondary">{t("Drivers.PHONE_NUMBER")}:</Text>
                <Text>{formatPhoneNumber(item.phone_number)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text type="secondary">{t("Drivers.COMPANY_NAME")}:</Text>
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
