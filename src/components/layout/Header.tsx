import { Flex, Layout, Menu } from 'antd';
import { Link } from 'react-router';
import { CONFIG, ROUTES } from '../../constants';

function Header() {
  return (
    <Layout.Header>
      <Flex justify='space-between'>
      <div className="logo">
      {CONFIG.APP_NAME} {/* Dinamik app name */}
      {CONFIG.DEBUG && <span style={{ fontSize: '12px', marginLeft: '10px' }}>v{CONFIG.VERSION}</span>}
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        items={[
          {
            key: 'dashboard',
            label: <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
          },
          {
            key: 'companies',
            label: <Link to={ROUTES.COMPANIES}>Şirketler</Link>
          },
          {
            key: 'drivers',
            label: <Link to={ROUTES.DRIVERS}>Sürücüler</Link>
          },
          {
            key: 'vehicles',
            label: <Link to={ROUTES.VEHICLES}>Araçlar</Link>
          },
          {
            key: 'trips',
            label: <Link to={ROUTES.TRIPS}>Seferler</Link>
          }
        ]}
      />
      </Flex>
    </Layout.Header> 
  )
}

export default Header