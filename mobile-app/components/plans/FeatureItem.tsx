import React from 'react';
import { View, Text } from 'react-native';
import { Check, X } from 'lucide-react-native';

interface FeatureItemProps {
  text: string;
  included: boolean;
  isDark: boolean;
  premium?: boolean;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  text,
  included,
  isDark,
  premium = false,
}) => (
  <View className="flex-row items-center py-2">
    <View
      className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${
        included ? (premium ? 'bg-blue-500' : 'bg-green-500') : 'bg-gray-300'
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

export default FeatureItem;

