import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Check, LucideIcon } from 'lucide-react-native';

interface OptionCardProps {
  type: 'personal' | 'business';
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  type,
  title,
  description,
  icon: Icon,
  isSelected,
  onSelect,
  isDark,
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className="p-5 rounded-2xl mb-4"
      style={{
        backgroundColor: isDark ? '#1a1a1a' : '#fff',
        borderWidth: 2,
        borderColor: isSelected
          ? isDark
            ? '#fff'
            : '#000'
          : isDark
          ? '#2a2a2a'
          : '#e5e5e5',
      }}
    >
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{
            backgroundColor: isSelected
              ? isDark
                ? '#fff'
                : '#000'
              : isDark
              ? '#2a2a2a'
              : '#f5f5f5',
          }}
        >
          <Icon
            size={22}
            color={
              isSelected
                ? isDark
                  ? '#000'
                  : '#fff'
                : isDark
                ? '#888'
                : '#666'
            }
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

          <Text className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OptionCard;

