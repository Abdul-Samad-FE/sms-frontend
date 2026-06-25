/**
 * Ant Design theme configuration
 * Maps CSS variables to Ant Design theme tokens
 */

/**
 * Get computed CSS variable value
 */
const getCSSVariable = (variable) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

/* ─────────────────────────── Charts ──────────────────────────── */

/**
 * Ordered series-colour cycle for the global chart components
 * (`@/components/charts`). Reads the theme's `--chart-*` variables so charts
 * always track the active theme. The order here is the single source of truth
 * for how multi-series line/bar charts (and pie slices) auto-assign colours
 * when a caller doesn't pass an explicit `color`.
 */
export const getChartSeriesColors = () =>
  [
    getCSSVariable('--chart-cyan'),
    getCSSVariable('--chart-amber'),
    getCSSVariable('--chart-emerald'),
    getCSSVariable('--chart-magenta'),
    getCSSVariable('--chart-violet'),
    getCSSVariable('--chart-indigo'),
    getCSSVariable('--chart-red'),
  ].filter(Boolean);

/**
 * `[bright, base]` gradient accent pairs for donut / gradient slice fills,
 * cycled per slice by the global `PieChart`. Reads the `--chart-*` /
 * `--chart-*-bright` variables so the gradient donuts stay theme-driven.
 */
export const getChartGradientPairs = () => [
  [getCSSVariable('--chart-cyan-bright'), getCSSVariable('--chart-cyan')],
  [getCSSVariable('--chart-violet'), getCSSVariable('--chart-indigo')],
  [getCSSVariable('--chart-amber-bright'), getCSSVariable('--chart-amber')],
  [getCSSVariable('--chart-emerald-bright'), getCSSVariable('--chart-emerald')],
  [getCSSVariable('--chart-magenta'), getCSSVariable('--chart-magenta-bright')],
  [getCSSVariable('--chart-red-bright'), getCSSVariable('--chart-red')],
];

/**
 * Style tokens for the global chart components (`@/components/charts`), grouped
 * by chart part the same way `getAntdThemeConfig` groups antd component tokens
 * (Button / Card / …). Reads the same theme CSS variables so charts track the
 * active theme. The React-reactive accessors in `@/components/charts/utils`
 * (`useChartBaseAxis` / `useChartTooltip` / `useChartLegend` / `useChartGridLine`)
 * read from here, so all chart styling lives in this file.
 */
export const getChartTheme = () => {
  const ink = getCSSVariable('--foreground');
  const inkMuted = getCSSVariable('--muted-foreground');
  const inkFaint = getCSSVariable('--text-tertiary');
  const gridLine = getCSSVariable('--chart-grid');
  const bgElevated = getCSSVariable('--input');
  const borderStrong = getCSSVariable('--muted-foreground');
  // Charts inherit the page font so canvas text matches the surrounding UI.
  const fontFamily = 'inherit';

  return {
    // Grid-line colour (also the trend layout's bottom axis line).
    gridLine,
    // Category / value axis — hidden axis line + ticks, faint 10px tick labels.
    axis: {
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: gridLine } },
      axisLabel: { fontSize: 10, fontFamily, color: inkFaint },
    },
    // Tooltip box — elevated surface, strong border, 12px inherited text.
    tooltip: {
      backgroundColor: bgElevated,
      borderColor: borderStrong,
      textStyle: { color: ink, fontFamily, fontSize: 12 },
    },
    // Bottom-centered, square-marker legend.
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: { color: inkMuted, fontFamily, fontSize: 10 },
    },
  };
};

/**
 * Generate Ant Design theme configuration based on current CSS variables
 */
