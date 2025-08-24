import { Outlet } from 'react-router';
import { Layout } from 'antd';
import Header from './components/layout/Header';
import Breadcrumb from './components/common/Breadcrumb';

function App() {
  return (
    <Layout>
     <Header />
      <Layout.Content>
        <Breadcrumb />
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}

export default App
