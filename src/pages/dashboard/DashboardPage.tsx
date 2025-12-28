import { Card, Row, Col, Statistic, Skeleton } from "antd";
import {
  UserOutlined,
  CarOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

function DashboardPage() {
  const isLoading = false;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Toplam Şirket"
                value={12}
                prefix={<TeamOutlined />}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Toplam Sürücü"
                value={48}
                prefix={<UserOutlined />}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Toplam Araç"
                value={156}
                prefix={<CarOutlined />}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Aktif Sefer"
                value={8}
                prefix={<AppstoreOutlined />}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
