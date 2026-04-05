import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/src/store/useAppStore';
import { ACHIEVEMENTS, getAchievementProgress } from '@/src/services/achievements';
import { Trophy, Lock, Award } from 'lucide-react-native';
import { Confetti } from '@/src/components/animations';

export default function Achievements() {
  const { stats, unlockedAchievements } = useAppStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  const renderItem = ({ item }: { item: typeof ACHIEVEMENTS[0] }) => {
    const isUnlocked = unlockedAchievements.includes(item.id);
    const progress = getAchievementProgress(item, stats);
    const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

    return (
      <TouchableOpacity
        style={[styles.card, !isUnlocked && styles.lockedCard]}
        onPress={() => setSelectedAchievement(item)}
      >
        <View style={[styles.iconBox, !isUnlocked && styles.lockedIconBox, { backgroundColor: isUnlocked ? `${item.color}20` : '#F2F2F2' }]}>
          {isUnlocked ? item.icon : <Lock color="#AFAFAF" size={24} />}
        </View>
        <View style={styles.info}>
          <Text style={[styles.achievementTitle, !isUnlocked && styles.lockedText]}>{item.title}</Text>
          <Text style={styles.achievementDesc}>{item.description}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: item.color }]} />
            </View>
            <Text style={styles.progressText}>{progress.current}/{progress.target}</Text>
          </View>
        </View>
        {isUnlocked && <View style={[styles.unlockedBadge, { backgroundColor: item.color }]}>
          <Trophy color="#FFFFFF" size={16} />
        </View>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Confetti visible={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ERFOLGE</Text>
          <Text style={styles.subtitle}>{unlockedCount} / {totalCount} freigeschaltet</Text>
        </View>
        <Trophy color="#FFD700" size={32} fill="#FFD700" />
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{Math.round((unlockedCount / totalCount) * 100)}%</Text>
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>GESAMTFORTSCHRITT</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.questsCompleted}</Text>
              <Text style={styles.statLabel}>Quests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={ACHIEVEMENTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Award color="#AFAFAF" size={48} />
            <Text style={styles.emptyText}>Lade deine Erfolge!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    margin: 16,
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
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
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
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#AFAFAF', marginTop: 16, fontWeight: '600' },
});
