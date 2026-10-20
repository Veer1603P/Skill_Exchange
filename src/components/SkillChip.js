import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius } from '../theme';
import { titleCase } from '../utils/format';

const KINDS = {
  teach: { bg: colors.teachSoft, fg: colors.teach },
  learn: { bg: colors.accentSoft, fg: colors.accentDark },
  neutral: { bg: colors.primarySoft, fg: colors.primary },
};

// kind: 'teach' (teal) | 'learn' (amber) | 'neutral' (indigo)
export default function SkillChip({ label, kind = 'neutral', onRemove, onPress, icon }) {
  const k = KINDS[kind];
  const chip = (
    <View style={[styles.chip, { backgroundColor: k.bg }]}>
      {icon ? <Ionicons name={icon} size={14} color={k.fg} style={{ marginRight: 4 }} /> : null}
      <AppText variant="label" style={{ color: k.fg }}>
        {titleCase(label)}
      </AppText>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={14} color={k.fg} style={{ marginLeft: 6 }} />
        </Pressable>
      ) : null}
    </View>
  );
  if (!onPress) return chip;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {chip}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginRight: 8,
    marginBottom: 8,
  },
});
