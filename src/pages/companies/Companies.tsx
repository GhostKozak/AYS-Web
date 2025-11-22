import {
  Button,
  Empty,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
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

function Companies() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CompanyType>();
  const [api, contextHolder] = notification.useNotification();

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

  const confirm = (id: string) => {
    setOpen(false);
    deleteCompany(id);
    message.success("Next step.");
  };

  const cancel = () => {
    setOpen(false);
    message.error("Click on cancel.");
  };

  interface CompanyType {
    _id: string;
    name: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  const columns: ColumnsType<CompanyType> = [
    {
      title: t("Companies.COMPANY_NAME"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("Companies.CREATED_AT"),
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
      title: t("Companies.UPDATED_AT"),
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
      title: t("Companies.STATUS"),
      key: "deleted",
      dataIndex: "deleted",
      render: (deleted: boolean) => {
        const color = deleted ? "red" : "green";
        const text = deleted ? t("Companies.PASSIVE") : t("Companies.ACTIVE");
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("Companies.ACTIONS"),
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
            description={`${record.name} firmasını silmek istediğinize emin misiniz?`}
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

  const deleteCompany = async (id: string) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.COMPANIES + "/" + id
      );
      console.log(response);
      fetchCompanies();
    } catch (error) { }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.COMPANIES);
      setCompanies(response.data.data);
      console.table(response.data.data);
    } catch (error) {
      console.error("Şirketler yüklenirken hata oluştu:", error);
      message.error("Şirketler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const searchCompaniesbyName = async (name: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.COMPANIES_SEARCH, {
        params: {
          name: name,
        },
      });
      setCompanies(response.data.data);
    } catch (error) {
      console.error("Şirketler yüklenirken hata oluştu:", error);
      message.error("Şirketler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showModal2 = (record: CompanyType) => {
    setIsModal2Open(true);
    setSelectedRecord(record);
    form.setFieldsValue({
      name: record.name,
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModal2Open(false);
    setSelectedRecord(undefined);
  };

  const addNewCompanySubmitHandler = async (values: { name: string }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMPANIES, {
        name: values.name,
      });
      console.log(response);
      fetchCompanies();
      message.success("Firma başarıyla eklendi.");
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

  const editCompanySubmitHandler = async (values: { name: string }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.COMPANIES + "/" + selectedRecord?._id,
        {
          name: values.name,
        }
      );
      console.log(response);
      fetchCompanies();
      message.success("Firma başarıyla eklendi.");
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

  return (
    <Layout style={{ padding: "0 50px" }}>
      {contextHolder}
      <Flex style={{ marginBottom: "20px" }} gap={25}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={t("Companies.SEARCH")}
          size="large"
          onSearch={searchCompaniesbyName}
        />
        <Button color="cyan" variant="solid" size="large" onClick={showModal}>
          Firma Ekle
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={companies}
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
            `${range[0]}-${range[1]} / ${total} şirket`,
        }}
      />
      <Modal
        title="Yeni Firma Ekleme Formu"
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
          onFinish={addNewCompanySubmitHandler}
          onFinishFailed={() => console.log("form calismadi")}
          autoComplete="off"
        >
          <Form.Item
            label="Firma Ismi"
            name="name"
            rules={[{ required: true, message: "Please input company name!" }]}
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
        title="Firma Düzenleme Formu"
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
          onFinish={editCompanySubmitHandler}
          onFinishFailed={() => console.log("form calismadi")}
          autoComplete="off"
        >
          <Form.Item
            label="Firma Ismi"
            name="name"
            rules={[{ required: true, message: "Please input company name!" }]}
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

export default Companies;
