import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-design" />
      <Stack.Screen name="purpose" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
