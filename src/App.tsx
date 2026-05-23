import { Outlet } from "react-router";
import { Layout } from "antd";
import Header from "./components/layout/Header";
import Breadcrumb from "./components/common/Breadcrumb";
import AxiosInterceptor from "./api/AxiosInterceptor";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useSocketSync } from "./hooks/useSocketSync";

function App() {
  // Globally synchronize Socket.io events with React Query cache
  useSocketSync();

  return (
    <Layout>
      <AxiosInterceptor />
      <Header />
      <Layout.Content>
        <Breadcrumb />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Layout.Content>
    </Layout>
  );
}

export default App;
