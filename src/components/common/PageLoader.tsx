import { Flex, Spin } from "antd";

export const PageLoader = () => (
  <Flex justify="center" align="center" style={{ minHeight: "60vh" }}>
    <Spin size="large" />
  </Flex>
);

export default PageLoader;
