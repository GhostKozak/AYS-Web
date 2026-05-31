import { Collapse, Layout, type CollapseProps } from "antd";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { useIsMobile } from "../hooks/useIsMobile";

const { Content } = Layout;

function FAQ() {
  const { t } = useTranslation();
  usePageTitle(t("Other.FAQ"));
  const isMobile = useIsMobile();

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: t("FAQ.Q1"),
      children: <p>{t("FAQ.A1")}</p>,
    },
    {
      key: "2",
      label: t("FAQ.Q2"),
      children: <p>{t("FAQ.A2")}</p>,
    },
    {
      key: "3",
      label: t("FAQ.Q3"),
      children: <p>{t("FAQ.A3")}</p>,
    },
    {
      key: "4",
      label: t("FAQ.Q4"),
      children: <p>{t("FAQ.A4")}</p>,
    },
    {
      key: "5",
      label: t("FAQ.Q5"),
      children: <p>{t("FAQ.A5")}</p>,
    },
    {
      key: "6",
      label: t("FAQ.Q6"),
      children: <p>{t("FAQ.A6")}</p>,
    },
    {
      key: "7",
      label: t("FAQ.Q7"),
      children: <p>{t("FAQ.A7")}</p>,
    },
    {
      key: "8",
      label: t("FAQ.Q8"),
      children: <p>{t("FAQ.A8")}</p>,
    },
  ];

  return (
    <Layout style={{ padding: isMobile ? "0 12px" : "0 20px" }}>
      <Content>
        <h1 style={{ margin: 0 }}>{t("Other.FAQ")}</h1>
        <Collapse
          items={items}
          defaultActiveKey={["1"]}
          bordered={false}
          accordion={true}
          style={{ marginBottom: 25 }}
        />
      </Content>
    </Layout>
  );
}

export default FAQ;
