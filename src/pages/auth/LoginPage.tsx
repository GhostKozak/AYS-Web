import { Form, Input, Button, Card, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/authApi";
import { ROUTES } from "../../constants";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setToken, setUser } from "../../utils/auth.utils";
import type { LoginPayload } from "../../types";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginPayload) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);
      setToken(data.access_token);
      
      // Adapt Backend User to Frontend User if needed
      // Currently backend returns {id, email, firstName, lastName, role}
      // Frontend User type expects {_id, email, firstName, lastName, role, ...}
      const frontendUser = {
        ...data.user,
        _id: data.user.id,
      };
      
      setUser(frontendUser as any);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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
