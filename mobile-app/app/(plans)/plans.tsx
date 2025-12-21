import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FREE_FEATURES, PREMIUM_FEATURES, PLAN_PRICES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedCard, Toast, PlanCard, FeatureItem } from '../../components';

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
            <View className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
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
