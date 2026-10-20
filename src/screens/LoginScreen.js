import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import BrandMark from '../components/BrandMark';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, fonts, spacing } from '../theme';
import { login } from '../api';
import { useAuth } from '../AuthContext';
import { validateLogin } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const onLogin = async () => {
    const e = validateLogin({ email, password });
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      setUser(await login(email.trim(), password));
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.brand}>
        <BrandMark size={72} />
        <AppText variant="h1" style={styles.title}>
          Skill Exchange
        </AppText>
        <AppText variant="small" style={styles.tagline}>
          Teach what you know. Learn what you don't.
        </AppText>
      </View>

      <Input
        label="Email"
        icon="mail-outline"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        label="Password"
        icon="lock-closed-outline"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      {formError ? (
        <AppText variant="small" style={styles.formError}>
          {formError}
        </AppText>
      ) : null}

      <Button title="Log in" onPress={onLogin} loading={loading} />

      <AppText variant="body" style={styles.link} onPress={() => navigation.navigate('Register')}>
        New here?{' '}
        <AppText variant="body" style={{ color: colors.primary, fontFamily: fonts.semibold }}>
          Create an account
        </AppText>
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  title: { marginTop: spacing.md },
  tagline: { marginTop: 4 },
  formError: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
  link: { textAlign: 'center', marginTop: spacing.lg },
});
