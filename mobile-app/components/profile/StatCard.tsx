import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  isDark: boolean;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  isDark,
  accentColor = '#6366F1',
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: isDark ? '#18181B' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${accentColor}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
      }}
    >
      <Icon size={20} color={accentColor} />
    </View>
    <Text
      style={{
        fontSize: 20,
        fontWeight: '700',
        color: isDark ? '#FAFAFA' : '#18181B',
        marginBottom: 2,
      }}
    >
      {value}
    </Text>
    <Text style={{ fontSize: 12, color: isDark ? '#71717A' : '#A1A1AA' }}>
      {label}
    </Text>
  </View>
);

export default StatCard;

