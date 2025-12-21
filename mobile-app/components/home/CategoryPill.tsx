import React from 'react';
import { Pressable, View, Text } from 'react-native';

interface CategoryPillProps {
  category: { name: string; emoji: string };
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  isSelected,
  onPress,
  isDark,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: isSelected
            ? '#6366F1'
            : isDark
              ? '#27272A'
              : '#F4F4F5',
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 15 }}>{category.emoji}</Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: isSelected ? '600' : '500',
            color: isSelected ? '#FFFFFF' : isDark ? '#A1A1AA' : '#52525B',
          }}
        >
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
};

export default CategoryPill;

