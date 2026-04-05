import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';

interface FoxMascotProps {
  message: string;
  expression?: 'happy' | 'thinking' | 'quest' | 'success';
}

export default function FoxMascot({ message, expression = 'happy' }: FoxMascotProps) {
  const floatValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    scaleValue.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatValue.value },
        { scale: scaleValue.value }
      ],
    };
  });

  const getExpressionEmoji = () => {
    switch (expression) {
      case 'thinking': return '🤔';
      case 'quest': return '⚔️';
      case 'success': return '🎉';
      default: return '🦊';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mascotContainer, animatedStyle]}>
        <View style={styles.foxHead}>
           <Text style={styles.emoji}>{getExpressionEmoji()}</Text>
        </View>
        <View style={styles.foxShadow} />
      </Animated.View>
      
      <View style={styles.bubbleContainer}>
        <View style={styles.bubble}>
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={styles.bubbleTail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  foxHead: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF7F24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#FF7F24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 32,
  },
  foxShadow: {
    width: 30,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 8,
  },
  bubbleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F2F2F2',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bubbleTail: {
    position: 'absolute',
    left: -10,
    top: 20,
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
    fontSize: 16,
    color: '#4B4B4B',
    fontWeight: '700',
    lineHeight: 22,
  },
});
