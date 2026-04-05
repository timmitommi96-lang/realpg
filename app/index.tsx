import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { initDb, getUserProfile } from '@/src/services/db';
import { useAppStore } from '@/src/store/useAppStore';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accountType, userId } = useAppStore();

  useEffect(() => {
    async function checkStatus() {
      try {
        await initDb();
        const profile = await getUserProfile();
        if (profile && profile.onboarding_completed) {
          setOnboardingCompleted(true);
        }
      } catch (err: any) {
        console.error('Failed to init DB', err);
        setError(err?.message || 'Database error');
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F24" />
        <Text style={styles.loadingText}>Lädt...</Text>
      </View>
    );
  }

  if (error) {
    console.log('DB Error, redirecting to onboarding anyway');
  }

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }
  
  if (accountType === 'cloud' && userId) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#AFAFAF',
    fontWeight: '600',
  },
});
