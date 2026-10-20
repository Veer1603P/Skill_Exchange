import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import Button from './Button';
import { colors, spacing } from '../theme';

// Shows a spinner while loading, an error with a Retry button on failure, otherwise the content.
export default function LoadingView({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="small" style={{ marginTop: spacing.md }}>
          Loading...
        </AppText>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={44} color={colors.muted} />
        <AppText variant="body" style={styles.msg}>
          {error}
        </AppText>
        <Button title="Try again" onPress={onRetry} variant="secondary" icon="refresh-outline" />
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  msg: { textAlign: 'center', marginVertical: spacing.md },
});
