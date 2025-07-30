"use client"

import { useRouter } from "expo-router"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "customer" | "chef"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: "customer" | "chef") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate splash screen loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const login = async (email: string, password: string, role: "customer" | "chef") => {
    // Simulate login - in real app, this would call your API
    const mockUser: User = {
      id: "1",
      name: role === "customer" ? "Sarah Johnson" : "Chef Marco Rossi",
      email,
      role,
    }
    setUser(mockUser)
    
    // Navigate to the appropriate route
    if (role === "customer") {
      router.replace("/(customer)")
    } else {
      router.replace("/(chef)")
    }
  }

  const logout = () => {
    setUser(null)
    router.replace("/(auth)")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
