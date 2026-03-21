import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useState } from "react";
import { useDashboardLayout } from "../../hooks/useDashboardLayout";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  Flex,
  FloatButton,
  Typography,
  App,
  Space,
} from "antd";
import CompanyDistribution from "./components/CompanyDistribution";
import MonthlyCompanyDistribution from "./components/MonthlyCompanyDistribution";
import StatsOverview from "./components/StatsOverview";
import UnloadedStatus from "./components/UnloadedStatus";
import WeeklyActivityChart from "./components/WeeklyActivityChart";
import YearlyActivityMap from "./components/YearlyActivityMap";
import LiveOperationsList from "./components/LiveOperationsList";
import { WidthProvider, Responsive } from "react-grid-layout/legacy";
import { DashboardWidget } from "./components/DashboardWidget";
import { FileExcelOutlined, FilePdfOutlined, SettingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { reportApi } from "../../api/reportApi";

const { Text } = Typography;
const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { layouts, visibleWidgets, onLayoutChange, toggleWidget, resetLayout } =
    useDashboardLayout();

  usePageTitle(t("Dashboard.TITLE"));

  const handleExport = async (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      const data = type === 'excel' 
        ? await reportApi.exportExcel('today')
        : await reportApi.exportPdf('today');
      
      const blob = new Blob([data], { 
        type: type === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Rapor_${dateStr}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(t("Common.EXPORT_SUCCESS"));
    } catch (error) {
      console.error(error);
      message.error(t("Common.EXPORT_ERROR"));
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <div style={{ padding: "24px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginTop: -45, marginBottom: 10 }}
      >
        <h1 style={{ marginBottom: 0 }}>{t("Dashboard.TITLE")}</h1>

        <Space>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            style={{ backgroundColor: "#217346" }}
            onClick={() => handleExport('excel')}
            loading={isExporting}
          >
            {t("Common.EXPORT_EXCEL")}
          </Button>
          <Button
            type="primary"
            danger
            icon={<FilePdfOutlined />}
            onClick={() => handleExport('pdf')}
            loading={isExporting}
          >
            {t("Common.EXPORT_PDF")}
          </Button>
        </Space>
      </Flex>
      <StatsOverview />
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".drag-handle"
        style={{ marginInline: -10 }}
        onLayoutChange={onLayoutChange as any}
      >
        {visibleWidgets.company && (
          <div key="company" data-grid={{ x: 0, y: 0, w: 3, h: 4 }}>
            <DashboardWidget
              title={t("Dashboard.TOP_COMPANIES")}
              onClose={() => toggleWidget("company", false)}
            >
              <CompanyDistribution />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.monthlyCompany && (
          <div key="monthlyCompany">
            <DashboardWidget
              title={t("Dashboard.MONTHLY_COMPANIES")}
              onClose={() => toggleWidget("monthlyCompany", false)}
            >
              <MonthlyCompanyDistribution />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.unloaded && (
          <div key="unloaded">
            <DashboardWidget
              title={t("Dashboard.TODAY_UNLOAD_STATUS")}
              onClose={() => toggleWidget("unloaded", false)}
            >
              <UnloadedStatus />
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
                    {t("Dashboard.LATEST_TRIPS")}
                  </Text>
                </>
              }
              onClose={() => toggleWidget("live", false)}
            >
              <LiveOperationsList />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.weekly && (
          <div key="weekly">
            <DashboardWidget
              title={t("Dashboard.WEEKLY_ACTIVITY")}
              onClose={() => toggleWidget("weekly", false)}
            >
              <WeeklyActivityChart />
            </DashboardWidget>
          </div>
        )}

        {visibleWidgets.yearly && (
          <div key="yearly">
            <DashboardWidget
              title={t("Dashboard.YEARLY_ACTIVITY")}
              onClose={() => toggleWidget("yearly", false)}
            >
              <YearlyActivityMap />
            </DashboardWidget>
          </div>
        )}
      </ResponsiveGridLayout>
      {/* Ayarlar Butonu (Sağ altta yüzen buton) */}
      <FloatButton
        icon={<SettingOutlined />}
        type="primary"
        onClick={() => setIsSettingsOpen(true)}
        tooltip={t("Dashboard.SETTINGS_TITLE")}
      />

      {/* Kapalı Widgetları Açma Paneli */}
      <Drawer
        title={t("Dashboard.SETTINGS_TITLE")}
        placement="right"
        onClose={() => setIsSettingsOpen(false)}
        open={isSettingsOpen}
      >
        <p>{t("Dashboard.SETTINGS_DESC")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Checkbox
            checked={visibleWidgets.company}
            onChange={(e) => toggleWidget("company", e.target.checked)}
          >
            {t("Dashboard.TOP_COMPANIES")}
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.monthlyCompany}
            onChange={(e) => toggleWidget("monthlyCompany", e.target.checked)}
          >
            {t("Dashboard.MONTHLY_COMPANIES")}
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.unloaded}
            onChange={(e) => toggleWidget("unloaded", e.target.checked)}
          >
            {t("Dashboard.TODAY_UNLOAD_STATUS")}
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.live}
            onChange={(e) => toggleWidget("live", e.target.checked)}
          >
            {t("Dashboard.LATEST_TRIPS")}
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.weekly}
            onChange={(e) => toggleWidget("weekly", e.target.checked)}
          >
            {t("Dashboard.WEEKLY_ACTIVITY")}
          </Checkbox>
          <Checkbox
            checked={visibleWidgets.yearly}
            onChange={(e) => toggleWidget("yearly", e.target.checked)}
          >
            {t("Dashboard.YEARLY_ACTIVITY")}
          </Checkbox>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={resetLayout} danger block>
            {t("Dashboard.RESET_LAYOUT")}
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

export default DashboardPage;
