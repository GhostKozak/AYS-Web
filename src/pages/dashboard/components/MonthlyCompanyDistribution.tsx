import { useTopCompanies } from "../../../hooks/useReports";
import { ResponsivePie } from "@nivo/pie";
import { Skeleton, theme } from "antd";
import { useIsMobile } from "../../../hooks/useIsMobile";

function MonthlyCompanyDistribution() {
  const { data: rawData, isLoading } = useTopCompanies("month");
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const data = (rawData || []).map((item: any) => ({
    id: item.companyName,
    label: item.companyName,
    value: item.tripCount,
  }));

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: isMobile ? 200 : 250 }}>
      <ResponsivePie
        data={data}
        margin={isMobile ? { top: 30, right: 80, bottom: 80, left: 80 } : { top: 30, right: 40, bottom: 60, left: 40 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "dark2" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={token.colorText}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLinkLabelsDiagonalLength={isMobile ? 10 : 16}
        arcLinkLabelsStraightLength={isMobile ? 12 : 24}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: isMobile ? 65 : 50,
            itemsSpacing: 0,
            itemWidth: isMobile ? 60 : 80,
            itemHeight: 18,
            itemTextColor: token.colorText,
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 14,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}

export default MonthlyCompanyDistribution;
