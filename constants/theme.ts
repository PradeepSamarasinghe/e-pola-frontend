export const colors = {
  primary: '#059669',
  primaryDark: '#0F6E56',
  primaryLight: '#D1FAE5',
  primaryMuted: '#ECFDF5',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    white: '#FFFFFF',
    green: '#059669',
  },
  category: {
    mint: '#DCFCE7',
    yellow: '#FEF9C3',
    pink: '#FCE7F3',
    peach: '#FED7AA',
    lightGreen: '#D1FAE5',
    lightPink: '#FDE8D8',
  },
  badge: {
    new: '#EF4444',
    newText: '#FFFFFF',
    cart: '#059669',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  shadow: 'rgba(0,0,0,0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    base: 15,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const categoryColors = [
  colors.category.mint,
  colors.category.yellow,
  colors.category.pink,
  colors.category.peach,
  colors.category.lightGreen,
  colors.category.lightPink,
];
