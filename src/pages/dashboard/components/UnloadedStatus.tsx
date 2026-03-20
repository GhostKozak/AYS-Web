import { useStatusDistribution } from "../../../hooks/useReports";
import { ResponsivePie } from "@nivo/pie";
import { Skeleton } from "antd";
import { useTranslation } from "react-i18next";

const STATUS_COLORS: Record<string, string> = {
  WAITING: "#faad14", // Sarı
  UNLOADING: "#1890ff", // Mavi (Yeni ekledim, backend dokümanında var)
  UNLOADED: "#52c41a", // Yeşil
  CANCELED: "#ff4d4f", // Kırmızı
  UNKNOWN: "#d9d9d9", // Gri
};

function UnloadedStatus() {
  const { t } = useTranslation();
  const { data: rawData, isLoading } = useStatusDistribution("today");

  const data = rawData ? [
    ...Object.entries(rawData.statuses || {}).map(([key, value]) => ({
      id: t(`Trips.STATUS_${key}`),
      label: t(`Trips.STATUS_${key}`),
      value: value as number,
      color: STATUS_COLORS[key] || STATUS_COLORS.UNKNOWN
    })),
    // İptal edilenler ayrı bir alandaysa ekleyelim
    ...(rawData.canceled ? [{
      id: t("Trips.STATUS_CANCELED"),
      label: t("Trips.STATUS_CANCELED"),
      value: rawData.canceled,
      color: STATUS_COLORS.CANCELED
    }] : [])
  ] : [];

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div style={{ width: "100%", height: 300, marginBlock: 25 }}>
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: "data.color" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#ffffff"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#fff",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}

export default UnloadedStatus;
