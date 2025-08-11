// app/(checkout)/_layout.tsx
import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // or false if you want full screen
      }}
    />
  );
}
