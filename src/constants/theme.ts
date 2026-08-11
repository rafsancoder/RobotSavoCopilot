export type RobotThemeColors = {
    background: string;
    surface: string;
    surfaceSoft: string;
    card: string;
    cardElevated: string;
    border: string;
    borderSubtle: string;
    text: string;
    textMuted: string;
    textDim: string;
    primary: string;
    primaryDim: string;
    success: string;
    warning: string;
    danger: string;
    robotBlue: string;
};

export type RobotTheme = {
    mode: 'dark';
    colors: RobotThemeColors;
};

const darkColors: RobotThemeColors = {
    background: '#050816',
    surface: '#0B1020',
    surfaceSoft: '#111827',
    card: '#0F172A',
    cardElevated: '#162032',
    border: '#1E2A3A',
    borderSubtle: '#141F2E',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    textDim: '#475569',
    primary: '#38BDF8',
    primaryDim: '#0C4A6E',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    robotBlue: '#0EA5E9',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const elevation = {
    card: 4,
    modal: 12,
};

export const getRobotTheme = (): RobotTheme => ({
    mode: 'dark',
    colors: darkColors,
});

// Returns #RRGGBBAA — works on iOS 8+ and Android 5+ (RN 0.63+).
export const withAlpha = (hex: string, alphaHex = '20'): string => {
    if (!hex || hex.length !== 7) return hex;
    return `${hex}${alphaHex}`;
};
