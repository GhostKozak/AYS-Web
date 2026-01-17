import { useCompanyStats } from "../../../hooks/useDashboard";
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

function CompanyDistribution({ trips }: { trips: TripType[] }) {
  const data = useCompanyStats(trips);

  return (
    <div style={{ width: "100%", height: 300, marginBlock: 60 }}>
      <h3>En Çok Gelen Firmalar</h3>
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5} // Ortasını delerek Donut yapar (0.5 - 0.8 arası iyidir)
        padAngle={3} // Dilimler arası boşluk (Modern görünüm için şart)
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

export default CompanyDistribution;
