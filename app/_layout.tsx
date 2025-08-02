import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { store } from '../store/store'
import { Provider } from "react-redux";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <Provider store={store}>
            <Stack screenOptions={{ headerShown: false }} />
          </Provider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
