import React from 'react';
import { StyleSheet, Text, ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  colors?: [string, string];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CustomButton({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  style,
  colors = ['#FF7F24', '#FF5500']
}: CustomButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(interpolate(pressed.value, [0, 1], [1, 0.95]), { damping: 10, stiffness: 200 });
    return {
      transform: [{ scale }],
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonWrapper,
        style,
        animatedStyle
      ]}
    >
      <View style={[styles.shadow, (disabled || loading) && styles.disabledShadow]} />
      <LinearGradient
        colors={disabled || loading ? ['#E5E5E5', '#D4D4D4'] : colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.text}>{title.toUpperCase()}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: '100%',
    height: 64,
    marginBottom: 8,
  },
  shadow: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    bottom: -5,
    backgroundColor: '#CC5500',
    borderRadius: 20,
  },
  disabledShadow: {
    backgroundColor: '#CCC',
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
