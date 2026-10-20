import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, spacing } from '../theme';
import { register } from '../api';
import { useAuth } from '../AuthContext';
import { validateRegister } from '../utils/validation';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', teach: '', learn: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const set = (key) => (value) => setForm({ ...form, [key]: value });

  const onRegister = async () => {
    const e = validateRegister(form);
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      setUser(
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          teach: form.teach.split(','),
          learn: form.learn.split(','),
        })
      );
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <Screen scroll edges={[]}>
      <AppText variant="small" style={styles.intro}>
        Tell us who you are and what you want to swap. You can set your skill levels later in My Skills.
      </AppText>

      <Input label="Name" icon="person-outline" value={form.name} onChangeText={set('name')} error={errors.name} />
      <Input
        label="Email"
        icon="mail-outline"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={set('email')}
        error={errors.email}
      />
      <Input
        label="Password"
        icon="lock-closed-outline"
        placeholder="At least 4 characters"
        secureTextEntry
        value={form.password}
        onChangeText={set('password')}
        error={errors.password}
      />
      <Input
        label="Skills I can teach"
        icon="school-outline"
        value={form.teach}
        onChangeText={set('teach')}
        error={errors.teach}
      />
      <Input
        label="Skills I want to learn"
        icon="bulb-outline"
        value={form.learn}
        onChangeText={set('learn')}
        error={errors.learn}
      />
      <AppText variant="small" style={styles.hint}>
        Separate skills with commas.
      </AppText>

      {formError ? (
        <AppText variant="small" style={styles.formError}>
          {formError}
        </AppText>
      ) : null}

      <Button title="Create account" onPress={onRegister} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing.lg, lineHeight: 18 },
  hint: { marginTop: -6, marginBottom: spacing.md },
  formError: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
});
