import { Breadcrumb } from 'antd'

function BreacdCrumb() {
  return (
    <Breadcrumb style={{ margin: '16px 0', padding: '0 50px' }}>
      <Breadcrumb.Item>Home</Breadcrumb.Item>
      <Breadcrumb.Item>List</Breadcrumb.Item>
      <Breadcrumb.Item>App</Breadcrumb.Item>
    </Breadcrumb>
  )
}

export default BreacdCrumb