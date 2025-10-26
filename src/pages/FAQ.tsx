import { Collapse, Layout, type CollapseProps } from "antd";
import { t } from "i18next";

const { Content } = Layout;

function FAQ() {
  const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "This is panel header 1",
      children: <p>{text}</p>,
    },
    {
      key: "2",
      label: "This is panel header 2",
      children: <p>{text}</p>,
    },
    {
      key: "3",
      label: "This is panel header 3",
      children: <p>{text}</p>,
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: "0 48px" }}>
        <h1>{t("Other.FAQ")}</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae
          ipsam veniam cupiditate voluptate saepe libero placeat voluptatum, id
          tenetur unde assumenda quam, deleniti natus, magni qui similique
          perspiciatis fugiat eum?
        </p>
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
