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

function Header() {
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

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate(ROUTES.LOGIN);
  };

  const menuItems: MenuProps["items"] = [
    { key: "dashboard", label: <Link to={ROUTES.DASHBOARD}>Dashboard</Link> },
    { key: "companies", label: <Link to={ROUTES.COMPANIES}>Şirketler</Link> },
    { key: "drivers", label: <Link to={ROUTES.DRIVERS}>Sürücüler</Link> },
    { key: "vehicles", label: <Link to={ROUTES.VEHICLES}>Araçlar</Link> },
    { key: "trips", label: <Link to={ROUTES.TRIPS}>Seferler</Link> },
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
    { key: "1", label: <Link to={ROUTES.DASHBOARD}>Hesap Ayarları</Link> },
    { key: "2", label: "Abonelik Bilgileri" },
    { key: "3", label: <a onClick={showModal}>Geri Bildirim Gönder</a> },
    {
      key: "4",
      label: (
        <a onClick={toggleTheme}>
          {themeMode === "dark" ? (
            <>
              <SunOutlined /> Light Mode
            </>
          ) : (
            <>
              <MoonOutlined /> Dark Mode
            </>
          )}
        </a>
      ),
    },
    { key: "6", label: <Link to={ROUTES.FAQ}>SSS</Link> },
    { type: "divider" },
    {
      key: "7",
      label: (
        <span onClick={handleLogout} style={{ color: "red" }}>
          Çıkış Yap
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
          fontSize: "18px",
          fontWeight: "bold",
          marginRight: "20px",
        }}
      >
        {CONFIG.APP_NAME}
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
        <div style={{ display: "flex", alignItems: "center" }}>
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
                Giriş Yap
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: "white", fontSize: "20px" }} />}
          onClick={() => setIsMobileMenuOpen(true)}
        />
      )}

      <Drawer
        title="Menü"
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
                  Giriş Yap
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        title="Geri Bildirim"
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
      >
        <p>Görüşleriniz bizim için değerli.</p>
        <Form form={form} layout="vertical" name="feedback_form">
          <Form.Item name="name" label="Ad Soyad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label="Mesajınız"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout.Header>
  );
}

export default Header;
