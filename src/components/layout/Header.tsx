import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Space,
  Tag,
  theme,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router";
import { CONFIG, ROUTES, STORAGE_KEYS } from "../../constants";
import {
  LoginOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTheme } from "../../utils/ThemeContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function Header() {
  const { t, i18n } = useTranslation();
  const { themeMode, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const { useToken } = theme;
  const { token } = useToken();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  const userObject = userString ? JSON.parse(userString) : null;
  const isLoggedIn = !!userObject;
  const currentLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "tr";

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate(ROUTES.LOGIN);
  };

  const toggleLang = () => {
    const newLang = currentLang === "tr" ? "en" : "tr";
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
    i18n.changeLanguage(newLang);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      label: <Link to={ROUTES.DASHBOARD}>{t("Breadcrumbs.DASHBOARD")}</Link>,
    },
    {
      key: "companies",
      label: <Link to={ROUTES.COMPANIES}>{t("Breadcrumbs.COMPANIES")}</Link>,
    },
    {
      key: "drivers",
      label: <Link to={ROUTES.DRIVERS}>{t("Breadcrumbs.DRIVERS")}</Link>,
    },
    {
      key: "vehicles",
      label: <Link to={ROUTES.VEHICLES}>{t("Breadcrumbs.VEHICLES")}</Link>,
    },
    {
      key: "trips",
      label: <Link to={ROUTES.TRIPS}>{t("Breadcrumbs.TRIPS")}</Link>,
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "0",
      disabled: true,
      label: (
        <Flex justify="space-between" align="center">
          <Space style={{ marginRight: 20 }}>
            {userObject?.firstName + " " + userObject?.lastName}
          </Space>
          <Tag>{userObject?.email}</Tag>
        </Flex>
      ),
    },
    { type: "divider" },
    {
      key: "1",
      label: <Link to={ROUTES.DASHBOARD}>{t("Header.ACCOUNT_SETTINGS")}</Link>,
    },
    { key: "2", label: t("Header.SUBSCRIPTION") },
    { key: "3", label: <a onClick={showModal}>{t("Header.SEND_FEEDBACK")}</a> },
    {
      key: "4",
      label: (
        <a onClick={toggleTheme}>
          {themeMode === "dark" ? (
            <>
              <SunOutlined /> {t("Header.LIGHT_MODE")}
            </>
          ) : (
            <>
              <MoonOutlined /> {t("Header.DARK_MODE")}
            </>
          )}
        </a>
      ),
    },
    { key: "6", label: <Link to={ROUTES.FAQ}>{t("Breadcrumbs.FAQ")}</Link> },
    { type: "divider" },
    {
      key: "7",
      label: (
        <span onClick={handleLogout} style={{ color: "red" }}>
          {t("Header.LOGOUT")}
        </span>
      ),
    },
  ];

  return (
    <Layout.Header
      style={{
        padding: "0 24px",
        background: "#001529",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        className="logo"
        style={{
          color: "white",
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          marginRight: "20px",
        }}
      >
        {CONFIG.APP_NAME + " " + t("Common.APP_SUBTITLE")}
        {CONFIG.DEBUG && (
          <span
            style={{
              fontSize: "10px",
              marginLeft: "8px",
              opacity: 0.7,
              fontWeight: "normal",
            }}
          >
            v{CONFIG.VERSION}
          </span>
        )}
      </div>

      {!isMobile && (
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname.split("/")[1] || "dashboard"]}
          items={menuItems}
          style={{
            flex: 1,
            minWidth: 0,
            borderBottom: "none",
            justifyContent: "center",
          }}
        />
      )}

      {!isMobile ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            ghost
            size="small"
            onClick={toggleLang}
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
          >
            {currentLang.toUpperCase()}
          </Button>
          {isLoggedIn ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <a
                onClick={(e) => e.preventDefault()}
                style={{
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Avatar
                  shape="square"
                  size="default"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: token.colorPrimary }}
                />
                <span>{userObject.firstName}</span>
                <Tag
                  color={userObject.role === "admin" ? "#87d068" : "#2db7f5"}
                >
                  {userObject.role}
                </Tag>
              </a>
            </Dropdown>
          ) : (
            <Link to={ROUTES.LOGIN}>
              <Button type="primary" icon={<LoginOutlined />}>
                {t("Header.LOGIN")}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={toggleLang}
            style={{ color: "white", fontWeight: "bold" }}
          >
            {currentLang.toUpperCase()}
          </Button>
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "white", fontSize: "20px" }} />}
            onClick={() => setIsMobileMenuOpen(true)}
          />
        </Space>
      )}

      <Drawer
        title={t("Header.MENU")}
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        {isLoggedIn && (
          <div
            style={{
              padding: "20px",
              background: token.colorBgContainerDisabled,
              marginBottom: "10px",
            }}
          >
            <Flex gap="small" align="center">
              <Avatar size="large" icon={<UserOutlined />} />
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {userObject.firstName} {userObject.lastName}
                </div>
                <Tag
                  color={userObject.role === "admin" ? "#87d068" : "#2db7f5"}
                >
                  {userObject.role}
                </Tag>
              </div>
            </Flex>
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname.split("/")[1] || "dashboard"]}
          items={menuItems}
          style={{ borderRight: "none" }}
        />

        <div
          style={{
            borderTop: `1px solid ${token.colorBorder}`,
            marginTop: "10px",
            paddingTop: "10px",
          }}
        >
          <Menu
            mode="inline"
            selectable={false}
            items={
              isLoggedIn ? userMenuItems.filter((i) => i && i.key !== "0") : []
            }
          />
          {!isLoggedIn && (
            <div style={{ padding: "20px" }}>
              <Link to={ROUTES.LOGIN}>
                <Button type="primary" block icon={<LoginOutlined />}>
                  {t("Header.LOGIN")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        title={t("Header.FEEDBACK_TITLE")}
        open={isModalOpen}
        onOk={() => {
          form
            .validateFields()
            .then(() => {
              form.resetFields();
              setIsModalOpen(false);
            })
            .catch(() => {});
        }}
        onCancel={handleCancel}
        okText={t("Common.SEND")}
        cancelText={t("Common.CANCEL")}
      >
        <p>{t("Header.FEEDBACK_DESC")}</p>
        <Form form={form} layout="vertical" name="feedback_form">
          <Form.Item
            name="name"
            label={t("Header.FULL_NAME")}
            rules={[{ required: true, message: t("Validation.REQUIRED") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("Header.EMAIL")}
            rules={[
              {
                required: true,
                type: "email",
                message: t("Validation.REQUIRED"),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label={t("Header.MESSAGE")}
            rules={[{ required: true, message: t("Validation.REQUIRED") }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout.Header>
  );
}

export default Header;
