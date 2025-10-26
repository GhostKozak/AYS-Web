import { Avatar, Dropdown, Flex, Layout, Menu, Modal, Space, Tag } from "antd";
import { Link } from "react-router";
import { CONFIG, ROUTES, STORAGE_KEYS } from "../../constants";
import { MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTheme } from "../../utils/ThemeContext";
import { useState } from "react";
function Header() {
  const { themeMode, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  const userObject = JSON.parse(userString || "{}");

  const items: MenuProps["items"] = [
    {
      key: "0",
      disabled: true,
      label: (
        <Flex justify="space-between">
          <Space style={{ marginRight: 20 }}>
            {userObject.firstName + " " + userObject.lastName}
          </Space>
          <Space>
            <Tag>{userObject.email}</Tag>
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
      label: "Çıkış Yap",
    },
  ];

  return (
    <Layout.Header>
      <Flex justify="space-between">
        <div className="logo" style={{ color: "white" }}>
          {CONFIG.APP_NAME} {/* Dinamik app name */}
          {CONFIG.DEBUG && (
            <>
              <span style={{ fontSize: "12px", marginLeft: "10px" }}>
                v{CONFIG.VERSION}
              </span>
              {userObject.role != "admin" ? (
                <Tag color="#2db7f5" style={{ marginLeft: 10 }}>
                  logged as {userObject.role}
                </Tag>
              ) : (
                ""
              )}
            </>
          )}
          {userObject.role == "admin" ? (
            <Tag color="#87d068" style={{ marginLeft: 10 }}>
              logged as {userObject.role}
            </Tag>
          ) : (
            ""
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
        />
        <Dropdown menu={{ items }} overlayStyle={{ minWidth: 300 }}>
          <a onClick={(e) => e.preventDefault()}>
            <Avatar shape="square" size="large" icon={<UserOutlined />} />{" "}
            Merhaba, {userObject.firstName}
          </a>
        </Dropdown>
      </Flex>
      <Modal
        title="Geri Bildirim"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde tenetur
          esse quasi necessitatibus voluptates aut libero! Provident delectus
          non velit eligendi adipisci nesciunt dolores similique illum. Quos a
          voluptatum facilis!
        </p>
        <form action="">
          <Flex vertical>
            <label htmlFor="">Ad soyad</label>
            <input type="text" name="" id="" />
            <label htmlFor="">Email</label>
            <input type="text" name="" id="" />
            <label htmlFor="">Geribildirim mesajiniz</label>
            <textarea name="" id=""></textarea>
          </Flex>
        </form>
      </Modal>
    </Layout.Header>
  );
}

export default Header;
