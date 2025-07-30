"use client"
import { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "../contexts/AuthContext"
import SplashScreen from "../screens/SplashScreen"

export default function App() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/(auth)")
      } else if (user.role === "customer") {
        router.replace("/(customer)")
      } else {
        router.replace("/(chef)")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <SplashScreen />
  }

  // This will be shown briefly while redirecting
  return <SplashScreen />
}
