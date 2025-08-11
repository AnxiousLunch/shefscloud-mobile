"use client";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { handleUserLogin } from "@/auth_endpoints/AuthEndpoints";
import { useDispatch } from "react-redux";
import { loginAndSaveUser } from "@/store/user";


const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

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

    try {
      const res = await handleUserLogin({email, password});
      dispatch(loginAndSaveUser(res));
      setUser(mockUser);

      if (role === "customer") {
        router.replace("/(customer)");
      } else {
        router.replace("/(chef)" );
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
