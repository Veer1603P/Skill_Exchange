import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { colors, radius, fonts } from '../theme';

const TINTS = {
  primary: { solid: colors.primary, soft: colors.primarySoft, fg: colors.primary },
  teach: { solid: colors.teach, soft: colors.teachSoft, fg: colors.teach },
  learn: { solid: colors.accentDark, soft: colors.accentSoft, fg: colors.accentDark },
};

// A row of selectable pills. options = [{ key, label, disabled? }]
export default function OptionPills({ options, value, onChange, tint = 'primary', style }) {
  const t = TINTS[tint];
  return (
    <View style={[styles.row, style]}>
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            disabled={o.disabled}
            onPress={() => onChange(o.key)}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: selected ? t.solid : t.soft,
                opacity: o.disabled ? 0.35 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <AppText variant="label" style={{ color: selected ? '#FFFFFF' : t.fg, fontFamily: fonts.semibold }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginRight: 8,
    marginBottom: 8,
  },
});