export const getAntdThemeConfig = () => {
  const background = getCSSVariable('--background');
  const foreground = getCSSVariable('--foreground');
  const primary = getCSSVariable('--primary');
  const primaryHover = getCSSVariable('--primary-hover');
  const border = getCSSVariable('--border');
  const muted = getCSSVariable('--muted');
  const mutedForeground = getCSSVariable('--muted-foreground');
  const card = getCSSVariable('--card');
  const input = getCSSVariable('--input');
  const success = getCSSVariable('--success') || getCSSVariable('--secondary');
  const warning = getCSSVariable('--warning') || getCSSVariable('--accent');
  const danger = getCSSVariable('--danger');
  const dangerHover = getCSSVariable('--danger-hover');
  const error = danger || getCSSVariable('--error') || '#ff4d4f';
  const info = getCSSVariable('--info') || primary;
  const textPrimary = getCSSVariable('--text-primary');
  const textSecondary = getCSSVariable('--text-secondary');
  const textTertiary = getCSSVariable('--text-tertiary');

  const fontSans =
    getCSSVariable('--font-sans') ||
    "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";

  return {
    token: {
      // Color
      colorPrimary: primary,
      colorPrimaryHover: primaryHover,
      colorSuccess: success,
      colorWarning: warning,
      colorError: error,
      colorInfo: info,
      colorLink: primary,

      // Background
      colorBgBase: background,
      colorBgContainer: card,
      colorBgElevated: card,
      colorBgLayout: background,
      colorBgSpotlight: muted,

      // Text
      colorText: foreground,
      colorTextSecondary: textSecondary || mutedForeground,
      colorTextTertiary: textTertiary || mutedForeground,
      colorTextQuaternary: textTertiary || mutedForeground,
      colorTextPlaceholder: mutedForeground,

      // Border
      colorBorder: border,
      colorBorderSecondary: border,

      // Border radius — NOC aesthetic: sharp edges, but 2px on tiny controls
      // keeps antd's visual polish on chips/inputs.
      borderRadius: 2,
      borderRadiusLG: 2,
      borderRadiusSM: 2,
      borderRadiusXS: 0,

      // Font
      fontFamily: fontSans,
      fontFamilyCode: fontSans,
      fontSize: 13,
      fontSizeHeading1: 32,
      fontSizeHeading2: 24,
      fontSizeHeading3: 19,
      fontSizeHeading4: 16,
      fontSizeHeading5: 14,

      // Line height
      lineHeight: 1.5,
      lineHeightHeading1: 1.2,
      lineHeightHeading2: 1.3,
      lineHeightHeading3: 1.35,
      lineHeightHeading4: 1.4,
      lineHeightHeading5: 1.5,
    },
    components: {
      Button: {
        colorPrimary: primary,
        colorPrimaryHover: primaryHover,
        // Pin antd's built-in danger button (e.g. Popconfirm's okButtonProps:{danger:true})
        // to the theme's --danger / --danger-hover so hover stays red, not blue.
        colorError: danger || error,
        colorErrorHover: dangerHover || error,
        // Default-variant buttons (Popconfirm Cancel, "Back" etc). Antd's
        // out-of-the-box derivation flips text & border to colorPrimaryHover on
        // hover (= blue) and uses colorBgContainer (= card) for the bg, which
        // blends into the Popconfirm popover. Pin them to the theme tokens so
        // they stay visible and don't flash blue.
        defaultBg: muted,
        defaultColor: foreground,
        defaultBorderColor: border,
        defaultHoverBg: card,
        defaultHoverColor: foreground,
        defaultHoverBorderColor: primary,
        defaultActiveBg: card,
        defaultActiveColor: foreground,
        defaultActiveBorderColor: primary,
        algorithm: true,
      },
      Input: {
        colorBgContainer: input,
        colorBorder: border,
        colorText: foreground,
        colorTextPlaceholder: mutedForeground,
        activeBorderColor: primary,
        hoverBorderColor: primary,
        // Password visibility-toggle (eye) icon — antd styles it via colorIcon /
        // colorIconHover. Pin them so the icon stays foreground-light on dark
        // surfaces instead of fading into the input bg.
        colorIcon: foreground,
        colorIconHover: primary,
        algorithm: true,
      },
      Select: {
        colorBgContainer: input,
        colorBgElevated: card,
        colorText: foreground,
        colorTextPlaceholder: mutedForeground,
        colorBorder: border,
        // Dropdown-arrow colour (antd styles `.ant-select-suffix` with
        // colorTextQuaternary). Pinned here so `algorithm: true` can't re-derive
        // it into a near-invisible shade on dark themes.
        colorTextQuaternary: mutedForeground,
        optionSelectedBg: muted,
        optionActiveBg: muted,
        algorithm: true,
      },
      Slider: {
        // The rail (unfilled line) derives to near-invisible on dark themes —
        // pin it to the theme border / muted-foreground so it always reads.
        railBg: border,
        railHoverBg: mutedForeground,
        trackBg: primary,
        trackHoverBg: primaryHover,
        handleColor: primary,
        handleActiveColor: primaryHover,
        dotBorderColor: border,
        dotActiveBorderColor: primary,
      },
      Tooltip: {
        // Render the tooltip (incl. the Slider value bubble) as the INVERSE of
        // the page so the box + text stay legible in both themes. Scoped to
        // Tooltip so it doesn't flip text colour on antd's solid-bg buttons.
        colorBgSpotlight: foreground,
        colorTextLightSolid: background,
      },
      Card: {
        colorBgContainer: card,
        colorText: foreground,
        colorBorderSecondary: border,
        headerHeight: 28,
        headerHeightSM: 24,
        headerPadding: 10,
        headerPaddingSM: 8,
        bodyPadding: 10,
        bodyPaddingSM: 8,
      },
      Alert: {
        colorSuccessBg: muted,
        colorSuccessBorder: success,
        colorSuccessText: foreground,
        colorInfoBg: muted,
        colorInfoBorder: info,
        colorInfoText: foreground,
        colorWarningBg: muted,
        colorWarningBorder: warning,
        colorWarningText: foreground,
        colorErrorBg: muted,
        colorErrorBorder: error,
        colorErrorText: foreground,
      },
      Tag: {
        defaultBg: primary,
        defaultColor: '#ffffff',
        fontSizeSM: 10,
      },
      Table: {
        colorBgContainer: card,
        headerBg: muted,
        headerColor: mutedForeground,
        colorText: foreground,
        borderColor: border,
        rowHoverBg: muted,
        rowSelectedBg: primary + '22',
        rowSelectedHoverBg: primary + '33',
        cellPaddingBlock: 4,
        cellPaddingInline: 6,
        cellPaddingBlockSM: 4,
        cellPaddingInlineSM: 6,
        headerSplitColor: border,
        fontSize: 12,
      },
      Modal: {
        contentBg: card,
        // Dark title-bar header — defined once here so every modal gets it automatically
        headerBg: foreground,
        titleColor: card,
        titleFontSize: 12,
        titleLineHeight: 1.5,
        // Close icon colour on dark header
        colorIcon: card,
        colorIconHover: primary,
        colorText: foreground,
        // Zero out antd's default outer content-padding; each modal controls its own spacing
        paddingMD: 0,
        paddingContentHorizontalLG: 0,
        paddingContentVerticalLG: 0,
        // Align close-button math (modalHeaderHeight & modalCloseBtnSize in antd's Modal
        // style) with the compact header so the X sits flush in the title bar instead of
        // overflowing into the body.
        padding: 0,
        fontSizeHeading5: 12,
        lineHeightHeading5: 2.3,
        controlHeight: 15,
      },
      Drawer: {
        colorBgElevated: card,
        colorText: foreground,
      },
      Menu: {
        itemBg: card,
        subMenuItemBg: muted,
        itemColor: foreground,
        itemSelectedBg: muted,
        itemSelectedColor: foreground,
        itemHoverBg: muted,
        itemHoverColor: foreground,
      },
      Message: {
        contentBg: card,
      },
      Notification: {
        colorBgElevated: card,
        colorText: foreground,
        colorTextHeading: foreground,
        colorIcon: mutedForeground,
        colorIconHover: primary,
      },
      Tabs: {
        colorBgContainer: card, // background of the tab bar area
        colorText: textTertiary, // default text color for all tab labels
        colorTextHeading: textPrimary, // heading-level text within tab content
        itemColor: textTertiary, // color of inactive tab labels
        itemActiveColor: textPrimary, // color of a tab label while being clicked/pressed
        itemSelectedColor: primary, // color of the currently active/selected tab label
        itemHoverColor: primary, // color of a tab label on mouse hover
        inkBarColor: primary, // color of the animated underline indicator on the active tab
        cardBg: muted, // background of tab items when using card type
        horizontalItemGutter: 16, // gap (px) between tab items in horizontal layout
        horizontalItemPadding: '6px 20px', // padding inside each tab item (vertical horizontal)
        horizontalItemPaddingLG: '2px 0px', // controls --ant-tabs-horizontal-item-padding-lg
        titleFontSize: 11, // font size for tab labels at default size
        titleFontSizeLG: 14, // font size for tab labels at large size
        titleFontSizeSM: 10, // font size for tab labels at small size
      },
    },
  };
};

/**
 * Theme configurations for specific themes (optional overrides)
 */
export const themeConfigs = {
  light: {
    algorithm: undefined, // Use default light algorithm
  },
  dark: {
    algorithm: undefined, // Will be handled by CSS variables
  },
};
