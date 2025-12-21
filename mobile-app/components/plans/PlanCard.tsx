import React, { useRef } from 'react';
import { TouchableOpacity, Animated, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface PlanCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  price: string;
  period: string;
  subtitle?: string;
  badge?: string;
  isDark: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  selected,
  onSelect,
  title,
  price,
  period,
  subtitle,
  badge,
  isDark,
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
            <Text
              className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {period}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default PlanCard;

