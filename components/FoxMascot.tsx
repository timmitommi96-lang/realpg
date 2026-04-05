import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface FoxMascotProps {
  message: string;
  expression?: 'happy' | 'thinking' | 'quest' | 'success';
}

export default function FoxMascot({ message, expression = 'happy' }: FoxMascotProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation.start();
    scaleAnimation.start();

    return () => {
      floatAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

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
      <Animated.View 
        style={[
          styles.mascotContainer, 
          { 
            transform: [
              { translateY: floatAnim },
              { scale: scaleAnim }
            ] 
          }
        ]}
      >
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
