import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiService, GeneratedQuest } from '@/src/services/ai';
import { getUserProfile } from '@/src/services/db';
import { generateQuests, UserLevels, UserLevel, PrioritySettings, defaultUserLevels } from '@/src/data/standardQuests';

const ROLL_COST = 10;
const CUSTOM_QUEST_COST = 50;
const QUESTS_PER_ROLL = 5;

interface UserStats {
  level: number;
  xp: number;
  coins: number;
  xpToNextLevel: number;
  title: string;
  streak: number;
  lastQuestDate: string | null;
  questsCompleted: number;
  selectedAvatar: string;
}

interface AppState {
  stats: UserStats;
  quests: GeneratedQuest[];
  isGeneratingQuests: boolean;
  unlockedAchievements: string[];
  soundEnabled: boolean;
  darkMode: boolean;
  questPoolIndex: number;
  userLevels: UserLevels;
  priorities: PrioritySettings;
  accountType: 'local' | 'cloud' | null;
  userId: string | null;
  isAdmin: boolean;
  allUnlocked: boolean;
  
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  setLevel: (level: number) => void;
  refreshQuests: () => Promise<void>;
  completeQuest: (questTitle: string) => void;
  updateStreak: () => void;
  setAvatar: (avatar: string) => void;
  toggleSound: () => void;
  toggleDarkMode: () => void;
  unlockAchievement: (id: string) => void;
  rollQuests: () => Promise<boolean>;
  generateCustomQuest: (goal: string) => Promise<GeneratedQuest | null>;
  setUserLevels: (levels: UserLevels) => void;
  setPriorities: (priorities: PrioritySettings) => void;
  setAccountType: (type: 'local' | 'cloud') => void;
  setUserId: (id: string | null) => void;
  activateAdmin: (code: string) => boolean;
}

const calculateXpToNextLevel = (level: number) => {
  if (level <= 10) return level * 100;
  if (level <= 30) return level * 250;
  return level * 500;
};

const getTitleForLevel = (level: number) => {
  if (level < 10) return "Anfänger";
  if (level < 20) return "Abenteurer";
  if (level < 30) return "Krieger";
  if (level < 50) return "Champion";
  return "Legende";
};

