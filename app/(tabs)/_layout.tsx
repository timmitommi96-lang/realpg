import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ShoppingBag, Trophy, Settings, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFF',
          position: 'absolute',
          borderTopColor: '#F2F2F2',
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
          borderTopWidth: 2,
          elevation: 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
          ) : null
        ),
        tabBarActiveTintColor: '#FF7F24',
        tabBarInactiveTintColor: '#AFAFAF',
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
        name="avatar"
        options={{
          title: 'Avatar',
          tabBarIcon: ({ color }) => <User color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einst.',
          tabBarIcon: ({ color }) => <Settings color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}
