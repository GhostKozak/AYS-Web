import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Space,
  Tag,
} from "antd";
import { Link, useNavigate } from "react-router";
import { CONFIG, ROUTES, STORAGE_KEYS } from "../../constants";
import {
  LoginOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTheme } from "../../utils/ThemeContext";
import { useState } from "react";
function Header() {
  const { themeMode, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  const userObject = userString ? JSON.parse(userString) : null;
  const isLoggedIn = !!userObject;

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate(ROUTES.LOGIN);
  };

  const items: MenuProps["items"] = [
    {
      key: "0",
      disabled: true,
      label: (
        <Flex justify="space-between">
          <Space style={{ marginRight: 20 }}>
            {userObject?.firstName + " " + userObject?.lastName}
          </Space>
          <Space>
            <Tag>{userObject?.email}</Tag>
          </Space>
        </Flex>
      ),
    },
    {
      key: "1",
      label: <Link to={ROUTES.DASHBOARD}>Hesap Ayarları</Link>,
    },
    {
      key: "2",
      label: "Abonelik Bilgileri",
    },
    {
      key: "3",
      label: (
        <Link to={"#"} onClick={showModal}>
          Geri Bildirim Gönder
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to={"#"} onToggle={toggleTheme} onClick={toggleTheme}>
          {themeMode == "dark"
            ? [<SunOutlined />, " Light Mode"]
            : [<MoonOutlined />, " Dark Mode"]}
        </Link>
      ),
    },
    {
      key: "6",
      label: <Link to={ROUTES.FAQ}>SSS</Link>,
    },
    {
      key: "7",
      label: <span onClick={handleLogout}>Çıkış Yap</span>,
    },
  ];

  return (
    <Layout.Header>
      <Flex justify="space-between">
        <div
          className="logo"
          style={{ color: "white", display: "flex", alignItems: "center" }}
        >
          {CONFIG.APP_NAME}
          {CONFIG.DEBUG && (
            <span
              style={{ fontSize: "12px", marginLeft: "10px", opacity: 0.7 }}
            >
              v{CONFIG.VERSION}
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={[
            {
              key: "dashboard",
              label: <Link to={ROUTES.DASHBOARD}>Dashboard</Link>,
            },
            {
              key: "companies",
              label: <Link to={ROUTES.COMPANIES}>Şirketler</Link>,
            },
            {
              key: "drivers",
              label: <Link to={ROUTES.DRIVERS}>Sürücüler</Link>,
            },
            {
              key: "vehicles",
              label: <Link to={ROUTES.VEHICLES}>Araçlar</Link>,
            },
            {
              key: "trips",
              label: <Link to={ROUTES.TRIPS}>Seferler</Link>,
            },
          ]}
          style={{ minWidth: 400, flex: 1, justifyContent: "center" }}
        />
        {isLoggedIn ? (
          <Dropdown menu={{ items }} overlayStyle={{ minWidth: 300 }}>
            <a onClick={(e) => e.preventDefault()}>
              <Avatar shape="square" size="large" icon={<UserOutlined />} />{" "}
              Merhaba, {userObject.firstName}
              <Tag
                color={userObject.role === "admin" ? "#33631f" : "#2db7f5"}
                style={{ marginLeft: 10 }}
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
      </Flex>
      <Modal
        title="Geri Bildirim"
        open={isModalOpen}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              console.log("Received values of form: ", values);
              form.resetFields();
              setIsModalOpen(false);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
        onCancel={handleCancel}
      >
        <p>
          Görüşleriniz bizim için değerli. Lütfen aşağıdaki formu doldurarak
          bize ulaşın.
        </p>
        <Form
          form={form}
          layout="vertical"
          name="feedback_form"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[
              {
                required: true,
                message: "Lütfen adınızı ve soyadınızı giriniz!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Lütfen email adresinizi giriniz!",
              },
              {
                type: "email",
                message: "Lütfen geçerli bir email adresi giriniz!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label="Geri Bildirim Mesajınız"
            rules={[
              {
                required: true,
                message: "Lütfen mesajınızı giriniz!",
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout.Header>
  );
}

export default Header;
