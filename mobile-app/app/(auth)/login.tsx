import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSendOtpMutation } from '../../store/api/authApi';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen() {
  const { isDark } = useTheme();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [error, setError] = useState('');

  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleContinue = async () => {
    setError('');

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      const result = await sendOtp({ phoneNumber: fullPhoneNumber }).unwrap();

      if (!result.error) {
        router.push({
          pathname: '/(auth)/otp',
          params: {
            phoneNumber: fullPhoneNumber,
            expiresIn: result.expiresIn.toString(),
            isNewUser: result.isNewUser.toString(),
          },
        });
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const isValid = phoneNumber.length === 10;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#000' : '#fff' }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Content */}
        <View className="flex-1 px-6 pt-12">
          {/* Logo & Title */}
          <View className="items-center mb-10">
            <Image
              source={require('../../assets/app_icon.png')}
              className="w-24 h-24 mb-4"
              style={{ borderRadius: 48 }}
              resizeMode="cover"
            />

            <Text
              className="text-2xl font-bold tracking-wider mb-1"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              SUVICHAR
            </Text>
            <Text
              className="text-sm"
              style={{ color: isDark ? '#666' : '#888' }}
            >
              Daily Motivation
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-xl font-semibold mb-2"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              Namaste! 🙏
            </Text>
            <Text
              className="text-sm"
              style={{ color: isDark ? '#888' : '#666' }}
            >
              Enter your phone number to get started
            </Text>
          </View>

          {/* Phone Input */}
          <View className="mb-6">
            <Text
              className="text-xs font-medium mb-2 uppercase tracking-wider"
              style={{ color: isDark ? '#666' : '#888' }}
            >
              Phone Number
            </Text>

            <View
              className="flex-row items-center rounded-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? '#111' : '#f5f5f5',
                borderWidth: 1,
                borderColor: isDark ? '#222' : '#e5e5e5',
              }}
            >
              {/* Country Code */}
              <View
                className="px-4 py-4 border-r"
                style={{ borderColor: isDark ? '#222' : '#e5e5e5' }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: isDark ? '#fff' : '#000' }}
                >
                  🇮🇳 {countryCode}
                </Text>
              </View>

              {/* Input */}
              <TextInput
                className="flex-1 px-4 py-4 text-base"
                style={{ color: isDark ? '#fff' : '#000' }}
                placeholder="Enter your number"
                placeholderTextColor={isDark ? '#555' : '#aaa'}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
            </View>

            {/* Error Message */}
            {error ? (
              <Text className="text-red-500 text-sm mt-2">{error}</Text>
            ) : null}
          </View>

          {/* Info */}
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: isDark ? '#111' : '#f5f5f5' }}
          >
            <Text
              className="text-sm leading-5"
              style={{ color: isDark ? '#888' : '#666' }}
            >
              We'll send you a verification code via SMS to confirm your number.
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isValid || isLoading}
            className="flex-row items-center justify-center py-4 rounded-xl"
            style={{
              backgroundColor: isValid ? (isDark ? '#fff' : '#000') : (isDark ? '#111' : '#e5e5e5'),
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={isDark ? '#000' : '#fff'} />
            ) : (
              <>
                <Text
                  className="text-base font-semibold mr-2"
                  style={{
                    color: isValid ? (isDark ? '#000' : '#fff') : (isDark ? '#555' : '#aaa'),
                  }}
                >
                  Continue
                </Text>
                <ArrowRight
                  size={20}
                  color={isValid ? (isDark ? '#000' : '#fff') : (isDark ? '#555' : '#aaa')}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text
            className="text-xs text-center mt-4"
            style={{ color: isDark ? '#555' : '#999' }}
          >
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

