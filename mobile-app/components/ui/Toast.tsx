import React, { useRef, useEffect } from 'react';
import { Animated, Text, View } from 'react-native';
import { Zap } from 'lucide-react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  icon?: React.ReactNode;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  icon,
  duration = 2200,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, translateY, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY }], opacity }}
      className="absolute bottom-8 left-6 right-6 bg-gray-900 rounded-2xl py-4 px-5 z-50 shadow-lg flex-row items-center justify-center"
    >
      {icon || <Zap size={18} color="#FBBF24" />}
      <Text className="text-white text-center font-medium ml-2">{message}</Text>
    </Animated.View>
  );
};

export default Toast;

