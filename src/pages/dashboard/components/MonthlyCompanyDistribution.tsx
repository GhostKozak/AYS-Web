import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMonthCompanyStats } from "../../../hooks/useDashboard";
import type { TripType } from "../../../types";
import { ResponsivePie } from "@nivo/pie";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#8884d8",
];

function MonthlyCompanyDistribution({ trips }: { trips: TripType[] }) {
  // Veriyi hook sayesinde hesapla
  const data = useMonthCompanyStats(trips);

  return (
    <div style={{ width: "100%", height: 300, marginBlock: 60 }}>
      <h3>Bu Ay Gelen Firmalar</h3>
      {/* <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${((percent || 0) * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer> */}
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.6} // Ortasını delerek Donut yapar (0.5 - 0.8 arası iyidir)
        padAngle={0.7} // Dilimler arası boşluk (Modern görünüm için şart)
        cornerRadius={3} // Dilim kenarlarını yuvarlar
        activeOuterRadiusOffset={8} // Üzerine gelince büyüme efekti
        colors={{ scheme: "dark2" }} // Verideki renkleri kullan
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        // Ortadaki yazıları kapatıp (çünkü çok sıkışık oluyor),
        // sadece kenara çizgi çekerek gösterelim:
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#ffffff" // Dark mode için beyaz yazı
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        // Dilimlerin içindeki sayıları gizlemek istersen false yap
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        // Ortaya "Toplam" veya yüzde yazdırmak için bir katman eklenebilir
        // Ancak en basit haliyle Nivo'nun "Legends" özelliğini kullanabilirsin
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
            itemTextColor: "#999",
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

export default MonthlyCompanyDistribution;
