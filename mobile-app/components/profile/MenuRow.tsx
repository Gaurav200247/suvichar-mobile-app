import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

interface MenuRowProps {
  icon: LucideIcon;
  title: string;
  onPress?: () => void;
  isDark: boolean;
  isLast?: boolean;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

export const MenuRow: React.FC<MenuRowProps> = ({
  icon: Icon,
  title,
  onPress,
  isDark,
  isLast = false,
  danger = false,
  rightElement,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: isDark ? '#27272A' : '#F4F4F5',
    }}
  >
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: danger
          ? 'rgba(239, 68, 68, 0.1)'
          : isDark
          ? '#27272A'
          : '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}
    >
      <Icon
        size={18}
        color={danger ? '#EF4444' : isDark ? '#A1A1AA' : '#71717A'}
      />
    </View>
    <Text
      style={{
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: danger ? '#EF4444' : isDark ? '#FAFAFA' : '#18181B',
      }}
    >
      {title}
    </Text>
    {rightElement ||
      (onPress && (
        <ChevronRight size={18} color={isDark ? '#3F3F46' : '#D4D4D8'} />
      ))}
  </TouchableOpacity>
);

export default MenuRow;

