import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { spacing } from '../theme';

export default function ScreenHeader({ title, subtitle, right }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <AppText variant="h1">{title}</AppText>
        {subtitle ? (
          <AppText variant="small" style={styles.sub}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right || null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  sub: { marginTop: 2, lineHeight: 17 },
});
