import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, fonts, radius } from '../theme';
import { badgeFor, formatAvg } from '../utils/reputation';

// "4.7 (3)" with a star, plus a badge such as Trusted Teacher when earned.
export default function Reputation({ rating, style }) {
  const r = rating || { avg: 0, count: 0 };
  const badge = badgeFor(r);
  const has = r.count > 0;
  return (
    <View style={[styles.row, style]}>
      <Ionicons name={has ? 'star' : 'star-outline'} size={14} color={has ? colors.accent : colors.muted} />
      <AppText variant="label" style={{ marginLeft: 4, color: has ? colors.ink : colors.muted, marginRight: 8 }}>
        {has ? `${formatAvg(r.avg)} (${r.count})` : 'No ratings yet'}
      </AppText>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.icon} size={12} color={badge.fg} />
          <AppText variant="small" style={{ color: badge.fg, marginLeft: 4, fontFamily: fonts.semibold }}>
            {badge.label}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
