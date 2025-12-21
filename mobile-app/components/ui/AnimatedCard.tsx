import React, { useRef, useEffect } from 'react';
import { Animated, Easing, ViewStyle, StyleProp } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  style,
}) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, translateY, opacity]);

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity }, style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedCard;

