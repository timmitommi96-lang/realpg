import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  size?: number;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  color = '#FF7F24',
  size = 32 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  return (
    <Text style={[styles.counter, { color, fontSize: size }]}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}

interface ConfettiProps {
  visible: boolean;
  onComplete?: () => void;
}

export function Confetti({ visible, onComplete }: ConfettiProps) {
  const animations = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(Math.random() * 400 - 50),
      y: new Animated.Value(-20),
      rotation: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      const startX = 150 + (Math.random() - 0.5) * 200;
      animations.forEach((anim, index) => {
        Animated.parallel([
          Animated.timing(anim.y, {
            toValue: 600,
            duration: 2000 + Math.random() * 1000,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim.x, {
            toValue: startX,
            duration: 2000,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotation, {
            toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
            duration: 2000,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2500,
            delay: index * 50,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      setTimeout(() => onComplete?.(), 3000);
    }
  }, [visible]);

  if (!visible) return null;

  const colors = ['#FFD700', '#FF7F24', '#7C3AED', '#10B981', '#EC4899', '#FF4B4B'];

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: colors[index % colors.length],
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                { rotate: anim.rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
              ],
              opacity: anim.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

interface XPBubbleProps {
  amount: number;
  visible: boolean;
  onComplete: () => void;
}

export function XPBubble({ amount, visible, onComplete }: XPBubbleProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(1000),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => {
        translateY.setValue(0);
        onComplete();
      });
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.xpBubble,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={styles.xpBubbleText}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontWeight: '900',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 9999,
  },
  confettiPiece: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
    top: -20,
  },
  xpBubble: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -50,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  xpBubbleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
});
