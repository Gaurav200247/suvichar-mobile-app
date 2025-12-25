import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, User, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetUserProfileQuery, useUpdateProfileMutation } from '../../store/api/userApi';
import { useAppDispatch } from '../../store/hooks';
import { updateUser, setProfileSetupComplete } from '../../store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';


export default function ProfileSetupScreen() {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const { isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { purpose, mode } = useLocalSearchParams<{ purpose: string; mode: string }>();
  
  const isEditMode = mode === 'edit';

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetUserProfileQuery();

  // Check for API errors
  useEffect(() => {
    if (profileError) {
      console.error('Profile load error:', profileError);
      setHasError(true);
      setIsCheckingProfile(false);
    }
  }, [profileError]);

  // Check if user already has profile setup complete
  useEffect(() => {
    if (!isLoadingProfile && profileData?.user) {
      const user = profileData.user;
      
      try {
        // In edit mode, pre-fill all data and don't redirect
        if (isEditMode) {
          if (user.name) {
            setName(user.name);
          }
          if (user.profileImageUrl) {
            setPhotoPreview(user.profileImageUrl);
          }
          setIsCheckingProfile(false);
          return;
        }
        
        // If user has name set, profile is complete - skip to home (only in setup mode)
        if (user.name && user.name.trim() !== '') {
          dispatch(setProfileSetupComplete());
          router.replace('/(user)/(tabs)');
          return;
        }
        
        // Pre-fill photo preview if exists (but don't set photo object for re-upload)
        if (user.profileImageUrl) {
          setPhotoPreview(user.profileImageUrl);
        }
        
        setIsCheckingProfile(false);
      } catch (error) {
        console.error('Error setting up profile data:', error);
        setIsCheckingProfile(false);
      }
    } else if (!isLoadingProfile && !profileError) {
      setIsCheckingProfile(false);
    }
  }, [isLoadingProfile, profileData, dispatch, router, isEditMode, profileError]);

  const isPersonal = purpose === 'personal' || profileData?.user?.accountType === 'personal';

  const handlePhotoUpload = async () => {
    // Show options to choose camera or gallery
    Alert.alert(
      isPersonal ? 'Add Profile Photo' : 'Add Business Logo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      setIsUploading(true);
      setError('');

      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          setError('Camera permission is required to take photos');
          setIsUploading(false);
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          setError('Gallery permission is required to select photos');
          setIsUploading(false);
          return;
        }
      }

      // Launch picker
      const result = source === 'camera'
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
        
        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          setError('Image size must be less than 5MB. Please choose a smaller image.');
          setIsUploading(false);
          return;
        }

        // Get file extension from URI or mimeType
        const uriParts = asset.uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
        const mimeType = asset.mimeType || `image/${fileExtension}`;
        const fileName = `profile-${Date.now()}.${fileExtension}`;

        // Set photo for upload
        setPhoto({
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        });
        
        // Set preview
        setPhotoPreview(asset.uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      setError('Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      setError(`Please enter your ${isPersonal ? 'name' : 'business name'}`);
      return;
    }

    try {
      const result = await updateProfile({
        name: name.trim(),
        profileImage: photo || undefined,
      }).unwrap();

      if (!result.error) {
        dispatch(updateUser(result.user));
        dispatch(setProfileSetupComplete());
        
        if (isEditMode) {
          // In edit mode, go back to profile
          router.back();
        } else {
          // In setup mode, go to home
          router.replace('/(user)/(tabs)');
        }
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err?.data?.message || err?.message || 'Failed to update profile');
    }
  };

  const handleSkip = () => {
    dispatch(setProfileSetupComplete());
    router.replace('/(user)/(tabs)');
  };

  const isValid = name.trim().length >= 2;

  // Show error state
  if (hasError) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
      >
        <Text
          className="text-xl font-bold mb-2"
          style={{ color: isDark ? '#fff' : '#000' }}
        >
          Unable to Load Profile
        </Text>
        <Text
          className="text-sm text-center mb-6"
          style={{ color: isDark ? '#888' : '#666' }}
        >
          There was an error loading your profile data. Please check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: isDark ? '#fff' : '#000' }}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: isDark ? '#000' : '#fff' }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }}
          >
            <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

          {isEditMode ? (
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                className="text-sm font-medium"
                style={{ color: isDark ? '#888' : '#666' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSkip}>
              <Text
                className="text-sm font-medium"
                style={{ color: isDark ? '#888' : '#666' }}
              >
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-4">
          {/* Title */}
          <View className="mb-10">
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              {isEditMode 
                ? 'Edit Profile' 
                : (isPersonal ? 'Set up your profile' : 'Set up your business')}
            </Text>
            <Text
              className="text-base"
              style={{ color: isDark ? '#888' : '#666' }}
            >
              {isEditMode
                ? 'Update your photo and name'
                : (isPersonal
                  ? 'Add your photo and name'
                  : 'Add your logo and business name')}
            </Text>
          </View>

          {/* Photo Upload */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={handlePhotoUpload}
              disabled={isUploading}
              className="relative"
            >
              {isUploading ? (
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
                    borderWidth: 2,
                    borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
                  }}
                >
                  <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                  <Text
                    className="text-xs mt-2"
                    style={{ color: isDark ? '#666' : '#888' }}
                  >
                    Loading...
                  </Text>
                </View>
              ) : photoPreview ? (
                <View className="relative">
                  <Image
                    source={{ uri: photoPreview }}
                    className="w-28 h-28 rounded-full"
                    style={{
                      borderWidth: 3,
                      borderColor: isDark ? '#fff' : '#000',
                    }}
                  />
                  <View
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    <Check size={16} color="#FFFFFF" />
                  </View>
                  <View
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full items-center justify-center"
                    style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                  >
                    <Camera size={14} color={isDark ? '#fff' : '#374151'} />
                  </View>
                </View>
              ) : (
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
                    borderWidth: 2,
                    borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
                    borderStyle: 'dashed',
                  }}
                >
                  <Camera size={28} color={isDark ? '#666' : '#888'} />
                  <Text
                    className="text-xs mt-2"
                    style={{ color: isDark ? '#666' : '#888' }}
                  >
                    Add {isPersonal ? 'photo' : 'logo'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Photo size hint */}
            <Text
              className="text-xs mt-3 text-center"
              style={{ color: isDark ? '#555' : '#9CA3AF' }}
            >
              Tap to {photoPreview ? 'change' : 'add'} • Max 5MB
            </Text>
            
            {/* Remove photo button */}
            {photoPreview && (
              <TouchableOpacity
                onPress={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                className="mt-2 px-4 py-2 rounded-lg"
                style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: isDark ? '#EF4444' : '#DC2626' }}
                >
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Name Input */}
          <View className="mb-6">
            <Text
              className="text-xs font-medium mb-2 uppercase tracking-wider"
              style={{ color: isDark ? '#666' : '#888' }}
            >
              {isPersonal ? 'Your Name' : 'Business Name'}
            </Text>

            <View
              className="flex-row items-center rounded-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                borderWidth: 1,
                borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
              }}
            >
              <View
                className="px-4"
                style={{ borderRightWidth: 1, borderColor: isDark ? '#2a2a2a' : '#e5e5e5' }}
              >
                <User size={20} color={isDark ? '#666' : '#888'} />
              </View>

              <TextInput
                className="flex-1 px-4 py-4 text-base"
                style={{ color: isDark ? '#fff' : '#000' }}
                placeholder={isPersonal ? 'Enter your name' : 'Enter business name'}
                placeholderTextColor={isDark ? '#555' : '#aaa'}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError('');
                }}
                autoCapitalize="words"
              />
            </View>

            {/* Error */}
            {error ? (
              <Text className="text-red-500 text-sm mt-2">{error}</Text>
            ) : null}
          </View>

          {/* Preview */}
          {(name || photoPreview) && (
            <View
              className="rounded-xl p-4"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                borderWidth: 1,
                borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
              }}
            >
              <Text
                className="text-xs font-medium mb-3 uppercase tracking-wider"
                style={{ color: isDark ? '#666' : '#888' }}
              >
                Preview
              </Text>

              <View className="flex-row items-center">
                {photoPreview ? (
                  <Image
                    source={{ uri: photoPreview }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }}
                  >
                    <User size={18} color={isDark ? '#666' : '#888'} />
                  </View>
                )}

                <Text
                  className="text-base font-medium"
                  style={{ color: isDark ? '#fff' : '#000' }}
                >
                  {name || (isPersonal ? 'Your Name' : 'Business Name')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Complete Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!isValid || isLoading}
            className="py-4 rounded-xl items-center"
            style={{
              backgroundColor: isValid
                ? isDark ? '#fff' : '#000'
                : isDark ? '#1a1a1a' : '#e5e5e5',
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={isDark ? '#000' : '#fff'} />
            ) : (
              <Text
                className="text-base font-semibold"
                style={{
                  color: isValid
                    ? isDark ? '#000' : '#fff'
                    : isDark ? '#555' : '#aaa',
                }}
              >
                {isEditMode ? 'Save Changes' : 'Complete Setup'}
              </Text>
            )}
          </TouchableOpacity>

          {!isEditMode && (
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
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

