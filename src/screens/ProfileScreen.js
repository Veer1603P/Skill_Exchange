import React, { useState, useCallback } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import { colors, spacing, radius, fonts } from '../theme';
import { updateProfile, resetDemoData, getProfileStats } from '../api';
import { useAuth } from '../AuthContext';
import { badgeFor, formatAvg } from '../utils/reputation';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ rating: { avg: 0, count: 0 }, reviews: [], sessionsDone: 0 });

  useFocusEffect(
    useCallback(() => {
      getProfileStats(user.id)
        .then(setStats)
        .catch(() => {});
    }, [user.id])
  );

  const dirty = name.trim() !== user.name || bio.trim() !== (user.bio || '');
  const badge = badgeFor(stats.rating);

  const onSave = async () => {
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      setUser(await updateProfile(user.id, { name, bio }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      Alert.alert('Could not save', e.message);
    }
    setSaving(false);
  };

  const onReset = () =>
    Alert.alert(
      'Reset app data?',
      'This restores the starting users and clears all requests, sessions, ratings and accounts you created. You will be logged out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDemoData();
            setUser(null);
          },
        },
      ]
    );

  return (
    <Screen scroll>
      <ScreenHeader title="Profile" />

      <Card style={{ alignItems: 'center' }}>
        <Avatar name={user.name} size={84} />
        <AppText variant="h2" style={{ marginTop: spacing.md }}>
          {user.name}
        </AppText>
        <AppText variant="small">{user.email}</AppText>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.teachSoft }]}>
            <AppText style={[styles.statNum, { color: colors.teach }]}>{user.teach.length}</AppText>
            <AppText variant="small" style={{ color: colors.teach }}>
              Teaching
            </AppText>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.accentSoft }]}>
            <AppText style={[styles.statNum, { color: colors.accentDark }]}>{user.learn.length}</AppText>
            <AppText variant="small" style={{ color: colors.accentDark }}>
              Learning
            </AppText>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
            <AppText style={[styles.statNum, { color: colors.primary }]}>{stats.sessionsDone}</AppText>
            <AppText variant="small" style={{ color: colors.primary }}>
              Sessions
            </AppText>
          </View>
        </View>
      </Card>

      <Card>
        <AppText variant="h3" style={{ marginBottom: spacing.md }}>
          Reputation
        </AppText>
        <View style={styles.repRow}>
          <AppText style={styles.repNum}>{stats.rating.count ? formatAvg(stats.rating.avg) : '-'}</AppText>
          <View style={{ marginLeft: spacing.md }}>
            <StarRating value={Math.round(stats.rating.avg)} size={20} />
            <AppText variant="small" style={{ marginTop: 2 }}>
              {stats.rating.count} {stats.rating.count === 1 ? 'rating' : 'ratings'}
            </AppText>
          </View>
        </View>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={14} color={badge.fg} />
            <AppText variant="label" style={{ color: badge.fg, marginLeft: 6, fontFamily: fonts.semibold }}>
              {badge.label}
            </AppText>
          </View>
        ) : (
          <AppText variant="small" style={{ marginTop: spacing.md }}>
            Complete sessions and get rated to earn a badge.
          </AppText>
        )}

        {stats.reviews.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.review}>
            <StarRating value={r.stars} size={14} />
            <AppText variant="body" style={{ marginTop: 4 }}>
              {r.comment}
            </AppText>
            <AppText variant="small">{r.fromName}</AppText>
          </View>
        ))}
      </Card>

      <Card>
        <Input label="Name" icon="person-outline" value={name} onChangeText={setName} error={nameError} />
        <Input
          label="Short bio"
          placeholder="Tell people a little about yourself"
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={140}
        />
        <Button
          title={saved ? 'Saved' : 'Save changes'}
          icon={saved ? 'checkmark' : undefined}
          onPress={onSave}
          loading={saving}
          disabled={!dirty}
        />
      </Card>

      <Button title="Reset app data" variant="ghost" icon="refresh-outline" onPress={onReset} style={{ marginBottom: spacing.sm }} />
      <Button title="Log out" variant="danger" icon="log-out-outline" onPress={() => setUser(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', marginTop: spacing.lg, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: 4,
  },
  statNum: { fontFamily: fonts.bold, fontSize: 22 },
  repRow: { flexDirection: 'row', alignItems: 'center' },
  repNum: { fontFamily: fonts.bold, fontSize: 34, color: colors.ink },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  review: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
});
