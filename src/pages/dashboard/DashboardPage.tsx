import { Col, Row } from "antd";
import { useTrips } from "../../hooks/useTrips";
import CompanyDistribution from "./components/CompanyDistribution";
import MonthlyCompanyDistribution from "./components/MonthlyCompanyDistribution";
import StatsOverview from "./components/StatsOverview";
import UnloadedStatus from "./components/UnloadedStatus";
import WeeklyActivityChart from "./components/WeeklyActivityChart";
import YearlyActivityMap from "./components/YearlyActivityMap";
import LiveOperationsList from "./components/LiveOperationsList";

function DashboardPage() {
  const { trips } = useTrips();
  // TODO: tablolari excel export edecek bir yol bulun
  return (
    <div style={{ padding: "24px" }}>
      <h1>Dashboard</h1>
      <StatsOverview />
      <Row>
        <Col span={6}>
          <CompanyDistribution trips={trips} />
        </Col>
        <Col span={6}>
          <MonthlyCompanyDistribution trips={trips} />
        </Col>
        <Col span={6}>
          <UnloadedStatus trips={trips} />
        </Col>
        <Col span={6}>
          <LiveOperationsList trips={trips} />
        </Col>
        <Col span={24}>
          <WeeklyActivityChart trips={trips} />
        </Col>
        <Col span={18}>
          <YearlyActivityMap trips={trips} />
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
