import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
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
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
  isDark: false,
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const { darkMode, toggleDarkMode } = useAppStore();
  
  const isDark = darkMode;
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleDarkMode }}>
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
