import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../store/api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';

export default function OTPScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { phoneNumber, expiresIn } = useLocalSearchParams<{
    phoneNumber: string;
    expiresIn: string;
  }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(parseInt(expiresIn || '300', 10));
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      const result = await verifyOtp({
        phoneNumber: phoneNumber!,
        otp: code,
      }).unwrap();

      if (!result.error) {
        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
            requiresProfileSetup: result.requiresProfileSetup,
          })
        );

        if (result.requiresProfileSetup) {
          router.replace('/(user)/purpose');
        } else {
          router.replace('/(user)/(tabs)');
        }
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      const result = await resendOtp({ phoneNumber: phoneNumber! }).unwrap();
      if (!result.error) {
        setTimer(result.expiresIn);
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canResend = timer === 0;
  const isComplete = otp.every((d) => d !== '');

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
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }}
          >
            <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-8">
          {/* Title */}
          <View className="mb-10">
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              Verification
            </Text>
            <Text
              className="text-base"
              style={{ color: isDark ? '#888' : '#666' }}
            >
              Enter the 6-digit code sent to{' '}
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>
                {phoneNumber}
              </Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                className="w-12 h-14 text-center text-xl font-semibold rounded-xl"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  borderWidth: 1,
                  borderColor: digit
                    ? isDark ? '#fff' : '#000'
                    : isDark ? '#2a2a2a' : '#e5e5e5',
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error */}
          {error ? (
            <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>
          ) : null}

          {/* Resend */}
          <View className="items-center">
            {canResend ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                className="flex-row items-center py-3"
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} />
                ) : (
                  <>
                    <RefreshCw size={16} color={isDark ? '#fff' : '#000'} />
                    <Text
                      className="text-sm font-medium ml-2"
                      style={{ color: isDark ? '#fff' : '#000' }}
                    >
                      Resend Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <Text
                className="text-sm"
                style={{ color: isDark ? '#666' : '#888' }}
              >
                Resend code in{' '}
                <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>
                  {formatTime(timer)}
                </Text>
              </Text>
            )}
          </View>
        </View>

        {/* Verify Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={() => handleVerify()}
            disabled={!isComplete || isVerifying}
            className="py-4 rounded-xl items-center"
            style={{
              backgroundColor: isComplete
                ? isDark ? '#fff' : '#000'
                : isDark ? '#1a1a1a' : '#e5e5e5',
            }}
          >
            {isVerifying ? (
              <ActivityIndicator color={isDark ? '#000' : '#fff'} />
            ) : (
              <Text
                className="text-base font-semibold"
                style={{
                  color: isComplete
                    ? isDark ? '#000' : '#fff'
                    : isDark ? '#555' : '#aaa',
                }}
              >
                Verify
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="py-3 items-center mt-2"
          >
            <Text
              className="text-sm"
              style={{ color: isDark ? '#666' : '#888' }}
            >
              Change phone number
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