const getToday = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      stats: {
        level: 1,
        xp: 0,
        coins: 10,
        xpToNextLevel: 100,
        title: "Anfänger",
        streak: 0,
        lastQuestDate: null,
        questsCompleted: 0,
        selectedAvatar: 'fox_default',
      },
      quests: [],
      isGeneratingQuests: false,
      unlockedAchievements: [],
      soundEnabled: true,
      darkMode: false,
      questPoolIndex: 0,
      userLevels: defaultUserLevels,
      priorities: { primary: 'Sport', secondary: [] },
      accountType: null,
      userId: null,
      isAdmin: false,
      allUnlocked: false,

      addXp: (amount) => {
        set((state) => {
          let newXp = state.stats.xp + amount;
          let newLevel = state.stats.level;
          let xpToNext = state.stats.xpToNextLevel;

          while (newXp >= xpToNext) {
            newXp -= xpToNext;
            newLevel += 1;
            xpToNext = calculateXpToNextLevel(newLevel);
          }

          return {
            stats: {
              ...state.stats,
              xp: newXp,
              level: newLevel,
              xpToNextLevel: xpToNext,
              title: getTitleForLevel(newLevel),
            }
          };
        });
      },

      addCoins: (amount) => {
        set((state) => ({
          stats: {
            ...state.stats,
            coins: state.stats.coins + amount,
          }
        }));
      },

      setLevel: (level) => {
        set((state) => ({
          stats: {
            ...state.stats,
            level,
            xpToNextLevel: calculateXpToNextLevel(level),
            title: getTitleForLevel(level),
          }
        }));
      },

      refreshQuests: async () => {
        set({ isGeneratingQuests: true });
        try {
          const profile = await getUserProfile();
          if (profile) {
            const newQuests = await aiService.generateDailyQuests(profile);
            set({ quests: newQuests });
          }
        } catch (error) {
          console.error("Failed to refresh quests:", error);
        } finally {
          set({ isGeneratingQuests: false });
        }
      },

      completeQuest: (questTitle) => {
        const quest = get().quests.find(q => q.title === questTitle);
        if (quest) {
          const today = getToday();
          const lastDate = get().stats.lastQuestDate;
          let newStreak = get().stats.streak;
          
          if (lastDate === today) {
          } else if (lastDate === getYesterday()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          
          get().addXp(quest.xp);
          get().addCoins(quest.coins);
          set((state) => ({
            quests: state.quests.filter(q => q.title !== questTitle),
            stats: {
              ...state.stats,
              questsCompleted: state.stats.questsCompleted + 1,
              streak: newStreak,
              lastQuestDate: today,
            }
          }));
          
          checkAchievements({ stats: get().stats, unlockAchievement: get().unlockAchievement } as any);
        }
      },

      updateStreak: () => {
        const today = getToday();
        const lastDate = get().stats.lastQuestDate;
        if (lastDate !== today) {
          if (lastDate === getYesterday()) {
            set((state) => ({ stats: { ...state.stats, streak: state.stats.streak + 1, lastQuestDate: today } }));
          } else {
            set((state) => ({ stats: { ...state.stats, streak: 1, lastQuestDate: today } }));
          }
        }
      },

      setAvatar: (avatar) => {
        set((state) => ({ stats: { ...state.stats, selectedAvatar: avatar } }));
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      unlockAchievement: (id) => {
        set((state) => {
          if (state.unlockedAchievements.includes(id)) return state;
          return { unlockedAchievements: [...state.unlockedAchievements, id] };
        });
      },

      rollQuests: async () => {
        const state = get();
        if (state.stats.coins < ROLL_COST) {
          return false;
        }
        
        const profile = await getUserProfile();
        const userLevels: UserLevels = {
          sport_level: (profile?.sport_level as UserLevel) || 'beginner',
          learning_level: (profile?.learning_level as UserLevel) || 'beginner',
          household_level: (profile?.household_level as UserLevel) || 'beginner',
          social_level: (profile?.social_level as UserLevel) || 'beginner',
          wellbeing_level: (profile?.wellbeing_level as UserLevel) || 'beginner',
        };
        
        const priorities: PrioritySettings = {
          primary: profile?.primary_category || 'Sport',
          secondary: profile?.secondary_categories ? profile.secondary_categories.split(',') : [],
        };
        
        const newIndex = state.questPoolIndex + QUESTS_PER_ROLL;
        const newQuests = generateQuests(QUESTS_PER_ROLL, state.questPoolIndex, userLevels, priorities);
        
        set({
          stats: { ...state.stats, coins: state.stats.coins - ROLL_COST },
          questPoolIndex: newIndex % 1000,
          quests: [...state.quests, ...newQuests],
        });
        return true;
      },

      generateCustomQuest: async (goal: string) => {
        const state = get();
        if (state.stats.coins < CUSTOM_QUEST_COST) {
          return null;
        }
        set({ isGeneratingQuests: true });
        try {
          const customQuest = await aiService.generateCustomQuest(goal);
          if (customQuest) {
            set((s) => ({
              stats: { ...s.stats, coins: s.stats.coins - CUSTOM_QUEST_COST },
              quests: [...s.quests, customQuest],
              isGeneratingQuests: false,
            }));
            return customQuest;
          }
        } catch (error) {
          console.error("Failed to generate custom quest:", error);
        }
        set({ isGeneratingQuests: false });
        return null;
      },

      setUserLevels: (levels) => {
        set({ userLevels: levels });
      },

      setPriorities: (priorities) => {
        set({ priorities });
      },

      setAccountType: (type) => {
        set({ accountType: type });
      },

      setUserId: (id) => {
        set({ userId: id });
      },

      activateAdmin: (code) => {
        if (code === '260512') {
          set({ 
            isAdmin: true,
            allUnlocked: true,
            stats: {
              ...get().stats,
              coins: 999999,
              level: 100,
              title: 'LEGENDÄRER ADMIN',
            }
          });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'realpg-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function checkAchievements(state: AppState) {
  const { stats, unlockAchievement } = state;
  
  if (stats.questsCompleted >= 1) unlockAchievement('first_quest');
  if (stats.questsCompleted >= 10) unlockAchievement('quest_10');
  if (stats.questsCompleted >= 50) unlockAchievement('quest_50');
  if (stats.questsCompleted >= 100) unlockAchievement('quest_100');
  if (stats.questsCompleted >= 500) unlockAchievement('quest_500');
  if (stats.level >= 5) unlockAchievement('level_5');
  if (stats.level >= 10) unlockAchievement('level_10');
  if (stats.level >= 20) unlockAchievement('level_20');
  if (stats.level >= 30) unlockAchievement('level_30');
  if (stats.level >= 50) unlockAchievement('level_50');
  if (stats.level >= 100) unlockAchievement('level_100');
  if (stats.streak >= 3) unlockAchievement('streak_3');
  if (stats.streak >= 7) unlockAchievement('streak_7');
  if (stats.streak >= 30) unlockAchievement('streak_30');
  if (stats.streak >= 100) unlockAchievement('streak_100');
  if (stats.coins >= 100) unlockAchievement('coins_100');
  if (stats.coins >= 500) unlockAchievement('coins_500');
  if (stats.coins >= 1000) unlockAchievement('coins_1000');
}
