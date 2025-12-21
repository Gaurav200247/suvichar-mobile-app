import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface AnimatedTabIconProps {
  Icon: LucideIcon;
  focused: boolean;
  color: string;
  isDark: boolean;
}

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  Icon,
  focused,
  color,
  isDark,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(bgOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, bgOpacity]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        borderRadius: 14,
        padding: 10,
        position: 'relative',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark
            ? 'rgba(99, 102, 241, 0.2)'
            : 'rgba(99, 102, 241, 0.1)',
          borderRadius: 14,
          opacity: bgOpacity,
        }}
      />
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    </Animated.View>
  );
};

export default AnimatedTabIcon;

