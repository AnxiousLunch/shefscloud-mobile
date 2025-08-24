"use client"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import SplashScreen from "../screens/SplashScreen.jsx"
import { useDispatch } from "react-redux"
import { loadUserFromStorage } from "@/store/user"
import { useState } from "react"

export default function App() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
  const bootstrap = async () => {
    try {
      const res = await dispatch(loadUserFromStorage()).unwrap();
      
      if (res?.userInfo && res?.authToken) {
        // user exists -> route by role
        router.replace("/(customer)");
      } else {
        // no user found in storage
        router.replace("/(auth)");
      }
    } catch (err) {
      console.error("Failed to load user from storage:", err);
      router.replace("/(auth)");
    } finally {
        setChecking(false);
    }
  };

  bootstrap();
}, [dispatch, router]);

  if (checking) {
    return <SplashScreen />;
  }
  // This will be shown briefly while redirecting
  return <SplashScreen />
}