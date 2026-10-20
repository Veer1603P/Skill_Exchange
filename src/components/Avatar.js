import React from 'react';
import { View, Text } from 'react-native';
import { fonts } from '../theme';

const PALETTE = [
  ['#E0E7FF', '#4338CA'],
  ['#FEF3C7', '#B45309'],
  ['#CCFBF1', '#0F766E'],
  ['#FCE7F3', '#BE185D'],
  ['#DBEAFE', '#1D4ED8'],
];

// Circle with the person's initials. The colour depends on the name, so it stays the same.
export default function Avatar({ name = '?', size = 44 }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => (p[0] ? p[0].toUpperCase() : ''))
      .join('') || '?';
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length;
  const [bg, fg] = PALETTE[idx];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.bold, color: fg, fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}
