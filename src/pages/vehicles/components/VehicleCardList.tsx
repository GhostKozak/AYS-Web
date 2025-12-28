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
import type { VehicleType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import { formatLicencePlate } from "../../../utils";

type Props = {
  vehicles: VehicleType[];
  isLoading: boolean;
  onEdit: (c: VehicleType) => void;
  onDelete: (c: VehicleType) => void;
};

export default function VehicleCardList({
  vehicles,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <List
      loading={isLoading}
      dataSource={vehicles}
      locale={{ emptyText: <Empty description={t("Table.NO_DATA")} /> }}
      renderItem={(item) => (
        <List.Item>
          <Card
            style={{ width: "100%" }}
            title={formatLicencePlate(item.licence_plate)}
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
                title={t("Vehicles.DELETE_CONFIRM_TITLE")}
                description={
                  <span>
                    <Trans
                      i18nKey="Vehicles.DELETE_CONFIRM_DESC"
                      values={{ plate: formatLicencePlate(item.licence_plate) }}
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
                <Text type="secondary">{t("Vehicles.VEHICLE_TYPE")}:</Text>
                <Text>{item.vehicle_type}</Text>
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
