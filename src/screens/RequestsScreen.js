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
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import PlanSessionModal from '../components/PlanSessionModal';
import { colors, spacing, radius, fonts } from '../theme';
import { getRequests, respondRequest } from '../api';
import { useAuth } from '../AuthContext';
import { overlaps } from '../utils/matchScore';
import { joinSkills } from '../utils/format';

export default function RequestsScreen({ navigation }) {
  const { user, refreshPending } = useAuth();
  const [reqs, setReqs] = useState([]);
  const [tab, setTab] = useState('incoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [planPartner, setPlanPartner] = useState(null);
  const loadedOnce = useRef(false);

  const load = useCallback(
    async (mode) => {
      if (mode === 'refresh') setRefreshing(true);
      else if (!loadedOnce.current) setLoading(true);
      setError('');
      try {
        setReqs(await getRequests(user.id));
        loadedOnce.current = true;
        refreshPending();
      } catch (e) {
        setError('Could not load your requests.');
      }
      setLoading(false);
      setRefreshing(false);
    },
    [user, refreshPending]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const respond = async (id, status) => {
    setBusyId(id);
    try {
      await respondRequest(id, status);
      await load();
    } catch (e) {
      Alert.alert('Something went wrong', e.message);
    }
    setBusyId(null);
  };

  const confirmDecline = (item) =>
    Alert.alert('Decline this request?', `${item.other ? item.other.name : 'This person'} will see it as declined.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => respond(item.id, 'REJECTED') },
    ]);

  const incoming = reqs.filter((r) => r.toUser === user.id);
  const sent = reqs.filter((r) => r.fromUser === user.id);
  const pendingIn = incoming.filter((r) => r.status === 'PENDING').length;
  const data = tab === 'incoming' ? incoming : sent;

  const renderItem = ({ item }) => {
    const other = item.other;
    const name = other ? other.name : 'Unknown';
    const isIncoming = item.toUser === user.id;
    const ov = other ? overlaps(user, other) : { theyTeach: [], theyWant: [] };

    return (
      <Card>
        <View style={styles.top}>
          <Avatar name={name} size={46} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText variant="h3">{name}</AppText>
            <AppText variant="small">{isIncoming ? 'wants to swap skills with you' : 'You sent a request'}</AppText>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {item.status === 'ACCEPTED' ? (
          <View style={styles.connected}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="h3" style={{ color: colors.success, fontSize: 14 }}>
                Connected with {name}
              </AppText>
              <AppText variant="small" style={{ color: colors.ink, marginTop: 2 }}>
                You teach {name}: {joinSkills(ov.theyWant) || '-'}
              </AppText>
              <AppText variant="small" style={{ color: colors.ink }}>
                {name} teaches you: {joinSkills(ov.theyTeach) || '-'}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.swapInfo}>
            <AppText variant="small">
              {name} teaches you: <AppText variant="small" style={styles.strong}>{joinSkills(ov.theyTeach) || '-'}</AppText>
            </AppText>
            <AppText variant="small">
              You teach {name}: <AppText variant="small" style={styles.strong}>{joinSkills(ov.theyWant) || '-'}</AppText>
            </AppText>
          </View>
        )}

        {item.status === 'ACCEPTED' && other ? (
          <Button
            title="Plan a session"
            icon="calendar-outline"
            variant="secondary"
            onPress={() => setPlanPartner(other)}
            style={{ marginTop: spacing.md }}
          />
        ) : null}

        {isIncoming && item.status === 'PENDING' ? (
          <View style={styles.actions}>
            <Button
              title="Accept"
              icon="checkmark"
              onPress={() => respond(item.id, 'ACCEPTED')}
              loading={busyId === item.id}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Decline"
              variant="danger"
              onPress={() => confirmDecline(item)}
              disabled={busyId === item.id}
              style={{ flex: 1 }}
            />
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Requests" subtitle="Swap requests you received and sent." />
      <LoadingView loading={loading} error={error} onRetry={() => load()}>
        <View style={styles.segment}>
          {[
            { key: 'incoming', label: 'Incoming', count: pendingIn },
            { key: 'sent', label: 'Sent', count: 0 },
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
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.primary} />}
          ListEmptyComponent={
            tab === 'incoming' ? (
              <EmptyState icon="mail-open-outline" title="No incoming requests" message="When someone wants to swap skills with you, it will show up here." />
            ) : (
              <EmptyState icon="paper-plane-outline" title="No requests sent" message="Open Matches and tap Request exchange to start a swap." />
            )
          }
        />
      </LoadingView>

      <PlanSessionModal
        visible={!!planPartner}
        onClose={() => setPlanPartner(null)}
        me={user}
        partners={planPartner ? [planPartner] : []}
        initialPartnerId={planPartner ? planPartner.id : null}
        onCreated={() => navigation.navigate('Sessions')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
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
  swapInfo: { marginTop: spacing.md },
  strong: { color: colors.ink, fontFamily: fonts.medium },
  connected: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  actions: { flexDirection: 'row', marginTop: spacing.md },
});
