import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';
import { useRouter } from 'expo-router';
import { Sparkles, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AISetupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { aiMode, setAIMode } = useAppStore();
  const s = isDark ? stylesDark : stylesLight;

  const handleUseCloudAI = useCallback(() => {
    setAIMode('cloud');
    router.replace('/(tabs)');
  }, [setAIMode, router]);

  const handleSkipAI = useCallback(() => {
    setAIMode('off');
    router.replace('/(tabs)');
  }, [setAIMode, router]);

  useEffect(() => {
    if (aiMode === 'cloud') {
      router.replace('/(tabs)');
    } else if (aiMode === 'off') {
      router.replace('/(tabs)');
    }
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <FoxMascot
          message="Ich kann dir mit KI-Quests helfen! Soll ich den Cloud-Assistenten aktivieren?"
          expression="happy"
        />
        <Text style={s.title}>KI-Assistent</Text>
        <Text style={s.subtitle}>
          Der Cloud-KI-Assistent hilft dir beim Erstellen und Prüfen von Quests.
          Du benötigst dafür eine Internetverbindung.
        </Text>

        <View style={s.card}>
          <TouchableOpacity style={s.optionCard} onPress={handleUseCloudAI}>
            <View style={s.optionIconRow}>
              <View style={s.optionIconPurple}>
                <Sparkles color="#9B59B6" size={28} />
              </View>
              <View style={s.optionTextWrap}>
                <Text style={s.optionTitle}>Cloud-KI aktivieren</Text>
                <Text style={s.optionDesc}>
                  KI-Quests und Validierung per Cloud (Internet erforderlich)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={s.optionCard} onPress={handleSkipAI}>
            <View style={s.optionIconRow}>
              <View style={s.optionIconGray}>
                <XCircle color="#94A3B8" size={28} />
              </View>
              <View style={s.optionTextWrap}>
                <Text style={[s.optionTitle, { color: '#94A3B8' }]}>Ohne KI starten</Text>
                <Text style={s.optionDesc}>Nur mit Standard-Quests spielen</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 15, color: '#AFAFAF', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22 },
  card: { gap: 12 },
  optionCard: { backgroundColor: '#FAFAFA', borderRadius: 22, padding: 18, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  optionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  optionIconPurple: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  optionIconGray: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  optionDesc: { fontSize: 13, color: '#AFAFAF', marginTop: 4, lineHeight: 18 },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 24, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22 },
  card: { gap: 12 },
  optionCard: { backgroundColor: '#1E293B', borderRadius: 22, padding: 18, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  optionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  optionIconPurple: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2E1065', justifyContent: 'center', alignItems: 'center' },
  optionIconGray: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  optionDesc: { fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 18 },
});