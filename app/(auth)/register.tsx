import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { setUserId, setAccountType } = useAppStore();
  const s = isDark ? stylesDark : stylesLight;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Fehler', 'Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Fehler', 'Passwort muss mindestens 6 Zeichen haben');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://realpg.pages.dev/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setAccountType('cloud');
        router.replace('/(onboarding)/welcome');
      } else {
        Alert.alert('Registrierung fehlgeschlagen', data.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Verbindung fehlgeschlagen. Bitte später erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setAccountType('local');
    setUserId(null);
    router.replace('/(onboarding)/welcome');
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.keyboardView}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ArrowLeft color={isDark ? '#F1F5F9' : '#4B4B4B'} size={24} />
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          <FoxMascot message="Willkommen! Legen wir los." expression="happy" />

          <Text style={s.title}>Registrieren</Text>
          <Text style={s.subtitle}>Erstelle ein Konto für Cloud-Sync</Text>

          <View style={s.form}>
            <View style={s.inputContainer}>
              <Mail color={isDark ? '#94A3B8' : '#AFAFAF'} size={20} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="E-Mail"
                placeholderTextColor={isDark ? '#64748B' : '#AFAFAF'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.inputContainer}>
              <Lock color={isDark ? '#94A3B8' : '#AFAFAF'} size={20} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Passwort"
                placeholderTextColor={isDark ? '#64748B' : '#AFAFAF'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
                {showPassword ? (
                  <EyeOff color={isDark ? '#94A3B8' : '#AFAFAF'} size={20} />
                ) : (
                  <Eye color={isDark ? '#94A3B8' : '#AFAFAF'} size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={s.inputContainer}>
              <Lock color={isDark ? '#94A3B8' : '#AFAFAF'} size={20} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Passwort bestätigen"
                placeholderTextColor={isDark ? '#64748B' : '#AFAFAF'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <CustomButton
              title={loading ? 'Wird erstellt...' : 'Konto erstellen'}
              onPress={handleRegister}
              disabled={loading}
              style={s.registerButton}
            />

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>oder</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity onPress={handleSkip} style={s.localButton}>
              <Text style={s.localButtonText}>Stattdessen lokal fortfahren</Text>
            </TouchableOpacity>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Bereits ein Konto?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={s.loginLink}>Anmelden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  header: { padding: 16, paddingTop: 8 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#AFAFAF', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  form: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5' },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, padding: 16, fontSize: 16, color: '#4B4B4B' },
  eyeButton: { padding: 16 },
  registerButton: { marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { marginHorizontal: 16, color: '#AFAFAF', fontSize: 14 },
  localButton: { padding: 16, alignItems: 'center' },
  localButtonText: { color: '#4B4B4B', fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  footerText: { color: '#AFAFAF', fontSize: 14 },
  loginLink: { color: '#FF7F24', fontSize: 14, fontWeight: '700' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  keyboardView: { flex: 1 },
  header: { padding: 16, paddingTop: 8 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  form: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, padding: 16, fontSize: 16, color: '#F1F5F9' },
  eyeButton: { padding: 16 },
  registerButton: { marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { marginHorizontal: 16, color: '#94A3B8', fontSize: 14 },
  localButton: { padding: 16, alignItems: 'center' },
  localButtonText: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  footerText: { color: '#94A3B8', fontSize: 14 },
  loginLink: { color: '#FF7F24', fontSize: 14, fontWeight: '700' },
});
