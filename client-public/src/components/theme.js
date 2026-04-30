import { createContext, useContext } from "react";

export const ThemeContext = createContext(null);
export const THEME_STORAGE_KEY = "blida1-public-theme";
export const THEME_LOGOS = {
  dark: "/logo-dark.svg",
  light: "/logo-light.svg",
};

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
