import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  type ReactNode,
  useEffect,
} from "react";
import { ConfigProvider, theme } from "antd";
import { useTranslation } from "react-i18next";
import trTR from "antd/locale/tr_TR";
import enUS from "antd/locale/en_US";

type ThemeMode = "light" | "dark";

interface AppConfigContext {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const AppConfigContext = createContext<AppConfigContext | null>(null);

export const useAppConfig = (): AppConfigContext => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error(
      "useAppConfig, AppConfigProvider içerisinde kullanılmalıdır"
    );
  }
  return context;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("themeMode");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const { i18n } = useTranslation();

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const antdTheme = useMemo(
    () => ({
      algorithm: themeMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
      token:
        themeMode === "dark"
          ? {
            // --- Ana Renkler ---
            colorPrimary: "#1677ff", // Modern ve canlı bir mavi
            colorInfo: "#1677ff",
            colorSuccess: "#52c41a",
            colorWarning: "#faad14",
            colorError: "#ff4d4f",

            // --- Arka Plan (Smooth Transition için katmanlı yapılar) ---
            colorBgBase: "#0d1117", // En alt katman (GitHub tarzı derinlik)
            colorBgContainer: "#161b22", // Kartlar ve tablolar için bir tık açık ton
            colorBgElevated: "#1f242c", // Modal ve Popover'lar için en üst katman

            // --- Metin Renkleri ---
            colorTextBase: "#e6edf3", // Saf beyaz yerine göz yormayan açık gri
            colorTextSecondary: "#8b949e", // Yardımcı metinler

            // --- Kenarlık ve Bölücüler ---
            colorBorder: "#30363d", // Yumuşak geçişli borderlar
            colorBorderSecondary: "#21262d",

            // --- Etkileşim ve Smoothness ---
            borderRadius: 8, // Daha modern bir yuvarlama
            wireframe: true, // Ant Design v5'in yeni görsel stili

            // Geçiş efektleri için kontrol (CSS'e de yansır)
            motionDurationSlow: "0.3s",
            motionDurationMid: "0.2s",
            motionDurationFast: "0.1s",
          }
          : {
            // --- Ana Karakter Renkleri ---
            colorPrimary: '#0052CC',          // Güven veren, modern bir kurumsal mavi
            colorInfo: '#0052CC',
            colorSuccess: '#389e0d',          // Daha doğal, doygun bir yeşil
            colorWarning: '#fa8c16',
            colorError: '#f5222d',

            // --- Arka Plan Katmanları (Derinlik için) ---
            colorBgBase: '#f4f7f9',           // Sayfanın ana zemini (Hafif grimsi mavi)
            colorBgContainer: '#ffffff',      // Kartlar, Tablolar ve Formlar (Saf beyaz)
            colorBgElevated: '#ffffff',       // Modal ve Popover'lar

            // --- Metin ve Okunabilirlik ---
            colorTextBase: '#172b4d',         // Tam siyah yerine çok koyu lacivert (Premium hissettirir)
            colorTextSecondary: '#44546f',    // İkincil açıklamalar ve etiketler

            // --- Kenarlıklar ve Bölücüler ---
            colorBorder: '#dfe1e6',           // Yumuşak, neredeyse hissedilmeyen borderlar
            colorBorderSecondary: '#ebecf0',

            // --- Etkileşim ve Smoothness ---
            borderRadius: 8,                  // Modern köşeler
            controlHeight: 36,                // Elemanlar arası ferahlık

            // Smooth Transition (Geçiş Efektleri)
            motionDurationSlow: '0.3s',
            motionDurationMid: '0.2s',
          },
    }),
    [themeMode]
  );

  const currentLocale = i18n.language.startsWith("en") ? enUS : trTR;

  const contextValue = { themeMode, toggleTheme };

  return (
    <AppConfigContext.Provider value={contextValue}>
      <ConfigProvider theme={antdTheme} locale={currentLocale}>
        {children}
      </ConfigProvider>
    </AppConfigContext.Provider>
  );
};
