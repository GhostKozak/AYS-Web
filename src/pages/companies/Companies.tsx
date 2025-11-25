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
import { useState, type ReactNode } from "react";
import apiClient from "../../api/apiClient";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../constants";
import Search from "antd/es/input/Search";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function Companies() {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState<CompanyType | undefined>(
    undefined
  );
  const [api, contextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const fetchCompanies = async () => {
    const response = await apiClient.get(API_ENDPOINTS.COMPANIES);
    return response.data.data;
  };

  const {
    data: companies = [],
    isLoading,
    isError,
  } = useQuery({
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
            onConfirm={() => deleteCompany(record)}
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

  const deleteCompany = async (record: CompanyType) => {
    try {
      await apiClient.delete(API_ENDPOINTS.COMPANIES + "/" + record._id);
      messageApi.warning(
        <span>
          <strong>{record.name}</strong> firması başarıyla silindi.
        </span>
      );
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    } catch (error) {}
  };

  const createCompany = async (values: { inputName: string }) => {
    try {
      await apiClient.post(API_ENDPOINTS.COMPANIES, {
        name: values.inputName,
      });
      messageApi.success(
        <span>
          <strong>{values.inputName}</strong> firması başarıyla eklendi.
        </span>
      );
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    } catch (error) {
      // TODO: error handler not working properly. Make better error response or handle
      // openNotification(
      //   "Hata",
      //   (error as any).response.data.message[0].constraints.toString(),
      //   <CloseCircleOutlined style={{ color: "#a61d24" }} />
      // );
    }
  };

  const updateCompany = async (values: { inputName: string }) => {
    try {
      await apiClient.patch(
        API_ENDPOINTS.COMPANIES + "/" + selectedRecord?._id,
        {
          name: values.inputName,
        }
      );
      messageApi.info(
        <span>
          <strong>{values.inputName}</strong> firması başarıyla düzenlendi.
        </span>
      );
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    } catch (error) {
      // TODO: error handler not working properly. Make better error response or handle
      const message = (error as any).response.data.message.toString();
      openNotification(
        "Hata",
        message,
        <CloseCircleOutlined style={{ color: "#a61d24" }} />
      );
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setSelectedRecord(undefined);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: CompanyType) => {
    setSelectedRecord(record);
    form.setFieldsValue({ inputName: record.name });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: { inputName: string }) => {
    if (selectedRecord) {
      await updateCompany(values);
    } else {
      await createCompany(values);
    }
    setIsModalOpen(false);
  };

  const filteredCompanies = companies?.filter((company: any) => {
    if (!searchText) return true;

    return company.name.toLowerCase().includes(searchText.toLowerCase()) ?? [];
  });

  return (
    <Layout style={{ padding: "0 50px" }}>
      {contextHolder}
      {messageContextHolder}
      <Flex style={{ marginBottom: "20px" }} gap={25}>
        <Search
          placeholder={t("Companies.SEARCH")}
          allowClear
          enterButton={
            <Space size={3}>
              <SearchOutlined /> {t("Companies.SEARCH")}
            </Space>
          }
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
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
      <Modal
        title={
          selectedRecord ? "Firma Düzenleme Formu" : "Yeni Firma Ekleme Formu"
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
          name="companyForm"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, paddingBlock: 32 }}
          onFinish={handleFormSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Firma Ismi"
            name="inputName"
            rules={[{ required: true, message: "Please input company name!" }]}
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

export default Companies;
