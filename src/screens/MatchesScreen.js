import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, RefreshControl, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import SkillChip from '../components/SkillChip';
import StatusBadge from '../components/StatusBadge';
import Reputation from '../components/Reputation';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import { colors, spacing, radius } from '../theme';
import { LEVEL_SHORT } from '../constants';
import { getMatches, getRequests, sendRequest } from '../api';
import { useAuth } from '../AuthContext';
import { overlaps, matchScore, relationWith } from '../utils/matchScore';

export default function MatchesScreen({ navigation }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const loadedOnce = useRef(false);

  const load = useCallback(
    async (mode) => {
      if (mode === 'refresh') setRefreshing(true);
      else if (!loadedOnce.current) setLoading(true);
      setError('');
      try {
        const [m, r] = await Promise.all([getMatches(user.id), getRequests(user.id)]);
        setMatches(m);
        setRequests(r);
        loadedOnce.current = true;
      } catch (e) {
        setError('Could not load your matches.');
      }
      setLoading(false);
      setRefreshing(false);
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Best match first; ties are broken by the person's rating
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches
      .map((m) => ({
        ...m,
        ...overlaps(user, m),
        score: matchScore(user, m),
        rel: relationWith(requests, user.id, m.id),
      }))
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.teach.some((s) => s.name.includes(q)) ||
          m.learn.some((s) => s.name.includes(q))
      )
      .sort((a, b) => b.score - a.score || (b.rating ? b.rating.avg : 0) - (a.rating ? a.rating.avg : 0));
  }, [matches, requests, query, user]);

  const request = async (m) => {
    setSendingId(m.id);
    try {
      await sendRequest(user.id, m.id);
      await load();
    } catch (e) {
      Alert.alert('Could not send request', e.message);
    }
    setSendingId(null);
  };

  const needsSkills = user.teach.length === 0 || user.learn.length === 0;

  const empty = needsSkills ? (
    <EmptyState
      icon="construct-outline"
      title="Add your skills first"
      message="Matches need at least one skill you can teach and one you want to learn."
      actionTitle="Go to My Skills"
      onAction={() => navigation.navigate('My Skills')}
    />
  ) : matches.length === 0 ? (
    <EmptyState
      icon="people-outline"
      title="No matches yet"
      message="Nobody fits both ways yet. A match needs someone who teaches what you want at a level above yours, and who wants what you teach. Try adding skills or changing levels."
      actionTitle="Update my skills"
      onAction={() => navigation.navigate('My Skills')}
    />
  ) : (
    <EmptyState icon="search-outline" title="No results" message={`Nothing matches "${query}".`} />
  );

  const renderAction = (m) => {
    if (!m.rel) {
      return (
        <Button
          title="Request exchange"
          icon="paper-plane-outline"
          onPress={() => request(m)}
          loading={sendingId === m.id}
        />
      );
    }
    if (m.rel.status === 'ACCEPTED') {
      return (
        <View style={styles.statusRow}>
          <StatusBadge status="ACCEPTED" />
          <AppText variant="small" style={{ marginLeft: 8 }}>
            You are connected
          </AppText>
        </View>
      );
    }
    if (m.rel.fromUser === user.id) {
      return (
        <View style={styles.statusRow}>
          <StatusBadge status="PENDING" />
          <AppText variant="small" style={{ marginLeft: 8 }}>
            Waiting for {m.name} to respond
          </AppText>
        </View>
      );
    }
    return <Button title={`${m.name} requested you. Review`} variant="secondary" onPress={() => navigation.navigate('Requests')} />;
  };

  return (
    <Screen>
      <ScreenHeader title="Matches" subtitle="People who can teach you at your level, and want to learn what you teach." />
      <LoadingView loading={loading} error={error} onRetry={() => load()}>
        {matches.length > 0 ? (
          <Input icon="search-outline" placeholder="Search by name or skill" value={query} onChangeText={setQuery} style={{ marginBottom: 12 }} />
        ) : null}
        <FlatList
          data={items}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={empty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.top}>
                <Avatar name={item.name} size={46} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <AppText variant="h3">{item.name}</AppText>
                  {item.bio ? (
                    <AppText variant="small" numberOfLines={1}>
                      {item.bio}
                    </AppText>
                  ) : null}
                </View>
                <View style={styles.score}>
                  <Ionicons name="flash" size={13} color={colors.accentDark} />
                  <AppText variant="label" style={{ color: colors.accentDark, marginLeft: 3 }}>
                    {item.score} match
                  </AppText>
                </View>
              </View>

              <Reputation rating={item.rating} style={{ marginTop: spacing.sm }} />

              <View style={styles.swap}>
                <View style={styles.col}>
                  <AppText variant="label" style={styles.colTitle}>
                    {item.name} teaches you
                  </AppText>
                  <View style={styles.chips}>
                    {item.theyTeach.map((s) => (
                      <SkillChip key={s.name} label={`${s.name} · ${LEVEL_SHORT[s.teachLevel]}`} kind="teach" />
                    ))}
                  </View>
                </View>
                <View style={styles.swapIcon}>
                  <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                </View>
                <View style={styles.col}>
                  <AppText variant="label" style={styles.colTitle}>
                    You teach {item.name}
                  </AppText>
                  <View style={styles.chips}>
                    {item.theyWant.map((s) => (
                      <SkillChip key={s.name} label={`${s.name} · ${LEVEL_SHORT[s.teachLevel]}`} kind="learn" />
                    ))}
                  </View>
                </View>
              </View>

              {renderAction(item)}
            </Card>
          )}
        />
      </LoadingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  swap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  col: { flex: 1 },
  colTitle: { marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  swapIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginTop: 14,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
});
