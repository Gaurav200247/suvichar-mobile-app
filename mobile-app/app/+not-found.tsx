import { Link, Stack } from 'expo-router';
import { View, Text, useColorScheme } from 'react-native';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View
        className="flex-1 items-center justify-center p-5"
        style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
      >
        <Text
          className="text-2xl font-bold mb-4"
          style={{ color: isDark ? '#fff' : '#000' }}
        >
          Page Not Found
        </Text>
        <Text
          className="text-base text-center mb-6"
          style={{ color: isDark ? '#888' : '#666' }}
        >
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Text className="text-blue-500 text-base font-semibold">
            Go to Home
          </Text>
        </Link>
      </View>
    </>
  );
}

