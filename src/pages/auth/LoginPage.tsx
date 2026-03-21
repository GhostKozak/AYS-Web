import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import apiClient from "../../api/apiClient";
import { API_ENDPOINTS, ROUTES } from "../../constants";
import { useTranslation } from "react-i18next";

import { useState } from "react";
import { setToken, setUser } from "../../utils/auth.utils";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, values);
      setToken(response.data.access_token);
      setUser(response.data.user);
      message.success(t("Login.SUCCESS"));
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || t("Login.ERROR");
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card title={t("Login.TITLE")} style={{ width: 300 }}>
        <Form onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: t("Login.EMAIL_REQUIRED") }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("Login.EMAIL_PLACEHOLDER")}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t("Login.PASSWORD_REQUIRED") }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("Login.PASSWORD_PLACEHOLDER")}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={loading}>
              {t("Login.BUTTON")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
