import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  type ReactNode,
  useEffect,
} from "react";
import { ConfigProvider, theme } from "antd";

type ThemeMode = "light" | "dark";

interface IThemeContext {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

interface IThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<IThemeContext | null>(null);

export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme, CustomThemeProvider iceriSinde kullanilmalidir");
  }

  return context;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme = localStorage.getItem("themeMode");

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  } catch (error) {
    console.warn("localStorage erisimi basarisiz:", error);
    return "light";
  }
};

export const CustomThemeProvider: React.FC<IThemeProviderProps> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("themeMode", themeMode);
      } catch (error) {
        console.warn("localStorage yazma basarisiz:", error);
      }
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const antdTheme = useMemo(
    () => ({
      algorithm:
        themeMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
    }),
    [themeMode]
  );

  const contextValue: IThemeContext = {
    themeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
