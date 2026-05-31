import { Collapse, Layout, Card, Button, Tag, Typography, theme } from "antd";
import {
  QuestionCircleOutlined,
  PlusCircleOutlined,
  ToolOutlined,
  CameraOutlined,
  CarryOutOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CarOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { useIsMobile } from "../hooks/useIsMobile";
import { useCallback } from "react";

const { Content } = Layout;
const { Text, Title } = Typography;

type FAQItem = {
  key: string;
  icon: React.ReactNode;
  color: string;
  label: string;
  children: React.ReactNode;
};

type FAQCategory = {
  key: string;
  title: string;
  color: string;
  items: FAQItem[];
};

function FAQ() {
  const { t } = useTranslation();
  usePageTitle(t("Other.FAQ"));
  const isMobile = useIsMobile();
  const { token } = theme.useToken();

  const categories: FAQCategory[] = [
    {
      key: "general",
      title: t("FAQ.CATEGORY_GENERAL"),
      color: "#1677ff",
      items: [
        {
          key: "1",
          icon: <QuestionCircleOutlined />,
          color: "#1677ff",
          label: t("FAQ.Q1"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A1")}</p>,
        },
        {
          key: "6",
          icon: <UserOutlined />,
          color: "#722ed1",
          label: t("FAQ.Q6"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A6")}</p>,
        },
      ],
    },
    {
      key: "trips",
      title: t("FAQ.CATEGORY_TRIPS"),
      color: "#52c41a",
      items: [
        {
          key: "2",
          icon: <PlusCircleOutlined />,
          color: "#52c41a",
          label: t("FAQ.Q2"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A2")}</p>,
        },
        {
          key: "5",
          icon: <CarryOutOutlined />,
          color: "#fa8c16",
          label: t("FAQ.Q5"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A5")}</p>,
        },
        {
          key: "7",
          icon: <EnvironmentOutlined />,
          color: "#13c2c2",
          label: t("FAQ.Q7"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A7")}</p>,
        },
      ],
    },
    {
      key: "field",
      title: t("FAQ.CATEGORY_FIELD"),
      color: "#eb2f96",
      items: [
        {
          key: "3",
          icon: <ToolOutlined />,
          color: "#eb2f96",
          label: t("FAQ.Q3"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A3")}</p>,
        },
        {
          key: "4",
          icon: <CameraOutlined />,
          color: "#fa541c",
          label: t("FAQ.Q4"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A4")}</p>,
        },
        {
          key: "8",
          icon: <CarOutlined />,
          color: "#2f54eb",
          label: t("FAQ.Q8"),
          children: <p style={{ margin: 0, lineHeight: 1.8 }}>{t("FAQ.A8")}</p>,
        },
      ],
    },
  ];

  const renderCollapse = useCallback(
    (items: FAQItem[]) => {
      const collapseItems = items.map((item) => ({
        key: item.key,
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Tag
              style={{
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 8,
                lineHeight: 1,
                border: "none",
                background: `${item.color}15`,
                color: item.color,
              }}
            >
              {item.icon}
            </Tag>
            <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
          </span>
        ),
        children: item.children,
      }));
      return (
        <Collapse
          items={collapseItems}
          bordered={false}
          accordion={true}
          style={{
            background: "transparent",
          }}
          styles={{
            header: {
              padding: "12px 16px",
              borderRadius: 8,
            },
          }}
        />
      );
    },
    [],
  );

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Content style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40, marginTop: 20 }}>
          <Title level={2} style={{ margin: 0 }}>
            {t("Other.FAQ")}
          </Title>
        </div>

        {categories.map((cat) => (
          <div key={cat.key} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 24,
                  background: cat.color,
                  borderRadius: 2,
                }}
              />
              <Title level={4} style={{ margin: 0, color: cat.color }}>
                {cat.title}
              </Title>
            </div>
            {renderCollapse(cat.items)}
          </div>
        ))}

        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgElevated,
            marginBottom: 32,
          }}
          styles={{ body: { padding: "32px 24px" } }}
        >
          <MailOutlined style={{ fontSize: 36, color: token.colorPrimary, marginBottom: 12 }} />
          <Title level={4} style={{ margin: "0 0 4px", color: token.colorText }}>{t("FAQ.SUPPORT_TITLE")}</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
            {t("FAQ.SUPPORT_DESC")}
          </Text>
          <Button type="primary" size="large" icon={<MailOutlined />}>
            {t("FAQ.SUPPORT_BUTTON")}
          </Button>
        </Card>
      </Content>
    </Layout>
  );
}

export default FAQ;
