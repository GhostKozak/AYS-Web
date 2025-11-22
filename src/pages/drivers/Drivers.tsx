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
import { useEffect, useState, type ReactNode } from "react";
import apiClient from "../../api/apiClient";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../constants";
import Search from "antd/es/input/Search";
import { CloseCircleOutlined } from "@ant-design/icons";

function Drivers() {
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DriverType>();
  const [api, contextHolder] = notification.useNotification();
  const [companies, setCompanies] = useState<CompanyType[]>([]);

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
            onClick={() => showModal2(record)}
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
            onConfirm={() => confirm(record._id)}
            onCancel={cancel}
            okText="Onayla"
            cancelText="İptal"
          >
            <Button danger type="link" variant="text">
              {t("Companies.DELETE")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const confirm = (id: string) => {
    setOpen(false);
    deleteDriver(id);
    message.success("Next step.");
  };

  const cancel = () => {
    setOpen(false);
    message.error("Click on cancel.");
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showModal2 = (record: DriverType) => {
    setIsModal2Open(true);
    setSelectedRecord(record);
    form.setFieldsValue({
      name: record.full_name,
      phone: record.phone_number,
      company: record.company._id,
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModal2Open(false);
    setSelectedRecord(undefined);
    form.resetFields();
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.DRIVERS);
      setDrivers(response.data.data);
      console.table(response.data.data);
    } catch (error) {
      console.error("Sürücüler yüklenirken hata oluştu:", error);
      message.error("Sürücüler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const searchDriverbyNameOrPhone = async (query: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.DRIVERS_SEARCH, {
        params: {
          query: query,
        },
      });
      setDrivers(response.data.data);
    } catch (error) {
      console.error("Sürücüler yüklenirken hata oluştu:", error);
      message.error("Sürücüler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.DRIVERS + "/" + id);
      console.log(response);
      message.success("Sürücü başarıyla silindi.");
      fetchDrivers();
    } catch (error) {
      console.error("Sürücü silinirken hata oluştu:", error);
      message.error("Sürücü silinemedi.");
    }
  };

  const addNewDriverSubmitHandler = async (values: {
    name: string;
    phone: string;
    company: string;
  }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.DRIVERS, {
        full_name: values.name,
        phone_number: values.phone,
        company: values.company,
      });
      console.log(response);
      fetchDrivers();
      message.success("Sürücü başarıyla eklendi.");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      const message = (error as any).response.data.message.toString();
      openNotification(
        "Hata",
        message,
        <CloseCircleOutlined style={{ color: "#a61d24" }} />
      );
    }
  };

  const editDriverSubmitHandler = async (values: {
    name: string;
    phone: string;
    company: string;
  }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.DRIVERS + "/" + selectedRecord?._id,
        {
          full_name: values.name,
          phone_number: values.phone,
          company: values.company,
        }
      );
      console.log(response);
      fetchDrivers();
      message.success("Sürücü başarıyla eklendi.");
      setIsModal2Open(false);
      form.resetFields();
    } catch (error) {
      const message = (error as any).response.data.message.toString();
      openNotification(
        "Hata",
        message,
        <CloseCircleOutlined style={{ color: "#a61d24" }} />
      );
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMPANIES);
      setCompanies(response.data.data);
    } catch (error) {
      console.error("Şirketler yüklenirken hata oluştu:", error);
      message.error("Şirketler yüklenemedi");
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchCompanies();
  }, []);

  return (
    <Layout style={{ padding: "0 50px" }}>
      {contextHolder}
      <Flex style={{ marginBottom: "20px" }} gap={25}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={t("Companies.SEARCH")}
          size="large"
          onSearch={searchDriverbyNameOrPhone}
        />
        <Button color="cyan" variant="solid" size="large" onClick={showModal}>
          Sürücü Ekle
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={drivers}
        loading={loading}
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
        title="Yeni Sürücü Ekleme Formu"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, paddingBlock: 32 }}
          initialValues={{ remember: true }}
          onFinish={addNewDriverSubmitHandler}
          onFinishFailed={() => console.log("form calismadi")}
          autoComplete="off"
        >
          <Form.Item
            label="Firma"
            name="company"
            rules={[{ required: true, message: "Lütfen bir firma seçin!" }]}
          >
            <Select
              placeholder="Firma Seçin"
              showSearch
              optionFilterProp="children"
            >
              {companies.map((company) => (
                <Select.Option key={company._id} value={company._id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Sürücü İsmi"
            name="name"
            rules={[{ required: true, message: "Please input driver name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Telefon"
            name="phone"
            rules={[
              { required: true, message: "Please input driver phone number!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Ekle
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Sürücü Düzenleme Formu"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModal2Open}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="edit"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, paddingBlock: 32 }}
          initialValues={{ remember: true }}
          onFinish={editDriverSubmitHandler}
          onFinishFailed={() => console.log("form calismadi")}
          autoComplete="off"
        >
          <Form.Item
            label="Firma"
            name="company"
            rules={[{ required: true, message: "Lütfen bir firma seçin!" }]}
          >
            <Select
              placeholder="Firma Seçin"
              showSearch
              optionFilterProp="children"
            >
              {companies.map((company) => (
                <Select.Option key={company._id} value={company._id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Sürücü İsmi"
            name="name"
            rules={[{ required: true, message: "Please input driver name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Telefon"
            name="phone"
            rules={[
              { required: true, message: "Please input driver phone number!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Değişiklikleri Kaydet
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default Drivers;
