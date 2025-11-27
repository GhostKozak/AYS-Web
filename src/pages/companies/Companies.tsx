import {
  Button,
  Empty,
  Flex,
  Layout,
  message,
  notification,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import Search from "antd/es/input/Search";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CloseCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies";
import { type CompanyType } from "../../types";
import CompanyModal from "./components/CompanyModal";

function Companies() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CompanyType | undefined>(
    undefined
  );

  const { companies, isLoading, createCompany, updateCompany, deleteCompany } =
    useCompanies();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: CompanyType) => {
    try {
      await deleteCompany(record._id);
      messageApi.warning(
        <span>
          <strong>{record.name}</strong> firması başarıyla silindi.
        </span>
      );
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
    }
  };

  const handleFormSubmit = async (values: { inputName: string }) => {
    try {
      if (selectedRecord) {
        await updateCompany({ id: selectedRecord._id, name: values.inputName });
        messageApi.info(
          <span>
            <strong>{values.inputName}</strong> firması başarıyla düzenlendi.
          </span>
        );
      } else {
        await createCompany(values.inputName);
        messageApi.success(
          <span>
            <strong>{values.inputName}</strong> firması başarıyla eklendi.
          </span>
        );
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message?.toString() ||
        "Beklenmedik bir hata oluştu.";
      openErrorNotification(errorMsg);
    }
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: CompanyType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchText) return true;
    return company.name.toLowerCase().includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: t("Companies.COMPANY_NAME"),
      dataIndex: "name",
      key: "name",
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
      render: (deleted: boolean) => {
        const color = deleted ? "red" : "green";
        const text = deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE");
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("Companies.ACTIONS"),
      key: "action",
      render: (_: any, record: CompanyType) => (
        <Space size="middle">
          <Button
            onClick={() => handleEdit(record)}
            color="yellow"
            variant="outlined"
          >
            {t("Companies.EDIT")}
          </Button>
          <Popconfirm
            title="Silme işlemi"
            description={
              <span>
                <strong>{record.name}</strong> firmasını silmek istediğinize
                emin misiniz?
              </span>
            }
            onConfirm={() => handleDelete(record)}
            okText="Onayla"
            cancelText="İptal"
            icon={<DeleteOutlined style={{ color: "red" }} />}
          >
            <Button danger type="link" variant="text">
              {t("Companies.DELETE")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ padding: "0 50px" }}>
      {messageContextHolder}
      {notificationContextHolder}
      <Flex style={{ marginBottom: "20px" }} gap={25}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={
            <>
              <SearchOutlined /> {t("Companies.SEARCH")}
            </>
          }
          size="large"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> Firma Ekle
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={filteredCompanies}
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

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
      />
    </Layout>
  );
}

export default Companies;
