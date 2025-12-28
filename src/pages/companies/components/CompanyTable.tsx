import { Table, Empty, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CompanyType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";

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
      title: t("Table.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: string) => new Date(d).toLocaleString("tr-TR"),
    },
    {
      title: t("Table.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (d: string) => new Date(d).toLocaleString("tr-TR"),
    },
    {
      title: t("Table.STATUS"),
      dataIndex: "deleted",
      key: "deleted",
      render: (deleted: boolean) => (
        <Tag color={deleted ? "red" : "green"}>
          {deleted ? t("Common.PASSIVE") : t("Common.ACTIVE")}
        </Tag>
      ),
    },
    {
      title: t("Table.ACTIONS"),
      key: "action",
      render: (_: any, record: CompanyType) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("Common.EDIT")}
          </Button>
          <Popconfirm
            title={t("Companies.DELETE_CONFIRM_TITLE")}
            description={
              <span>
                <Trans
                  i18nKey="Companies.DELETE_CONFIRM_DESC"
                  values={{ name: record.name }}
                  components={{ bold: <strong /> }}
                />
              </span>
            }
            onConfirm={() => onDelete(record)}
            okText={t("Common.CONFIRM")}
            cancelText={t("Common.CANCEL")}
            icon={<DeleteOutlined style={{ color: "red" }} />}
          >
            <Button danger type="text">
              {t("Common.DELETE")}
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
          `${range[0]}-${range[1]} / ${total} ${t("Companies.TOTAL")}`,
      }}
    />
  );
}
