import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ThemeOptionButtonProps {
  mode: 'light' | 'dark' | 'system';
  currentMode: string;
  onPress: () => void;
  isDark: boolean;
  icon: LucideIcon;
  label: string;
}

export const ThemeOptionButton: React.FC<ThemeOptionButtonProps> = ({
  mode,
  currentMode,
  onPress,
  isDark,
  icon: Icon,
  label,
}) => {
  const isSelected = currentMode === mode;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: isSelected
          ? '#6366F1'
          : isDark
          ? '#27272A'
          : '#F4F4F5',
      }}
    >
      <Icon
        size={20}
        color={isSelected ? '#FFFFFF' : isDark ? '#A1A1AA' : '#71717A'}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          color: isSelected ? '#FFFFFF' : isDark ? '#A1A1AA' : '#71717A',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeOptionButton;

