import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { ChevronLeft, Info, Heart, Star, Coffee, Globe, Mail } from 'lucide-react-native';

export default function AboutSettings() {
  const router = useRouter();
  const { isDark } = useTheme();
  const s = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ChevronLeft color={isDark ? '#F1F5F9' : '#4B4B4B'} size={28} />
        </TouchableOpacity>
        <Text style={s.title}>ÜBER REALPG</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.iconContainer}>
          <Star color="#FF7F24" size={48} fill="#FF7F24" />
        </View>

        <Text style={s.appName}>RealPG</Text>
        <Text style={s.version}>Version 1.0.0</Text>

        <View style={s.descriptionBox}>
          <Text style={s.description}>
            RealPG ist dein persönlicher RPG-ähnlicher Begleiter für Self-Improvement. 
            Verwandle dein tägliches Leben in ein Abenteuer mit Quests, Erfahrungspunkten 
            und einem progressiven Belohnungssystem.
          </Text>
        </View>

        <View style={s.features}>
          <FeatureItem icon={<Star color="#FFD700" size={20} />} text="Tägliche Quests" isDark={isDark} />
          <FeatureItem icon={<Heart color="#FF4B4B" size={20} />} text="Level & Titel-System" isDark={isDark} />
          <FeatureItem icon={<Coffee color="#7C3AED" size={20} />} text="Streak-Tracking" isDark={isDark} />
          <FeatureItem icon={<Star color="#10B981" size={20} />} text="KI-generierte Quests" isDark={isDark} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>ENTWICKLUNG</Text>
          <Text style={s.creditsText}>
            RealPG wurde mit ❤️ entwickelt von einem Team, das glaubt, dass Selbstverbesserung Spaß machen kann.
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>TECHNOLOGIE</Text>
          <View style={s.techStack}>
            <TechBadge text="React Native" />
            <TechBadge text="Expo" />
            <TechBadge text="TypeScript" />
            <TechBadge text="Zustand" />
            <TechBadge text="Google Gemini" />
          </View>
        </View>

        <View style={s.links}>
          <TouchableOpacity style={s.linkItem} onPress={() => Linking.openURL('https://realpg.app')}>
            <Globe color="#FF7F24" size={24} />
            <Text style={s.linkText}>Website</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.linkItem} onPress={() => Linking.openURL('mailto:support@realpg.app')}>
            <Mail color="#FF7F24" size={24} />
            <Text style={s.linkText}>Kontakt</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.copyright}>© 2024 RealPG</Text>
          <Text style={s.allRights}>Alle Rechte vorbehalten</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text, isDark }: { icon: any, text: string, isDark: boolean }) {
  const s = isDark ? stylesDark : stylesLight;
  return (
    <View style={s.featureItem}>
      {icon}
      <Text style={s.featureText}>{text}</Text>
    </View>
  );
}

function TechBadge({ text }: { text: string }) {
  return (
    <View style={stylesLight.techBadge}>
      <Text style={stylesLight.techBadgeText}>{text}</Text>
    </View>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  content: { padding: 24, alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: '900', color: '#4B4B4B' },
  version: { fontSize: 14, color: '#AFAFAF', fontWeight: '600', marginBottom: 20 },
  descriptionBox: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 2, borderColor: '#F2F2F2' },
  description: { fontSize: 14, color: '#4B4B4B', lineHeight: 22, textAlign: 'center' },
  features: { width: '100%', gap: 12, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: '#F2F2F2' },
  featureText: { fontSize: 14, fontWeight: '700', color: '#4B4B4B' },
  section: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#AFAFAF', marginBottom: 10, letterSpacing: 1 },
  creditsText: { fontSize: 14, color: '#4B4B4B', lineHeight: 22 },
  techStack: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D8B4FE' },
  techBadgeText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
  links: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF5EE', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: '#FF7F24' },
  linkText: { fontSize: 14, fontWeight: '800', color: '#FF7F24' },
  footer: { alignItems: 'center' },
  copyright: { fontSize: 14, fontWeight: '800', color: '#AFAFAF' },
  allRights: { fontSize: 12, color: '#D4D4D4', marginTop: 4 }
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#334155' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  content: { padding: 24, alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2D1B0E', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: '900', color: '#F1F5F9' },
  version: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginBottom: 20 },
  descriptionBox: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  description: { fontSize: 14, color: '#F1F5F9', lineHeight: 22, textAlign: 'center' },
  features: { width: '100%', gap: 12, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1E293B', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: '#334155' },
  featureText: { fontSize: 14, fontWeight: '700', color: '#F1F5F9' },
  section: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10, letterSpacing: 1 },
  creditsText: { fontSize: 14, color: '#F1F5F9', lineHeight: 22 },
  techStack: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techBadge: { backgroundColor: '#2E1065', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#5B21B6' },
  techBadgeText: { fontSize: 12, fontWeight: '700', color: '#A78BFA' },
  links: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2D1B0E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: '#FF7F24' },
  linkText: { fontSize: 14, fontWeight: '800', color: '#FF7F24' },
  footer: { alignItems: 'center' },
  copyright: { fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  allRights: { fontSize: 12, color: '#64748B', marginTop: 4 }
});