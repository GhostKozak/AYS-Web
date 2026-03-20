import { Card, Row, Col, Statistic, Skeleton } from "antd";
import {
  UserOutlined,
  CarOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useDashboardSummary } from "../../../hooks/useReports";

function StatsOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardSummary();

  const stats = data?.today || {
    totalTrips: 0,
    waitingToUnload: 0,
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={t("Stats.TOTAL_TRIPS_TODAY")}
              value={stats.totalTrips}
              prefix={<AppstoreOutlined />}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={t("Stats.WAITING_TO_UNLOAD")}
              value={stats.waitingToUnload}
              prefix={<CarOutlined />}
              styles={{ content: { color: stats.waitingToUnload > 0 ? "#faad14" : "inherit" } }}
            />
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }}>
            <Statistic
              title={t("Stats.TOTAL_COMPANY")}
              value={data?.totalCompanies || 0}
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
              value={data?.totalDrivers || 0}
              prefix={<UserOutlined />}
            />
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
}

export default StatsOverview;
