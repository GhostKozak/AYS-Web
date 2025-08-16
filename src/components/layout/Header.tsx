import { Layout, Menu } from 'antd';

function Header() {
  return (
    <Layout.Header>
      <div className="logo">
        Ulusal Araç Yönetim Sistemi
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        items={[
          
        ]}
      />
    </Layout.Header> 
  )
}

export default Header