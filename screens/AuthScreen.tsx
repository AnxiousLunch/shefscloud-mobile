"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../contexts/AuthContext"

export default function AuthScreen() {
  const [selectedRole, setSelectedRole] = useState<"customer" | "chef">("customer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await login(email, password, selectedRole)
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = () => {
    Alert.alert("Sign Up", "Signup functionality would be implemented with additional form fields and validation.")
  }

  return (
    <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>SC</Text>
            </View>

            <Text style={styles.title}>Welcome to Shefs Cloud</Text>
            <Text style={styles.subtitle}>
              Discover exceptional culinary experiences from verified professional chefs
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleButton, selectedRole === "customer" && styles.roleButtonActive]}
                  onPress={() => setSelectedRole("customer")}
                >
                  <Text style={styles.roleIcon}>🍽️</Text>
                  <Text style={[styles.roleText, selectedRole === "customer" && styles.roleTextActive]}>
                    Food Lover
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, selectedRole === "chef" && styles.roleButtonActive]}
                  onPress={() => setSelectedRole("chef")}
                >
                  <Text style={styles.roleIcon}>👨‍🍳</Text>
                  <Text style={[styles.roleText, selectedRole === "chef" && styles.roleTextActive]}>
                    Professional Chef
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
                <Text style={styles.secondaryButtonText}>Create New Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>By continuing, you agree to our{"\n"}Terms of Service & Privacy Policy</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.2,
    shadowRadius: 35,
    elevation: 15,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#dc2626",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 40,
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 25,
    padding: 35,
    marginBottom: 25,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 18,
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleText: {
    fontWeight: "600",
    color: "#374151",
  },
  roleTextActive: {
    color: "#dc2626",
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 15,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 18,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  primaryButton: {
    width: "100%",
    padding: 18,
    backgroundColor: "#dc2626",
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    padding: 18,
    backgroundColor: "#6b7280",
    borderRadius: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})
