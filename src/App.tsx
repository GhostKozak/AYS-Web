import { Outlet } from 'react-router';
import { Layout } from 'antd';
import Header from './components/layout/Header';
import BreacdCrumb from './components/common/BreacdCrumb';

function App() {
  return (
    <Layout>
     <Header />
      <Layout.Content>
        <BreacdCrumb />
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}

export default App
