import { ResponsiveBar } from "@nivo/bar";
import { useReportTrend } from "../../../hooks/useReports";
import { useTranslation } from "react-i18next";
import { Skeleton, theme } from "antd";
import { useIsMobile } from "../../../hooks/useIsMobile";

const WeeklyActivityChart = () => {
  const { t, i18n } = useTranslation();
  const { data: rawData, isLoading } = useReportTrend("month");
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  // Son 7 günü filtreleyelim veya hepsini gösterelim (Backend "month" için hepsini dönebilir)
  // Nivo Bar için datayı hazırlayalım
  const data = (rawData || []).map((item) => {
    // Tarihi gün ve kısa ay ismi olarak çevirelim (örn: 21 Mar)
    const rawDate = item.timestamp?.split('T')[0] || item.timestamp;
    let shortDate = rawDate;

    if (rawDate && rawDate.length === 10) {
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj.getTime())) {
        shortDate = dateObj.toLocaleDateString(i18n.language || "tr-TR", { day: "numeric", month: "short" });
      }
    }

    return {
      day: shortDate,
      count: item.count,
    };
  }).slice(-7); // Sadece son 7 gün

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <div style={{ height: "100%", width: "100%", minHeight: isMobile ? 250 : 300 }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="day"
        margin={isMobile ? { top: 20, right: 20, bottom: 80, left: 50 } : { top: 30, right: 30, bottom: 80, left: 60 }}
        padding={0.3}
        colors={[token.colorPrimary]} // Tema rengine uyumlu
        theme={{
          text: { fill: token.colorText },
          axis: {
            domain: { line: { stroke: token.colorBorder } },
            ticks: { line: { stroke: token.colorBorder }, text: { fill: token.colorTextSecondary } },
          },
          grid: {
            line: { stroke: token.colorSplit, strokeWidth: 1 },
          },
          tooltip: {
            container: {
              background: token.colorBgElevated,
              color: token.colorText,
              boxShadow: token.boxShadow,
            },
          },
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45, // Tarihler sığsın diye eğdik
          legend: isMobile ? "" : t("Dashboard.LAST_7_DAYS"), // Mobilde eksen ismini gizle, daralmasın
          legendPosition: "middle",
          legendOffset: 60,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isMobile ? "" : t("Dashboard.TRIP_COUNT"),
          legendPosition: "middle",
          legendOffset: -40,
        }}
        tooltip={({ value, indexValue, color }) => (
          <div
            style={{
              padding: "6px 12px",
              background: token.colorBgElevated,
              color: token.colorText,
              borderRadius: token.borderRadius,
              boxShadow: token.boxShadowSecondary || token.boxShadow,
              border: `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ width: 12, height: 12, background: color, borderRadius: "50%" }} ></div>
            <span>
              <strong>{indexValue}</strong>: {value} {t("Trips.TOTAL").toLowerCase()}
            </span>
          </div>
        )}
        animate={true}
        enableLabel={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={token.colorTextLightSolid}
      />
    </div>
  );
};

export default WeeklyActivityChart;
