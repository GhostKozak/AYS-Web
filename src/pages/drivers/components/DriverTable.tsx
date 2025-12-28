import { Table, Tag, Popconfirm, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { DriverType } from "../../../types";
import { Trans, useTranslation } from "react-i18next";
import { formatPhoneNumber, getUniqueOptions } from "../../../utils";
import { useMemo } from "react";

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

  const filters = useMemo(() => {
    return {
      name: getUniqueOptions(drivers, (driver) => driver.full_name),
      phone: getUniqueOptions(
        drivers,
        (driver) => driver.phone_number,
        formatPhoneNumber
      ),
      company: getUniqueOptions(drivers, (driver) => driver.company.name),
    };
  }, [drivers]);

  const columns: ColumnsType<DriverType> = [
    {
      title: t("Drivers.FULL_NAME"),
      dataIndex: "full_name",
      key: "full_name",
      filters: filters.name,
      onFilter: (value, record) => record.full_name === value,
      filterSearch: true,
    },
    {
      title: t("Drivers.PHONE_NUMBER"),
      dataIndex: "phone_number",
      key: "phone_number",
      render: formatPhoneNumber,
      filters: filters.phone,
      onFilter: (value, record) => record.phone_number === value,
      filterSearch: true,
    },
    {
      title: t("Drivers.COMPANY_NAME"),
      dataIndex: ["company", "name"],
      key: "company",
      filters: filters.company,
      onFilter: (value, record) => record.company.name === value,
      filterSearch: true,
    },
    {
      title: t("Table.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      responsive: ["lg"],
    },
    {
      title: t("Table.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleString("tr-TR"),
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      responsive: ["lg"],
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
      filters: [
        { text: t("Common.ACTIVE"), value: false },
        { text: t("Common.PASSIVE"), value: true },
      ],
      onFilter: (value, record) => record.deleted === value,
    },
    {
      title: t("Table.ACTIONS"),
      key: "action",
      render: (_: any, record: DriverType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("Common.EDIT")}
          </Button>
          <Popconfirm
            title={t("Drivers.DELETE_CONFIRM_TITLE")}
            description={
              <span>
                <Trans
                  i18nKey="Drivers.DELETE_CONFIRM_DESC"
                  values={{ name: record.full_name }}
                  components={{ bold: <strong /> }}
                />
              </span>
            }
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onConfirm={() => onDelete(record)}
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
      dataSource={drivers}
      loading={isLoading}
      rowKey="_id"
      scroll={{ x: 1000 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} / ${total} ${t("Drivers.TOTAL")}`,
      }}
    />
  );
}
