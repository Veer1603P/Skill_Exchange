import React from 'react';
import { Text } from 'react-native';
import { type } from '../theme';

// Text with the app font and a named style: h1, h2, h3, body, small, label
export default function AppText({ variant = 'body', style, children, ...props }) {
  return (
    <Text {...props} style={[type[variant], style]}>
      {children}
    </Text>
  );
}
