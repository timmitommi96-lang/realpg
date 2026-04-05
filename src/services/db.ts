import { Platform } from 'react-native';

let db: any = null;

const getDb = async () => {
  if (Platform.OS === 'web') {
    return null;
  }
  
  if (!db) {
    const SQLite = await import('expo-sqlite');
    db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return db;
};

const DB_NAME = 'realpg.db';

export interface UserProfile {
  id?: number;
  nickname: string;
  age: string;
  hobbies: string;
  motivation: string;
  quest_level: string;
  daily_time: string;
  notifications: boolean;
  onboarding_completed: boolean;
  sleep_quality: string;
  diet_type: string;
  primary_goal: string;
  sport_level: string;
  learning_level: string;
  household_level: string;
  social_level: string;
  wellbeing_level: string;
  primary_category: string;
  secondary_categories: string;
}

const defaultProfile: UserProfile = {
  nickname: '',
  age: '',
  hobbies: '',
  motivation: '',
  quest_level: '',
  daily_time: '',
  notifications: true,
  onboarding_completed: false,
  sleep_quality: '',
  diet_type: '',
  primary_goal: '',
  sport_level: 'beginner',
  learning_level: 'beginner',
  household_level: 'beginner',
  social_level: 'beginner',
  wellbeing_level: 'beginner',
  primary_category: 'Sport',
  secondary_categories: ''
};

export const initDb = async () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && !localStorage.getItem('realpg_profile')) {
      localStorage.setItem('realpg_profile', JSON.stringify(defaultProfile));
    }
    return null;
  }
  
  const database = await getDb();
  
  try {
    await database.execAsync('DROP TABLE IF EXISTS user_profile');
  } catch (e) {
    // Table doesn't exist, continue
  }
  
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY NOT NULL,
      nickname TEXT DEFAULT '',
      age TEXT DEFAULT '',
      hobbies TEXT DEFAULT '',
      motivation TEXT DEFAULT '',
      quest_level TEXT DEFAULT '',
      daily_time TEXT DEFAULT '',
      notifications INTEGER DEFAULT 1,
      onboarding_completed INTEGER DEFAULT 0,
      sleep_quality TEXT DEFAULT '',
      diet_type TEXT DEFAULT '',
      primary_goal TEXT DEFAULT '',
      sport_level TEXT DEFAULT 'beginner',
      learning_level TEXT DEFAULT 'beginner',
      household_level TEXT DEFAULT 'beginner',
      social_level TEXT DEFAULT 'beginner',
      wellbeing_level TEXT DEFAULT 'beginner',
      primary_category TEXT DEFAULT 'Sport',
      secondary_categories TEXT DEFAULT ''
    );
  `);
  
  return database;
};

export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    
    const current = await getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem('realpg_profile', JSON.stringify(updated));
    return;
  }
  
  const database = await getDb();
  const existing = await database.getFirstAsync<UserProfile>('SELECT * FROM user_profile LIMIT 1');

  if (existing) {
    const keys = Object.keys(profile);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => profile[k as keyof UserProfile] ?? null);
    await database.runAsync(`UPDATE user_profile SET ${setClause} WHERE id = ?`, [...values, existing.id] as any);
  } else {
    const keys = Object.keys(profile);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => profile[k as keyof UserProfile] ?? null);
    await database.runAsync(`INSERT INTO user_profile (${keys.join(', ')}) VALUES (${placeholders})`, values as any);
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem('realpg_profile');
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
  
  const database = await getDb();
  return await database.getFirstAsync<UserProfile>('SELECT * FROM user_profile LIMIT 1');
};

export const resetDatabase = async () => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    localStorage.setItem('realpg_profile', JSON.stringify(defaultProfile));
    return;
  }
  
  const database = await getDb();
  await database.execAsync('DELETE FROM user_profile');
};
