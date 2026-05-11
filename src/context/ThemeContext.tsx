import React, { createContext, useContext, ReactNode } from 'react';
import { useAppStore } from '@/src/store/useAppStore';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  success: string;
  border: string;
  inputBg: string;
  tabBar: string;
}

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#4B4B4B',
  textSecondary: '#AFAFAF',
  primary: '#FF7F24',
  accent: '#7C3AED',
  success: '#10B981',
  border: '#F2F2F2',
  inputBg: '#F9F9F9',
  tabBar: '#FFFFFF',
};

const darkTheme: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#FF7F24',
  accent: '#A78BFA',
  success: '#10B981',
  border: '#334155',
  inputBg: '#1E293B',
  tabBar: '#0F172A',
};

const neonTheme: ThemeColors = {
  background: '#0D0221',
  card: '#261447',
  text: '#FFFFFF',
  textSecondary: '#FF00E4',
  primary: '#FF00E4',
  accent: '#00F0FF',
  success: '#39FF14',
  border: '#FF00E4',
  inputBg: '#2D0054',
  tabBar: '#0D0221',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  isNeon: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
  isDark: false,
  isNeon: false,
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { darkMode, neonThemeEnabled, toggleDarkMode } = useAppStore();
  
  const isDark = darkMode || neonThemeEnabled;
  const isNeon = neonThemeEnabled;

  let colors = isDark ? darkTheme : lightTheme;
  if (neonThemeEnabled) {
    colors = neonTheme;
  }

  return (
    <ThemeContext.Provider value={{ colors, isDark, isNeon, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
