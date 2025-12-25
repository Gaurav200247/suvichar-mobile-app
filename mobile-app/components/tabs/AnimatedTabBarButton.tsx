import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';

interface AnimatedTabBarButtonProps extends PressableProps {
  children: React.ReactNode;
}

export const AnimatedTabBarButton: React.FC<AnimatedTabBarButtonProps> = ({
  children,
  onPress,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      {...props}
    >
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedTabBarButton;

