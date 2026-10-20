import { colors } from '../theme';

// Badge earned from the ratings a person has received
export const badgeFor = ({ avg, count }) => {
  if (count >= 3 && avg >= 4.5) {
    return { label: 'Trusted Teacher', icon: 'ribbon', bg: colors.successSoft, fg: colors.success };
  }
  if (count >= 1 && avg >= 4) {
    return { label: 'Rising Star', icon: 'star', bg: colors.accentSoft, fg: colors.accentDark };
  }
  return null;
};

export const formatAvg = (avg) => (avg ? avg.toFixed(1) : '0.0');

export const STAR_WORDS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
