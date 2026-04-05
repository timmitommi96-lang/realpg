import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserProfile, saveUserProfile } from '@/src/services/db';
import { useTheme } from '@/src/context/ThemeContext';
import { ChevronLeft, Bell, Clock, Zap, Calendar, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface NotificationSettings {
  daily_reminder: boolean;
  quest_reminder: boolean;
  streak_reminder: boolean;
  achievement_notifications: boolean;
  reminder_time: string;
}

export default function NotificationsSettings() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    daily_reminder: true,
    quest_reminder: true,
    streak_reminder: true,
    achievement_notifications: true,
    reminder_time: "09:00"
  });
  const s = isDark ? stylesDark : stylesLight;

  const toggleSetting = (key: keyof NotificationSettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    await saveUserProfile({ notifications: settings.daily_reminder });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Gespeichert!", "Deine Benachrichtigungseinstellungen wurden aktualisiert.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ChevronLeft color={isDark ? '#F1F5F9' : '#4B4B4B'} size={28} />
        </TouchableOpacity>
        <Text style={s.title}>MITTEILUNGEN</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={s.saveText}>SPEICHERN</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.iconContainer}>
          <Bell color="#F59E0B" size={48} />
        </View>

        <Text style={s.description}>
          Verwalte, wann und wie du benachrichtigt wirst.
        </Text>

        <View style={s.section}>
          <Text style={s.sectionTitle}>ERINNERUNGEN</Text>
          
          <NotificationToggle
            icon={<Bell color="#F59E0B" size={24} />}
            title="Tägliche Erinnerung"
            description="Erinnere mich jeden Tag an meine Quests"
            value={settings.daily_reminder}
            onToggle={() => toggleSetting('daily_reminder')}
            isDark={isDark}
          />
          
          <NotificationToggle
            icon={<Zap color="#FF7F24" size={24} />}
            title="Quest-Erinnerungen"
            description="Benachrichtigung wenn neue Quests verfügbar sind"
            value={settings.quest_reminder}
            onToggle={() => toggleSetting('quest_reminder')}
            isDark={isDark}
          />
          
          <NotificationToggle
            icon={<Calendar color="#10B981" size={24} />}
            title="Streak-Erinnerung"
            description="Erinnere mich, meinen Streak nicht zu verlieren"
            value={settings.streak_reminder}
            onToggle={() => toggleSetting('streak_reminder')}
            isDark={isDark}
          />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>ERFOLGE</Text>
          
          <NotificationToggle
            icon={<Trophy color="#FFD700" size={24} />}
            title="Achievement-Benachrichtigungen"
            description="Feiere meine Erfolge mit mir"
            value={settings.achievement_notifications}
            onToggle={() => toggleSetting('achievement_notifications')}
            isDark={isDark}
          />
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>💡 Hinweis</Text>
          <Text style={s.infoText}>
            Um alle Benachrichtigungen zu erhalten, stelle sicher, dass du die Berechtigungen in den Systemeinstellungen deines Geräts erteilt hast.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationToggle({ icon, title, description, value, onToggle, isDark }: { icon: any, title: string, description: string, value: boolean, onToggle: () => void, isDark: boolean }) {
  const s = isDark ? stylesDark : stylesLight;
  return (
    <TouchableOpacity style={s.toggleItem} onPress={onToggle}>
      <View style={s.iconBox}>{icon}</View>
      <View style={s.toggleInfo}>
        <Text style={s.toggleTitle}>{title}</Text>
        <Text style={s.toggleDescription}>{description}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#F2F2F2', true: '#F59E0B' }}
        thumbColor="#FFFFFF"
      />
    </TouchableOpacity>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  saveText: { fontSize: 14, fontWeight: '800', color: '#FF7F24' },
  content: { padding: 24 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
  description: { fontSize: 14, color: '#AFAFAF', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#AFAFAF', marginBottom: 12, letterSpacing: 1 },
  toggleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 18, marginBottom: 10, borderWidth: 2, borderColor: '#E5E5E5' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center' },
  toggleInfo: { flex: 1, marginLeft: 12 },
  toggleTitle: { fontSize: 15, fontWeight: '800', color: '#4B4B4B' },
  toggleDescription: { fontSize: 12, color: '#AFAFAF', marginTop: 2 },
  infoBox: { backgroundColor: '#F0F9FF', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#BAE6FD' },
  infoTitle: { fontSize: 16, fontWeight: '900', color: '#0284C7', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#0284C7', lineHeight: 20 }
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#334155' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  saveText: { fontSize: 14, fontWeight: '800', color: '#FF7F24' },
  content: { padding: 24 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#451A03', justifyContent: 'center', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
  description: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 12, letterSpacing: 1 },
  toggleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 18, marginBottom: 10, borderWidth: 2, borderColor: '#334155' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  toggleInfo: { flex: 1, marginLeft: 12 },
  toggleTitle: { fontSize: 15, fontWeight: '800', color: '#F1F5F9' },
  toggleDescription: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  infoBox: { backgroundColor: '#0C4A6E', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#155E75' },
  infoTitle: { fontSize: 16, fontWeight: '900', color: '#38BDF8', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#38BDF8', lineHeight: 20 }
});