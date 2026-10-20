import React, { useState } from 'react';
import { View, Pressable, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import SkillChip from '../components/SkillChip';
import OptionPills from '../components/OptionPills';
import { colors, spacing, radius } from '../theme';
import {
  SUGGESTED_SKILLS,
  TEACH_LEVEL_OPTIONS,
  LEARN_LEVEL_OPTIONS,
  DEFAULT_TEACH_LEVEL,
  DEFAULT_LEARN_LEVEL,
} from '../constants';
import { updateSkills } from '../api';
import { useAuth } from '../AuthContext';
import { titleCase } from '../utils/format';

function SkillSection({ title, subtitle, levelQuestion, icon, kind, list, onAdd, onRemove, onLevel }) {
  const isTeach = kind === 'teach';
  const options = isTeach ? TEACH_LEVEL_OPTIONS : LEARN_LEVEL_OPTIONS;
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [newLevel, setNewLevel] = useState(isTeach ? DEFAULT_TEACH_LEVEL : DEFAULT_LEARN_LEVEL);
  const tint = isTeach ? colors.teach : colors.accentDark;
  const tintBg = isTeach ? colors.teachSoft : colors.accentSoft;
  const suggestions = SUGGESTED_SKILLS.filter((s) => !list.some((x) => x.name === s)).slice(0, 8);

  const add = (raw) => {
    const name = raw.trim().toLowerCase();
    if (!name) return;
    if (list.some((x) => x.name === name)) {
      setMsg(`${titleCase(name)} is already in your list`);
      return;
    }
    setMsg('');
    onAdd(name, newLevel);
    setText('');
  };

  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.iconCircle, { backgroundColor: tintBg }]}>
          <Ionicons name={icon} size={20} color={tint} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{title}</AppText>
          <AppText variant="small">{subtitle}</AppText>
        </View>
      </View>

      {list.length === 0 ? (
        <AppText variant="small">Nothing here yet. Add a skill or tap a suggestion below.</AppText>
      ) : (
        list.map((item) => (
          <View key={item.name} style={styles.skillRow}>
            <View style={styles.skillTop}>
              <AppText variant="h3" style={{ flex: 1 }}>
                {titleCase(item.name)}
              </AppText>
              <Pressable onPress={() => onRemove(item.name)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            </View>
            <OptionPills
              options={options}
              value={item.level}
              onChange={(lvl) => onLevel(item.name, lvl)}
              tint={kind}
              style={{ marginTop: 8 }}
            />
          </View>
        ))
      )}

      <View style={styles.addBox}>
        <AppText variant="label" style={{ marginBottom: 8 }}>
          Add a skill
        </AppText>
        <View style={styles.addRow}>
          <Input
            style={{ flex: 1, marginBottom: 0, marginRight: 8 }}
            value={text}
            onChangeText={(t) => {
              setText(t);
              setMsg('');
            }}
            onSubmitEditing={() => add(text)}
            returnKeyType="done"
          />
          <Button title="Add" onPress={() => add(text)} variant={isTeach ? 'primary' : 'accent'} />
        </View>
        {msg ? (
          <AppText variant="small" style={{ color: colors.danger, marginTop: 6 }}>
            {msg}
          </AppText>
        ) : null}
        <AppText variant="small" style={{ marginTop: spacing.md, marginBottom: 8 }}>
          {levelQuestion}
        </AppText>
        <OptionPills options={options} value={newLevel} onChange={setNewLevel} tint={kind} />
      </View>

      {suggestions.length > 0 ? (
        <View style={{ marginTop: spacing.sm }}>
          <AppText variant="label" style={{ marginBottom: 8 }}>
            Suggestions
          </AppText>
          <View style={styles.chips}>
            {suggestions.map((s) => (
              <SkillChip key={s} label={s} icon="add" onPress={() => add(s)} />
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export default function SkillsScreen() {
  const { user, setUser } = useAuth();

  const save = async (teach, learn) => {
    try {
      setUser(await updateSkills(user.id, teach, learn));
    } catch (e) {
      Alert.alert('Could not save', e.message);
    }
  };

  const setLevel = (list, name, level) => list.map((x) => (x.name === name ? { ...x, level } : x));

  return (
    <Screen scroll>
      <ScreenHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        subtitle="Set a level for every skill. You are matched with people whose level fits yours."
      />
      <SkillSection
        title="I can teach"
        subtitle="Skills you can help others with"
        levelQuestion="How good are you at the skill you add?"
        icon="school-outline"
        kind="teach"
        list={user.teach}
        onAdd={(name, level) => save([...user.teach, { name, level }], user.learn)}
        onRemove={(name) => save(user.teach.filter((x) => x.name !== name), user.learn)}
        onLevel={(name, level) => save(setLevel(user.teach, name, level), user.learn)}
      />
      <SkillSection
        title="I want to learn"
        subtitle="Skills you would like to pick up"
        levelQuestion="Where are you with the skill you add?"
        icon="bulb-outline"
        kind="learn"
        list={user.learn}
        onAdd={(name, level) => save(user.teach, [...user.learn, { name, level }])}
        onRemove={(name) => save(user.teach, user.learn.filter((x) => x.name !== name))}
        onLevel={(name, level) => save(user.teach, setLevel(user.learn, name, level))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  skillRow: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  skillTop: { flexDirection: 'row', alignItems: 'center' },
  addBox: { marginTop: spacing.md },
  addRow: { flexDirection: 'row', alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
