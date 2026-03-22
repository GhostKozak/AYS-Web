import { ResponsiveCalendar } from "@nivo/calendar";
import { useReportTrend } from "../../../hooks/useReports";
import { Skeleton, theme } from "antd";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../hooks/useIsMobile";

const YearlyActivityMap = ({ year }: { year?: number }) => {
  const currentYear = year || new Date().getFullYear();
  const fromDate = `${currentYear}-01-01`;
  const toDate = `${currentYear}-12-31`;

  // 'all' periyodu günlük verileri (YYYY-MM-DD) döndürdüğü için takvim görünümü için bunu kullanıyoruz
  const { data: rawData, isLoading } = useReportTrend("all", currentYear);
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const data = (rawData || [])
    .filter((item) => item.timestamp.startsWith(currentYear.toString()))
    .map((item) => ({
      day: item.timestamp,
      value: item.count,
    }));

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <div style={{ height: "100%", width: "100%", overflowX: "auto", overflowY: "hidden" }}>
      <div style={{ minWidth: isMobile ? 800 : "100%", height: isMobile ? 250 : "100%", minHeight: 200 }}>
        <ResponsiveCalendar
          data={data}
          from={fromDate}
          to={toDate}
          emptyColor={token.colorFillAlter}
          colors={[token.colorPrimaryBorder, token.colorPrimaryHover, token.colorPrimary, token.colorPrimaryActive]}
          margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
          yearSpacing={40}
          monthBorderColor={token.colorBgContainer}
          monthLegendOffset={10}
          dayBorderWidth={2}
          dayBorderColor={token.colorBgContainer}
          daySpacing={0}
          theme={{
            text: {
              fill: token.colorTextSecondary,
              fontSize: 12,
            },
            tooltip: {
              container: {
                background: token.colorBgElevated,
                color: token.colorText,
                fontSize: "13px",
                borderRadius: token.borderRadius,
                boxShadow: token.boxShadow,
                border: `1px solid ${token.colorBorder}`,
              },
            },
          }}
          tooltip={({ day, value, color }) => {
            const dateObj = new Date(day);
            const dateStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString(i18n.language || "tr-TR", { day: "numeric", month: "long", weekday: "long" })
              : day;
            return (
              <div style={{
                padding: "8px 12px",
                backgroundColor: token.colorBgElevated,
                color: token.colorText,
                borderRadius: token.borderRadius,
                boxShadow: token.boxShadowSecondary
              }}>
                <strong>{dateStr}</strong>
                <br />
                <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, whiteSpace: "nowrap" }}>
                  <span style={{ width: 10, height: 10, backgroundColor: color, borderRadius: "50%" }}></span>
                  {value} {t("Trips.TOTAL").toLowerCase()}
                </span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default YearlyActivityMap;
