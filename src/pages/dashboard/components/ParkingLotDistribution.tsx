import { useParkingLot } from "../../../hooks/useReports";
import { ResponsivePie } from "@nivo/pie";
import { Skeleton, theme, Progress, Typography, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../hooks/useIsMobile";

const { Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  WAITING: "#faad14",   // Sarı
  UNLOADING: "#1890ff", // Mavi
  UNLOADED: "#52c41a",  // Yeşil
  CANCELED: "#ff4d4f",  // Kırmızı
  UNKNOWN: "#d9d9d9",   // Gri
};

function ParkingLotDistribution() {
  const { t } = useTranslation();
  const { data, isLoading } = useParkingLot(100);
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const chartData = data ? Object.entries(data.breakdown || {})
    .filter(([_, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      id: t(`Trips.STATUS_${key}`),
      label: t(`Trips.STATUS_${key}`),
      value: value as number,
      color: STATUS_COLORS[key] || STATUS_COLORS.UNKNOWN
    })) : [];

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  const occupancyRate = data ? Math.round((data.currentCount / data.totalCapacity) * 100) : 0;



  return (
    <div style={{ width: "100%", height: "100%", minHeight: isMobile ? 350 : 400, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <ResponsivePie
          data={chartData}
          margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          innerRadius={0.5}
          padAngle={3}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ datum: "data.color" }}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          enableArcLinkLabels={true}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={token.colorText}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLinkLabelsDiagonalLength={isMobile ? 10 : 16}
          arcLinkLabelsStraightLength={isMobile ? 12 : 24}
          theme={{
            tooltip: {
              container: {
                background: token.colorBgElevated,
                color: token.colorText,
                fontSize: "13px",
                borderRadius: token.borderRadius,
                boxShadow: token.boxShadowSecondary,
              },
            },
          }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        />
      </div>
      
      <div style={{ padding: "0 10px 10px 10px" }}>
        <Space orientation="vertical" style={{ width: "100%" }} size={0}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t("Dashboard.PARKING_FULLNESS")}</Text>
            <Text strong style={{ fontSize: 12 }}>{data?.currentCount} / {data?.totalCapacity}</Text>
          </div>
          <Progress 
            percent={occupancyRate} 
            size="small" 
            status={occupancyRate > 90 ? "exception" : "normal"}
            strokeColor={occupancyRate > 90 ? token.colorError : token.colorPrimary}
          />
        </Space>
      </div>
    </div>
  );
}

export default ParkingLotDistribution;
