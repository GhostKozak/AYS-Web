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
import type { TripType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import { formatLicencePlate, formatPhoneNumber } from "../../../utils";

type Props = {
  trips: TripType[];
  isLoading: boolean;
  onEdit: (c: TripType) => void;
  onDelete: (c: TripType) => void;
};

export default function TripCardList({
  trips,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <List
      loading={isLoading}
      dataSource={trips}
      locale={{ emptyText: <Empty description={t("Table.NO_DATA")} /> }}
      renderItem={(item) => (
        <List.Item>
          <Card
            style={{ width: "100%" }}
            title={formatLicencePlate(item.vehicle?.licence_plate)}
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
                title={t("Trips.DELETE_CONFIRM_TITLE")}
                description={
                  <span>
                    <Trans
                      i18nKey="Trips.DELETE_CONFIRM_DESC"
                      values={{
                        plate:
                          formatLicencePlate(item.vehicle?.licence_plate) || "",
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </span>
                }
                onConfirm={() => onDelete(item)}
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
                <Text type="secondary">{t("Trips.FULL_NAME")}:</Text>
                <Text>{item.driver?.full_name}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text type="secondary">{t("Trips.PHONE_NUMBER")}:</Text>
                <Text>{formatPhoneNumber(item.driver?.phone_number)}</Text>
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
              <Divider size="small" />
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
