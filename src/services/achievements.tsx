import { Trophy, Zap, Flame, Star, Target, Award, ZapOff, Users, Dumbbell, BookOpen, Home, Coffee, Brain, Crown, Medal, Rocket, Heart, Shield, Sun, Moon, Clock, Calendar, CheckCircle, Lock, Gem, Sparkles, TrendingUp, FlameIcon } from 'lucide-react-native';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'level' | 'quests' | 'streak' | 'coins' | 'category' | 'special';
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quest', title: 'Erster Schritt', description: 'Schließe deine erste Quest ab', icon: <Star color="#FFD700" size={28} />, category: 'quests', color: '#FFD700' },
  { id: 'quest_10', title: 'Quest-Meister', description: 'Schließe 10 Quests ab', icon: <Target color="#FF7F24" size={28} />, category: 'quests', color: '#FF7F24' },
  { id: 'quest_50', title: 'Epos-Quelle', description: 'Schließe 50 Quests ab', icon: <Trophy color="#FFD700" size={28} />, category: 'quests', color: '#FFD700' },
  { id: 'quest_100', title: 'Unaufhaltsam', description: 'Schließe 100 Quests ab', icon: <Crown color="#FFD700" size={28} />, category: 'quests', color: '#FFD700' },
  { id: 'quest_500', title: 'Legende', description: 'Schließe 500 Quests ab', icon: <Sparkles color="#7C3AED" size={28} />, category: 'quests', color: '#7C3AED' },
  { id: 'level_5', title: 'Neuling', description: 'Erreiche Level 5', icon: <TrendingUp color="#10B981" size={28} />, category: 'level', color: '#10B981' },
  { id: 'level_10', title: 'Aufsteiger', description: 'Erreiche Level 10', icon: <TrendingUp color="#10B981" size={28} />, category: 'level', color: '#10B981' },
  { id: 'level_20', title: 'Veteran', description: 'Erreiche Level 20', icon: <Medal color="#EF4444" size={28} />, category: 'level', color: '#EF4444' },
  { id: 'level_30', title: 'Champion', description: 'Erreiche Level 30', icon: <Medal color="#EF4444" size={28} />, category: 'level', color: '#EF4444' },
  { id: 'level_50', title: 'Mythos', description: 'Erreiche Level 50', icon: <Crown color="#7C3AED" size={28} />, category: 'level', color: '#7C3AED' },
  { id: 'level_100', title: 'Unsterblich', description: 'Erreiche Level 100', icon: <Sparkles color="#EC4899" size={28} />, category: 'level', color: '#EC4899' },
  { id: 'streak_3', title: 'Dreierstreik', description: '3 Tage in Folge', icon: <Flame color="#FF4B4B" size={28} />, category: 'streak', color: '#FF4B4B' },
  { id: 'streak_7', title: 'Wochenkämpfer', description: '7 Tage in Folge', icon: <Flame color="#FF4B4B" size={28} />, category: 'streak', color: '#FF4B4B' },
  { id: 'streak_30', title: 'Monatsheld', description: '30 Tage in Folge', icon: <Flame color="#7C3AED" size={28} />, category: 'streak', color: '#7C3AED' },
  { id: 'streak_100', title: 'Unaufhaltsam', description: '100 Tage in Folge', icon: <Rocket color="#EC4899" size={28} />, category: 'streak', color: '#EC4899' },
  { id: 'coins_100', title: 'Geldwechsler', description: 'Sammle 100 Münzen', icon: <Zap color="#00CD00" size={28} />, category: 'coins', color: '#00CD00' },
  { id: 'coins_500', title: 'Münzmagier', description: 'Sammle 500 Münzen', icon: <Gem color="#00CD00" size={28} />, category: 'coins', color: '#00CD00' },
  { id: 'coins_1000', title: 'Goldschatz', description: 'Sammle 1000 Münzen', icon: <Gem color="#FFD700" size={28} />, category: 'coins', color: '#FFD700' },
  { id: 'sport_10', title: 'Sportler', description: 'Schließe 10 Sport-Quests ab', icon: <Dumbbell color="#EF4444" size={28} />, category: 'category', color: '#EF4444' },
  { id: 'learning_10', title: 'Wissensdurst', description: 'Schließe 10 Lern-Quests ab', icon: <BookOpen color="#3B82F6" size={28} />, category: 'category', color: '#3B82F6' },
  { id: 'social_10', title: 'Gesellig', description: 'Schließe 10 Social-Quests ab', icon: <Users color="#10B981" size={28} />, category: 'category', color: '#10B981' },
  { id: 'household_10', title: 'Haushaltsheld', description: 'Schließe 10 Haushalts-Quests ab', icon: <Home color="#F59E0B" size={28} />, category: 'category', color: '#F59E0B' },
  { id: 'early_bird', title: 'Frühaufsteher', description: 'Quest vor 7 Uhr', icon: <Sun color="#F59E0B" size={28} />, category: 'special', color: '#F59E0B' },
  { id: 'night_owl', title: 'Nachteule', description: 'Quest nach 22 Uhr', icon: <Moon color="#7C3AED" size={28} />, category: 'special', color: '#7C3AED' },
  { id: 'speed_demon', title: 'Schnellstarter', description: 'Quest in unter 5 Min', icon: <Clock color="#3B82F6" size={28} />, category: 'special', color: '#3B82F6' },
  { id: 'weekend_warrior', title: 'Wochenend-Krieger', description: 'Am Wochenende Quests', icon: <Calendar color="#10B981" size={28} />, category: 'special', color: '#10B981' },
  { id: 'first_level', title: 'Level-Up!', description: 'Erreiche Level 2', icon: <TrendingUp color="#10B981" size={28} />, category: 'level', color: '#10B981' },
  { id: 'collector', title: 'Sammler', description: 'Schließe 5 verschiedene Kategorien ab', icon: <Trophy color="#FFD700" size={28} />, category: 'special', color: '#FFD700' },
  { id: 'dedicated', title: 'Engagiert', description: 'Tägliche Quests für 14 Tage', icon: <Heart color="#EC4899" size={28} />, category: 'special', color: '#EC4899' },
  { id: 'unstoppable', title: 'Nicht zu stoppen', description: 'Quests an 5 aufeinanderfolgenden Tagen', icon: <Shield color="#7C3AED" size={28} />, category: 'special', color: '#7C3AED' },
  { id: 'balanced', title: 'Ausbalanciert', description: 'Quests in allen Kategorien', icon: <CheckCircle color="#10B981" size={28} />, category: 'special', color: '#10B981' },
  { id: 'early_adopter', title: 'Early Adopter', description: 'Nutze Fynix eine Woche', icon: <Rocket color="#EC4899" size={28} />, category: 'special', color: '#EC4899' },
  { id: 'helper', title: 'Helfer', description: 'Hilf dir selbst', icon: <Heart color="#EF4444" size={28} />, category: 'special', color: '#EF4444' },
  { id: 'thinker', title: 'Denker', description: '10 Lern-Quests', icon: <Brain color="#3B82F6" size={28} />, category: 'category', color: '#3B82F6' },
  { id: 'social_butterfly', title: 'Schmetterling', description: '10 Social-Quests', icon: <Users color="#10B981" size={28} />, category: 'category', color: '#10B981' },
  { id: 'home_improver', title: 'Verbesserer', description: '10 Haushalts-Quests', icon: <Home color="#F59E0B" size={28} />, category: 'category', color: '#F59E0B' },
  { id: 'wellness', title: 'Wellness-König', description: '10 Entspannungs-Quests', icon: <Coffee color="#8B5CF6" size={28} />, category: 'category', color: '#8B5CF6' },
  { id: 'perfectionist', title: 'Perfektionist', description: 'Alle Quests eines Tages', icon: <Star color="#FFD700" size={28} />, category: 'special', color: '#FFD700' },
  { id: 'variety_seeker', title: 'Abwechslungssucher', description: 'Probiere 3 verschiedene Kategorien', icon: <Sparkles color="#EC4899" size={28} />, category: 'special', color: '#EC4899' },
  { id: 'marathon', title: 'Marathon', description: '5 Quests an einem Tag', icon: <Flame color="#FF4B4B" size={28} />, category: 'special', color: '#FF4B4B' },
  { id: 'millionaire', title: 'Millionär', description: 'Sammle 10000 Münzen', icon: <Gem color="#FFD700" size={28} />, category: 'coins', color: '#FFD700' },
  { id: 'high_roller', title: 'High Roller', description: 'Gib 500 Münzen im Shop aus', icon: <Zap color="#00CD00" size={28} />, category: 'coins', color: '#00CD00' },
  { id: 'shopaholic', title: 'Shopaholic', description: 'Kaufe 10 Items', icon: <Target color="#FF7F24" size={28} />, category: 'special', color: '#FF7F24' },
  { id: 'first_purchase', title: 'Erster Kauf', description: 'Kaufe etwas im Shop', icon: <Trophy color="#FFD700" size={28} />, category: 'special', color: '#FFD700' },
  { id: 'joker_used', title: 'Glückspilz', description: 'Nutze einen Joker', icon: <Sparkles color="#EC4899" size={28} />, category: 'special', color: '#EC4899' },
  { id: 'zen_master', title: 'Zen-Meister', description: 'Schließe 25 Entspannungs-Quests ab', icon: <Coffee color="#8B5CF6" size={28} />, category: 'category', color: '#8B5CF6' },
  { id: 'growth', title: 'Wachstum', description: 'Steige 5 Level in einer Woche', icon: <TrendingUp color="#10B981" size={28} />, category: 'level', color: '#10B981' },
  { id: 'century', title: 'Jahrhundert', description: 'Erreiche Level 100', icon: <Crown color="#7C3AED" size={28} />, category: 'level', color: '#7C3AED' },
];

export const getAchievementProgress = (achievement: Achievement, stats: any): { current: number; target: number } => {
  const id = achievement.id;
  
  if (id.startsWith('quest_')) {
    const target = parseInt(id.split('_')[1]);
    return { current: Math.min(stats.questsCompleted, target), target };
  }
  if (id.startsWith('level_')) {
    const target = parseInt(id.split('_')[1]);
    return { current: Math.min(stats.level, target), target };
  }
  if (id.startsWith('streak_')) {
    const target = parseInt(id.split('_')[1]);
    return { current: Math.min(stats.streak, target), target };
  }
  if (id.startsWith('coins_')) {
    const target = parseInt(id.split('_')[1]);
    return { current: Math.min(stats.coins, target), target };
  }
  
  return { current: achievement.category === 'special' ? 0 : 0, target: 1 };
};
