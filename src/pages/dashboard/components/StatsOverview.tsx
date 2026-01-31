import { Card, Row, Col, Statistic, Skeleton } from "antd";
import {
  UserOutlined,
  CarOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

function StatsOverview() {
  const { t } = useTranslation();
  const isLoading = false;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={t("Stats.TOTAL_COMPANY")}
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
              title={t("Stats.TOTAL_DRIVER")}
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
              title={t("Stats.TOTAL_VEHICLE")}
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
              title={t("Stats.ACTIVE_TRIP")}
              value={8}
              prefix={<AppstoreOutlined />}
            />
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
}

export default StatsOverview;
