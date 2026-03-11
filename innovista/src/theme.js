export const theme = {
  colors: {
    primary: '#3B82F6', // Neon Blue
    accent: '#10B981', // Neon Green
    warning: '#F59E0B', // Neon Amber
    alert: '#EF4444', // Neon Red
    background: '#000000', // Pure Black
    surface: '#0F0F0F', // Very Dark Grey
    surfaceElevated: '#1A1A1A', // Elevated surface
    text: '#FFFFFF', // Pure White
    textSecondary: '#A1A1AA', // Zinc 400
    border: '#27272A', // Zinc 800
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: '#3B82F6', // Neon glow effect for central interaction components
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
