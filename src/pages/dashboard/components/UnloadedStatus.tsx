import { useState } from "react";
import { useStatusDistribution } from "../../../hooks/useReports";
import { ResponsivePie } from "@nivo/pie";
import { Skeleton, theme, Select, Flex } from "antd";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../hooks/useIsMobile";

const STATUS_COLORS: Record<string, string> = {
  WAITING: "#faad14", // Sarı
  UNLOADING: "#1890ff", // Mavi
  UNLOADED: "#52c41a", // Yeşil
  IN_PROGRESS: "#13c2c2", // Camgöbeği (Cyan)
  COMPLETED: "#389e0d", // Koyu Yeşil
  CANCELED: "#ff4d4f", // Kırmızı
  UNKNOWN: "#d9d9d9", // Gri
};

function UnloadedStatus() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<"today" | "month" | "year" | "all">("month");
  const { data: rawData, isLoading } = useStatusDistribution(period);
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

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

  const legendHeight = data.length * 20;
  const bottomMargin = isMobile ? (legendHeight + 50) : (legendHeight + 50);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: isMobile ? 300 : 350, display: "flex", flexDirection: "column" }}>
      <Flex justify="flex-end" style={{ paddingBottom: 8 }}>
        <Select
          value={period}
          onChange={setPeriod}
          size="small"
          options={[
            { value: "today", label: t("Periods.TODAY") },
            { value: "month", label: t("Periods.THIS_MONTH") },
            { value: "year", label: t("Periods.THIS_YEAR") },
            { value: "all", label: t("Periods.ALL_TIME") }
          ]}
          style={{ width: 130 }}
        />
      </Flex>
      <div style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
           <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
        <ResponsivePie
          data={data}
        margin={{ top: 20, right: 20, bottom: bottomMargin, left: 20 }}
        innerRadius={0.5}
        padAngle={3}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: "data.color" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLinkLabels={false}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={token.colorText}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
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
        arcLinkLabelsDiagonalLength={isMobile ? 10 : 16}
        arcLinkLabelsStraightLength={isMobile ? 12 : 24}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "column",
            justify: false,
            translateX: -75, // Centers the 150-width block
            translateY: bottomMargin - 20,
            itemsSpacing: 4,
            itemWidth: 150,
            itemHeight: 18,
            itemTextColor: token.colorText,
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 14,
            symbolShape: "circle",
          },
        ]}
        />
        )}
      </div>
    </div>
  );
}

export default UnloadedStatus;
