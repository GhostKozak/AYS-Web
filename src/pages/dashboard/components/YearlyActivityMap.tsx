import { ResponsiveCalendar } from "@nivo/calendar";
import { useReportTrend } from "../../../hooks/useReports";
import { Skeleton } from "antd";

const currentYear = new Date().getFullYear();
const fromDate = `${currentYear}-01-01`;
const toDate = `${currentYear}-12-31`;

const YearlyActivityMap = () => {
  const { data: rawData, isLoading } = useReportTrend("year");

  const data = (rawData || []).map((item: any) => ({
    day: item.timestamp,
    value: item.count,
  }));

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <div style={{ height: 220, width: "100%", marginBlock: 30 }}>
      <ResponsiveCalendar
        data={data}
        from={fromDate}
        to={toDate}
        emptyColor="#1f2937"
        colors={["#064e3b", "#065f46", "#047857", "#10b981"]}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        yearSpacing={40}
        monthBorderColor="#000000"
        monthLegendOffset={10}
        dayBorderWidth={2}
        dayBorderColor="#000000"
        daySpacing={0}
        theme={{
          text: {
            fill: "#9ca3af",
            fontSize: 12,
          },
          tooltip: {
            container: {
              background: "#111827",
              color: "#10b981",
              fontSize: "13px",
              borderRadius: "4px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
            },
          },
        }}
        tooltip={({ day, value, color }) => (
          <div style={{ padding: 12, color, backgroundColor: "#111827" }}>
            <strong>
              {new Date(day).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                weekday: "long",
              })}
            </strong>
            <br />
            <span>Sefer Sayısı: {value}</span>
          </div>
        )}
      />
    </div>
  );
};

export default YearlyActivityMap;
