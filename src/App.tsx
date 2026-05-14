import { Outlet } from "react-router";
import { Layout } from "antd";
import Header from "./components/layout/Header";
import Breadcrumb from "./components/common/Breadcrumb";
import AxiosInterceptor from "./api/AxiosInterceptor";

function App() {

  return (
    <Layout>
      <AxiosInterceptor />
      <Header />
      <Layout.Content>
        <Breadcrumb />
        <Outlet />
      </Layout.Content>
    </Layout>
  );
}

export default App;
