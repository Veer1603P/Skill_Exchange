import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// 5 stars. Pass onChange to make it tappable, leave it out for a read-only display.
export default function StarRating({ value = 0, onChange, size = 28 }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={filled ? colors.accent : '#D1D5DB'} />;
        return onChange ? (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={4} style={{ marginRight: 4 }}>
            {star}
          </Pressable>
        ) : (
          <View key={n} style={{ marginRight: 2 }}>
            {star}
          </View>
        );
      })}
    </View>
  );
}
