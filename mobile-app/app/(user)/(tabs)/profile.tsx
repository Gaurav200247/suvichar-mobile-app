import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut,
  User,
  Crown,
  ChevronRight,
  Pencil,
  Download,
  ImageIcon,
  Star,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { useLogoutMutation } from '../../../store/api/authApi';
import { useGetUserProfileQuery } from '../../../store/api/userApi';
import { DOWNLOADED_QUOTES, DownloadedQuote } from '../../../constants';
import { useTheme } from '../../../context/ThemeContext';

// Animated Pressable Component
const AnimatedPressable = ({ 
  onPress, 
  children, 
  style,
  disabled = false,
}: { 
  onPress: () => void; 
  children: React.ReactNode; 
  style?: any;
  disabled?: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
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
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }], opacity: disabled ? 0.6 : 1 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  isDark,
  accentColor = '#6366F1',
}: {
  icon: typeof Download;
  value: string | number;
  label: string;
  isDark: boolean;
  accentColor?: string;
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: isDark ? '#18181B' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${accentColor}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
      }}
    >
      <Icon size={20} color={accentColor} />
    </View>
    <Text
      style={{
        fontSize: 20,
        fontWeight: '700',
        color: isDark ? '#FAFAFA' : '#18181B',
        marginBottom: 2,
      }}
    >
      {value}
    </Text>
    <Text style={{ fontSize: 12, color: isDark ? '#71717A' : '#A1A1AA' }}>
      {label}
    </Text>
  </View>
);

// Menu Row Component
const MenuRow = ({ 
  icon: Icon, 
  title, 
  onPress, 
  isDark,
  isLast = false,
  danger = false,
  rightElement,
}: {
  icon: typeof LogOut;
  title: string;
  onPress?: () => void;
  isDark: boolean;
  isLast?: boolean;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: isDark ? '#27272A' : '#F4F4F5',
    }}
  >
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: danger 
          ? 'rgba(239, 68, 68, 0.1)' 
          : (isDark ? '#27272A' : '#F4F4F5'),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}
    >
      <Icon size={18} color={danger ? '#EF4444' : (isDark ? '#A1A1AA' : '#71717A')} />
    </View>
    <Text
      style={{
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: danger ? '#EF4444' : (isDark ? '#FAFAFA' : '#18181B'),
      }}
    >
      {title}
    </Text>
    {rightElement || (onPress && <ChevronRight size={18} color={isDark ? '#3F3F46' : '#D4D4D8'} />)}
  </TouchableOpacity>
);

