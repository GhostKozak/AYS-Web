import {
  Card,
  Tag,
  Popconfirm,
  Button,
  Empty,
  Space,
  Typography,
  Flex,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Trans, useTranslation } from "react-i18next";
import type { ReactNode } from "react";

type Props<T extends { _id: string; deleted?: boolean }> = {
  items: T[];
  isLoading: boolean;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  renderTitle: (item: T) => ReactNode;
  renderExtra?: (item: T) => ReactNode;
  renderBody: (item: T) => ReactNode;
  deleteConfirmTitleKey: string;
  deleteConfirmDescKey: string;
  deleteConfirmValues: (item: T) => Record<string, string | undefined>;
};

export default function EntityCardList<T extends { _id: string; deleted?: boolean }>({
  items,
  isLoading,
  onEdit,
  onDelete,
  renderTitle,
  renderExtra,
  renderBody,
  deleteConfirmTitleKey,
  deleteConfirmDescKey,
  deleteConfirmValues,
}: Props<T>) {
  const { t } = useTranslation();
  const { Text } = Typography;

  return (
    <div style={{ position: "relative" }}>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">{t("Common.LOADING")}</Text>
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <Empty description={t("Table.NO_DATA")} />
      )}
      {!isLoading && (
        <Flex gap="middle" wrap="wrap">
          {items.map((item) => (
            <Card
              key={item._id}
              style={{ width: "100%", maxWidth: "400px" }}
              title={renderTitle(item)}
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
                  title={t(deleteConfirmTitleKey)}
                  description={
                    <span>
                      <Trans
                        i18nKey={deleteConfirmDescKey}
                        values={deleteConfirmValues(item) as Record<string, string>}
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
                renderExtra ? (
                  renderExtra(item)
                ) : (
                  <Tag color={item.deleted ? "red" : "green"}>
                    {item.deleted ? t("Common.PASSIVE") : t("Common.ACTIVE")}
                  </Tag>
                )
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {renderBody(item)}
              </Space>
            </Card>
          ))}
        </Flex>
      )}
    </div>
  );
}
