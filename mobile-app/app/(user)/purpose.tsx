import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Briefcase, Check, ArrowRight } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import { useGetUserProfileQuery, useUpdateProfileMutation } from '../../store/api/userApi';
import { useAppDispatch } from '../../store/hooks';
import { setProfileSetupComplete } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';

type AccountType = 'personal' | 'business';

export default function PurposeScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [error, setError] = useState('');
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { data: profileData, isLoading: isLoadingProfile } = useGetUserProfileQuery();

  // Check if user already has profile setup complete
  useEffect(() => {
    if (!isLoadingProfile && profileData?.user) {
      const user = profileData.user;
      
      // If user has name set, profile is complete - skip to home
      if (user.name && user.name.trim() !== '') {
        dispatch(setProfileSetupComplete());
        router.replace('/(user)' as Href);
        return;
      }
      
      setIsCheckingProfile(false);
    }
  }, [isLoadingProfile, profileData, dispatch, router]);

  const handleSkip = () => {
    dispatch(setProfileSetupComplete());
    router.replace('/(user)' as Href);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    try {
      const result = await updateProfile({ accountType: selectedType }).unwrap();

      if (!result.error) {
        router.push({
          pathname: '/(user)/profile-setup',
          params: { purpose: selectedType },
        });
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to set account type');
    }
  };

  const OptionCard = ({
    type,
    title,
    description,
    icon: Icon,
  }: {
    type: AccountType;
    title: string;
    description: string;
    icon: typeof User;
  }) => {
    const isSelected = selectedType === type;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedType(type);
          setError('');
        }}
        className="p-5 rounded-2xl mb-4"
        style={{
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
          borderWidth: 2,
          borderColor: isSelected
            ? isDark ? '#fff' : '#000'
            : isDark ? '#2a2a2a' : '#e5e5e5',
        }}
      >
        <View className="flex-row items-start">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{
              backgroundColor: isSelected
                ? isDark ? '#fff' : '#000'
                : isDark ? '#2a2a2a' : '#f5f5f5',
            }}
          >
            <Icon
              size={22}
              color={isSelected ? (isDark ? '#000' : '#fff') : (isDark ? '#888' : '#666')}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-lg font-semibold mb-1"
                style={{ color: isDark ? '#fff' : '#000' }}
              >
                {title}
              </Text>

              {isSelected && (
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? '#fff' : '#000' }}
                >
                  <Check size={14} color={isDark ? '#000' : '#fff'} />
                </View>
              )}
            </View>

            <Text
              className="text-sm"
              style={{ color: isDark ? '#888' : '#666' }}
            >
              {description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading while checking profile
  if (isCheckingProfile || isLoadingProfile) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
      >
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text
          className="mt-4 text-sm"
          style={{ color: isDark ? '#888' : '#666' }}
        >
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
    >
      {/* Header with Skip */}
      <View className="flex-row items-center justify-end px-4 py-4">
        <TouchableOpacity onPress={handleSkip}>
          <Text
            className="text-sm font-medium"
            style={{ color: isDark ? '#888' : '#666' }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 pt-4">
        {/* Title */}
        <View className="mb-10">
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: isDark ? '#fff' : '#000' }}
          >
            How will you use this?
          </Text>
          <Text
            className="text-base"
            style={{ color: isDark ? '#888' : '#666' }}
          >
            Choose the type of account that best fits your needs
          </Text>
        </View>

        {/* Options */}
        <View className="mb-6">
          <OptionCard
            type="personal"
            title="Personal"
            description="For personal quotes, inspiration, and sharing with friends"
            icon={User}
          />

          <OptionCard
            type="business"
            title="Business"
            description="For professional branding, marketing, and client work"
            icon={Briefcase}
          />
        </View>

        {/* Error */}
        {error ? (
          <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
        ) : null}

        {/* Note */}
        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }}
        >
          <Text
            className="text-sm leading-5"
            style={{ color: isDark ? '#888' : '#666' }}
          >
            You can change this later in your settings. This helps us personalize your experience.
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedType || isLoading}
          className="flex-row items-center justify-center py-4 rounded-xl"
          style={{
            backgroundColor: selectedType
              ? isDark ? '#fff' : '#000'
              : isDark ? '#1a1a1a' : '#e5e5e5',
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={isDark ? '#000' : '#fff'} />
          ) : (
            <>
              <Text
                className="text-base font-semibold mr-2"
                style={{
                  color: selectedType
                    ? isDark ? '#000' : '#fff'
                    : isDark ? '#555' : '#aaa',
                }}
              >
                Continue
              </Text>
              <ArrowRight
                size={20}
                color={selectedType ? (isDark ? '#000' : '#fff') : (isDark ? '#555' : '#aaa')}
              />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          className="py-3 items-center mt-2"
        >
          <Text
            className="text-sm"
            style={{ color: isDark ? '#666' : '#888' }}
          >
            I'll do this later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

