import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import { ChevronLeft, Shield, Key, Eye, EyeOff, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SecuritySettings() {
  const router = useRouter();
  const { soundEnabled, toggleSound } = useAppStore();
  const { isDark } = useTheme();
  const s = isDark ? stylesDark : stylesLight;

  const handleFeature = (feature: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      feature,
      "Diese Funktion ist in der aktuellen Version noch nicht verfügbar. Sie wird in einem zukünftigen Update verfügbar sein.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ChevronLeft color={isDark ? '#F1F5F9' : '#4B4B4B'} size={28} />
        </TouchableOpacity>
        <Text style={s.title}>SICHERHEIT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.iconContainer}>
          <Shield color="#7C3AED" size={48} />
        </View>

        <Text style={s.description}>
          Schütze deinen Account und deine Daten mit diesen Sicherheitsfunktionen.
        </Text>

        <View style={s.section}>
          <SecurityItem 
            icon={<Key color="#10B981" size={24} />}
            title="Passwort ändern"
            subtitle="Ändere dein Passwort"
            onPress={() => handleFeature("Passwort ändern")}
            isDark={isDark}
          />
          <SecurityItem 
            icon={<Eye color="#7C3AED" size={24} />}
            title="Zwei-Faktor-Authentifizierung"
            subtitle="Erhöhe die Sicherheit"
            onPress={() => handleFeature("2FA")}
            isDark={isDark}
          />
          <SecurityItem 
            icon={<Lock color="#F59E0B" size={24} />}
            title="Biometrische Anmeldung"
            subtitle="Face ID / Fingerabdruck"
            onPress={() => handleFeature("Biometrie")}
            isDark={isDark}
          />
          <SecurityItem 
            icon={<Shield color="#FF4B4B" size={24} />}
            title="Daten exportieren"
            subtitle="Lade deine Daten herunter"
            onPress={() => handleFeature("Daten exportieren")}
            isDark={isDark}
          />
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🔒 Datenschutz</Text>
          <Text style={s.infoText}>
            Deine Daten werden verschlüsselt gespeichert und nur für die App-Funktionalität verwendet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SecurityItem({ icon, title, subtitle, onPress, isDark }: { icon: any, title: string, subtitle: string, onPress: () => void, isDark: boolean }) {
  const s = isDark ? stylesDark : stylesLight;
  return (
    <TouchableOpacity style={s.securityItem} onPress={onPress}>
      <View style={s.iconBox}>{icon}</View>
      <View style={s.securityInfo}>
        <Text style={s.securityTitle}>{title}</Text>
        <Text style={s.securitySubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  content: { padding: 24 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
  description: { fontSize: 14, color: '#AFAFAF', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  section: { gap: 12 },
  securityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 18, borderWidth: 2, borderColor: '#E5E5E5', borderBottomWidth: 4 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center' },
  securityInfo: { flex: 1, marginLeft: 14 },
  securityTitle: { fontSize: 16, fontWeight: '800', color: '#4B4B4B' },
  securitySubtitle: { fontSize: 12, color: '#AFAFAF', marginTop: 2 },
  infoBox: { backgroundColor: '#F0FDF4', padding: 20, borderRadius: 20, marginTop: 24, borderWidth: 2, borderColor: '#BBF7D0' },
  infoTitle: { fontSize: 16, fontWeight: '900', color: '#16A34A', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#16A34A', lineHeight: 20 }
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#334155' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  content: { padding: 24 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2E1065', justifyContent: 'center', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
  description: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  section: { gap: 12 },
  securityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 18, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 4 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  securityInfo: { flex: 1, marginLeft: 14 },
  securityTitle: { fontSize: 16, fontWeight: '800', color: '#F1F5F9' },
  securitySubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  infoBox: { backgroundColor: '#052E16', padding: 20, borderRadius: 20, marginTop: 24, borderWidth: 2, borderColor: '#166534' },
  infoTitle: { fontSize: 16, fontWeight: '900', color: '#22C55E', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#22C55E', lineHeight: 20 }
});