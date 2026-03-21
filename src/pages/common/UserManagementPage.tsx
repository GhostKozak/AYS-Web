import { Table, Button, Space, Typography, Tag, Modal, Form, Input, Select, Switch, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/userApi";
import { useTranslation } from "react-i18next";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import dayjs from "dayjs";
import type { User, CreateUserPayload } from "../../types";
import { UserRole as UserRoleConst } from "../../types";
import { getUser } from "../../utils/auth.utils";

const { Title } = Typography;

function UserManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateCurrentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => userApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success(t("Users.CREATE_SUCCESS"));
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserPayload> }) => 
      userApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Mevcut oturum açmış kullanıcıysa Header'ı hemen güncelle
      const currentStoredUser = getUser();
      if (variables.id === currentStoredUser?._id) {
        updateCurrentUser(variables.data);
      }
      message.success(t("Users.UPDATE_SUCCESS"));
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success(t("Users.DELETE_SUCCESS"));
    },
  });

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: CreateUserPayload) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    {
      title: t("Users.FIRST_NAME"),
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: t("Users.LAST_NAME"),
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: t("Users.EMAIL"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("Users.ROLE"),
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="purple">{role?.toUpperCase()}</Tag>,
    },
    {
      title: t("Table.STATUS"),
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? t("Common.ACTIVE") : t("Common.PASSIVE")}
        </Tag>
      ),
    },
    {
      title: t("Dashboard.LATEST_TRIPS"), // Reusing translation for "Last" or will add new
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      render: (date: string) => date ? dayjs(date).format("DD.MM.YYYY HH:mm") : "-",
    },
    {
       title: "⚠️",
       dataIndex: "failedLoginAttempts",
       key: "failedLoginAttempts",
       render: (val: number) => val > 0 ? <Tag color="warning">{val}</Tag> : "-",
    },
    {
      title: t("Common.ACTIONS"),
      key: "actions",
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => {
              Modal.confirm({
                title: t("Common.ARE_YOU_SURE"),
                onOk: () => deleteMutation.mutate(record._id),
              });
            }} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2}>{t("Users.TITLE")}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t("Users.ADD_USER")}
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={isLoading} 
        rowKey="_id" 
      />

      <Modal
        title={editingUser ? t("Users.EDIT_USER") : t("Users.ADD_USER")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="email" label={t("Users.EMAIL")} rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label={t("Login.PASSWORD_PLACEHOLDER")}
              rules={[
                { required: true, message: t("Validation.REQUIRED") },
                { min: 8, message: t("Validation.PASSWORD_MIN_LENGTH") },
                {
                  pattern: /(?=.*[A-Z])/,
                  message: t("Validation.PASSWORD_UPPERCASE"),
                },
                {
                  pattern: /(?=.*[a-z])/,
                  message: t("Validation.PASSWORD_LOWERCASE"),
                },
                {
                  pattern: /(?=.*[!@#$%^&*(),.?":{}|<>])/,
                  message: t("Validation.PASSWORD_SPECIAL"),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="firstName" label={t("Users.FIRST_NAME")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label={t("Users.LAST_NAME")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t("Users.ROLE")} rules={[{ required: true }]}>
            <Select 
              options={[
                { value: UserRoleConst.ADMIN, label: 'ADMIN' },
                { value: UserRoleConst.EDITOR, label: 'EDITOR' },
                { value: UserRoleConst.VIEWER, label: 'VIEWER' },
                { value: UserRoleConst.USER, label: 'USER' },
              ]}
            />
          </Form.Item>
          {editingUser && (
            <Form.Item name="isActive" label={t("Table.STATUS")} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
