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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  Crown,
  Sparkles,
  User,
  Mail,
  Phone,
  Building2,
  ChevronRight,
  Globe,
  MapPin,
  FileText,
  Move,
  Type,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { useGetUserProfileQuery, useUpdateProfileMutation } from '../../store/api/userApi';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedButton, AnimatedCard, LockedField } from '../../components';

// Storage key for showDate preference
const SHOW_DATE_KEY = 'quote_show_date';

// ========================================
// PREMIUM TOGGLE - Change this to showcase premium features to stakeholders
// Set to true to show premium features as unlocked
// Set to false to show locked premium features (default user experience)
// ========================================
const IS_PREMIUM_ENABLED = false;

// Position types for premium positioning feature
type PositionType = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const POSITION_OPTIONS: { value: PositionType; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

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
  const [hasError, setHasError] = useState(false);

  // Premium fields - Personal tab
  const [aboutMe, setAboutMe] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');

  // Premium fields - Business tab
  const [companyAddress, setCompanyAddress] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Premium fields - Position controls (both tabs)
  const [nameOverlayPosition, setNameOverlayPosition] = useState<PositionType>('center');
  const [avatarPosition, setAvatarPosition] = useState<PositionType>('bottom-left');

  // API hooks
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // Check for API errors
  useEffect(() => {
    if (profileError) {
      console.error('Profile load error:', profileError);
      setHasError(true);
    }
  }, [profileError]);

  // Tab animation
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Load user data and showDate preference on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedShowDate = await SecureStore.getItemAsync(SHOW_DATE_KEY);
        if (storedShowDate !== null) {
          setShowDate(storedShowDate === 'true');
        }
      } catch (error) {
        console.error('Error loading showDate preference:', error);
        // Set default if loading fails
        setShowDate(true);
      }
    };
    loadData();
  }, []);

  // Pre-fill user data when profile loads
  useEffect(() => {
    if (!isLoadingProfile && profileData?.user) {
      const user = profileData.user;
      try {
        setName(user.name || '');
        setPhoto(user.profileImageUrl);
        setActiveTab(user.accountType || 'personal');
      } catch (error) {
        console.error('Error setting user data:', error);
      }
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
  }, [activeTab, tabIndicatorAnim]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      await SecureStore.setItemAsync(SHOW_DATE_KEY, showDate.toString());

      const result = await updateProfile({
        name: name.trim(),
        profileImage: newPhoto || undefined,
        accountType: activeTab,
      }).unwrap();

      if (!result.error) {
        Alert.alert('Success', 'Your design settings have been saved!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to save changes. Please try again.');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/(plans)/plans');
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

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  // Helper function to get position styles for name overlay
  const getNameOverlayPositionStyle = (position: PositionType) => {
    const baseStyle = { position: 'absolute' as const };
    switch (position) {
      case 'center':
        return { ...baseStyle, top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' as const, justifyContent: 'center' as const };
      case 'top-left':
        return { ...baseStyle, top: 50, left: 16, alignItems: 'flex-start' as const };
      case 'top-right':
        return { ...baseStyle, top: 50, right: 16, alignItems: 'flex-end' as const };
      case 'bottom-left':
        return { ...baseStyle, bottom: 70, left: 16, alignItems: 'flex-start' as const };
      case 'bottom-right':
        return { ...baseStyle, bottom: 70, right: 16, alignItems: 'flex-end' as const };
      default:
        return { ...baseStyle, top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' as const, justifyContent: 'center' as const };
    }
  };

  // Helper function to get position styles for avatar
  const getAvatarPositionStyle = (position: PositionType) => {
    const baseStyle = { position: 'absolute' as const };
    switch (position) {
      case 'center':
        return { ...baseStyle, top: '50%' as any, left: '50%' as any, transform: [{ translateX: -20 }, { translateY: -20 }] };
      case 'top-left':
        return { ...baseStyle, top: 16, left: 16 };
      case 'top-right':
        return { ...baseStyle, top: 16, right: 16 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 16, left: 16 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 16, right: 16 };
      default:
        return { ...baseStyle, bottom: 16, left: 16 };
    }
  };

  // Position Selector Component
  const PositionSelector = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange 
  }: { 
    label: string; 
    icon: any; 
    value: PositionType; 
    onChange: (pos: PositionType) => void;
  }) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <Icon size={16} color="#22C55E" />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 }}>
          {label}
        </Text>
        <Crown size={14} color="#22C55E" />
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {POSITION_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: value === option.value 
                ? 'rgba(34, 197, 94, 0.2)' 
                : colors.inputBg,
              borderWidth: 1,
              borderColor: value === option.value 
                ? '#22C55E' 
                : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: value === option.value ? '600' : '500',
                color: value === option.value ? '#22C55E' : colors.textSecondary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading || isLoadingProfile) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 20 }}
      >
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Unable to Load
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
          There was an error loading your profile. Please try again.
        </Text>
        <AnimatedButton onPress={() => router.back()}>
          <View style={{ backgroundColor: colors.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Go Back</Text>
          </View>
        </AnimatedButton>
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
          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              width: '50%',
              transform: [
                {
                  translateX: tabIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 156],
                  }),
                },
              ],
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
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>Tap to change • Max 5MB</Text>
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
                  style={getNameOverlayPositionStyle(IS_PREMIUM_ENABLED ? nameOverlayPosition : 'center')}
                  pointerEvents="none"
                >
                  <Text
                    style={{
                      color: 'rgba(99, 102, 241, 0.7)',
                      fontSize: nameOverlayPosition === 'center' ? 32 : 24,
                      fontWeight: '900',
                      textAlign: nameOverlayPosition === 'center' ? 'center' : 
                               (nameOverlayPosition === 'top-left' || nameOverlayPosition === 'bottom-left') ? 'left' : 'right',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      textShadowColor: 'rgba(99, 102, 241, 0.3)',
                      textShadowOffset: { width: 0, height: 3 },
                      textShadowRadius: 6,
                      paddingHorizontal: 16,
                      maxWidth: nameOverlayPosition === 'center' ? undefined : 200,
                    }}
                    numberOfLines={2}
                  >
                    {name || 'Your Name'}
                  </Text>
                </View>

                {/* User Avatar with glow effect - Dynamic Position */}
                <View
                  style={getAvatarPositionStyle(IS_PREMIUM_ENABLED ? avatarPosition : 'bottom-left')}
                >
                  <View
                    style={{
                      borderRadius: 24,
                      padding: 3,
                      shadowColor: '#6366F1',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 10,
                      elevation: 6,
                      backgroundColor: 'rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.7)',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {photo ? (
                        <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <User size={18} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </View>

                {/* Premium Info Preview - Bottom Right (fixed position) */}
                {IS_PREMIUM_ENABLED && (
                  <View 
                    style={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      right: 16, 
                      alignItems: 'flex-end', 
                      maxWidth: '60%' 
                    }}
                  >
                    {/* Personal Tab Preview */}
                    {activeTab === 'personal' && (aboutMe || email || phoneNumber || website) && (
                      <View
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: 10,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: 'rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        {aboutMe && (
                          <Text
                            style={{
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontSize: 10,
                              fontStyle: 'italic',
                              marginBottom: (email || phoneNumber || website) ? 6 : 0,
                              textAlign: 'right',
                            }}
                            numberOfLines={2}
                          >
                            "{aboutMe}"
                          </Text>
                        )}
                        {email && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: phoneNumber || website ? 3 : 0 }}>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 9 }} numberOfLines={1}>
                              {email}
                            </Text>
                            <Mail size={10} color="rgba(255, 255, 255, 0.5)" style={{ marginLeft: 4 }} />
                          </View>
                        )}
                        {phoneNumber && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: website ? 3 : 0 }}>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 9 }} numberOfLines={1}>
                              {phoneNumber}
                            </Text>
                            <Phone size={10} color="rgba(255, 255, 255, 0.5)" style={{ marginLeft: 4 }} />
                          </View>
                        )}
                        {website && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 9 }} numberOfLines={1}>
                              {website}
                            </Text>
                            <Globe size={10} color="rgba(255, 255, 255, 0.5)" style={{ marginLeft: 4 }} />
                          </View>
                        )}
                      </View>
                    )}

                    {/* Business Tab Preview */}
                    {activeTab === 'business' && (companyAddress || registrationNumber) && (
                      <View
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: 10,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: 'rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        {companyAddress && (
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', marginBottom: registrationNumber ? 6 : 0 }}>
                            <Text
                              style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: 9,
                                textAlign: 'right',
                                flex: 1,
                              }}
                              numberOfLines={2}
                            >
                              {companyAddress}
                            </Text>
                            <MapPin size={10} color="rgba(255, 255, 255, 0.5)" style={{ marginLeft: 4, marginTop: 1 }} />
                          </View>
                        )}
                        {registrationNumber && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 9 }} numberOfLines={1}>
                              {registrationNumber}
                            </Text>
                            <FileText size={10} color="rgba(255, 255, 255, 0.5)" style={{ marginLeft: 4 }} />
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>

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
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
          >
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
            {IS_PREMIUM_ENABLED ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Crown size={12} color="#22C55E" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#22C55E', marginLeft: 4 }}>
                  UNLOCKED
                </Text>
              </View>
            ) : (
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
            )}
          </View>

          {/* Personal Tab Premium Features */}
          {activeTab === 'personal' && (
            <>
              {IS_PREMIUM_ENABLED ? (
                <>
                  {/* About Section - Unlocked */}
                  <AnimatedCard delay={200}>
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                          }}
                        >
                          <User size={16} color="#22C55E" />
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                          About Section
                        </Text>
                        <Crown size={14} color="#22C55E" style={{ marginLeft: 8 }} />
                      </View>
                      <View
                        style={{
                          backgroundColor: colors.inputBg,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                        }}
                      >
                        <TextInput
                          style={{
                            paddingVertical: 14,
                            fontSize: 15,
                            color: colors.text,
                            minHeight: 60,
                          }}
                          value={aboutMe}
                          onChangeText={setAboutMe}
                          placeholder="Add a personal tagline..."
                          placeholderTextColor={colors.textMuted}
                          multiline
                        />
                      </View>
                    </View>
                  </AnimatedCard>

                  {/* Contact Details - Unlocked */}
                  <AnimatedCard delay={250}>
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                          }}
                        >
                          <Mail size={16} color="#22C55E" />
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                          Contact Details
                        </Text>
                        <Crown size={14} color="#22C55E" style={{ marginLeft: 8 }} />
                      </View>

                      {/* Email Input */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.inputBg,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          marginBottom: 10,
                        }}
                      >
                        <Mail size={16} color={colors.textSecondary} />
                        <TextInput
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            fontSize: 14,
                            color: colors.text,
                          }}
                          value={email}
                          onChangeText={setEmail}
                          placeholder="Email address"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      {/* Phone Input */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.inputBg,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          marginBottom: 10,
                        }}
                      >
                        <Phone size={16} color={colors.textSecondary} />
                        <TextInput
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            fontSize: 14,
                            color: colors.text,
                          }}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          placeholder="Phone number"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="phone-pad"
                        />
                      </View>

                      {/* Website Input */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.inputBg,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                        }}
                      >
                        <Globe size={16} color={colors.textSecondary} />
                        <TextInput
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            fontSize: 14,
                            color: colors.text,
                          }}
                          value={website}
                          onChangeText={setWebsite}
                          placeholder="Website URL"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="url"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </AnimatedCard>

                  {/* Position Controls - Personal Tab */}
                  <AnimatedCard delay={300}>
                    <PositionSelector
                      label="Name Overlay Position"
                      icon={Type}
                      value={nameOverlayPosition}
                      onChange={setNameOverlayPosition}
                    />
                  </AnimatedCard>

                  <AnimatedCard delay={350}>
                    <PositionSelector
                      label="Avatar Position"
                      icon={Move}
                      value={avatarPosition}
                      onChange={setAvatarPosition}
                    />
                  </AnimatedCard>
                </>
              ) : (
                <>
                  <LockedField
                    icon={User}
                    label="About Section"
                    description="Add a personal tagline that appears on your quotes"
                    delay={200}
                    onPress={handleUpgradeToPremium}
                    isDark={isDark}
                  />

                  <LockedField
                    icon={Mail}
                    label="Contact Details"
                    description="Include phone number, email, and website on your quotes"
                    delay={250}
                    onPress={handleUpgradeToPremium}
                    isDark={isDark}
                  />

                  <LockedField
                    icon={Move}
                    label="Element Positioning"
                    description="Customize the position of name overlay and avatar"
                    delay={300}
                    onPress={handleUpgradeToPremium}
                    isDark={isDark}
                  />
                </>
              )}
            </>
          )}

          {/* Business Tab Premium Features */}
          {activeTab === 'business' && (
            <>
              {IS_PREMIUM_ENABLED ? (
                <>
                  <AnimatedCard delay={300}>
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 10,
                        }}
                      >
                        <Building2 size={16} color="#22C55E" />
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                        Organization Info
                      </Text>
                      <Crown size={14} color="#22C55E" style={{ marginLeft: 8 }} />
                    </View>

                    {/* Company Address Input */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        backgroundColor: colors.inputBg,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingTop: 14,
                        marginBottom: 10,
                      }}
                    >
                      <MapPin size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingBottom: 14,
                          paddingHorizontal: 10,
                          fontSize: 14,
                          color: colors.text,
                          minHeight: 60,
                        }}
                        value={companyAddress}
                        onChangeText={setCompanyAddress}
                        placeholder="Company address"
                        placeholderTextColor={colors.textMuted}
                        multiline
                      />
                    </View>

                    {/* Registration Number Input */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.inputBg,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                      }}
                    >
                      <FileText size={16} color={colors.textSecondary} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          fontSize: 14,
                          color: colors.text,
                        }}
                        value={registrationNumber}
                        onChangeText={setRegistrationNumber}
                        placeholder="Registration / GST number"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>
                </AnimatedCard>

                {/* Position Controls - Business Tab */}
                <AnimatedCard delay={350}>
                  <PositionSelector
                    label="Name Overlay Position"
                    icon={Type}
                    value={nameOverlayPosition}
                    onChange={setNameOverlayPosition}
                  />
                </AnimatedCard>

                <AnimatedCard delay={400}>
                  <PositionSelector
                    label="Avatar Position"
                    icon={Move}
                    value={avatarPosition}
                    onChange={setAvatarPosition}
                  />
                </AnimatedCard>
                </>
              ) : (
                <>
                  <LockedField
                    icon={Building2}
                    label="Organization Info"
                    description="Add company address, registration details, and more"
                    delay={300}
                    onPress={handleUpgradeToPremium}
                    isDark={isDark}
                  />

                  <LockedField
                    icon={Move}
                    label="Element Positioning"
                    description="Customize the position of name overlay and avatar"
                    delay={350}
                    onPress={handleUpgradeToPremium}
                    isDark={isDark}
                  />
                </>
              )}
            </>
          )}
        </View>

        {/* Upgrade CTA / Premium Status */}
        <AnimatedCard delay={350}>
          {IS_PREMIUM_ENABLED ? (
            <LinearGradient
              colors={isDark ? ['#14532D', '#15803D'] : ['#DCFCE7', '#BBF7D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: 'rgba(34, 197, 94, 0.4)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: 'rgba(34, 197, 94, 0.25)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Crown size={26} color="#22C55E" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : '#15803D', marginBottom: 4 }}>
                    Premium Active
                  </Text>
                  <Text style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.8)' : '#166534', lineHeight: 18 }}>
                    All features unlocked! Customize your quotes with full control.
                  </Text>
                </View>

                <Sparkles size={20} color="#22C55E" />
              </View>
            </LinearGradient>
          ) : (
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
          )}
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}
