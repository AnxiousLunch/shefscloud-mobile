"use client";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error loading user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password, role) => {
    // Simulate API response
    const mockUser= {
      id: "1",
      name: role === "customer" ? "Sarah Johnson" : "Chef Marco Rossi",
      email,
      role,
    };

    try {
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      await AsyncStorage.setItem("auth", "mock_token"); // you can replace this with real token
      setUser(mockUser);

      if (role === "customer") {
        router.replace("/(customer)");
      } else {
        router.replace("/(chef)");
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "auth"]);
      setUser(null);
      router.replace("/(auth)");
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
