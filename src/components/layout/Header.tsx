import { Flex, Layout, Menu } from 'antd';
import { Link } from 'react-router';

function Header() {
  return (
    <Layout.Header>
      <Flex justify='space-between'>
      <div className="logo">
        Ulusal Araç Yönetim Sistemi
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        items={[
          {
            key: 'dashboard',
            label: <Link to="/dashboard">Dashboard</Link>
          },
          {
            key: 'companies',
            label: <Link to="/companies">Şirketler</Link>
          },
          {
            key: 'drivers',
            label: <Link to="/drivers">Sürücüler</Link>
          },
          {
            key: 'vehicles',
            label: <Link to="/vehicles">Araçlar</Link>
          },
          {
            key: 'trips',
            label: <Link to="/trips">Seferler</Link>
          }
        ]}
      />
      </Flex>
    </Layout.Header> 
  )
}

export default Header