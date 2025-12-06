import { Table, Empty, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { DriverType } from "../../../types";
import { useTranslation } from "react-i18next";
import { formatPhoneNumber } from "../../../utils";

type Props = {
  drivers: DriverType[];
  isLoading: boolean;
  onEdit: (c: DriverType) => void;
  onDelete: (c: DriverType) => void;
};

export default function DriverTable({
  drivers,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const columns: ColumnsType<DriverType> = [
    { title: t("Drivers.FULL_NAME"), dataIndex: "full_name", key: "full_name" },
    {
      title: t("Drivers.PHONE_NUMBER"),
      dataIndex: "phone_number",
      key: "phone_number",
      render: formatPhoneNumber,
    },
    {
      title: t("Drivers.COMPANY_NAME"),
      dataIndex: "company",
      key: "company",
      render: (company: { name: string }) => company?.name || "Şirket Yok",
    },
    {
      title: t("Companies.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
    },
    {
      title: t("Companies.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
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
      title: t("Drivers.ACTIONS"),
      key: "action",
      render: (_: any, record: DriverType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("Companies.EDIT")}
          </Button>
          <Popconfirm
            title="Silme işlemi"
            description={
              <span>
                <strong>{record.full_name}</strong> sürücünü silmek istediğinize
                emin misiniz?
              </span>
            }
            okText="Onayla"
            cancelText="İptal"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onConfirm={() => onDelete(record)}
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
      dataSource={drivers}
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
