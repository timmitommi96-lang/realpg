import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import { ACHIEVEMENTS, getAchievementProgress } from '@/src/services/achievements';
import { Trophy, Lock, Award } from 'lucide-react-native';
import { Confetti } from '@/src/components/animations';
import FoxMascot from '@/components/FoxMascot';

export default function Achievements() {
  const { isDark } = useTheme();
  const { stats, unlockedAchievements, newlyUnlockedAchievement, clearNewAchievement } = useAppStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);
  const s = isDark ? stylesDark : stylesLight;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  useEffect(() => {
    if (newlyUnlockedAchievement) {
      setShowConfetti(true);
      const achievement = ACHIEVEMENTS.find(a => a.id === newlyUnlockedAchievement);
      if (achievement) {
        setSelectedAchievement(achievement);
      }
    }
  }, [newlyUnlockedAchievement]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    clearNewAchievement();
  };

  const mascotReaction = useMemo(() => {
    const ratio = unlockedCount / totalCount;
    if (ratio === 0) {
      return { message: "Noch keine Erfolge? Lass uns heute den ersten schnappen!", expression: 'thinking' };
    }
    if (ratio < 0.3) {
      return { message: "Ein guter Anfang! Jeder Held fängt mal klein an.", expression: 'happy' };
    }
    if (ratio < 0.7) {
      return { message: "Du wirst immer stärker! Schau dir all diese Trophäen an!", expression: 'excited' };
    }
    if (ratio < 1) {
      return { message: "Fast am Ziel! Nur noch ein paar Quests bis zur Perfektion!", expression: 'quest' };
    }
    return { message: "UNGLAUBLICH! Du hast ALLES erreicht! Du bist ein wahrer Gott!", expression: 'success' };
  }, [unlockedCount, totalCount]);

  const renderItem = ({ item }: { item: typeof ACHIEVEMENTS[0] }) => {
    const isUnlocked = unlockedAchievements.includes(item.id);
    const progress = getAchievementProgress(item, stats);
    const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

    return (
      <TouchableOpacity
        style={[s.card, !isUnlocked && s.lockedCard]}
        onPress={() => setSelectedAchievement(item)}
      >
        <View style={[s.iconBox, !isUnlocked && s.lockedIconBox, { backgroundColor: isUnlocked ? `${item.color}20` : (isDark ? '#334155' : '#F2F2F2') }]}>
          {isUnlocked ? item.icon : <Lock color={isDark ? "#64748B" : "#AFAFAF"} size={24} />}
        </View>
        <View style={s.info}>
          <Text style={[s.achievementTitle, !isUnlocked && s.lockedText]}>{item.title}</Text>
          <Text style={s.achievementDesc}>{item.description}</Text>
          <View style={s.progressContainer}>
            <View style={s.progressBarWrapper}>
              <View style={[s.progressBar, { width: `${progressPercent}%`, backgroundColor: item.color }]} />
            </View>
            <Text style={s.progressText}>{progress.current}/{progress.target}</Text>
          </View>
        </View>
        {isUnlocked && <View style={[s.unlockedBadge, { backgroundColor: item.color }]}>
          <Trophy color="#FFFFFF" size={16} />
        </View>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <Confetti visible={showConfetti} onComplete={handleConfettiComplete} />
      
      <View style={s.header}>
        <View>
          <Text style={s.title}>ERFOLGE</Text>
          <Text style={s.subtitle}>{unlockedCount} / {totalCount} freigeschaltet</Text>
        </View>
        <Trophy color="#FFD700" size={32} fill="#FFD700" />
      </View>

      <FlatList
        data={ACHIEVEMENTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={{ marginVertical: 10 }}>
              <FoxMascot
                message={mascotReaction.message}
                expression={mascotReaction.expression as any}
                size={80}
              />
            </View>

            <View style={s.progressCard}>
              <View style={s.progressCircle}>
                <Text style={s.progressPercent}>{Math.round((unlockedCount / totalCount) * 100)}%</Text>
              </View>
              <View style={s.progressInfo}>
                <Text style={s.progressLabel}>GESAMTFORTSCHRITT</Text>
                <View style={s.statsRow}>
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{stats.questsCompleted}</Text>
                    <Text style={s.statLabel}>Quests</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{stats.streak}</Text>
                    <Text style={s.statLabel}>Streak</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{stats.level}</Text>
                    <Text style={s.statLabel}>Level</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        }
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F2',
  },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  subtitle: { fontSize: 13, color: '#AFAFAF', fontWeight: '600', marginTop: 4 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F2F2F2',
    borderBottomWidth: 6,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7F24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressPercent: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  progressInfo: { flex: 1 },
  progressLabel: { fontSize: 12, fontWeight: '900', color: '#AFAFAF', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#4B4B4B' },
  statLabel: { fontSize: 11, color: '#AFAFAF', fontWeight: '700' },
  list: { paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 5,
  },
  lockedCard: { backgroundColor: '#F7F7F7', opacity: 0.8 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lockedIconBox: { backgroundColor: '#F2F2F2' },
  info: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '800', color: '#4B4B4B' },
  lockedText: { color: '#AFAFAF' },
  achievementDesc: { fontSize: 12, color: '#AFAFAF', marginTop: 2, fontWeight: '500' },
  progressContainer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarWrapper: { flex: 1, height: 8, backgroundColor: '#F2F2F2', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  progressText: { color: '#AFAFAF', fontSize: 11, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
  },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  subtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
    borderBottomWidth: 6,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7F24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressPercent: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  progressInfo: { flex: 1 },
  progressLabel: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#F1F5F9' },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  list: { paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderBottomWidth: 5,
  },
  lockedCard: { backgroundColor: '#0F172A', opacity: 0.7 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lockedIconBox: { backgroundColor: '#334155' },
  info: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '800', color: '#F1F5F9' },
  lockedText: { color: '#64748B' },
  achievementDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  progressContainer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarWrapper: { flex: 1, height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  progressText: { color: '#94A3B8', fontSize: 11, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