// Theme Option Button
const ThemeOptionButton = ({
  mode,
  currentMode,
  onPress,
  isDark,
  icon: Icon,
  label,
}: {
  mode: 'light' | 'dark' | 'system';
  currentMode: string;
  onPress: () => void;
  isDark: boolean;
  icon: typeof Sun;
  label: string;
}) => {
  const isSelected = currentMode === mode;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: isSelected 
          ? (isDark ? '#6366F1' : '#6366F1')
          : (isDark ? '#27272A' : '#F4F4F5'),
      }}
    >
      <Icon 
        size={20} 
        color={isSelected ? '#FFFFFF' : (isDark ? '#A1A1AA' : '#71717A')} 
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          color: isSelected ? '#FFFFFF' : (isDark ? '#A1A1AA' : '#71717A'),
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: profileData, isLoading: isLoadingProfile } = useGetUserProfileQuery();
  const user = profileData?.user;
  const [logoutApi] = useLogoutMutation();
  const isPremium = false; // Would come from user subscription status

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutApi().unwrap();
            } catch (error) {
              // Continue with local logout even if API fails
            }
            dispatch(logout());
            router.replace('/(auth)/login' as Href);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }}
      >
        {/* Profile Header Section */}
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 32 }}>
          {/* Profile Image */}
          <View style={{ marginBottom: 16 }}>
            {isLoadingProfile ? (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: isDark ? '#27272A' : '#E2E8F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size="large" color={isDark ? '#A1A1AA' : '#64748B'} />
              </View>
            ) : (
              <View style={{ position: 'relative' }}>
                {user?.profileImageUrl ? (
                  <Image
                    source={{ uri: user.profileImageUrl }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 3,
                      borderColor: isDark ? '#3F3F46' : '#E2E8F0',
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: isDark ? '#27272A' : '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 3,
                      borderColor: isDark ? '#3F3F46' : '#CBD5E1',
                    }}
                  >
                    <User size={44} color={isDark ? '#52525B' : '#94A3B8'} />
                  </View>
                )}
                
                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => router.push('/(user)/profile-setup?mode=edit' as Href)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#6366F1',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: isDark ? '#09090B' : '#F8FAFC',
                  }}
                >
                  <Pencil size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* User Name */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: isDark ? '#FAFAFA' : '#0F172A',
              marginBottom: 4,
              letterSpacing: -0.5,
            }}
          >
            {user?.name || 'Your Name'}
          </Text>

          {/* Phone Number */}
          <Text style={{ fontSize: 14, color: isDark ? '#71717A' : '#64748B', marginBottom: 12 }}>
            {user?.phoneNumber || 'Add phone number'}
          </Text>

          {/* Plan Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: isPremium 
                ? 'rgba(251, 191, 36, 0.15)' 
                : (isDark ? '#27272A' : '#E2E8F0'),
            }}
          >
            {isPremium && <Crown size={14} color="#F59E0B" style={{ marginRight: 6 }} />}
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isPremium ? '#F59E0B' : (isDark ? '#A1A1AA' : '#64748B'),
              }}
            >
              {isPremium ? 'Premium' : 'Free Plan'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
          <StatCard
            icon={Download}
            value="12"
            label="Downloads"
            isDark={isDark}
            accentColor="#10B981"
          />
          <StatCard
            icon={ImageIcon}
            value={isPremium ? '∞' : '5'}
            label="Remaining"
            isDark={isDark}
            accentColor="#6366F1"
          />
          <StatCard
            icon={Star}
            value="4.8"
            label="Rating"
            isDark={isDark}
            accentColor="#F59E0B"
          />
        </View>

        {/* Upgrade Banner (for non-premium users) */}
        {!isPremium && (
          <AnimatedPressable
            onPress={() => router.push('/(plans)/plans' as Href)}
            style={{ marginHorizontal: 20, marginBottom: 24 }}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Crown size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 }}>
                  Upgrade to Premium
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                  Unlimited downloads • No watermarks
                </Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </AnimatedPressable>
        )}

        {/* Appearance Section */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: isDark ? '#18181B' : '#FFFFFF',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          {/* Section Header */}
          <View 
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingHorizontal: 18,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#27272A' : '#F1F5F9',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#27272A' : '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                {isDark ? (
                  <Moon size={16} color="#A1A1AA" />
                ) : (
                  <Sun size={16} color="#64748B" />
                )}
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: isDark ? '#FAFAFA' : '#0F172A',
                }}
              >
                Appearance
              </Text>
            </View>
          </View>

          {/* Theme Options */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#71717A' : '#64748B',
                marginBottom: 12,
              }}
            >
              Choose your preferred theme
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ThemeOptionButton
                mode="light"
                currentMode={themeMode}
                onPress={() => setThemeMode('light')}
                isDark={isDark}
                icon={Sun}
                label="Light"
              />
              <ThemeOptionButton
                mode="dark"
                currentMode={themeMode}
                onPress={() => setThemeMode('dark')}
                isDark={isDark}
                icon={Moon}
                label="Dark"
              />
              <ThemeOptionButton
                mode="system"
                currentMode={themeMode}
                onPress={() => setThemeMode('system')}
                isDark={isDark}
                icon={Smartphone}
                label="System"
              />
            </View>
          </View>
        </View>

        {/* Downloads Section */}
        <View 
          style={{ 
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: isDark ? '#18181B' : '#FFFFFF',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          {/* Section Header */}
          <View 
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingHorizontal: 18,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#27272A' : '#F1F5F9',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#27272A' : '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <ImageIcon size={16} color={isDark ? '#A1A1AA' : '#64748B'} />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: isDark ? '#FAFAFA' : '#0F172A',
                }}
              >
                My Downloads
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: isDark ? '#27272A' : '#F1F5F9',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#71717A' : '#94A3B8' }}>
                0 items
              </Text>
            </View>
          </View>

          {/* Empty State */}
          <View
            style={{
              paddingVertical: 48,
              paddingHorizontal: 24,
              alignItems: 'center',
            }}
          >
            {/* Decorative circles */}
            <View style={{ position: 'relative', marginBottom: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isDark ? '#27272A' : '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: isDark ? '#3F3F46' : '#E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Download size={26} color={isDark ? '#71717A' : '#94A3B8'} />
                </View>
              </View>
              {/* Small decorative dot */}
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#6366F1',
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isDark ? '#FAFAFA' : '#0F172A',
                marginBottom: 6,
              }}
            >
              No downloads yet
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#71717A' : '#94A3B8',
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              Your saved quotes will appear here.{'\n'}Start downloading to build your collection!
            </Text>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={() => router.push('/(user)/(tabs)/' as Href)}
              style={{
                marginTop: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isDark ? '#27272A' : '#F1F5F9',
                borderWidth: 1,
                borderColor: isDark ? '#3F3F46' : '#E2E8F0',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#6366F1',
                }}
              >
                Browse Quotes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Section */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: isDark ? '#18181B' : '#FFFFFF',
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 24,
          }}
        >
          <MenuRow
            icon={LogOut}
            title="Log Out"
            onPress={handleLogout}
            isDark={isDark}
            danger
            isLast
          />
        </View>

        {/* App Version */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: isDark ? '#3F3F46' : '#CBD5E1' }}>
            Suvichar v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
