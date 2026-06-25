/**
 * Theme registry. Add a theme here AND a matching `.theme-{key}` block in the
 * corresponding CSS file under `src/theme/` for it to take effect at runtime.
 */
export const themes = {
  light: { name: 'Light', key: 'light' },
  dark: { name: 'Dark', key: 'dark' },
};

export const themeKeys = Object.keys(themes);

export const DEFAULT_THEME = 'dark';
