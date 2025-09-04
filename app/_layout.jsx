import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { store } from "../store/store";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import * as Notifications from 'expo-notifications'
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    // When the app is opened from a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;

        if (screen) {
          router.push(screen); // Navigate with expo-router
        }
      }
    );

    return () => subscription.remove();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AuthProvider>
            <CartProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }} />
            </CartProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}