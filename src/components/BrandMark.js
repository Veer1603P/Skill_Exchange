import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// App logo: a rounded indigo square with a two-way exchange arrow in amber.
export default function BrandMark({ size = 64 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="swap-horizontal" size={size * 0.58} color={colors.accent} />
    </View>
  );
}
