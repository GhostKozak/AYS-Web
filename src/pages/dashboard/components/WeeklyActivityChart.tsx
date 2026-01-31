import { ResponsiveBar } from "@nivo/bar";
import { useDailyTripStats } from "../../../hooks/useDashboard";
import { useTranslation } from "react-i18next";

// Senin renk paletin (Yukarıda tanımladığın)
const STATUS_COLORS: Record<string, string> = {
  WAITING: "#faad14",
  COMPLETED: "#52c41a",
  UNLOADED: "#13c2c2",
  CANCELED: "#ff4d4f",
  UNKNOWN: "#d9d9d9",
};

const WeeklyActivityChart = ({ trips }: { trips: any[] }) => {
  const data = useDailyTripStats(trips);
  const { t } = useTranslation();

  return (
    <div style={{ height: 370, width: "100%" }}>
      <ResponsiveBar
        data={data}
        // Hangi verileri üst üste yığacağız?
        keys={["UNLOADED", "COMPLETED", "WAITING", "CANCELED", "UNKNOWN"]}
        // X ekseninde ne yazacak?
        indexBy="dayName"
        // Kenar boşlukları (Eksen yazılarına yer kalsın diye)
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3} // Çubuklar arası boşluk
        // --- RENK AYARLARI ---
        // Her bir parça (id) için bizim paletten rengi çekiyoruz
        colors={(item) => STATUS_COLORS[item.id] || STATUS_COLORS.UNKNOWN}
        // --- DARK MODE AYARLARI (Theme) ---
        theme={{
          // Genel yazı rengi
          text: { fill: "#ffffff" },
          axis: {
            domain: { line: { stroke: "#525252" } }, // Eksen çizgileri
            ticks: { line: { stroke: "#525252" }, text: { fill: "#9ca3af" } }, // Sayılar ve Yazılar
          },
          grid: {
            line: { stroke: "#262626", strokeWidth: 1 }, // Arkadaki ızgara çizgileri (çok silik gri)
          },
          tooltip: {
            container: {
              background: "#1f2937", // Tooltip arka planı (Koyu gri)
              color: "#ffffff",
            },
          },
        }}
        // --- EKSEN AYARLARI ---
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t("Dashboard.LAST_7_DAYS"), // Alt başlık
          legendPosition: "middle",
          legendOffset: 45,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t("Dashboard.TRIP_COUNT"), // Sol başlık
          legendPosition: "middle",
          legendOffset: -40,
        }}
        // --- EFSANE (LEGEND) ---
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            itemTextColor: "#ffffff", // Legend yazı rengi
            data: [
              "UNLOADED",
              "COMPLETED",
              "WAITING",
              "CANCELED",
              "UNKNOWN",
            ].map((key) => ({
              id: key,
              label: t(`Trips.STATUS_${key}`), // Durumları çeviriyoruz
              color: STATUS_COLORS[key],
            })),
          },
        ]}
        // Animasyon ve Etkileşim
        animate={true}
        enableLabel={false} // Çubukların içinde sayı yazmasın (karışık durur)
      />
    </div>
  );
};

export default WeeklyActivityChart;
