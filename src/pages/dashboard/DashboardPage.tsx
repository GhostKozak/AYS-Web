import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useState } from "react";
import { Badge, Button, Checkbox, Drawer, FloatButton, Typography } from "antd";
import { useTrips } from "../../hooks/useTrips";
import CompanyDistribution from "./components/CompanyDistribution";
import MonthlyCompanyDistribution from "./components/MonthlyCompanyDistribution";
import StatsOverview from "./components/StatsOverview";
import UnloadedStatus from "./components/UnloadedStatus";
import WeeklyActivityChart from "./components/WeeklyActivityChart";
import YearlyActivityMap from "./components/YearlyActivityMap";
import LiveOperationsList from "./components/LiveOperationsList";
import { WidthProvider, Responsive } from "react-grid-layout/legacy";
import { DashboardWidget } from "./components/DashboardWidget";
import { SettingOutlined } from "@ant-design/icons";

const { Text } = Typography;
const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardPage() {
  const { trips } = useTrips();
  const [visibleWidgets, setVisibleWidgets] = useState({
    weekly: true,
    live: true,
    yearly: true,
    company: true,
    monthlyCompany: true,
    unloaded: true,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const myLayout = {
    lg: [
      { i: "company", x: 0, y: 0, w: 3, h: 4 },
      { i: "monthlyCompany", x: 3, y: 0, w: 3, h: 4 },
      { i: "unloaded", x: 6, y: 0, w: 3, h: 4 },
      { i: "live", x: 9, y: 0, w: 3, h: 4 },
      { i: "weekly", x: 0, y: 4, w: 6, h: 4 },
      { i: "yearly", x: 6, y: 4, w: 6, h: 4 },
    ],
  };

  const [layouts, setLayouts] = useState(myLayout);

  const toggleWidget = (key: keyof typeof visibleWidgets, show: boolean) => {
    // 1. Görünürlüğü güncelle
    setVisibleWidgets((prev) => ({ ...prev, [key]: show }));

    if (show) {
      // 2. Eğer widget AÇILIYORSA, orijinal boyutlarını layout'a geri yükle
      setLayouts((currentLayouts) => {
        const newLayouts = { ...currentLayouts };

        // Şu anki ekran boyutundaki (örn: lg) layout listesini al
        // Not: React Grid Layout bazen lg, md, sm hepsini tutar. Biz hepsini gezelim.
        Object.keys(myLayout).forEach((breakpoint) => {
          const originalItem = myLayout[
            breakpoint as keyof typeof myLayout
          ]?.find((item) => item.i === key);

          if (originalItem) {
            // Mevcut listede bu item varsa (bozuk haliyle), onu filtrele ve orijinali ekle
            const currentList =
              newLayouts[breakpoint as keyof typeof newLayouts] || [];
            newLayouts[breakpoint as keyof typeof newLayouts] = [
              ...currentList.filter((item: any) => item.i !== key), // Eskisini sil
              originalItem, // Orijinali ekle
            ];
          }
        });

        return newLayouts;
      });
    }
  };

  const onResetLayout = () => {
    // Spread operator (...) kullanarak yeni bir referans oluştur, react değişikliği algılasın
    setLayouts({ ...myLayout });
  };

  // TODO: tablolari excel export edecek bir yol bulun
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginTop: -30 }}>Dashboard</h1>
      <StatsOverview />
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts} // Büyük ekranlar için bu planı kullan
        // Grid Ayarları
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100} // Her bir kare 100px yüksekliğinde olsun
        draggableHandle=".drag-handle" // Sadece bu class'a sahip yerden tutunca sürüklensin
        style={{ marginInline: -10 }}
        onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
      >
        {visibleWidgets.company && (
          <div key="company" data-grid={{ x: 0, y: 0, w: 3, h: 4 }}>
            <DashboardWidget
              title="En Çok Gelen Firmalar"
              onClose={() => toggleWidget("company", false)}
            >
              <CompanyDistribution trips={trips} />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.monthlyCompany && (
          <div key="monthlyCompany">
            <DashboardWidget
              title="Bu Ay Gelen Firmalar"
              onClose={() => toggleWidget("monthlyCompany", false)}
            >
              <MonthlyCompanyDistribution trips={trips} />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.unloaded && (
          <div key="unloaded">
            <DashboardWidget
              title="Bugünkü Boşalma Durumu"
              onClose={() => toggleWidget("unloaded", false)}
            >
              <UnloadedStatus trips={trips} />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.live && (
          <div key="live">
            <DashboardWidget
              title={
                <>
                  <Badge status="processing" color="green" />
                  <Text strong style={{ fontSize: 16, marginLeft: 10 }}>
                    Son Hareketler
                  </Text>
                </>
              }
              onClose={() => toggleWidget("live", false)}
            >
              <LiveOperationsList trips={trips} />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.weekly && (
          <div key="weekly">
            <DashboardWidget
              title="Haftalık Aktivite"
              onClose={() => toggleWidget("weekly", false)}
            >
              <WeeklyActivityChart trips={trips} />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.yearly && (
          <div key="yearly">
            <DashboardWidget
              title="Yıllık Yoğunluk"
              onClose={() => toggleWidget("yearly", false)}
            >
              <YearlyActivityMap trips={trips} />
            </DashboardWidget>
          </div>
        )}
      </ResponsiveGridLayout>
      {/* Ayarlar Butonu (Sağ altta yüzen buton) */}
      <FloatButton
        icon={<SettingOutlined />}
        type="primary"
        onClick={() => setIsSettingsOpen(true)}
        tooltip="Dashboard Düzenle"
      />

      {/* Kapalı Widgetları Açma Paneli */}
      <Drawer
        title="Görünüm Ayarları"
        placement="right"
        onClose={() => setIsSettingsOpen(false)}
        open={isSettingsOpen}
      >
        <p>Görmek istediğiniz grafikleri seçin:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Checkbox
            checked={visibleWidgets.company}
            onChange={(e) => toggleWidget("company", e.target.checked)}
          >
            En Çok Gelen Firmalar
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.monthlyCompany}
            onChange={(e) => toggleWidget("monthlyCompany", e.target.checked)}
          >
            Bu Ay Gelen Firmalar
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.unloaded}
            onChange={(e) => toggleWidget("unloaded", e.target.checked)}
          >
            Bugünkü Boşaltma Durumu
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.live}
            onChange={(e) => toggleWidget("live", e.target.checked)}
          >
            Son Hareketler
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.weekly}
            onChange={(e) => toggleWidget("weekly", e.target.checked)}
          >
            Haftalık Aktivite
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.yearly}
            onChange={(e) => toggleWidget("yearly", e.target.checked)}
          >
            Yıllık Yoğunluk
          </Checkbox>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={onResetLayout} danger block>
            Yerleşimi Sıfırla
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

export default DashboardPage;
