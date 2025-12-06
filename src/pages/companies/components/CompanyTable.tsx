import { Table, Empty, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CompanyType } from "../../../types";
import { useTranslation } from "react-i18next";

type Props = {
  companies: CompanyType[];
  isLoading: boolean;
  onEdit: (c: CompanyType) => void;
  onDelete: (c: CompanyType) => void;
};

export default function CompaniesTable({
  companies,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const columns: ColumnsType<CompanyType> = [
    { title: t("Companies.COMPANY_NAME"), dataIndex: "name", key: "name" },
    {
      title: t("Companies.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: string) => new Date(d).toLocaleString("tr-TR"),
    },
    {
      title: t("Companies.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (d: string) => new Date(d).toLocaleString("tr-TR"),
    },
    {
      title: t("Companies.STATUS"),
      dataIndex: "deleted",
      key: "deleted",
      render: (deleted: boolean) => (
        <Tag color={deleted ? "red" : "green"}>
          {deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE")}
        </Tag>
      ),
    },
    {
      title: t("Companies.ACTIONS"),
      key: "action",
      render: (_: any, record: CompanyType) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("Companies.EDIT")}
          </Button>
          <Popconfirm
            title={t("Companies.DELETE_CONFIRM_TITLE") || "Silme işlemi"}
            description={<strong>{record.name}</strong>}
            onConfirm={() => onDelete(record)}
            okText="Onayla"
            cancelText="İptal"
            icon={<DeleteOutlined style={{ color: "red" }} />}
          >
            <Button danger type="text">
              {t("Companies.DELETE")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={companies}
      loading={isLoading}
      rowKey="_id"
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("Table.NO_DATA")}
          />
        ),
      }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} / ${total} şirket`,
      }}
    />
  );
}
