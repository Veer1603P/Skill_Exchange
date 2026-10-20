import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius } from '../theme';

const MAP = {
  PENDING: { label: 'Pending', bg: colors.accentSoft, fg: colors.accentDark, icon: 'time-outline' },
  ACCEPTED: { label: 'Accepted', bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle-outline' },
  REJECTED: { label: 'Declined', bg: colors.dangerSoft, fg: colors.danger, icon: 'close-circle-outline' },
  SCHEDULED: { label: 'Scheduled', bg: colors.primarySoft, fg: colors.primary, icon: 'calendar-outline' },
  OVERDUE: { label: 'Time passed', bg: colors.accentSoft, fg: colors.accentDark, icon: 'alarm-outline' },
  COMPLETED: { label: 'Completed', bg: colors.successSoft, fg: colors.success, icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelled', bg: colors.dangerSoft, fg: colors.danger, icon: 'close-circle-outline' },
};

export default function StatusBadge({ status }) {
  const m = MAP[status] || MAP.PENDING;
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }]}>
      <Ionicons name={m.icon} size={14} color={m.fg} style={{ marginRight: 4 }} />
      <AppText variant="label" style={{ color: m.fg }}>
        {m.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
