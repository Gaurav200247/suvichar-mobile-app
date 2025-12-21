import React from 'react';
import { View, Text } from 'react-native';
import { Lock, ChevronRight, LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedButton } from '../ui/AnimatedButton';
import { AnimatedCard } from '../ui/AnimatedCard';

interface LockedFieldProps {
  label: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
  onPress: () => void;
  isDark: boolean;
}

export const LockedField: React.FC<LockedFieldProps> = ({
  label,
  description,
  icon: Icon,
  delay = 0,
  onPress,
  isDark,
}) => {
  const colors = {
    card: isDark ? '#18181B' : '#FFFFFF',
    text: isDark ? '#FAFAFA' : '#18181B',
    textSecondary: isDark ? '#71717A' : '#71717A',
    textMuted: isDark ? '#52525B' : '#A1A1AA',
    premium: '#F59E0B',
  };

  return (
    <AnimatedCard delay={delay}>
      <AnimatedButton onPress={onPress}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(245, 158, 11, 0.3)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          {/* Premium gradient overlay */}
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Icon size={22} color={colors.premium} />
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: colors.text,
                      marginRight: 8,
                    }}
                  >
                    {label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Lock size={10} color={colors.premium} />
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: '700',
                        color: colors.premium,
                        marginLeft: 3,
                      }}
                    >
                      PRO
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    lineHeight: 18,
                  }}
                >
                  {description}
                </Text>
              </View>

              <ChevronRight
                size={18}
                color={colors.textMuted}
                style={{ marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </AnimatedButton>
    </AnimatedCard>
  );
};

export default LockedField;

