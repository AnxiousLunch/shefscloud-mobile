"use client";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "chef";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: "customer" | "chef") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  const login = async (email: string, password: string, role: "customer" | "chef") => {
    // Simulate API response
    const mockUser: User = {
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
