// Web stub for SQLite - uses localStorage instead
const DB_NAME = 'realpg';

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

const getStorageKey = () => `${DB_NAME}_profile`;

export const initDb = async () => {
  if (typeof window !== 'undefined' && !localStorage.getItem(getStorageKey())) {
    localStorage.setItem(getStorageKey(), JSON.stringify(defaultProfile));
  }
  return null;
};

export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  if (typeof window === 'undefined') return;
  
  const current = await getUserProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(getStorageKey(), JSON.stringify(updated));
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem(getStorageKey());
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const resetDatabase = async () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(), JSON.stringify(defaultProfile));
};
