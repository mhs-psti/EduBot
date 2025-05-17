import { Stack } from 'expo-router';

export default function DocumentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="preview/[id]" />
    </Stack>
  );
}