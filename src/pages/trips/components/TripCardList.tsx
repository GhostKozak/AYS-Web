import {
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
    <div style={{ position: "relative" }}>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">{t("Common.LOADING")}</Text>
        </div>
      )}
      {!isLoading && trips.length === 0 && (
        <Empty description={t("Table.NO_DATA")} />
      )}
      {!isLoading && (
        <Flex gap="middle" wrap="wrap">
          {trips.map((item) => (
            <Card
              key={item._id}
              style={{ width: "100%", maxWidth: "400px" }}
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
                            formatLicencePlate(item.vehicle?.licence_plate) ||
                            "",
                        }}
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
                <Divider size="small" style={{ margin: "8px 0" }} />
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
