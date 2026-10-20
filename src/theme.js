// Design tokens for the whole app. Change a colour here and it changes everywhere.
export const colors = {
  primary: '#4338CA',
  primaryDark: '#312E81',
  primarySoft: '#E0E7FF',
  accent: '#F59E0B',
  accentSoft: '#FEF3C7',
  accentDark: '#B45309',
  teach: '#0F766E',
  teachSoft: '#CCFBF1',
  bg: '#F6F5FF',
  surface: '#FFFFFF',
  ink: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#15803D',
  successSoft: '#DCFCE7',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 18, pill: 999 };

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const shadow = {
  card: {
    shadowColor: '#312E81',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export const type = {
  h1: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  h2: { fontFamily: fonts.semibold, fontSize: 20, color: colors.ink },
  h3: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
};
