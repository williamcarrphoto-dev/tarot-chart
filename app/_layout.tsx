import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="friend/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Profile',
            headerStyle: { backgroundColor: '#1a0a2e' },
            headerTintColor: '#d4b8f0',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
