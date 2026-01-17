// components/YearlyActivityMap.tsx
import { ResponsiveCalendar } from "@nivo/calendar";
import { useCalendarStats } from "../../../hooks/useDashboard";
import type { TripType } from "../../../types";

// Bu Yılın Başlangıç ve Bitiş Tarihleri
const currentYear = new Date().getFullYear();
const fromDate = `${currentYear}-01-01`;
const toDate = `${currentYear}-12-31`;

const YearlyActivityMap = ({ trips }: { trips: TripType[] }) => {
  const data = useCalendarStats(trips);

  return (
    // Calendar genelde geniş olduğu için yükseklik 200-250px yeterlidir
    <div style={{ height: 220, width: "100%", marginBlock: 60 }}>
      <h3>Yıllık Operasyon Yoğunluğu</h3>
      <ResponsiveCalendar
        data={data}
        from={fromDate}
        to={toDate}
        emptyColor="#1f2937" // Boş günler (Senin kart arka plan renginle aynı olmalı)
        // RENK PALETİ: Koyu Yeşilden -> Parlak Neon Yeşile
        colors={["#064e3b", "#065f46", "#047857", "#10b981"]}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        yearSpacing={40}
        // Ay İsimleri ve Sınırları
        monthBorderColor="#000000" // Arka plan siyahsa sınır görünmesin diye
        monthLegendOffset={10}
        // Gün Kutucukları
        dayBorderWidth={2}
        dayBorderColor="#000000" // Kutucukların arası ayrılsın (Siyah çizgi)
        daySpacing={0} // Border kullandığımız için spacing 0 olabilir
        // Dark Mode Teması
        theme={{
          text: {
            fill: "#9ca3af", // Ay ve Gün isimleri (Gri)
            fontSize: 12,
          },
          tooltip: {
            container: {
              background: "#111827", // Tooltip arka planı (Simsiyah)
              color: "#10b981", // Tooltip yazı rengi (Yeşil)
              fontSize: "13px",
              borderRadius: "4px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
            },
          },
        }}
        // Tooltip İçeriği (Türkçe Tarih Göstermek İçin)
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
