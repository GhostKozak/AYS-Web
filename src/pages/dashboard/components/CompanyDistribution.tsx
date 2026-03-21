import { useTopCompanies } from "../../../hooks/useReports";
import { ResponsivePie } from "@nivo/pie";
import { Skeleton } from "antd";

function CompanyDistribution() {
  const { data: rawData, isLoading } = useTopCompanies("all");

  const data = (rawData || []).map((item) => ({
    id: item.companyName,
    label: item.companyName,
    value: item.tripCount,
  }));

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 250 }}>
      <ResponsivePie
        data={data}
        margin={{ top: 30, right: 40, bottom: 60, left: 40 }}
        innerRadius={0.5}
        padAngle={3}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "dark2" }}
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
            translateY: 50,
            itemsSpacing: 0,
            itemWidth: 80,
            itemHeight: 18,
            itemTextColor: "#fff",
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

export default CompanyDistribution;
