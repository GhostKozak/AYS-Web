import { Outlet, useNavigate } from "react-router";
import { Layout } from "antd";
import Header from "./components/layout/Header";
import Breadcrumb from "./components/common/Breadcrumb";
import { useEffect } from "react";
import { checkTokenValidity } from "./utils";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    checkTokenValidity(navigate);
  }, [navigate]);

  return (
    <Layout>
      <Header />
      <Layout.Content>
        <Breadcrumb />
        <Outlet />
      </Layout.Content>
    </Layout>
  );
}

export default App;
