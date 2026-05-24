import { Form, Input, Button, Card, App, theme } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/authApi";
import { connectSocket } from "../../utils/socket";
import { ROUTES } from "../../constants";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setUser } from "../../utils/auth.utils";
import type { LoginPayload } from "../../types";

import warehouseImg from "../../assets/warehouse.png";

const { useToken } = theme;

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const { token } = useToken();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const onFinish = async (values: LoginPayload) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);

      // Normalize the user object (backend returns `id`, app expects `_id`)
      const frontendUser = { ...data.user, _id: data.user.id };

      // Persist user info to localStorage so useAuth initialData hydrates immediately
      setUser(frontendUser as any);

      // 2. Set cache synchronously — AuthGuard will unblock on next render
      queryClient.setQueryData(["currentUser"], frontendUser);
      // NOTE: Do NOT call invalidateQueries here. That would trigger a
      // background /users/me fetch immediately after login, creating a race
      // condition where the fresh response could race with the cache set.

      message.success(t("Login.SUCCESS"));
      connectSocket();
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? t("Login.INVALID_CREDENTIALS")
          : t("Login.ERROR"));
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Panel: Login Form */}
      <div
        style={{
          flex: "1 1 50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: token.colorBgLayout,
          padding: "24px",
          zIndex: 2,
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }} className="fadeIn">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{
                color: token.colorPrimary,
                fontSize: "42px",
                margin: "0 0 8px 0",
                fontWeight: "bold",
                letterSpacing: "-1.5px",
              }}
            >
              {t("Common.APP_ABBREVIATION")}
            </h1>
            <p
              style={{
                color: token.colorTextSecondary,
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              {t("Common.APP_SUBTITLE")}
            </p>
          </div>
          <Card
            variant="borderless"
            style={{
              backgroundColor: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              backdropFilter: "blur(10px)",
            }}
          >
            <Form onFinish={onFinish} layout="vertical" size="large">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: t("Login.EMAIL_REQUIRED") },
                  { type: "email", message: t("Login.EMAIL_INVALID") },
                ]}
              >
                <Input
                  prefix={
                    <UserOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                  placeholder={t("Login.EMAIL_PLACEHOLDER")}
                  autoComplete="email"
                  style={{ borderRadius: token.borderRadius }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: t("Login.PASSWORD_REQUIRED") },
                ]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                  placeholder={t("Login.PASSWORD_PLACEHOLDER")}
                  autoComplete="current-password"
                  style={{ borderRadius: token.borderRadius }}
                />
              </Form.Item>
              <Form.Item style={{ marginTop: "40px", marginBottom: "8px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{
                    height: "50px",
                    borderRadius: token.borderRadius,
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {t("Login.BUTTON")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>

      {/* Right Panel: Blurred Warehouse Image */}
      <div
        className="login-side-image"
        style={{
          flex: "1 1 50%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${warehouseImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(4px) brightness(0.7)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to right, ${token.colorBgLayout}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

export default LoginPage;
