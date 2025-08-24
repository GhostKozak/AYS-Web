import { Breadcrumb as AntBreadcrumb } from 'antd'
import { useLocation, Link } from 'react-router'
import { HomeOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next';

function Breadcrumb() {
  
  const location = useLocation()
  
  // URL path'ini parçalara ayır
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '')
  
  // Breadcrumb item'larını oluştur
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined /> Ana Sayfa
        </Link>
      ),
      key: 'home'
    },
    ...pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`
      const title = getSegmentTitle(segment)
      
      // Son segment ise link olmasın
      if (index === pathSegments.length - 1) {
        return {
          title: title,
          key: segment
        }
      }
      
      return {
        title: <Link to={path}>{title}</Link>,
        key: segment
      }
    })
  ]

  return (
    <AntBreadcrumb style={{ margin: '16px 0', padding: '0 50px' }}>
      {breadcrumbItems.map(item => (
        <AntBreadcrumb.Item key={item.key}>
          {item.title}
        </AntBreadcrumb.Item>
      ))}
    </AntBreadcrumb>
  )
}

function getSegmentTitle(segment: string): string {
  const { t } = useTranslation();

  const titleMap: Record<string, string> = {
    'dashboard': t("Breadcrumbs.DASHBOARD"),
    'login': t("Breadcrumbs.LOGIN"),
    'companies': t("Breadcrumbs.COMPANIES"),
    'drivers': t("Breadcrumbs.DRIVERS"),
    'vehicles': t("Breadcrumbs.VEHICLES"),
    'trips': t("Breadcrumbs.TRIPS"),
  }
  
  return titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
}

export default Breadcrumb