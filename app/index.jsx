"use client"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import SplashScreen from "../screens/SplashScreen.jsx"

export default function App() {
  const { user, isLoading } = useAuth();
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.role) {
        router.replace("/(auth)")
      } else if (user.role === "customer") {
        router.replace("/(customer)")
      } else if (user.role === "chef") {
        router.replace("/(chef)")
      } else {
        router.replace("/(auth)");
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <SplashScreen />
  }

  // This will be shown briefly while redirecting
  return <SplashScreen />
}
