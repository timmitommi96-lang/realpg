import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider as AppThemeProvider } from '@/src/context/ThemeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)/welcome" />
          <Stack.Screen name="(onboarding)/step/[step]" />
          <Stack.Screen name="(onboarding)/summary" />
          <Stack.Screen name="(onboarding)/ai-setup" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/avatar" />
          <Stack.Screen name="settings/inventory" />
          <Stack.Screen name="settings/ai-models" />
          <Stack.Screen name="settings/nickname" />
          <Stack.Screen name="settings/security" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="settings/about" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
