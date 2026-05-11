import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiService, GeneratedQuest } from '@/src/services/ai';
import { getUserProfile, saveUserProfile } from '@/src/services/db';
import { generateQuests, UserLevels, UserLevel, PrioritySettings, defaultUserLevels } from '@/src/data/standardQuests';
import { gameCloudService } from '@/src/services/gameCloud';

const ROLL_COST = 50;
const CUSTOM_QUEST_COST = 50;
const MAX_NORMAL_QUESTS = 5;
const MAX_AI_QUESTS = 5;

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
  totalXpEarned: number;
  totalCoinsSpent: number;
  itemsPurchased: number;
  lastLoginDate: string | null;
  consecutiveLoginDays: number;
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'avatar' | 'theme' | 'buff' | 'joker' | 'special';
  quantity: number;
  icon: string;
}

interface CategoryStats {
  sport: number;
  learning: number;
  household: number;
  social: number;
  wellbeing: number;
}

interface Friend {
  id: string;
  nickname: string;
  level: number;
  questsCompleted: number;
  streak: number;
  title: string;
  addedAt: string;
}

interface FriendRequest {
  id: string;
  nickname: string;
  level: number;
  title: string;
  fromId: string;
  receivedAt: string;
}

interface AppState {
  stats: UserStats;
  quests: GeneratedQuest[];
  aiQuests: GeneratedQuest[];
  isGeneratingQuests: boolean;
  unlockedAchievements: string[];
  soundEnabled: boolean;
  darkMode: boolean;
  neonThemeEnabled: boolean;
  questPoolIndex: number;
  userLevels: UserLevels;
  priorities: PrioritySettings;
  accountType: 'local' | 'cloud' | null;
  userId: string | null;
  isAdmin: boolean;
  allUnlocked: boolean;
  inventory: InventoryItem[];
  categoryStats: CategoryStats;
  activeBuffs: { type: string; expiresAt: string }[];
  dailyBonusCollected: boolean;
  newlyUnlockedAchievement: string | null;
  friends: Friend[];
  friendRequests: FriendRequest[];
  inviteCode: string | null;
  
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  setLevel: (level: number) => void;
  refreshQuests: () => Promise<void>;
  completeQuest: (questTitle: string) => void;
  updateStreak: () => void;
  setAvatar: (avatar: string) => void;
  toggleSound: () => void;
  toggleDarkMode: () => void;
  toggleNeonTheme: (enabled: boolean) => void;
  unlockAchievement: (id: string) => void;
  clearNewAchievement: () => void;
  rollQuests: () => Promise<boolean>;
  generateCustomQuest: (goal: string) => Promise<GeneratedQuest | null>;
  replaceQuest: (index: number) => Promise<boolean>;
  replaceAiQuest: (index: number) => Promise<boolean>;
  setUserLevels: (levels: UserLevels) => void;
  setPriorities: (priorities: PrioritySettings) => void;
  setAccountType: (type: 'local' | 'cloud') => void;
  setUserId: (id: string | null) => void;
  activateAdmin: (code: string) => boolean;
  purchaseItem: (itemId: string, name: string, type: 'avatar' | 'theme' | 'buff' | 'joker' | 'special', icon: string) => boolean;
  useInventoryItem: (itemId: string) => boolean;
  activateBuff: (type: string, durationMinutes: number) => void;
  openTreasureChest: () => { itemId: string; name: string } | null;
  hasActiveBuff: (type: string) => boolean;
  collectDailyBonus: () => { coins: number; xp: number } | null;
  incrementCategoryStat: (category: string) => void;
  checkLoginBonus: () => boolean;
  generateInviteCode: () => string;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  getLeaderboard: () => any[];
  cloudFriends: any[];
  cloudFriendRequests: any[];
  cloudLeaderboard: any[];
  cloudInviteCode: string | null;
  aiMode: 'cloud' | 'off' | null;
  syncToCloud: () => Promise<void>;
  loadCloudFriends: () => Promise<void>;
  loadCloudFriendRequests: () => Promise<void>;
  loadCloudLeaderboard: () => Promise<void>;
  addCloudFriend: (code: string) => Promise<boolean>;
  loadCloudIdentity: () => Promise<void>;
  acceptCloudFriendRequest: (requestId: string) => Promise<boolean>;
  declineCloudFriendRequest: (requestId: string) => Promise<boolean>;
  setAIMode: (mode: 'cloud' | 'off') => void;
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
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

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
        totalXpEarned: 0,
        totalCoinsSpent: 0,
        itemsPurchased: 0,
        lastLoginDate: null,
        consecutiveLoginDays: 0,
      },
      quests: [],
      aiQuests: [],
      isGeneratingQuests: false,
      unlockedAchievements: [],
      soundEnabled: true,
      darkMode: false,
      neonThemeEnabled: false,
      questPoolIndex: 0,
      userLevels: defaultUserLevels,
      priorities: { primary: 'Sport', secondary: [] },
      accountType: null,
      userId: null,
      isAdmin: false,
      allUnlocked: false,
      inventory: [],
      categoryStats: { sport: 0, learning: 0, household: 0, social: 0, wellbeing: 0 },
      activeBuffs: [],
      dailyBonusCollected: false,
      newlyUnlockedAchievement: null,
      friends: [],
      friendRequests: [],
      inviteCode: null,
      cloudFriends: [],
      cloudFriendRequests: [],
      cloudLeaderboard: [],
      cloudInviteCode: null,
      aiMode: null,

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
              totalXpEarned: state.stats.totalXpEarned + amount,
            }
          };
        });
      },

      addCoins: (amount) => {
        set((state) => ({
          stats: {
            ...state.stats,
            coins: Math.max(0, state.stats.coins + amount),
            totalCoinsSpent: amount < 0 ? state.stats.totalCoinsSpent + Math.abs(amount) : state.stats.totalCoinsSpent,
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
            const state = get();
            if (state.accountType === 'cloud') {
              const createdQuests: GeneratedQuest[] = [];
              for (const quest of newQuests) {
                const created = await gameCloudService.createQuest(quest, 'daily');
                createdQuests.push({ ...quest, cloudId: created?.id });
              }
              set({ quests: createdQuests });
              return;
            }
            set({ quests: newQuests });
          }
        } catch (error) {
          console.error("Failed to refresh quests:", error);
        } finally {
          set({ isGeneratingQuests: false });
        }
      },

      completeQuest: (questTitle) => {
        const state = get();
        const normalQuest = state.quests.find(q => q.title === questTitle);
        const aiQuest = state.aiQuests.find(q => q.title === questTitle);
        const quest = normalQuest || aiQuest;
        
        if (quest) {
          if (quest.cloudId && get().accountType === 'cloud') {
            gameCloudService.completeQuest(quest.cloudId).catch((error) =>
              console.error('Cloud quest completion failed:', error)
            );
          }

          const today = getToday();
          const lastDate = state.stats.lastQuestDate;
          let newStreak = state.stats.streak;
          
          if (lastDate === today) {
          } else if (lastDate === getYesterday()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          
          const xpBonus = state.hasActiveBuff('xp_boost') ? 1.5 : 1;
          const coinsBonus = state.hasActiveBuff('coins_boost') ? 1.5 : 1;
          
          get().addXp(Math.round(quest.xp * xpBonus));
          get().addCoins(Math.round(quest.coins * coinsBonus));
          get().incrementCategoryStat(quest.category);
          
          set((s) => ({
            quests: normalQuest ? s.quests.filter(q => q.title !== questTitle) : s.quests,
            aiQuests: aiQuest ? s.aiQuests.filter(q => q.title !== questTitle) : s.aiQuests,
            stats: {
              ...s.stats,
              questsCompleted: s.stats.questsCompleted + 1,
              streak: newStreak,
              lastQuestDate: today,
            }
          }));
          
          checkAchievements({ stats: get().stats, categoryStats: get().categoryStats, unlockAchievement: get().unlockAchievement } as any);
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

      toggleNeonTheme: (enabled) => {
        set({ neonThemeEnabled: enabled });
      },

      unlockAchievement: (id) => {
        set((state) => {
          if (state.unlockedAchievements.includes(id)) return state;
          return { unlockedAchievements: [...state.unlockedAchievements, id], newlyUnlockedAchievement: id };
        });
      },

      clearNewAchievement: () => {
        set({ newlyUnlockedAchievement: null });
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
        
        const newIndex = state.questPoolIndex + 5;
        const newQuests = generateQuests(5, state.questPoolIndex, userLevels, priorities);
        
        set({
          stats: { ...state.stats, coins: state.stats.coins - ROLL_COST, totalCoinsSpent: state.stats.totalCoinsSpent + ROLL_COST },
          questPoolIndex: newIndex % 1000,
          quests: newQuests,
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
            const created =
              state.accountType === 'cloud'
                ? await gameCloudService.createQuest(customQuest, 'custom')
                : null;
            let updatedAiQuests = [...state.aiQuests];
            if (updatedAiQuests.length >= MAX_AI_QUESTS) {
              updatedAiQuests.shift();
            }
            updatedAiQuests.push({ ...customQuest, cloudId: created?.id });
            
            set((s) => ({
              stats: { ...s.stats, coins: s.stats.coins - CUSTOM_QUEST_COST, totalCoinsSpent: s.stats.totalCoinsSpent + CUSTOM_QUEST_COST },
              aiQuests: updatedAiQuests,
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

      replaceQuest: async (index: number) => {
        const state = get();
        const cost = 10;
        if (state.stats.coins < cost) {
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
        
        const newIndex = state.questPoolIndex + 1;
        const newQuests = generateQuests(1, state.questPoolIndex, userLevels, priorities);
        
        let updatedQuests = [...state.quests];
        if (index >= 0 && index < updatedQuests.length) {
          updatedQuests[index] = newQuests[0];
        }
        
        set({
          stats: { ...state.stats, coins: state.stats.coins - cost, totalCoinsSpent: state.stats.totalCoinsSpent + cost },
          questPoolIndex: newIndex % 1000,
          quests: updatedQuests,
        });
        return true;
      },

      replaceAiQuest: async (index: number) => {
        const state = get();
        if (state.stats.coins < CUSTOM_QUEST_COST) {
          return false;
        }
        set({ isGeneratingQuests: true });
        try {
          const customQuest = await aiService.generateCustomQuest("Generiere eine neue Quest");
          if (customQuest) {
            let updatedAiQuests = [...state.aiQuests];
            if (index >= 0 && index < updatedAiQuests.length) {
              updatedAiQuests[index] = customQuest;
            }
            
            set((s) => ({
              stats: { ...s.stats, coins: s.stats.coins - CUSTOM_QUEST_COST, totalCoinsSpent: s.stats.totalCoinsSpent + CUSTOM_QUEST_COST },
              aiQuests: updatedAiQuests,
              isGeneratingQuests: false,
            }));
            return true;
          }
        } catch (error) {
          console.error("Failed to replace ai quest:", error);
        }
        set({ isGeneratingQuests: false });
        return false;
      },

      setUserLevels: (levels) => {
        set({ userLevels: levels });
      },

      setPriorities: (priorities) => {
        set({ priorities });
      },

      setAccountType: (type) => {
        set({ accountType: type });
        if (type !== 'cloud') {
          set({ cloudInviteCode: null, cloudFriends: [], cloudFriendRequests: [] });
        }
      },

      setUserId: (id) => {
        set({ userId: id });
        if (id) {
          void get().loadCloudIdentity();
        }
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

      purchaseItem: (itemId, name, type, icon) => {
        const state = get();
        const prices: Record<string, number> = {
          'legendary_avatar': 100,
          'golden_frame': 50,
          'joker_card': 30,
          'neon_theme': 200,
          'xp_booster': 150,
          'coins_booster': 100,
          'streak_shield': 75,
          'treasure_chest': 500,
        };
        const price = prices[itemId] || 50;
        
        if (state.stats.coins < price) return false;

        if (state.accountType === 'cloud') {
          gameCloudService.purchaseItem(itemId).catch((error) => {
            console.error('Cloud purchase failed:', error);
          });
        }

        set((s) => {
          const existingItem = s.inventory.find(i => i.id === itemId);
          let newInventory = [...s.inventory];
          
          if (existingItem) {
            newInventory = newInventory.map(i => 
              i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newInventory.push({ id: itemId, name, type, icon, quantity: 1 });
          }
          
          return {
            stats: {
              ...s.stats,
              coins: s.stats.coins - price,
              totalCoinsSpent: s.stats.totalCoinsSpent + price,
              itemsPurchased: s.stats.itemsPurchased + 1,
            },
            inventory: newInventory,
          };
        });
        
        checkAchievements({ stats: get().stats, unlockAchievement: get().unlockAchievement } as any);
        return true;
      },

      useInventoryItem: (itemId) => {
        const state = get();
        const item = state.inventory.find(i => i.id === itemId);
        if (!item || item.quantity <= 0) return false;

        set((s) => ({
          inventory: s.inventory.map(i => 
            i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
          ).filter(i => i.quantity > 0),
        }));
        return true;
      },

      activateBuff: (type, durationMinutes) => {
        const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();
        set((state) => ({
          activeBuffs: [...state.activeBuffs.filter(b => b.type !== type), { type, expiresAt }]
        }));
      },

      openTreasureChest: () => {
        if (!get().useInventoryItem('treasure_chest')) return null;

        const possibleItems = [
          { id: 'xp_booster', name: 'XP-Booster' },
          { id: 'coins_booster', name: 'Münzen-Booster' },
          { id: 'streak_shield', name: 'Streak-Schild' },
          { id: 'joker_card', name: 'Joker-Karte' },
          { id: 'golden_frame', name: 'Goldener Rahmen' }
        ];

        const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

        // Add item back to inventory
        set((s) => {
            const existing = s.inventory.find(i => i.id === randomItem.id);
            let newInv = [...s.inventory];
            if (existing) {
                newInv = newInv.map(i => i.id === randomItem.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                newInv.push({ id: randomItem.id, name: randomItem.name, type: 'buff', quantity: 1, icon: '📦' });
            }
            return { inventory: newInv };
        });

        return { itemId: randomItem.id, name: randomItem.name };
      },

      hasActiveBuff: (type) => {
        const state = get();
        const now = new Date().toISOString();
        return state.activeBuffs.some(b => b.type === type && b.expiresAt > now);
      },

      collectDailyBonus: () => {
        const state = get();
        if (state.dailyBonusCollected) return null;
        
        const bonus = { coins: 20, xp: 30 };
        
        set((s) => ({
          stats: {
            ...s.stats,
            coins: s.stats.coins + bonus.coins,
            xp: s.stats.xp + bonus.xp,
            totalXpEarned: s.stats.totalXpEarned + bonus.xp,
          },
          dailyBonusCollected: true,
        }));
        
        return bonus;
      },

      incrementCategoryStat: (category) => {
        const categoryKey = category.toLowerCase() as keyof CategoryStats;
        set((state) => ({
          categoryStats: {
            ...state.categoryStats,
            [categoryKey]: (state.categoryStats[categoryKey] || 0) + 1,
          }
        }));
      },

      checkLoginBonus: () => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();
        
        if (state.stats.lastLoginDate === today) {
          return false;
        }
        
        let newConsecutiveDays = 1;
        if (state.stats.lastLoginDate === yesterday) {
          newConsecutiveDays = state.stats.consecutiveLoginDays + 1;
        }
        
        set((s) => ({
          stats: {
            ...s.stats,
            lastLoginDate: today,
            consecutiveLoginDays: newConsecutiveDays,
          },
          dailyBonusCollected: false,
        }));
        
        return true;
      },

      generateInviteCode: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        set({ inviteCode: code });
        return code;
      },

      addFriend: (friend: Friend) => {
        set((state) => {
          if (state.friends.find(f => f.id === friend.id)) return state;
          return { friends: [...state.friends, friend] };
        });
      },

      removeFriend: (friendId: string) => {
        set((state) => ({
          friends: state.friends.filter(f => f.id !== friendId),
        }));
      },

      acceptFriendRequest: (requestId: string) => {
        const state = get();
        const request = state.friendRequests.find(r => r.id === requestId);
        if (request) {
          const newFriend: Friend = {
            id: request.fromId,
            nickname: request.nickname,
            level: request.level,
            questsCompleted: 0,
            streak: 0,
            title: request.title,
            addedAt: new Date().toISOString(),
          };
          set((s) => ({
            friends: [...s.friends, newFriend],
            friendRequests: s.friendRequests.filter(r => r.id !== requestId),
          }));
        }
      },

      declineFriendRequest: (requestId: string) => {
        set((state) => ({
          friendRequests: state.friendRequests.filter(r => r.id !== requestId),
        }));
      },

      getLeaderboard: () => {
        const state = get();
        const friendEntries = state.friends.map((f) => ({
          nickname: f.nickname,
          level: f.level,
          questsCompleted: f.questsCompleted,
          streak: f.streak,
          title: f.title,
          isCurrentUser: false,
        }));

        const currentUser = { nickname: 'Du', level: state.stats.level, questsCompleted: state.stats.questsCompleted, streak: state.stats.streak, title: state.stats.title, isCurrentUser: true };
        
        const allUsers = [...friendEntries, currentUser].sort((a, b) => b.level - a.level || b.questsCompleted - a.questsCompleted);
        
        return allUsers.map((u, i) => ({
          rank: i + 1,
          nickname: u.nickname,
          level: u.level,
          questsCompleted: u.questsCompleted,
          streak: u.streak,
          title: u.title,
          isCurrentUser: u.isCurrentUser,
        }));
      },

      syncToCloud: async () => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return;

        try {
          const { cloudService } = await import('@/src/services/cloud');
          await cloudService.updateProfile(state.userId, {
            level: state.stats.level,
            xp: state.stats.xp,
            coins: state.stats.coins,
            quests_completed: state.stats.questsCompleted,
            streak: state.stats.streak,
            title: state.stats.title,
          });
        } catch (e) {
          console.log('Cloud sync error:', e);
        }
      },

      loadCloudFriends: async () => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return;

        try {
          const { cloudService } = await import('@/src/services/cloud');
          const friends = await cloudService.getFriends(state.userId);
          set({ cloudFriends: friends });
        } catch (e) {
          console.log('Load friends error:', e);
        }
      },

      loadCloudFriendRequests: async () => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return;

        try {
          const { cloudService } = await import('@/src/services/cloud');
          const requests = await cloudService.getPendingRequests(state.userId);
          set({ cloudFriendRequests: requests });
        } catch (e) {
          console.log('Load friend requests error:', e);
        }
      },

      loadCloudLeaderboard: async () => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return;

        try {
          const { cloudService } = await import('@/src/services/cloud');
          const leaderboard = await cloudService.getLeaderboard(state.userId);
          set({ cloudLeaderboard: leaderboard });
        } catch (e) {
          console.log('Load leaderboard error:', e);
        }
      },

      addCloudFriend: async (code: string) => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return false;

        try {
          const { cloudService } = await import('@/src/services/cloud');
          const profile = await cloudService.getProfileByCode(code);
          if (!profile || profile.id === state.userId) return false;
          return await cloudService.sendFriendRequestByCode(code);
        } catch (e) {
          console.log('Add friend error:', e);
          return false;
        }
      },

      loadCloudIdentity: async () => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return;
        try {
          const { cloudService } = await import('@/src/services/cloud');
          const profile = await cloudService.getMyProfile();
          if (profile) {
            set({ cloudInviteCode: profile.invite_code });
          }
        } catch (e) {
          console.log('Load cloud identity error:', e);
        }
      },

      acceptCloudFriendRequest: async (requestId: string) => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return false;
        try {
          const { cloudService } = await import('@/src/services/cloud');
          const ok = await cloudService.acceptFriendRequest(requestId);
          if (ok) {
            await get().loadCloudFriendRequests();
            await get().loadCloudFriends();
          }
          return ok;
        } catch (e) {
          console.log('Accept cloud friend request error:', e);
          return false;
        }
      },

      setAIMode: (mode) => {
        set({ aiMode: mode as 'cloud' | 'off' | null });
      },

      declineCloudFriendRequest: async (requestId: string) => {
        const state = get();
        if (!state.userId || state.accountType !== 'cloud') return false;
        try {
          const { cloudService } = await import('@/src/services/cloud');
          const ok = await cloudService.declineFriendRequest(requestId);
          if (ok) {
            await get().loadCloudFriendRequests();
          }
          return ok;
        } catch (e) {
          console.log('Decline cloud friend request error:', e);
          return false;
        }
      },
    }),
    {
      name: 'realpg-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function checkAchievements(state: any) {
  const { stats, categoryStats, unlockAchievement } = state;
  
  if (stats.questsCompleted >= 1) unlockAchievement('first_quest');
  if (stats.questsCompleted >= 10) unlockAchievement('quest_10');
  if (stats.questsCompleted >= 50) unlockAchievement('quest_50');
  if (stats.questsCompleted >= 100) unlockAchievement('quest_100');
  if (stats.questsCompleted >= 500) unlockAchievement('quest_500');
  if (stats.level >= 2) unlockAchievement('first_level');
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
  if (stats.coins >= 10000) unlockAchievement('millionaire');
  if (stats.totalCoinsSpent >= 500) unlockAchievement('high_roller');
  if (stats.itemsPurchased >= 1) unlockAchievement('first_purchase');
  if (stats.itemsPurchased >= 10) unlockAchievement('shopaholic');
  
  if (categoryStats?.sport >= 10) unlockAchievement('sport_10');
  if (categoryStats?.learning >= 10) unlockAchievement('learning_10');
  if (categoryStats?.social >= 10) unlockAchievement('social_10');
  if (categoryStats?.household >= 10) unlockAchievement('household_10');
  if (categoryStats?.wellbeing >= 10) unlockAchievement('wellness');
}
