import { useEffect, useMemo, useState } from 'react';
import { ThemeContext, THEME_LOGOS, THEME_STORAGE_KEY } from './theme';

function getStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  } catch {
    return 'dark';
  }
}

function updateFavicon(theme) {
  const href = THEME_LOGOS[theme];
  let favicon = document.querySelector("link[rel='icon']");

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.type = 'image/svg+xml';
  favicon.href = href;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateFavicon(theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures; the active theme still applies for this session.
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      logoSrc: THEME_LOGOS[theme],
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
