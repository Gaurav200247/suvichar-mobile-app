import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { Animated, Pressable } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext';

// Animated Tab Icon Component
const AnimatedTabIcon = ({ 
  Icon, 
  focused, 
  color, 
  isDark 
}: { 
  Icon: typeof Home; 
  focused: boolean; 
  color: string; 
  isDark: boolean;
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
  }, [focused]);

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
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
          borderRadius: 14,
          opacity: bgOpacity,
        }}
      />
      <Icon 
        size={22} 
        color={color}
        strokeWidth={focused ? 2.5 : 1.8}
      />
    </Animated.View>
  );
};

// Custom Tab Bar Button with press animation
const AnimatedTabBarButton = ({ children, onPress, ...props }: any) => {
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
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TabsLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#27272A' : '#E4E4E7',
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 16,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: isDark ? '#71717A' : '#A1A1AA',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              Icon={Home} 
              focused={focused} 
              color={color} 
              isDark={isDark} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              Icon={User} 
              focused={focused} 
              color={color} 
              isDark={isDark} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
