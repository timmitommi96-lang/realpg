import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { resetDatabase, saveUserProfile, getUserProfile } from '@/src/services/db';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import { 
  User, 
  Bell, 
  Moon, 
  Shield, 
  LogOut, 
  Trash2,
  ChevronRight,
  Info,
  Crown,
  Flame,
  Zap,
  Mail,
  Globe,
  FileText
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function Settings() {
  const router = useRouter();
  const { stats, setLevel, soundEnabled, darkMode, toggleSound, toggleDarkMode } = useAppStore();
  const { colors, isDark } = useTheme();
  const s = isDark ? stylesDark : stylesLight;

  const handleReset = () => {
    Alert.alert(
      "Daten zurücksetzen?",
      "Dein gesamter Fortschritt (Level, XP, Münzen) wird gelöscht. Dies kann nicht rückgängig gemacht werden.",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Ja, alles löschen", 
          style: "destructive",
          onPress: async () => {
            await resetDatabase();
            setLevel(1);
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleNicknamePress = () => {
    router.push('/settings/nickname');
  };

  const handleSecurityPress = () => {
    router.push('/settings/security');
  };

  const handleNotificationsPress = () => {
    router.push('/settings/notifications');
  };

  const handleAboutPress = () => {
    router.push('/settings/about');
  };

  const handleSupportPress = () => {
    Linking.openURL('mailto:support@realpg.app?subject=RealPG Support');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>EINSTELLUNGEN</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Crown color="#FF7F24" size={32} />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{stats.title}</Text>
            <View style={s.profileStats}>
              <View style={s.profileStat}>
                <Flame color="#FF4B4B" size={16} />
                <Text style={s.profileStatText}>{stats.streak} Tage</Text>
              </View>
              <View style={s.profileStat}>
                <Zap color="#FF7F24" size={16} />
                <Text style={s.profileStatText}>{stats.coins} Münzen</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={s.avatarButton} onPress={() => router.push('/(tabs)/avatar')}>
            <Text style={s.avatarButtonText}>AVATAR</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>PROFIL</Text>
          <SettingItem icon={<User color="#10B981" size={24} />} label="Nickname ändern" onPress={handleNicknamePress} isDark={isDark} />
          <SettingItem icon={<Shield color="#7C3AED" size={24} />} label="Sicherheit" onPress={handleSecurityPress} isDark={isDark} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>APP</Text>
          <SettingItem 
            icon={<Moon color="#7C3AED" size={24} />} 
            label="Dark Mode" 
            isDark={isDark}
            right={
              <Switch 
                value={darkMode} 
                onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleDarkMode(); }}
                trackColor={{ false: '#F2F2F2', true: '#7C3AED' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingItem 
            icon={<Bell color="#F59E0B" size={24} />} 
            label="Mitteilungen" 
            onPress={handleNotificationsPress}
            isDark={isDark}
            right={<ChevronRight color={isDark ? "#475569" : "#E5E5E5"} size={24} />}
          />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>RECHTLICHES</Text>
          <SettingItem icon={<Info color="#AFAFAF" size={24} />} label="Über RealPG" onPress={handleAboutPress} isDark={isDark} />
          <SettingItem icon={<Mail color="#AFAFAF" size={24} />} label="Support" onPress={handleSupportPress} isDark={isDark} />
        </View>

        <TouchableOpacity style={s.resetButton} onPress={handleReset}>
          <Trash2 color="#FF4B4B" size={20} />
          <Text style={s.resetButtonText}>DATEN ZURÜCKSCHLAGEN</Text>
        </TouchableOpacity>

        <View style={s.footer}>
          <Text style={s.versionText}>RealPG v1.0.0</Text>
          <Text style={s.footerText}>Made with ❤️ for Heroes</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({ icon, label, right, onPress, isDark }: { icon: any, label: string, right?: any, onPress?: () => void, isDark: boolean }) {
  const s = isDark ? stylesDark : stylesLight;
  return (
    <TouchableOpacity 
      style={s.settingItem} 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <View style={s.settingItemLeft}>
        <View style={s.iconBox}>{icon}</View>
        <Text style={s.settingLabel}>{label}</Text>
      </View>
      {right ? right : <ChevronRight color={isDark ? "#475569" : "#E5E5E5"} size={24} />}
    </TouchableOpacity>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 5 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FF7F24' },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 16, fontWeight: '900', color: '#4B4B4B' },
  profileStats: { flexDirection: 'row', gap: 14, marginTop: 4 },
  profileStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileStatText: { fontSize: 12, color: '#AFAFAF', fontWeight: '600' },
  avatarButton: { backgroundColor: '#FF7F24', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  avatarButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#AFAFAF', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 18, marginBottom: 8, borderWidth: 2, borderColor: '#E5E5E5', borderBottomWidth: 4 },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { color: '#4B4B4B', fontSize: 16, fontWeight: '700' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F0', padding: 16, borderRadius: 18, gap: 10, marginTop: 8, borderWidth: 2, borderColor: '#FFDEDE', borderBottomWidth: 4 },
  resetButtonText: { color: '#FF4B4B', fontSize: 14, fontWeight: '800' },
  footer: { marginTop: 32, alignItems: 'center', paddingBottom: 40 },
  versionText: { color: '#AFAFAF', fontSize: 12, fontWeight: '800' },
  footerText: { color: '#D4D4D4', fontSize: 12, marginTop: 4, fontWeight: '700' }
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, backgroundColor: '#0F172A', borderBottomWidth: 2, borderBottomColor: '#334155' },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 5 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2D1B0E', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FF7F24' },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 16, fontWeight: '900', color: '#F1F5F9' },
  profileStats: { flexDirection: 'row', gap: 14, marginTop: 4 },
  profileStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileStatText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  avatarButton: { backgroundColor: '#FF7F24', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  avatarButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E293B', padding: 14, borderRadius: 18, marginBottom: 8, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 4 },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { color: '#F1F5F9', fontSize: 16, fontWeight: '700' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#450A0A', padding: 16, borderRadius: 18, gap: 10, marginTop: 8, borderWidth: 2, borderColor: '#7F1D1D', borderBottomWidth: 4 },
  resetButtonText: { color: '#F87171', fontSize: 14, fontWeight: '800' },
  footer: { marginTop: 32, alignItems: 'center', paddingBottom: 40 },
  versionText: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  footerText: { color: '#64748B', fontSize: 12, marginTop: 4, fontWeight: '700' }
});
