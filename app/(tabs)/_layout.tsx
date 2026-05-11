import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { LayoutDashboard, MessageCircle, ShoppingBag, Trophy, Users } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, Alert } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';

export default function TabsLayout() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { accountType, loadCloudFriendRequests, cloudFriendRequests, aiMode } = useAppStore();
  const previousCount = useRef(0);

  useEffect(() => {
    if (accountType !== 'cloud') return;
    loadCloudFriendRequests();
    const timer = setInterval(() => {
      loadCloudFriendRequests();
    }, 12000);
    return () => clearInterval(timer);
  }, [accountType]);

  useEffect(() => {
    if (accountType !== 'cloud') return;
    const current = cloudFriendRequests.length;
    if (current > previousCount.current && previousCount.current > 0) {
      Alert.alert(
        'Neue Freundschaftsanfrage',
        'Du hast eine neue Anfrage. Jetzt anzeigen?',
        [
          { text: 'Später', style: 'cancel' },
          { text: 'Öffnen', onPress: () => router.push('/(tabs)/social') },
        ]
      );
    }
    previousCount.current = current;
  }, [cloudFriendRequests.length, accountType]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : (isDark ? '#0F172A' : '#FFFFFF'),
          position: 'absolute',
          borderTopColor: isDark ? '#334155' : '#F2F2F2',
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
          borderTopWidth: 2,
          elevation: 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
          ) : null
        ),
        tabBarActiveTintColor: '#FF7F24',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#AFAFAF',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Held',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'KI',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={28} />,
          tabBarItemStyle: aiMode === 'off' ? { flex: 0, width: 0, height: 0, overflow: 'hidden', padding: 0, margin: 0 } : undefined,
          tabBarButton: aiMode === 'off' ? () => null : undefined,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Erfolge',
          tabBarIcon: ({ color }) => <Trophy color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Soziales',
          tabBarIcon: ({ color }) => <Users color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}
