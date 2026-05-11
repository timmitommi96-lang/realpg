import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';
import { ChevronLeft, Sparkles, XCircle, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AISettingsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { aiMode, setAIMode } = useAppStore();
  const s = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ChevronLeft color={isDark ? "#94A3B8" : "#AFAFAF"} size={28} />
        </TouchableOpacity>
        <Text style={s.title}>KI-ASSISTENT</Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.sectionTitle}>KI-MODUS</Text>
        <Text style={s.sectionDesc}>
          Wähle, ob der KI-Assistent aktiviert sein soll. Im Cloud-Modus wird die KI
          über das Internet genutzt.
        </Text>

        <TouchableOpacity
          style={[s.optionCard, aiMode === 'cloud' && s.optionCardActive]}
          onPress={() => { setAIMode('cloud'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <View style={s.optionRow}>
            <View style={[s.optionIcon, { backgroundColor: isDark ? '#2E1065' : '#F3E8FF' }]}>
              <Sparkles color="#9B59B6" size={24} />
            </View>
            <View style={s.optionInfo}>
              <Text style={s.optionTitle}>Cloud-KI</Text>
              <Text style={s.optionDesc}>KI-Quests und Validierung (Internet erforderlich)</Text>
            </View>
            {aiMode === 'cloud' && (
              <CheckCircle2 color="#10B981" size={24} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.optionCard, aiMode === 'off' && s.optionCardActive]}
          onPress={() => { setAIMode('off'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <View style={s.optionRow}>
            <View style={[s.optionIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <XCircle color="#94A3B8" size={24} />
            </View>
            <View style={s.optionInfo}>
              <Text style={[s.optionTitle, { color: isDark ? '#94A3B8' : '#AFAFAF' }]}>Deaktiviert</Text>
              <Text style={s.optionDesc}>Nur mit Standard-Quests spielen</Text>
            </View>
            {aiMode === 'off' && (
              <CheckCircle2 color="#10B981" size={24} />
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  placeholder: { width: 44 },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#AFAFAF', letterSpacing: 1, marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: '#AFAFAF', lineHeight: 19, marginBottom: 16 },
  optionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 5 },
  optionCardActive: { borderColor: '#9B59B6', backgroundColor: '#F8F4FF' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  optionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 17, fontWeight: '900', color: '#4B4B4B' },
  optionDesc: { fontSize: 13, color: '#AFAFAF', marginTop: 2, lineHeight: 18 },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#0F172A', borderBottomWidth: 2, borderBottomColor: '#334155' },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  placeholder: { width: 44 },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 19, marginBottom: 16 },
  optionCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 5 },
  optionCardActive: { borderColor: '#A78BFA', backgroundColor: '#1E1B2E' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  optionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 17, fontWeight: '900', color: '#F1F5F9' },
  optionDesc: { fontSize: 13, color: '#94A3B8', marginTop: 2, lineHeight: 18 },
});