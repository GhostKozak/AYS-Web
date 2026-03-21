import { Card, Row, Col, Statistic, Skeleton } from "antd";
import {
  UserOutlined,
  CarOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useDashboardSummary } from "../../../hooks/useReports";

function StatsOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardSummary();
  const isMobile = useIsMobile();

  const stats = data?.today || {
    totalTrips: 0,
    waitingToUnload: 0,
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={12} md={6}>
        <Card size={isMobile ? "small" : "default"} style={{ height: '100%' }}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>{t("Stats.TOTAL_TRIPS_TODAY")}</span>}
              value={stats.totalTrips}
              prefix={<AppstoreOutlined />}
              valueStyle={{ fontSize: isMobile ? '18px' : '24px' }}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size={isMobile ? "small" : "default"} style={{ height: '100%' }}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>{t("Stats.WAITING_TO_UNLOAD")}</span>}
              value={stats.waitingToUnload}
              prefix={<CarOutlined />}
              valueStyle={{ fontSize: isMobile ? '18px' : '24px', color: stats.waitingToUnload > 0 ? "#faad14" : "inherit" }}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size={isMobile ? "small" : "default"} style={{ height: '100%' }}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>{t("Stats.TOTAL_COMPANY")}</span>}
              value={data?.totalCompanies || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: isMobile ? '18px' : '24px' }}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size={isMobile ? "small" : "default"} style={{ height: '100%' }}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>{t("Stats.TOTAL_DRIVER")}</span>}
              value={data?.totalDrivers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: isMobile ? '18px' : '24px' }}
            />
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
}

export default StatsOverview;
