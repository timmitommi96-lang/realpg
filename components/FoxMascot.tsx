import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

export type FoxExpression =
  | 'happy' | 'thinking' | 'quest' | 'success' | 'idle' | 'sleep'
  | 'level_up' | 'sad' | 'excited' | 'working' | 'shop';

interface FoxMascotProps {
  message?: string;
  expression?: FoxExpression;
  size?: number;
}

function getFoxEmoji(expression: FoxExpression): string {
  switch (expression) {
    case 'happy': return '🦊✨';
    case 'thinking': return '🤔🦊';
    case 'quest': return '⚔️🦊';
    case 'success': return '🎉🦊';
    case 'idle': return '🦊';
    case 'sleep': return '💤🦊';
    case 'level_up': return '⭐🦊';
    case 'sad': return '😿🦊';
    case 'excited': return '🎊🦊';
    case 'working': return '💪🦊';
    case 'shop': return '🛒🦊';
    default: return '🦊';
  }
}

function getFoxColor(expression: FoxExpression): string {
  switch (expression) {
    case 'happy':
    case 'excited': return '#FF7F24';
    case 'thinking': return '#9B59B6';
    case 'quest':
    case 'working': return '#3B82F6';
    case 'success':
    case 'level_up': return '#10B981';
    case 'sleep': return '#AFAFAF';
    case 'sad': return '#EF4444';
    case 'shop': return '#FFD700';
    default: return '#FF7F24';
  }
}

function getImage(expression: FoxExpression) {
  switch (expression) {
    case 'idle':
    case 'happy':
    case 'excited':
    case 'shop':
      return require('../assets/images/fox_idle.png');
    case 'quest':
    case 'working':
      return require('../assets/images/fox_quest_accepted.png');
    case 'success':
    case 'level_up':
      return require('../assets/images/fox_quest_completed.png');
    case 'sleep':
    case 'thinking':
    case 'sad':
      return require('../assets/images/fox_sleep.png');
    default:
      return require('../assets/images/fox_idle.png');
  }
}

export default function FoxMascot({ message, expression = 'idle', size = 100 }: FoxMascotProps) {
  const { isDark } = useTheme();
  const [imageError, setImageError] = useState(false);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bubbleScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.03, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    floatAnimation.start();
    breathingAnimation.start();
    return () => { floatAnimation.stop(); breathingAnimation.stop(); };
  }, []);

  useEffect(() => {
    if (message) {
      Animated.spring(bubbleScaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(bubbleScaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [message]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: floatAnim }, { scale: scaleAnim }] }}>
        {imageError ? (
          <View style={[styles.foxCircle, { width: size, height: size, backgroundColor: getFoxColor(expression) }]}>
            <Text style={[styles.foxEmoji, { fontSize: size * 0.45 }]}>{getFoxEmoji(expression)}</Text>
          </View>
        ) : (
          <Image
            source={getImage(expression)}
            style={{ width: size, height: size }}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        )}
        <View style={[styles.foxShadow, isDark && styles.foxShadowDark, { width: size * 0.4 }]} />
      </Animated.View>

      {message && (
        <Animated.View
          style={[
            styles.bubbleContainer,
            { transform: [{ scale: bubbleScaleAnim }], opacity: bubbleScaleAnim },
          ]}
        >
          <View style={[styles.bubble, isDark && styles.bubbleDark]}>
            <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>
          </View>
          <View style={[styles.bubbleTail, isDark && styles.bubbleTailDark]} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 10,
  },
  foxCircle: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  foxEmoji: {
    textAlign: 'center',
  },
  foxShadow: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 4,
  },
  foxShadowDark: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bubbleContainer: {
    flex: 1,
    marginLeft: 18,
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F2F2F2',
    borderBottomWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 25,
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#F2F2F2',
    transform: [{ rotate: '45deg' }],
    zIndex: -1,
  },
  message: {
    fontSize: 15,
    color: '#4B4B4B',
    fontWeight: '800',
    lineHeight: 20,
  },
  bubbleDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  bubbleTailDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  messageDark: {
    color: '#F1F5F9',
  },
});