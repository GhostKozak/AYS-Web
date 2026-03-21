import { ResponsiveBar } from "@nivo/bar";
import { useReportTrend } from "../../../hooks/useReports";
import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";

const WeeklyActivityChart = () => {
  const { t } = useTranslation();
  const { data: rawData, isLoading } = useReportTrend("month");

  // Son 7 günü filtreleyelim veya hepsini gösterelim (Backend "month" için hepsini dönebilir)
  // Nivo Bar için datayı hazırlayalım
  const data = (rawData || []).map((item) => ({
    day: item.timestamp,
    count: item.count,
  })).slice(-7); // Sadece son 7 gün

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <div style={{ height: 370, width: "100%" }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="day"
        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
        padding={0.3}
        colors={["#10b981"]} // Başarılı bir yeşil (Neon)
        theme={{
          text: { fill: "#ffffff" },
          axis: {
            domain: { line: { stroke: "#525252" } },
            ticks: { line: { stroke: "#525252" }, text: { fill: "#9ca3af" } },
          },
          grid: {
            line: { stroke: "#262626", strokeWidth: 1 },
          },
          tooltip: {
            container: {
              background: "#1f2937",
              color: "#ffffff",
            },
          },
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45, // Tarihler sığsın diye eğdik
          legend: t("Dashboard.LAST_7_DAYS"),
          legendPosition: "middle",
          legendOffset: 45,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t("Dashboard.TRIP_COUNT"),
          legendPosition: "middle",
          legendOffset: -40,
        }}
        animate={true}
        enableLabel={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
      />
    </div>
  );
};

export default WeeklyActivityChart;
