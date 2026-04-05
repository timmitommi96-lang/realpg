import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserProfile, saveUserProfile } from '@/src/services/db';
import { useTheme } from '@/src/context/ThemeContext';
import { ChevronLeft, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function NicknameSettings() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const s = isDark ? stylesDark : stylesLight;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getUserProfile();
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert("Fehler", "Bitte gib einen Nickname ein.");
      return;
    }
    if (nickname.length < 2) {
      Alert.alert("Fehler", "Der Nickname muss mindestens 2 Zeichen haben.");
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveUserProfile({ nickname: nickname.trim() });
    Alert.alert("Gespeichert!", "Dein Nickname wurde aktualisiert.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={s.label}>Laden...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.keyboardView}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ChevronLeft color={isDark ? '#F1F5F9' : '#4B4B4B'} size={28} />
          </TouchableOpacity>
          <Text style={s.title}>NICKNAME</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.content}>
          <View style={s.iconContainer}>
            <Crown color="#FF7F24" size={48} />
          </View>
          
          <Text style={s.label}>DEIN NICKNAME</Text>
          <TextInput
            style={s.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Gib deinen Heldennamen ein"
            placeholderTextColor={isDark ? "#64748B" : "#AFAFAF"}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={s.hint}>{nickname.length}/20 Zeichen</Text>

          <TouchableOpacity style={s.saveButton} onPress={handleSave}>
            <Text style={s.saveButtonText}>SPEICHERN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginBottom: 32, borderWidth: 4, borderColor: '#FF7F24' },
  label: { fontSize: 14, fontWeight: '800', color: '#AFAFAF', alignSelf: 'flex-start', marginBottom: 12, letterSpacing: 1 },
  input: { width: '100%', backgroundColor: '#F9F9F9', borderRadius: 16, padding: 18, fontSize: 18, fontWeight: '700', color: '#4B4B4B', borderWidth: 2, borderColor: '#E5E5E5' },
  hint: { fontSize: 12, color: '#AFAFAF', alignSelf: 'flex-start', marginTop: 8, fontWeight: '600' },
  saveButton: { width: '100%', backgroundColor: '#FF7F24', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 40, borderBottomWidth: 5, borderBottomColor: '#CC5500' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' }
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#334155' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2D1B0E', justifyContent: 'center', alignItems: 'center', marginBottom: 32, borderWidth: 4, borderColor: '#FF7F24' },
  label: { fontSize: 14, fontWeight: '800', color: '#94A3B8', alignSelf: 'flex-start', marginBottom: 12, letterSpacing: 1 },
  input: { width: '100%', backgroundColor: '#1E293B', borderRadius: 16, padding: 18, fontSize: 18, fontWeight: '700', color: '#F1F5F9', borderWidth: 2, borderColor: '#334155' },
  hint: { fontSize: 12, color: '#94A3B8', alignSelf: 'flex-start', marginTop: 8, fontWeight: '600' },
  saveButton: { width: '100%', backgroundColor: '#FF7F24', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 40, borderBottomWidth: 5, borderBottomColor: '#CC5500' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' }
});