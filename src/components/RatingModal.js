import React, { useState, useEffect } from 'react';
import { Modal, View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import AppText from './AppText';
import Button from './Button';
import Input from './Input';
import StarRating from './StarRating';
import { colors, spacing } from '../theme';
import { STAR_WORDS } from '../utils/reputation';

// Bottom sheet where you give 1 to 5 stars (and an optional comment) after a session.
export default function RatingModal({ visible, onClose, partnerName, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setStars(0);
      setComment('');
      setSaving(false);
    }
  }, [visible]);

  const submit = async () => {
    setSaving(true);
    try {
      await onSubmit(stars, comment);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <AppText variant="h2" style={{ textAlign: 'center' }}>
            Rate your session
          </AppText>
          <AppText variant="small" style={styles.sub}>
            How was your session with {partnerName}?
          </AppText>

          <View style={{ alignItems: 'center', marginVertical: spacing.lg }}>
            <StarRating value={stars} onChange={setStars} size={40} />
            <AppText variant="label" style={{ marginTop: spacing.sm, color: colors.primary, minHeight: 20 }}>
              {stars > 0 ? STAR_WORDS[stars - 1] : ''}
            </AppText>
          </View>

          <Input
            placeholder="Add a comment (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={140}
          />

          <Button title="Submit rating" onPress={submit} loading={saving} disabled={stars === 0} />
          <Button title="Not now" variant="ghost" onPress={onClose} style={{ marginTop: spacing.sm }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,24,39,0.45)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sub: { textAlign: 'center', marginTop: 4 },
});
