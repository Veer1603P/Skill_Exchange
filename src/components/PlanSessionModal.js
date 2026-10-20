import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, ScrollView, Pressable, Switch, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import Button from './Button';
import OptionPills from './OptionPills';
import { colors, spacing } from '../theme';
import { createSession, setSessionReminder } from '../api';
import { teachesMe } from '../utils/matchScore';
import { titleCase } from '../utils/format';
import { nextDays, TIME_SLOTS, slotDate, formatSessionTime } from '../utils/dates';
import { scheduleSessionReminder, reminderTime, REMINDER_MINUTES } from '../utils/reminders';

// Bottom sheet to plan a session: pick a person, a skill, a day and a time, with an optional reminder.
export default function PlanSessionModal({ visible, onClose, me, partners, initialPartnerId, onCreated }) {
  const days = useMemo(() => nextDays(7), [visible]);
  const [partnerId, setPartnerId] = useState(null);
  const [topicKey, setTopicKey] = useState(null);
  const [dayKey, setDayKey] = useState('0');
  const [slotKey, setSlotKey] = useState(null);
  const [remind, setRemind] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPartnerId(initialPartnerId || (partners[0] ? partners[0].id : null));
      setTopicKey(null);
      setDayKey('0');
      setSlotKey(null);
      setRemind(true);
      setSaving(false);
      setError('');
    }
  }, [visible]);

  const partner = partners.find((p) => p.id === partnerId) || null;

  // The skills these two people can swap right now (levels respected)
  const topics = useMemo(() => {
    if (!partner) return [];
    return [
      ...teachesMe(me, partner).map((t) => ({
        key: `${t.name}|${partner.id}`,
        label: `${titleCase(t.name)} (${partner.name} teaches)`,
        skill: t.name,
        teacherId: partner.id,
      })),
      ...teachesMe(partner, me).map((t) => ({
        key: `${t.name}|${me.id}`,
        label: `${titleCase(t.name)} (you teach)`,
        skill: t.name,
        teacherId: me.id,
      })),
    ];
  }, [me, partner]);

  const day = days.find((d) => d.key === dayKey) || days[0];
  const slotOptions = TIME_SLOTS.map((s) => ({
    key: s.key,
    label: s.label,
    disabled: slotDate(day, s).getTime() <= Date.now(),
  }));

  const submit = async () => {
    const topic = topics.find((t) => t.key === topicKey);
    const slot = TIME_SLOTS.find((s) => s.key === slotKey);
    if (!partner || !topic || !slot) {
      setError('Choose a skill, a day and a time.');
      return;
    }
    const start = slotDate(day, slot);
    if (start.getTime() <= Date.now()) {
      setError('Pick a time in the future.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const s = await createSession({
        creatorId: me.id,
        partnerId: partner.id,
        skill: topic.skill,
        teacherId: topic.teacherId,
        startsAt: start.toISOString(),
      });
      let note = '';
      if (remind) {
        const at = reminderTime(s.startsAt);
        if (at) {
          const res = await scheduleSessionReminder({
            title: 'Skill session coming up',
            body: `${titleCase(topic.skill)} with ${partner.name}, ${formatSessionTime(s.startsAt)}`,
            date: at,
          });
          if (res.ok) await setSessionReminder(s.id, res.id);
          else note = '\n\nThe reminder could not be set. Check that notifications are allowed for this app.';
        }
      }
      setSaving(false);
      if (onCreated) onCreated();
      onClose();
      Alert.alert('Session planned', `${titleCase(topic.skill)} with ${partner.name}\n${formatSessionTime(s.startsAt)}${note}`);
    } catch (e) {
      setSaving(false);
      setError(e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText variant="h2">Plan a session</AppText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {partners.length > 1 ? (
              <>
                <AppText variant="label" style={styles.label}>
                  With
                </AppText>
                <OptionPills
                  options={partners.map((p) => ({ key: p.id, label: p.name }))}
                  value={partnerId}
                  onChange={(k) => {
                    setPartnerId(k);
                    setTopicKey(null);
                  }}
                />
              </>
            ) : partner ? (
              <AppText variant="body" style={{ marginBottom: spacing.sm }}>
                Session with {partner.name}
              </AppText>
            ) : null}

            <AppText variant="label" style={styles.label}>
              What will you work on?
            </AppText>
            {topics.length === 0 ? (
              <AppText variant="small" style={{ marginBottom: spacing.md }}>
                There is no skill swap between you two right now. Check your skill levels on the My Skills screen.
              </AppText>
            ) : (
              <OptionPills options={topics} value={topicKey} onChange={setTopicKey} />
            )}

            <AppText variant="label" style={styles.label}>
              Day
            </AppText>
            <OptionPills
              options={days.map((d) => ({ key: d.key, label: d.label }))}
              value={dayKey}
              onChange={(k) => {
                setDayKey(k);
                setSlotKey(null);
              }}
            />

            <AppText variant="label" style={styles.label}>
              Time
            </AppText>
            <OptionPills options={slotOptions} value={slotKey} onChange={setSlotKey} />

            <View style={styles.remindRow}>
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <AppText variant="h3" style={{ fontSize: 14 }}>
                  Remind me
                </AppText>
                <AppText variant="small">{REMINDER_MINUTES} minutes before the session</AppText>
              </View>
              <Switch
                value={remind}
                onValueChange={setRemind}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {error ? (
              <AppText variant="small" style={{ color: colors.danger, marginBottom: spacing.sm }}>
                {error}
              </AppText>
            ) : null}

            <Button title="Plan session" icon="calendar-outline" onPress={submit} loading={saving} disabled={topics.length === 0} />
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '88%',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  label: { marginTop: spacing.sm, marginBottom: spacing.sm },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingVertical: spacing.sm,
  },
});
