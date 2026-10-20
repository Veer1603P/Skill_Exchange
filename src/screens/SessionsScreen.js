import React, { useState, useCallback, useRef } from 'react';
import { View, FlatList, Pressable, RefreshControl, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import PlanSessionModal from '../components/PlanSessionModal';
import RatingModal from '../components/RatingModal';
import { colors, spacing, radius, fonts } from '../theme';
import { getSessions, getRequests, setSessionStatus, rateSession } from '../api';
import { useAuth } from '../AuthContext';
import { titleCase } from '../utils/format';
import { formatSessionTime, isPast } from '../utils/dates';
import { cancelReminder } from '../utils/reminders';

export default function SessionsScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [rateFor, setRateFor] = useState(null);
  const loadedOnce = useRef(false);

  const load = useCallback(
    async (mode) => {
      if (mode === 'refresh') setRefreshing(true);
      else if (!loadedOnce.current) setLoading(true);
      setError('');
      try {
        const [s, r] = await Promise.all([getSessions(user.id), getRequests(user.id)]);
        setSessions(s);
        setReqs(r);
        loadedOnce.current = true;
      } catch (e) {
        setError('Could not load your sessions.');
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

  const connections = reqs.filter((r) => r.status === 'ACCEPTED' && r.other).map((r) => r.other);
  const upcoming = sessions.filter((s) => s.status === 'SCHEDULED').sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = sessions.filter((s) => s.status !== 'SCHEDULED').sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const data = tab === 'upcoming' ? upcoming : past;

  const openPlan = () => {
    if (connections.length === 0) {
      Alert.alert('No connections yet', 'Get a swap request accepted first, then you can plan a session with that person.');
      return;
    }
    setPlanOpen(true);
  };

  const markDone = async (s) => {
    setBusyId(s.id);
    try {
      await setSessionStatus(s.id, 'COMPLETED');
      await cancelReminder(s.reminderId);
      await load();
      setRateFor({ ...s, status: 'COMPLETED' });
    } catch (e) {
      Alert.alert('Something went wrong', e.message);
    }
    setBusyId(null);
  };

  const cancel = async (s) => {
    setBusyId(s.id);
    try {
      await setSessionStatus(s.id, 'CANCELLED');
      await cancelReminder(s.reminderId);
      await load();
    } catch (e) {
      Alert.alert('Something went wrong', e.message);
    }
    setBusyId(null);
  };

  const confirmCancel = (s) =>
    Alert.alert('Cancel this session?', `${s.other ? s.other.name : 'Your partner'} will see it as cancelled.`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel session', style: 'destructive', onPress: () => cancel(s) },
    ]);

  const submitRating = async (stars, comment) => {
    try {
      await rateSession({ sessionId: rateFor.id, fromUser: user.id, stars, comment });
      setRateFor(null);
      await load();
    } catch (e) {
      Alert.alert('Could not save rating', e.message);
    }
  };

  const renderItem = ({ item }) => {
    const name = item.other ? item.other.name : 'Unknown';
    const overdue = item.status === 'SCHEDULED' && isPast(item.startsAt);
    const badge = overdue ? 'OVERDUE' : item.status;
    const iTeach = item.teacherId === user.id;

    return (
      <Card>
        <View style={styles.top}>
          <Avatar name={name} size={46} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText variant="h3">{titleCase(item.skill)}</AppText>
            <AppText variant="small">with {name}</AppText>
          </View>
          <StatusBadge status={badge} />
        </View>

        <View style={styles.info}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <AppText variant="body" style={styles.infoText}>
            {formatSessionTime(item.startsAt)}
          </AppText>
        </View>
        <View style={styles.info}>
          <Ionicons name="school-outline" size={16} color={colors.teach} />
          <AppText variant="small" style={styles.infoText}>
            {iTeach ? 'You teach in this session' : `${item.teacherName} teaches in this session`}
          </AppText>
        </View>
        {item.status === 'SCHEDULED' && item.reminderId ? (
          <View style={styles.info}>
            <Ionicons name="notifications-outline" size={16} color={colors.accentDark} />
            <AppText variant="small" style={styles.infoText}>
              Reminder set
            </AppText>
          </View>
        ) : null}

        {item.status === 'SCHEDULED' ? (
          <View style={styles.actions}>
            <Button
              title="Mark as done"
              icon="checkmark"
              onPress={() => markDone(item)}
              loading={busyId === item.id}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Cancel"
              variant="danger"
              onPress={() => confirmCancel(item)}
              disabled={busyId === item.id}
              style={{ flex: 1 }}
            />
          </View>
        ) : null}

        {item.status === 'COMPLETED' ? (
          item.myRating ? (
            <View style={styles.rated}>
              <AppText variant="small" style={{ marginRight: 8 }}>
                Your rating
              </AppText>
              <StarRating value={item.myRating.stars} size={18} />
            </View>
          ) : (
            <Button
              title={`Rate ${name}`}
              icon="star-outline"
              variant="accent"
              onPress={() => setRateFor(item)}
              style={{ marginTop: spacing.md }}
            />
          )
        ) : null}
      </Card>
    );
  };

  const addButton = (
    <Pressable onPress={openPlan} style={styles.addBtn} hitSlop={6}>
      <Ionicons name="add" size={26} color="#FFFFFF" />
    </Pressable>
  );

  return (
    <Screen>
      <ScreenHeader title="Sessions" subtitle="Plan, track and rate your skill sessions." right={addButton} />
      <LoadingView loading={loading} error={error} onRetry={() => load()}>
        <View style={styles.segment}>
          {[
            { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { key: 'past', label: 'Past', count: 0 },
          ].map((t) => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.segBtn, tab === t.key && styles.segActive]}>
              <AppText variant="label" style={{ color: tab === t.key ? colors.primary : colors.muted, fontFamily: fonts.semibold }}>
                {t.label}
              </AppText>
              {t.count > 0 ? (
                <View style={styles.count}>
                  <AppText variant="small" style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 11 }}>
                    {t.count}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        <FlatList
          data={data}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.primary} />}
          ListEmptyComponent={
            tab === 'upcoming' ? (
              <EmptyState
                icon="calendar-outline"
                title="No upcoming sessions"
                message="Plan a session with someone you are connected with."
                actionTitle="Plan a session"
                onAction={openPlan}
              />
            ) : (
              <EmptyState icon="time-outline" title="No past sessions" message="Completed and cancelled sessions show up here." />
            )
          }
        />
      </LoadingView>

      <PlanSessionModal
        visible={planOpen}
        onClose={() => setPlanOpen(false)}
        me={user}
        partners={connections}
        initialPartnerId={connections[0] ? connections[0].id : null}
        onCreated={() => {
          setTab('upcoming');
          load();
        }}
      />
      <RatingModal
        visible={!!rateFor}
        onClose={() => setRateFor(null)}
        partnerName={rateFor && rateFor.other ? rateFor.other.name : 'your partner'}
        onSubmit={submitRating}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  segActive: { backgroundColor: colors.surface },
  count: {
    backgroundColor: colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 5,
  },
  info: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  infoText: { marginLeft: 8 },
  actions: { flexDirection: 'row', marginTop: spacing.md },
  rated: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
});
