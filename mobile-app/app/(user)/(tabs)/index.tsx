import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ImageBackground,
  Animated,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Share2,
  Download,
  Palette,
  ChevronRight,
  RefreshCw,
  Crown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { HINDI_CATEGORIES, QUOTES, QUOTE_TEMPLATES, HINDI_MONTHS } from '../../../constants';
import { useGetUserProfileQuery } from '../../../store/api/userApi';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../../context/ThemeContext';
import { AnimatedButton, CategoryPill } from '../../../components';

// Storage key for showDate preference (must match edit-design.tsx)
const SHOW_DATE_KEY = 'quote_show_date';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Fetch user profile
  const { data: profileData, isLoading: isLoadingProfile } = useGetUserProfileQuery();
  const user = profileData?.user;

  // Quote card animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pulsing glow animation for photo frame
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // ViewShot ref for capturing quote card
  const viewShotRef = useRef<ViewShot>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showBranding, setShowBranding] = useState(true);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [showDate, setShowDate] = useState(true);

  // Load showDate preference from SecureStore when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadShowDatePreference = async () => {
        try {
          const storedShowDate = await SecureStore.getItemAsync(SHOW_DATE_KEY);
          if (storedShowDate !== null) {
            setShowDate(storedShowDate === 'true');
          }
        } catch (error) {
          console.error('Error loading showDate preference:', error);
        }
      };
      loadShowDatePreference();
    }, [])
  );

  // Request media library permission on mount
  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (Platform.OS === 'ios') {
        const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();
        if (existingStatus === 'granted') {
          setHasMediaPermission(true);
        } else {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          setHasMediaPermission(status === 'granted');
        }
      } else {
        setHasMediaPermission(true);
      }
    };
    checkAndRequestPermission();
  }, []);

  // Start pulsing glow animation for photo frame
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate()} ${HINDI_MONTHS[today.getMonth()]}`;
  };

  const nextQuote = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      slideAnim.setValue(30);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
      ]).start();
    });
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setShowBranding(false);
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture?.();
        if (uri) {
          if (Platform.OS === 'ios' && !hasMediaPermission) {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Please enable photo access in Settings to save images.');
              setIsDownloading(false);
              setShowBranding(true);
              return;
            }
            setHasMediaPermission(true);
          }

          const asset = await MediaLibrary.createAssetAsync(uri);

          if (Platform.OS === 'ios') {
            await MediaLibrary.createAlbumAsync('Suvichar', asset, false);
          }

          Alert.alert('Saved! ✨', 'Image saved to gallery');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setShowBranding(true);
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);

      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture?.();
        if (uri) {
          await Share.share({
            url: Platform.OS === 'ios' ? uri : `file://${uri}`,
            message: `"${QUOTES[currentQuoteIndex % QUOTES.length]}" - Shared via Suvichar App`,
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share image. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const userName = user?.name || 'Your Name';
  const userPhoto = user?.profileImageUrl;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#09090B' : '#FAFAFA' }}
    >
      {/* Header */}
      <View
        className="flex-row justify-between items-center px-5 py-4"
        style={{
          backgroundColor: isDark ? '#09090B' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        }}
      >
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3 overflow-hidden">
            <Image
              source={require('../../../assets/app_icon.png')}
              style={{ width: 44, height: 44 }}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text
              className="text-2xl font-bold"
              style={{ color: isDark ? '#FAFAFA' : '#18181B', letterSpacing: -0.5 }}
            >
              Suvichar
            </Text>
            <Text
              className="text-xs"
              style={{ color: isDark ? '#71717A' : '#A1A1AA', marginTop: 1 }}
            >
              सुविचार • Good Thoughts
            </Text>
          </View>
        </View>

        <AnimatedButton
          onPress={() => router.push('/(user)/(tabs)/profile')}
          style={{
            shadowColor: isDark ? '#000' : '#6366F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View
            className="w-11 h-11 rounded-full justify-center items-center overflow-hidden"
            style={{
              backgroundColor: isDark ? '#27272A' : '#F4F4F5',
              borderWidth: 2,
              borderColor: isDark ? '#3F3F46' : '#E4E4E7',
            }}
          >
            {isLoadingProfile ? (
              <ActivityIndicator size="small" color={isDark ? '#A1A1AA' : '#71717A'} />
            ) : userPhoto ? (
              <Image source={{ uri: userPhoto }} className="w-full h-full" />
            ) : (
              <User size={20} color={isDark ? '#A1A1AA' : '#71717A'} />
            )}
          </View>
        </AnimatedButton>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View className="px-5 pt-5 pb-2">
          <Text
            style={{
              fontSize: 15,
              color: isDark ? '#71717A' : '#71717A',
              fontWeight: '500',
            }}
          >
            Welcome back,
          </Text>
          <Text
            style={{
              fontSize: 22,
              color: isDark ? '#FAFAFA' : '#18181B',
              fontWeight: '700',
              marginTop: 2,
              letterSpacing: -0.3,
            }}
          >
            {userName} 👋
          </Text>
        </View>

        {/* Category Tab Bar */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 4,
                height: 16,
                backgroundColor: '#6366F1',
                borderRadius: 2,
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isDark ? '#71717A' : '#71717A',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Categories
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ 
            paddingHorizontal: 20, 
            gap: 10,
            paddingVertical: 4,
          }}
        >
          {HINDI_CATEGORIES.map((category, index) => (
            <CategoryPill
              key={index}
              category={category}
              isSelected={selectedCategory === index}
              onPress={() => setSelectedCategory(index)}
              isDark={isDark}
            />
          ))}
        </ScrollView>

        {/* Quote Template Card */}
        <Animated.View
          className="mx-5 mb-5"
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'jpg', quality: 1 }}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
            }}
          >
            <ImageBackground
              source={QUOTE_TEMPLATES[currentQuoteIndex % QUOTE_TEMPLATES.length]}
              className="w-full"
              style={{ height: 500 }}
            >
              {/* Date Badge */}
              {showDate && (
                <View
                  className="absolute top-4 left-3 px-4 py-2 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.85)',
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 }}>
                    {getCurrentDate()}
                  </Text>
                </View>
              )}

              {/* Premium Badge */}
              <View
                className="absolute top-4 right-4 flex-row items-center px-3 py-2 rounded-xl"
                style={{ backgroundColor: 'rgba(251, 191, 36, 0.9)' }}
              >
                <Crown size={12} color="#000" />
                <Text style={{ color: '#000', fontSize: 10, fontWeight: '700', marginLeft: 4 }}>
                  PRO
                </Text>
              </View>

              {/* Watermark - User Name */}
              {showBranding && (
                <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                  <Text
                    style={{
                      color: 'rgba(99, 102, 241, 0.7)',
                      fontSize: 48,
                      fontWeight: '900',
                      textAlign: 'center',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      textShadowColor: 'rgba(99, 102, 241, 0.3)',
                      textShadowOffset: { width: 0, height: 3 },
                      textShadowRadius: 6,
                    }}
                    numberOfLines={2}
                  >
                    {userName}
                  </Text>
                </View>
              )}

              {/* User Info */}
              {showBranding && (
                <View className="absolute bottom-0 left-0 right-0 p-5">
                  <View className="flex-row items-center">
                    <Animated.View
                      style={{
                        borderRadius: 32,
                        padding: 3,
                        shadowColor: '#6366F1',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.4, 0.9],
                        }),
                        shadowRadius: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 16],
                        }),
                        elevation: 8,
                        backgroundColor: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.4)'],
                        }),
                      }}
                    >
                      <Animated.View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          overflow: 'hidden',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.9)'],
                          }),
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {userPhoto ? (
                          <Image source={{ uri: userPhoto }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <User size={20} color="#FFFFFF" />
                        )}
                      </Animated.View>
                    </Animated.View>
                  </View>
                </View>
              )}
            </ImageBackground>
          </ViewShot>
        </Animated.View>

        {/* Action Buttons Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 20,
            marginBottom: 24,
          }}
        >
          {/* Left: Icon Buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <AnimatedButton onPress={() => router.push('/(user)/edit-design')}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#3F3F46' : '#E4E4E7',
                }}
              >
                <Palette size={20} color={isDark ? '#FAFAFA' : '#18181B'} />
              </View>
            </AnimatedButton>

            <AnimatedButton onPress={handleDownload} disabled={isDownloading}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#3F3F46' : '#E4E4E7',
                  opacity: isDownloading ? 0.6 : 1,
                }}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color={isDark ? '#FAFAFA' : '#18181B'} />
                ) : (
                  <Download size={20} color={isDark ? '#FAFAFA' : '#18181B'} />
                )}
              </View>
            </AnimatedButton>

            <AnimatedButton onPress={handleShare} disabled={isSharing}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#3F3F46' : '#E4E4E7',
                  opacity: isSharing ? 0.6 : 1,
                }}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color={isDark ? '#FAFAFA' : '#18181B'} />
                ) : (
                  <Share2 size={20} color={isDark ? '#FAFAFA' : '#18181B'} />
                )}
              </View>
            </AnimatedButton>
          </View>

          {/* Right: Next Quote Button */}
          <AnimatedButton
            onPress={nextQuote}
            style={{
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginRight: 8 }}>
                Next Quote
              </Text>
              <RefreshCw size={18} color="#FFFFFF" />
            </LinearGradient>
          </AnimatedButton>
        </View>

        {/* Upgrade Banner */}
        <AnimatedButton
          onPress={() => router.push('/(plans)/plans')}
          style={{ marginHorizontal: 20, marginBottom: 32 }}
        >
          <LinearGradient
            colors={isDark ? ['#27272A', '#18181B'] : ['#FAFAFA', '#F4F4F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 16,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDark ? '#3F3F46' : '#E4E4E7',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
              }}
            >
              <Crown size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: isDark ? '#FAFAFA' : '#18181B',
                  marginBottom: 3,
                }}
              >
                Unlock Premium Features
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#71717A' : '#71717A' }}>
                Remove watermarks • Unlimited downloads
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#71717A' : '#A1A1AA'} />
          </LinearGradient>
        </AnimatedButton>
      </ScrollView>
    </SafeAreaView>
  );
}
