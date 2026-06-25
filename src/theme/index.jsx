import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ConfigProvider } from 'antd';
import { themes, themeKeys, DEFAULT_THEME } from './themes';
import { getAntdThemeConfig } from './antdThemeConfig';

const THEME_STORAGE_KEY = 'theme';

const isThemeKey = (v) => !!v && themeKeys.includes(v);

const readSavedTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeSavedTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable (private mode, SSR) — silently ignore.
  }
};

const getSystemTheme = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : DEFAULT_THEME;

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  themeKeys.forEach((k) => root.classList.remove(`theme-${k}`));
  root.classList.add(`theme-${theme}`);
};

const readVar = (name) => {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};

const resolveInitialTheme = () => {
  const saved = readSavedTheme();
  return isThemeKey(saved) ? saved : getSystemTheme();
};

// Apply the saved theme class to <html> before React's first render so any
// `getComputedStyle` reads during render see the correct CSS-variable values.
// Without this, the very first render of the provider's `useMemo` reads from
// `:root` (which carries the light-theme defaults) and caches a light palette
// even when the active theme is dark.
applyThemeClass(resolveInitialTheme());

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

const buildBundle = (currentTheme) => {
  const isDark = currentTheme === 'dark';

  const palette = {
    bg: readVar('--background'),
    bgElevated: readVar('--input'),
    panel: readVar('--card'),
    panelAlt: readVar('--muted'),
    border: readVar('--border'),
    borderStrong: readVar('--muted-foreground'),
    gridLine: readVar('--chart-grid'),
    ink: readVar('--foreground'),
    inkMuted: readVar('--muted-foreground'),
    inkFaint: readVar('--text-tertiary'),

    // Themes that don't define `--success`/`--warning` fall back to their
    // secondary/accent — mirrors `antdThemeConfig.js`.
    primary: readVar('--primary'),
    accent: readVar('--accent'),
    success: readVar('--success') || readVar('--secondary'),
    warning: readVar('--warning') || readVar('--accent'),
    statusNeutral: readVar('--status-neutral') || readVar('--border'),
    statusOnNeutral:
      readVar('--status-on-neutral') || readVar('--muted-foreground'),

    cyan: readVar('--chart-cyan'),
    cyanBright: readVar('--chart-cyan-bright'),
    amber: readVar('--chart-amber'),
    amberBright: readVar('--chart-amber-bright'),
    magenta: readVar('--chart-magenta'),
    magentaBright: readVar('--chart-magenta-bright'),
    emerald: readVar('--chart-emerald'),
    emeraldBright: readVar('--chart-emerald-bright'),
    red: readVar('--chart-red'),
    redBright: readVar('--chart-red-bright'),
    violet: readVar('--chart-violet'),
    indigo: readVar('--chart-indigo'),
    labelOnColor: readVar('--chart-label-on-color'),
  };

  const severityColor = {
    disaster: readVar('--severity-disaster'),
    high: readVar('--severity-high'),
    average: readVar('--severity-average'),
    warning: readVar('--severity-warning'),
    info: readVar('--severity-info'),
  };

  const healthColor = {
    healthy: readVar('--health-healthy'),
    warning: readVar('--health-warning'),
    critical: readVar('--health-critical'),
    unknown: readVar('--health-unknown'),
    maintenance: readVar('--health-maintenance'),
  };

  return { isDark, palette, severityColor, healthColor };
};

/**
 * Build the light-theme palette regardless of the active theme. Swaps the
 * `<html>` theme class, reads the CSS vars synchronously (no paint between swap
 * and restore), then restores the active theme.
 */
export const getLightPalette = () => {
  if (typeof document === 'undefined') return buildBundle('light').palette;
  const root = document.documentElement;
  const active = themeKeys.find((k) => root.classList.contains(`theme-${k}`));
  if (active === 'light') return buildBundle('light').palette;
  applyThemeClass('light');
  const { palette } = buildBundle('light');
  if (active) applyThemeClass(active);
  return palette;
};

const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(resolveInitialTheme);

  const setTheme = useCallback((theme) => {
    if (!isThemeKey(theme)) return;
    // Apply the class synchronously so the next render's `useMemo` reads CSS
    // variables that already match the new theme.
    applyThemeClass(theme);
    writeSavedTheme(theme);
    setCurrentTheme(theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => {
      const next =
        themeKeys[(themeKeys.indexOf(prev) + 1) % themeKeys.length] ??
        DEFAULT_THEME;
      applyThemeClass(next);
      writeSavedTheme(next);
      return next;
    });
  }, []);

  // Both bundles read the DOM via `getComputedStyle`; safe to compute during
  // render because `applyThemeClass` is invoked before any state change here
  // (module scope on mount, inside `setTheme`/`toggleTheme` on switch).
  const bundle = useMemo(() => buildBundle(currentTheme), [currentTheme]);
  const antdTheme = useMemo(() => getAntdThemeConfig(), [currentTheme]);

  const value = useMemo(
    () => ({
      currentTheme,
      themeName: themes[currentTheme]?.name ?? 'Light',
      toggleTheme,
      setTheme,
      availableThemes: themeKeys,
      ...bundle,
    }),
    [currentTheme, toggleTheme, setTheme, bundle]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
