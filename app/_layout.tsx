import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { store } from "../store/store";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AuthProvider>
            <CartProvider>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </CartProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
