import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius, fonts } from '../theme';

// Text field with optional label, left icon, inline error and show/hide password toggle.
export default function Input({ label, error, icon, secureTextEntry, multiline, style, ...props }) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMulti,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={styles.icon} /> : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={hidden}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="small" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  fieldMulti: { alignItems: 'flex-start' },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 10,
  },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  error: { color: colors.danger, marginTop: 4 },
});
