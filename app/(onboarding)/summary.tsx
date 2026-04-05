import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import { getUserProfile, saveUserProfile, UserProfile } from '@/src/services/db';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

export default function Summary() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setInitLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveUserProfile({ onboarding_completed: true });
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to save:', err);
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7F24" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Zusammenfassung</Text>
        
        <FoxMascot 
          message="Das sieht super aus! Bist du bereit für dein erstes Abenteuer?" 
          expression="success" 
        />

        <View style={styles.card}>
          <SummaryItem label="Nickname" value={profile?.nickname || 'Held'} />
          <SummaryItem label="Alter" value={profile?.age || '-'} />
          <SummaryItem label="Interessen" value={profile?.hobbies || '-'} />
          <SummaryItem label="Motivation" value={profile?.motivation || '-'} />
          <SummaryItem label="Level" value={profile?.quest_level || '-'} />
          <SummaryItem label="Tägliche Zeit" value={profile?.daily_time || '-'} />
          <SummaryItem label="Push-Benachrichtigungen" value={profile?.notifications ? 'Aktiviert' : 'Deaktiviert'} />
        </View>

      </ScrollView>
      <View style={styles.footer}>
        <CustomButton 
          title="Abenteuer starten" 
          onPress={handleFinish} 
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4B4B4B',
    textAlign: 'center',
    marginVertical: 10,
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 20,
    marginTop: 10,
  },
  item: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AFAFAF',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B4B4B',
  },
  footer: {
    padding: 24,
  },
});
