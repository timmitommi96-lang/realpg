import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { User, Zap, Mail } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';
import { saveUserProfile } from '@/src/services/db';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { setAccountType } = useAppStore();
  const s = isDark ? stylesDark : stylesLight;

  const handleLocalAccount = async () => {
    setAccountType('local');
    router.push('/step/1');
  };

  const handleCloudAccount = () => {
    setAccountType('cloud');
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <FoxMascot 
            message="Hey, ready fürs echte Life-RPG?" 
            expression="happy" 
          />
          
          <Text style={s.title}>Willkommen bei RealPG</Text>
          <Text style={s.subtitle}>
            Wähle, wie du fortfahren möchtest
          </Text>

          <View style={s.optionsContainer}>
            <TouchableOpacity style={s.optionCard} onPress={handleLocalAccount}>
              <View style={s.optionIcon}>
                <User color="#FF7F24" size={32} />
              </View>
              <Text style={s.optionTitle}>Lokal fortfahren</Text>
              <Text style={s.optionDesc}>
                Alles bleibt auf deinem Gerät. Kein Account nötig.
              </Text>
              <View style={s.badge}>
                <Zap size={12} color="#10B981" />
                <Text style={s.badgeText}>KOSTENLOS</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[s.optionCard, s.optionCardCloud]} onPress={handleCloudAccount}>
              <View style={[s.optionIcon, s.optionIconCloud]}>
                <Mail color="#7C3AED" size={32} />
              </View>
              <Text style={[s.optionTitle, s.optionTitleCloud]}>Mit Email anmelden</Text>
              <Text style={[s.optionDesc, s.optionDescCloud]}>
                Sync deinen Fortschritt über alle Geräte.
              </Text>
              <View style={[s.badge, s.badgeCloud]}>
                <Zap size={12} color="#7C3AED" />
                <Text style={[s.badgeText, s.badgeTextCloud]}>CLOUD SYNC</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#AFAFAF', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  optionsContainer: { width: '100%', gap: 16 },
  optionCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  optionIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  optionTitle: { fontSize: 20, fontWeight: '900', color: '#4B4B4B', marginBottom: 6 },
  optionDesc: { fontSize: 14, color: '#AFAFAF', lineHeight: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 12 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#10B981' },
  optionCardCloud: { backgroundColor: '#FAFAFA', borderColor: '#E9D5FF' },
  optionIconCloud: { backgroundColor: '#F3E8FF' },
  optionTitleCloud: { color: '#7C3AED' },
  optionDescCloud: { color: '#A855F7' },
  badgeCloud: { backgroundColor: '#F3E8FF' },
  badgeTextCloud: { color: '#7C3AED' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  optionsContainer: { width: '100%', gap: 16 },
  optionCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  optionIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2D1B0E', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  optionTitle: { fontSize: 20, fontWeight: '900', color: '#F1F5F9', marginBottom: 6 },
  optionDesc: { fontSize: 14, color: '#94A3B8', lineHeight: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#052E16', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 12 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#22C55E' },
  optionCardCloud: { backgroundColor: '#1E1B2E', borderColor: '#4C1D95' },
  optionIconCloud: { backgroundColor: '#2E1065' },
  optionTitleCloud: { color: '#A78BFA' },
  optionDescCloud: { color: '#A78BFA' },
  badgeCloud: { backgroundColor: '#2E1065' },
  badgeTextCloud: { color: '#A78BFA' },
});