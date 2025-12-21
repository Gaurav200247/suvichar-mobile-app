import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AnimatedTabIcon, AnimatedTabBarButton } from '../../../components';

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
            <AnimatedTabIcon Icon={Home} focused={focused} color={color} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={User} focused={focused} color={color} isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  );
}
