import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Switch,
  Animated,
  Easing,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Lock, Crown, Sparkles, User, Mail, Phone, Building2, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { useGetUserProfileQuery, useUpdateProfileMutation } from '../../store/api/userApi';
import { useTheme } from '../../context/ThemeContext';

// Storage key for showDate preference
const SHOW_DATE_KEY = 'quote_show_date';

// Animated Button Component
const AnimatedButton = ({ 
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
      toValue: 0.97,
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
        style={[style, { transform: [{ scale: scaleAnim }], opacity: disabled ? 0.6 : 1 }]} 
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Animated Card with staggered entrance
const AnimatedCard = ({ 
  children, 
  delay = 0, 
  style 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  style?: any;
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
  }, []);

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity }, style]}>
      {children}
    </Animated.View>
  );
};

export default function EditDesignScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [showDate, setShowDate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // API hooks
  const { data: profileData, isLoading: isLoadingProfile } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // Tab animation
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  
  // Pulsing glow animation for photo frame in preview
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Load user data and showDate preference on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load showDate preference from SecureStore
        const storedShowDate = await SecureStore.getItemAsync(SHOW_DATE_KEY);
        if (storedShowDate !== null) {
          setShowDate(storedShowDate === 'true');
        }
      } catch (error) {
        console.error('Error loading showDate preference:', error);
      }
    };
    
    loadData();
  }, []);

  // Pre-fill user data when profile loads
  useEffect(() => {
    if (!isLoadingProfile && profileData?.user) {
      const user = profileData.user;
      setName(user.name || '');
      setPhoto(user.profileImageUrl);
      setActiveTab(user.accountType || 'personal');
      setIsLoading(false);
    } else if (!isLoadingProfile) {
      setIsLoading(false);
    }
  }, [isLoadingProfile, profileData]);

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: activeTab === 'personal' ? 0 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [activeTab]);

  // Start pulsing glow animation for photo frame in preview
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      // Save showDate preference to SecureStore
      await SecureStore.setItemAsync(SHOW_DATE_KEY, showDate.toString());

      // Call update profile API
      const result = await updateProfile({
        name: name.trim(),
        profileImage: newPhoto || undefined,
        accountType: activeTab,
      }).unwrap();

      if (!result.error) {
        Alert.alert('Success', 'Your design settings have been saved!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to save changes. Please try again.');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/plans');
  };

  const handlePhotoUpload = async () => {
    Alert.alert(
      activeTab === 'personal' ? 'Change Profile Photo' : 'Change Business Logo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery permission is required to select photos');
          return;
        }
      }

      // Launch picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uriParts = asset.uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
        const mimeType = asset.mimeType || `image/${fileExtension}`;
        const fileName = `profile-${Date.now()}.${fileExtension}`;

        setNewPhoto({
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        });
        setPhoto(asset.uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Colors
  const colors = {
    bg: isDark ? '#09090B' : '#FAFAFA',
    card: isDark ? '#18181B' : '#FFFFFF',
    cardBorder: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#FAFAFA' : '#18181B',
    textSecondary: isDark ? '#71717A' : '#71717A',
    textMuted: isDark ? '#52525B' : '#A1A1AA',
    inputBg: isDark ? '#27272A' : '#F4F4F5',
    accent: '#6366F1',
    premium: '#F59E0B',
  };

  const LockedField = ({ 
    label, 
    description, 
    icon: Icon,
    delay = 0,
  }: { 
    label: string; 
    description: string;
    icon: any;
    delay?: number;
  }) => (
    <AnimatedCard delay={delay}>
      <AnimatedButton onPress={handleUpgradeToPremium}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(245, 158, 11, 0.3)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          {/* Premium gradient overlay */}
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Icon size={22} color={colors.premium} />
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginRight: 8 }}>
                    {label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Lock size={10} color={colors.premium} />
                    <Text style={{ fontSize: 9, fontWeight: '700', color: colors.premium, marginLeft: 3 }}>
                      PRO
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                  {description}
                </Text>
              </View>
              
              <ChevronRight size={18} color={colors.textMuted} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>
      </AnimatedButton>
    </AnimatedCard>
  );

  // Show loading state
  if (isLoading || isLoadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
          backgroundColor: colors.card,
        }}
      >
        <AnimatedButton onPress={() => router.back()} disabled={isSaving}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: colors.inputBg,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={22} color={colors.text} />
          </View>
        </AnimatedButton>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Sparkles size={20} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>
            Edit Design
          </Text>
        </View>
        
        <AnimatedButton onPress={handleSave} disabled={isSaving}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Save</Text>
            )}
          </LinearGradient>
        </AnimatedButton>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.inputBg,
            borderRadius: 12,
            padding: 4,
            flex: 1,
          }}
        >
          {/* Animated indicator */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              width: '50%',
              transform: [{
                translateX: tabIndicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 156], // Adjust based on tab width
                }),
              }],
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
          </Animated.View>
          
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
            onPress={() => setActiveTab('personal')}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: activeTab === 'personal' ? colors.text : colors.textSecondary,
              }}
            >
              Personal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
            onPress={() => setActiveTab('business')}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: activeTab === 'business' ? colors.text : colors.textSecondary,
              }}
            >
              Business
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Editable Fields Section */}
        <AnimatedCard delay={0}>
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textSecondary,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Customize Your Design
            </Text>
            
            {/* Photo Upload Card */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ position: 'relative' }} onPress={handlePhotoUpload}>
                  {photo ? (
                    <Image 
                      source={{ uri: photo }} 
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        borderWidth: 3,
                        borderColor: colors.accent,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        borderWidth: 2,
                        borderColor: colors.cardBorder,
                        borderStyle: 'dashed',
                        backgroundColor: colors.inputBg,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <User size={28} color={colors.textMuted} />
                    </View>
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      backgroundColor: colors.accent,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 3,
                      borderColor: colors.card,
                    }}
                  >
                    <Camera size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    {activeTab === 'personal' ? 'Profile Photo' : 'Business Logo'}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Tap to change • Max 5MB
                  </Text>
                </View>
              </View>
            </View>

            {/* Name Input Card */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: colors.textSecondary,
                  marginBottom: 10,
                }}
              >
                {activeTab === 'personal' ? 'Display Name' : 'Business Name'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.inputBg,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                }}
              >
                <User size={18} color={colors.textSecondary} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 15,
                    color: colors.text,
                  }}
                  value={name}
                  onChangeText={setName}
                  placeholder={activeTab === 'personal' ? 'Enter your name' : 'Enter business name'}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Show Date Toggle Card */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Show Date
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Display current date on quotes
                  </Text>
                </View>
                <Switch
                  value={showDate}
                  onValueChange={setShowDate}
                  trackColor={{ false: isDark ? '#3F3F46' : '#E4E4E7', true: '#6366F1' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={isDark ? '#3F3F46' : '#E4E4E7'}
                />
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Live Preview Section */}
        <AnimatedCard delay={100}>
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textSecondary,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Live Preview
            </Text>
            
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* Preview Card */}
              <View
                style={{
                  width: '100%',
                  height: 400,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: '#1F2937',
                }}
              >
                {/* Background gradient */}
                <LinearGradient
                  colors={['#1F2937', '#111827', '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                
                {/* Decorative elements */}
                <View
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  }}
                />

                {/* Date Badge */}
                {showDate && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      backgroundColor: 'rgba(99, 102, 241, 0.85)',
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 16,
                      shadowColor: '#6366F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 }}>
                      17 नवंबर
                    </Text>
                  </View>
                )}
                
                {/* Watermark - User Name Overlay */}
                <View 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  pointerEvents="none"
                >
                  <Text
                    style={{
                      color: 'rgba(99, 102, 241, 0.7)',
                      fontSize: 32,
                      fontWeight: '900',
                      textAlign: 'center',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      textShadowColor: 'rgba(99, 102, 241, 0.3)',
                      textShadowOffset: { width: 0, height: 3 },
                      textShadowRadius: 6,
                      paddingHorizontal: 16,
                    }}
                    numberOfLines={2}
                  >
                    {name || 'Your Name'}
                  </Text>
                </View>
                
                {/* User Info with animated pulsing glow */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {/* Animated pulsing glow container */}
                  <Animated.View
                    style={{
                      borderRadius: 24,
                      padding: 3,
                      shadowColor: '#6366F1',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 0.9],
                      }),
                      shadowRadius: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 14],
                      }),
                      elevation: 6,
                      backgroundColor: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.4)'],
                      }),
                    }}
                  >
                    <Animated.View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.9)'],
                        }),
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {photo ? (
                        <Image 
                          source={{ uri: photo }} 
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <User size={18} color="#FFFFFF" />
                      )}
                    </Animated.View>
                  </Animated.View>
                </View>
              </View>
              
              {/* Preview hint */}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginTop: 12,
                }}
              >
                This is how your content will overlay on the content
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Premium Fields Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textSecondary,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Premium Features
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Crown size={12} color={colors.premium} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.premium, marginLeft: 4 }}>
                UPGRADE
              </Text>
            </View>
          </View>

          <LockedField
            icon={User}
            label="About Section"
            description={activeTab === 'personal' 
              ? "Add a personal tagline that appears on your quotes" 
              : "Add your business tagline or mission statement"
            }
            delay={200}
          />

          <LockedField
            icon={activeTab === 'personal' ? Mail : Phone}
            label="Contact Details"
            description="Include phone number, email, and website on your quotes"
            delay={250}
          />

          {activeTab === 'business' && (
            <LockedField
              icon={Building2}
              label="Organization Info"
              description="Add company address, registration details, and more"
              delay={300}
            />
          )}
        </View>

        {/* Upgrade CTA */}
        <AnimatedCard delay={350}>
          <AnimatedButton onPress={handleUpgradeToPremium}>
            <LinearGradient
              colors={isDark ? ['#27272A', '#18181B'] : ['#FFFBEB', '#FEF3C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Crown size={26} color={colors.premium} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                    Unlock All Features
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                    Get contact details, about section, and unlimited customization
                  </Text>
                </View>
                
                <ChevronRight size={20} color={colors.textMuted} />
              </View>
            </LinearGradient>
          </AnimatedButton>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}
