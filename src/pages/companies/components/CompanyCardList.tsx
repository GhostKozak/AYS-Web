import { List, Card, Tag, Popconfirm, Button, Empty, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { CompanyType } from "../../../types";
import { useTranslation } from "react-i18next";

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
              <div>
                <small>{t("Companies.CREATED_AT")}:</small>{" "}
                <span>
                  {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <div>
                <small>{t("Companies.UPDATED_AT")}:</small>{" "}
                <span>
                  {new Date(item.updatedAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
}
