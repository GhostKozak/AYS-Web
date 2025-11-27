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
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { useCompanies } from "../../hooks/useCompanies"; // Şirketleri buradan çekiyoruz
import { useDrivers } from "../../hooks/useDrivers";
import DriverModal from "./components/DriverModal";

import { formatPhoneNumber } from "../../utils";

import type { ColumnsType } from "antd/es/table";
import type { DriverType } from "../../types";

function Drivers() {
  const { t } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DriverType | undefined>(
    undefined
  );

  const { drivers, isLoading, createDriver, updateDriver, deleteDriver } =
    useDrivers();
  const { companies } = useCompanies();

  const openErrorNotification = (description: string) => {
    notificationApi.open({
      message: "İşlem Başarısız",
      description: description,
      duration: 4.5,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  const handleDelete = async (record: DriverType) => {
    try {
      await deleteDriver(record._id);
      messageApi.warning(
        <span>
          <strong>{record.full_name}</strong> firması başarıyla silindi.
        </span>
      );
    } catch (error) {
      messageApi.error("Silme işlemi başarısız.");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (record: DriverType) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: {
    inputName: string;
    inputPhone: string;
    inputCompany: string;
  }) => {
    try {
      const payload = {
        full_name: values.inputName,
        phone_number: values.inputPhone,
        company: values.inputCompany,
      };

      if (selectedRecord) {
        await updateDriver({ id: selectedRecord._id, ...payload });
        messageApi.info(
          <span>
            <strong>{values.inputName}</strong> güncellendi.
          </span>
        );
      } else {
        await createDriver(payload);
        messageApi.success(
          <span>
            <strong>{values.inputName}</strong> eklendi.
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

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchText) return true;
    return (
      driver.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.phone_number.includes(searchText)
    );
  });

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
                <strong>{record.full_name}</strong> sürücünü silmek istediğinize
                emin misiniz?
              </span>
            }
            okText="Onayla"
            cancelText="İptal"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record)}
          >
            <Button danger type="link">
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
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button color="cyan" variant="solid" size="large" onClick={handleAdd}>
          <PlusOutlined /> Sürücü Ekle
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={filteredDrivers}
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
            `${range[0]}-${range[1]} / ${total} sürücü`,
        }}
      />
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFinish={handleFormSubmit}
        selectedRecord={selectedRecord}
        companies={companies}
      />
    </Layout>
  );
}

export default Drivers;
