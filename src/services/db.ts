import * as SQLite from 'expo-sqlite';

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

export const initDb = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  
  // Drop and recreate to ensure clean schema (simple fix for migration issues)
  try {
    await db.execAsync('DROP TABLE IF EXISTS user_profile');
  } catch (e) {
    // Table doesn't exist, continue
  }
  
  // Create fresh table with all columns
  await db.execAsync(`
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
  
  return db;
};

export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const existing = await db.getFirstAsync<UserProfile>('SELECT * FROM user_profile LIMIT 1');

  if (existing) {
    const keys = Object.keys(profile);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => profile[k as keyof UserProfile] ?? null);
    await db.runAsync(`UPDATE user_profile SET ${setClause} WHERE id = ?`, [...values, existing.id] as any);
  } else {
    const keys = Object.keys(profile);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => profile[k as keyof UserProfile] ?? null);
    await db.runAsync(`INSERT INTO user_profile (${keys.join(', ')}) VALUES (${placeholders})`, values as any);
  }
};

export const getUserProfile = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  return await db.getFirstAsync<UserProfile>('SELECT * FROM user_profile LIMIT 1');
};

export const resetDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('DELETE FROM user_profile');
};
