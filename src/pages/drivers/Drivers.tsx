import {
  Button,
  Empty,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, type ReactNode } from "react";
import apiClient from "../../api/apiClient";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../constants";
import Search from "antd/es/input/Search";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function Drivers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState<DriverType | undefined>(
    undefined
  );
  const [api, contextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [searchText, setSearchText] = useState("");

  const queryClient = useQueryClient();

  const fetchDrivers = async () => {
    const response = await apiClient.get(API_ENDPOINTS.DRIVERS);
    return response.data.data;
  };

  const fetchCompanies = async () => {
    const response = await apiClient.get(API_ENDPOINTS.COMPANIES);
    return response.data.data;
  };

  const {
    data: drivers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: 1000 * 60 * 5,
  });

  const { data: companies = [], isLoading: isCompanyLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 5,
  });

  const openNotification = (
    message?: string,
    description?: string,
    icon?: ReactNode
  ) => {
    api.open({
      message: message,
      description: description,
      duration: 10,
      showProgress: true,
      pauseOnHover: true,
      icon: icon,
    });
  };

  interface DriverType {
    _id: string;
    company: {
      _id: string;
      name: string;
    };
    full_name: string;
    phone_number: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  interface CompanyType {
    _id: string;
    name: string;
  }

  const formatPhoneNumber = (phone_number: string): string => {
    const cleanNumber = String(phone_number).replace(/\D/g, "");

    if (cleanNumber.length === 11 && cleanNumber.startsWith("0")) {
      const [, countryCode, ...rest] = cleanNumber.split("");
      const areaCode = rest.slice(0, 3).join("");
      const prefix = rest.slice(3, 6).join("");
      const suffix = rest.slice(6, 8).join("");
      const lastTwo = rest.slice(8, 10).join("");

      return `${countryCode}${areaCode} ${prefix} ${suffix} ${lastTwo}`;
    }

    if (cleanNumber.length === 10) {
      const [, ...rest] = `0${cleanNumber}`.split("");
      const areaCode = rest.slice(0, 3).join("");
      const prefix = rest.slice(3, 6).join("");
      const suffix = rest.slice(6, 8).join("");
      const lastTwo = rest.slice(8, 10).join("");

      return `0${areaCode} ${prefix} ${suffix} ${lastTwo}`;
    }

    return phone_number;
  };

  const columns: ColumnsType<DriverType> = [
    {
      title: t("Drivers.FULL_NAME"),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: t("Drivers.PHONE_NUMBER"),
      dataIndex: "phone_number",
      key: "phone_number",
      render: (phone_number: string) => formatPhoneNumber(phone_number),
    },
    {
      title: t("Drivers.COMPANY_NAME"),
      dataIndex: "company",
      key: "company",
      render: (company: { _id: string; name: string }) =>
        company?.name || "Şirket bulunamadı",
    },
    {
      title: t("Drivers.CREATED_AT"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: t("Drivers.UPDATED_AT"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) =>
        new Date(date).toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: t("Drivers.STATUS"),
      key: "deleted",
      dataIndex: "deleted",
      render: (deleted: boolean) => {
        const color = deleted ? "red" : "green";
        const text = deleted ? t("Drivers.PASSIVE") : t("Drivers.ACTIVE");
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("Drivers.ACTIONS"),
      key: "action",
      render: (_, record) => (
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
                <strong>{record.full_name}</strong> sürücüsünü silmek
                istediğinize emin misiniz?
              </span>
            }
            onConfirm={() => deleteDriver(record)}
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

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: DriverType) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      inputName: record.full_name,
      inputPhone: record.phone_number,
      inputCompany: record.company?._id,
    });
    setIsModalOpen(true);
  };

  const createDriver = async (values: {
    inputName: string;
    inputPhone: string;
    inputCompany: string;
  }) => {
    try {
      await apiClient.post(API_ENDPOINTS.DRIVERS, {
        full_name: values.inputName,
        phone_number: values.inputPhone,
        company: values.inputCompany,
      });
      messageApi.success(
        <span>
          <strong>{values.inputName}</strong> sürücüsü başarıyla eklendi.
        </span>
      );
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (error) {}
  };

  const updateDriver = async (values: {
    inputName: string;
    inputPhone: string;
    inputCompany: string;
  }) => {
    try {
      await apiClient.patch(API_ENDPOINTS.DRIVERS + "/" + selectedRecord?._id, {
        full_name: values.inputName,
        phone_number: values.inputPhone,
        company: values.inputCompany,
      });
      messageApi.success(
        <span>
          <strong>{values.inputName}</strong> sürücüsü başarıyla düzenlendi.
        </span>
      );
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (error) {}
  };

  const deleteDriver = async (record: DriverType) => {
    try {
      await apiClient.delete(API_ENDPOINTS.DRIVERS + "/" + record._id);
      messageApi.warning(
        <span>
          <strong>{record.full_name}</strong> sürücüsü başarıyla silindi.
        </span>
      );
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (error) {
      console.error("Sürücü silinirken hata oluştu:", error);
      message.error("Sürücü silinemedi.");
    }
  };

  const handleFormSubmit = async (values: {
    inputName: string;
    inputPhone: string;
    inputCompany: string;
  }) => {
    if (selectedRecord) {
      await updateDriver(values);
    } else {
      await createDriver(values);
    }
    setIsModalOpen(false);
  };

  const filteredDrivers = drivers?.filter((driver: any) => {
    if (!searchText) return true;

    return (
      driver.full_name.toLowerCase().includes(searchText.toLowerCase()) ?? [],
      driver.phone_number.includes(searchText) ?? []
    );
  });

  return (
    <Layout style={{ padding: "0 50px" }}>
      {contextHolder}
      {messageContextHolder}
      <Flex style={{ marginBottom: "20px" }} gap={25}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={t("Companies.SEARCH")}
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
      <Modal
        title={
          selectedRecord ? "Sürücü Düzenleme Formu" : "Yeni Sürücü Ekleme Formu"
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(undefined);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          name="driverForm"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, paddingBlock: 32 }}
          onFinish={handleFormSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Firma"
            name="inputCompany"
            rules={[{ required: true, message: "Lütfen bir firma seçin!" }]}
          >
            <Select
              placeholder="Firma Seçin"
              showSearch
              optionFilterProp="children"
            >
              {companies.map((company: CompanyType) => (
                <Select.Option key={company._id} value={company._id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Sürücü İsmi"
            name="inputName"
            rules={[{ required: true, message: "Please input driver name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Telefon"
            name="inputPhone"
            rules={[
              { required: true, message: "Please input driver phone number!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              {selectedRecord ? "Değişiklikleri Kaydet" : "Ekle"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default Drivers;
