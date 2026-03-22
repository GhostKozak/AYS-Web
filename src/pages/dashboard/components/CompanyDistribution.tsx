import { useState } from "react";
import { useTopCompanies } from "../../../hooks/useReports";
import { ResponsivePie } from "@nivo/pie";
import { Skeleton, theme, Select, Flex } from "antd";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../hooks/useIsMobile";

function CompanyDistribution() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<"today" | "month" | "year" | "all">("all");
  const { data: rawData, isLoading } = useTopCompanies(period);
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const data = (rawData || [])
    .filter((item: any) => item.tripCount > 0)
    .map((item: any) => ({
      id: item.companyName,
      label: item.companyName,
      value: item.tripCount,
    }));



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
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        innerRadius={0.5}
        padAngle={3}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "dark2" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLinkLabels={true}
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
        />
        )}
      </div>
    </div>
  );
}

export default CompanyDistribution;
