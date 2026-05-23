import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Layout, App, Row, Col, Typography, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../hooks/usePageTitle";
import { userApi } from "../../api/userApi";
import { SaveOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;

export default function Profile() {
  const { t } = useTranslation();
  usePageTitle(t("Header.ACCOUNT_SETTINGS", "Account Settings"));
  const { notification } = App.useApp();
  const isMobile = useIsMobile();
  const { updateCurrentUser } = useAuth();
  const [personalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loadingConfig, setLoadingConfig] = useState({
    fetch: true,
    personal: false,
    password: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getMe();
        personalForm.setFieldsValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email, // email is readonly usually
        });
      } catch (err: any) {
        notification.error({
          title: t("Common.ERROR", "Error"),
          description: t("Errors.GENERAL_ERROR", "An error occurred."),
        });
      } finally {
        setLoadingConfig(prev => ({ ...prev, fetch: false }));
      }
    };
    fetchProfile();
  }, [personalForm, notification, t]);

  const onUpdatePersonalInfo = async (values: any) => {
    setLoadingConfig(prev => ({ ...prev, personal: true }));
    try {
      await userApi.updateMe({
        firstName: values.firstName,
        lastName: values.lastName,
      });

      // Update local auth state via hook which now handles storage + query cache sync
      updateCurrentUser({
        firstName: values.firstName,
        lastName: values.lastName,
      });

      notification.success({
        title: t("Common.SUCCESS", "Success"),
        description: t("Users.UPDATE_SUCCESS", "User updated successfully."),
      });
    } catch (err: any) {
      notification.error({
        title: t("Common.ERROR", "Error"),
        description: err?.response?.data?.message || t("Errors.OPERATION_FAILED", "Operation Failed"),
      });
    } finally {
      setLoadingConfig(prev => ({ ...prev, personal: false }));
    }
  };

  const onUpdatePassword = async (values: any) => {
    setLoadingConfig(prev => ({ ...prev, password: true }));
    try {
      await userApi.updateMe({
        password: values.password,
      });
      notification.success({
        title: t("Common.SUCCESS", "Success"),
        description: t("Profile.PASSWORD_UPDATE_SUCCESS", "Password updated successfully."),
      });
      passwordForm.resetFields();
    } catch (err: any) {
      notification.error({
        title: t("Common.ERROR", "Error"),
        description: err?.message || t("Errors.OPERATION_FAILED", "Operation Failed"),
      });
    } finally {
      setLoadingConfig(prev => ({ ...prev, password: false }));
    }
  };

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Title level={2} style={{ marginTop: 0, marginBottom: 20 }}>
        {t("Header.ACCOUNT_SETTINGS", "Account Settings")}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title={<><UserOutlined style={{ marginRight: 8 }} />{t("Users.EDIT_USER", "Edit User")}</>}
            style={{ height: '100%' }}
          >
            <Form
              form={personalForm}
              layout="vertical"
              onFinish={onUpdatePersonalInfo}
            >
              <Spin spinning={loadingConfig.fetch}>
                <Form.Item
                  name="email"
                  label={t("Users.EMAIL", "Email")}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  name="firstName"
                  label={t("Users.FIRST_NAME", "First Name")}
                  rules={[{ required: true, message: t("Validation.REQUIRED", "This field is required!") }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label={t("Users.LAST_NAME", "Last Name")}
                  rules={[{ required: true, message: t("Validation.REQUIRED", "This field is required!") }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loadingConfig.personal}
                    block={isMobile}
                  >
                    {t("Common.SAVE", "Save")}
                  </Button>
                </Form.Item>
              </Spin>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<><LockOutlined style={{ marginRight: 8 }} />{t("Login.PASSWORD_PLACEHOLDER", "Password")}</>}
            style={{ height: '100%' }}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onUpdatePassword}
            >
              <Form.Item
                name="password"
                label={t("Profile.NEW_PASSWORD", "New Password")}
                rules={[
                  { required: true, message: t("Validation.REQUIRED") },
                  { min: 8, message: t("Validation.PASSWORD_MIN_LENGTH") },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
                    message: t("Validation.PASSWORD_COMPLEXITY")
                  }
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={t("Profile.NEW_PASSWORD_CONFIRM", "Confirm New Password")}
                dependencies={['password']}
                rules={[
                  { required: true, message: t("Validation.REQUIRED", "This field is required!") },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t("Validation.PASSWORDS_DO_NOT_MATCH")));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loadingConfig.password}
                  block={isMobile}
                  danger
                >
                  {t("Profile.UPDATE_PASSWORD_BTN", "Update Password")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
