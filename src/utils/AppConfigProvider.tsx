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
      algorithm:
        themeMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
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
