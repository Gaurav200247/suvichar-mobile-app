import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, StyleProp } from 'react-native';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  disabled?: boolean;
  scaleValue?: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  style,
  className,
  disabled = false,
  scaleValue = 0.96,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale: scaleAnim }], opacity: disabled ? 0.6 : 1 },
        ]}
        className={className}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedButton;

