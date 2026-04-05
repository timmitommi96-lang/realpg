import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GeneratedQuest } from '@/src/services/ai';
import { useTheme } from '@/src/context/ThemeContext';
import { Trophy, Zap, ChevronRight } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface QuestCardProps {
  quest: GeneratedQuest;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return '#00CD00';
    case 'Medium': return '#FFB000';
    case 'Hard': return '#FF4B4B';
    default: return '#FF7F24';
  }
};

export default function QuestCard({ quest, onPress }: QuestCardProps) {
  const { isDark } = useTheme();
  const pressed = useSharedValue(0);
  const s = isDark ? stylesDark : stylesLight;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(interpolate(pressed.value, [0, 1], [1, 0.96]), { damping: 10, stiffness: 100 }) }
      ] as any,
    };
  });

  const handlePressIn = () => {
    pressed.value = 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = 0;
  };

  return (
    <AnimatedPressable 
      style={[s.card, animatedStyle]} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress} 
    >
      <View style={s.header}>
        <View style={[s.badge, { backgroundColor: getDifficultyColor(quest.difficulty) + '15' }]}>
          <Text style={[s.badgeText, { color: getDifficultyColor(quest.difficulty) }]}>
            {quest.difficulty.toUpperCase()}
          </Text>
        </View>
        <View style={s.rewardContainer}>
          <View style={s.rewardItem}>
            <Trophy size={16} color="#FFD700" />
            <Text style={s.rewardText}>{quest.xp} XP</Text>
          </View>
          <View style={s.rewardItem}>
            <Zap size={16} color="#FF7F24" fill="#FF7F24" />
            <Text style={s.rewardText}>{quest.coins}</Text>
          </View>
        </View>
      </View>

      <Text style={s.title}>{quest.title}</Text>
      <Text style={s.description} numberOfLines={2}>{quest.description}</Text>

      <View style={s.footer}>
        <View style={s.categoryContainer}>
          <Text style={s.categoryText}>#{quest.category}</Text>
        </View>
        <View style={s.actionBtn}>
           <Text style={s.actionText}>LOS GEHT'S</Text>
           <ChevronRight size={18} color="#FF7F24" strokeWidth={3} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const stylesLight = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  rewardContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: '#4B4B4B',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: '#4B4B4B',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    color: '#AFAFAF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#F2F2F2',
    paddingTop: 16,
  },
  categoryContainer: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#AFAFAF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FF7F24',
    fontSize: 14,
    fontWeight: '800',
  }
});

const stylesDark = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
    borderBottomWidth: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  rewardContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  categoryContainer: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FF7F24',
    fontSize: 14,
    fontWeight: '800',
  }
});
