import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Check, X, ArrowLeft, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FREE_FEATURES, PREMIUM_FEATURES, PLAN_PRICES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

// Animated Card Component with staggered entrance
const AnimatedCard = ({ 
  children, 
  delay = 0, 
  style 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  style?: any;
}) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
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

// Simple Toast Component
const Toast = ({ visible, message }: { visible: boolean; message: string }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY }], opacity }}
      className="absolute bottom-8 left-6 right-6 bg-gray-900 rounded-2xl py-4 px-5 z-50 shadow-lg flex-row items-center justify-center"
    >
      <Zap size={18} color="#FBBF24" />
      <Text className="text-white text-center font-medium ml-2">{message}</Text>
    </Animated.View>
  );
};

// Plan Option Card
const PlanCard = ({
  selected,
  onSelect,
  title,
  price,
  period,
  subtitle,
  badge,
  isDark,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  price: string;
  period: string;
  subtitle?: string;
  badge?: string;
  isDark: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect();
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={{ transform: [{ scale }] }}
        className={`rounded-2xl p-4 mb-3 border-2 ${
          selected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : isDark
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-gray-200 bg-white'
        }`}
      >
        {badge && (
          <View className="absolute -top-3 left-4 bg-amber-500 px-3 py-1 rounded-full">
            <Text className="text-xs font-bold text-white">{badge}</Text>
          </View>
        )}
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {/* Radio Indicator */}
            <View
              className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                selected
                  ? 'border-blue-500 bg-blue-500'
                  : isDark
                  ? 'border-gray-600'
                  : 'border-gray-300'
              }`}
            >
              {selected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>

            <View>
              <Text
                className={`text-base font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {title}
              </Text>
              {subtitle && (
                <Text className="text-xs text-green-600 font-medium mt-0.5">
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          <View className="items-end">
            <Text className="text-xl font-bold text-blue-600">{price}</Text>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {period}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Feature Item Component
const FeatureItem = ({
  text,
  included,
  isDark,
  premium = false,
}: {
  text: string;
  included: boolean;
  isDark: boolean;
  premium?: boolean;
}) => (
  <View className="flex-row items-center py-2">
    <View
      className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${
        included
          ? premium
            ? 'bg-blue-500'
            : 'bg-green-500'
          : 'bg-gray-300'
      }`}
    >
      {included ? (
        <Check size={12} color="#FFFFFF" strokeWidth={3} />
      ) : (
        <X size={10} color="#FFFFFF" strokeWidth={3} />
      )}
    </View>
    <Text
      className={`text-sm flex-1 ${
        included
          ? isDark
            ? 'text-gray-200'
            : 'text-gray-700'
          : isDark
          ? 'text-gray-500'
          : 'text-gray-400'
      }`}
    >
      {text}
    </Text>
  </View>
);

export default function PlansScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const handleContinue = () => {
    setToastKey((prev) => prev + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity
          className={`w-10 h-10 rounded-full justify-center items-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={isDark ? '#FFFFFF' : '#374151'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Title Section */}
        <AnimatedCard delay={0}>
          <View className="px-6 mb-6">
            <View className="flex-row items-center mb-2">
              <Crown size={28} color="#3B82F6" />
              <Text
                className={`text-2xl font-bold ml-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Go Premium
              </Text>
            </View>
            <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Unlock all features and create stunning quotes without limits.
            </Text>
          </View>
        </AnimatedCard>

        {/* Plan Selection */}
        <AnimatedCard delay={100}>
          <View className="px-5 mb-6">
            <Text
              className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Choose your plan
            </Text>

            <PlanCard
              selected={selectedPlan === 'yearly'}
              onSelect={() => setSelectedPlan('yearly')}
              title="Yearly"
              price={`${PLAN_PRICES.yearly.currency}${PLAN_PRICES.yearly.price}`}
              period="per year"
              subtitle={`Only ₹${PLAN_PRICES.yearly.monthlyEquivalent}/mo • Save ${PLAN_PRICES.yearly.savings}`}
              badge="BEST VALUE"
              isDark={isDark}
            />

            <PlanCard
              selected={selectedPlan === 'monthly'}
              onSelect={() => setSelectedPlan('monthly')}
              title="Monthly"
              price={`${PLAN_PRICES.monthly.currency}${PLAN_PRICES.monthly.price}`}
              period="per month"
              isDark={isDark}
            />
          </View>
        </AnimatedCard>

        {/* What's Included */}
        <AnimatedCard delay={200}>
          <View className="px-5 mb-6">
            <View
              className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <Text
                className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Premium includes
              </Text>

              <View className="border-t border-gray-200 dark:border-gray-700 pt-2">
                {PREMIUM_FEATURES.map((feature, index) => (
                  <FeatureItem
                    key={index}
                    text={feature}
                    included={true}
                    isDark={isDark}
                    premium
                  />
                ))}
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Free Plan Comparison */}
        <AnimatedCard delay={300}>
          <View className="px-5">
            <View
              className={`rounded-2xl p-5 border border-dashed ${
                isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-white/50'
              }`}
            >
              <Text
                className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Free plan
              </Text>

              <View className="border-t border-gray-200 dark:border-gray-700 pt-2">
                {FREE_FEATURES.map((feature, index) => (
                  <FeatureItem
                    key={index}
                    text={feature}
                    included={index !== 2}
                    isDark={isDark}
                  />
                ))}
              </View>

              <TouchableOpacity
                className="mt-4 py-3 rounded-xl bg-transparent"
                onPress={() => router.back()}
                activeOpacity={0.6}
              >
                <Text
                  className={`text-center font-medium text-sm ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  Continue with Free →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>
      </ScrollView>

      {/* Bottom CTA */}
      <AnimatedCard delay={350}>
        <View
          className={`absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 ${
            isDark ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center"
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Crown size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">
              Continue with {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}
            </Text>
          </TouchableOpacity>

          <Text className={`text-center text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Cancel anytime • Secure payment
          </Text>
        </View>
      </AnimatedCard>

      {/* Toast */}
      <Toast key={toastKey} visible={showToast} message="Payment flow coming soon!" />
    </SafeAreaView>
  );
}
