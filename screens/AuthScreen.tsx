"use client";

import { useState, useEffect } from "react";
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
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { handleUserLogin } from "../auth_endpoints/AuthEndpoints";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "expo-router";
import { loginAndSaveUser, loadUserFromStorage } from '../store/user';
import { AppDispatch } from "../store/store";
import { useAppSelector } from "@/hooks/hooks";

const { width, height } = Dimensions.get("window");

export default function AuthScreen() {
  const [selectedRole, setSelectedRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { userInfo, isLoading: reduxLoading, isInitialized } = useAppSelector((state) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Load user data from AsyncStorage when component mounts
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Navigate to appropriate screen once user data is loaded and user is authenticated
  useEffect(() => {
    if (isInitialized && userInfo) {
      router.replace('/(customer)');
    }
  }, [userInfo, isInitialized, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await handleUserLogin({ email, password });
      dispatch(loginAndSaveUser(res));
      Alert.alert("Successfully Logged In");
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking for existing user data
  if (!isInitialized || reduxLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#b30000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const navigateToSignUp = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Gradient background */}
            <LinearGradient
              colors={["#5a0000", "#8b0000", "#b30000", "#e40c0c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modernBackground}
            />

            {/* Header */}
            <View style={styles.authHeader}>
              <LinearGradient colors={["#b30000", "#ff0000"]} style={styles.logoGradient}>
                <Text style={styles.logoText}>SC</Text>
              </LinearGradient>
              <Text style={styles.title}>Shefs Cloud</Text>
              <Text style={styles.subtitle}>
                Discover exceptional culinary experiences from verified professional chefs
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.glassMorphism} />

              {/* Role Selector */}
              <View style={styles.roleSelector}>
                {["customer", "chef"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      selectedRole === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole(role as "customer" | "chef")}
                  >
                    <View
                      style={[
                        styles.roleIconContainer,
                        selectedRole === role && styles.roleIconActive,
                      ]}
                    >
                      <Ionicons
                        name={role === "customer" ? "restaurant-outline" : "storefront-outline"}
                        size={20}
                        color={selectedRole === role ? "#b10707ff" : "#cc0000"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleText,
                        selectedRole === role && styles.roleTextActive,
                      ]}
                    >
                      {role === "customer" ? "Food Lover" : "Chef"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Email Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#530202" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#7a7979ff"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#530202" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#7a7979ff"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#530202"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#b30000", "#e40c0c"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingDot} />
                      <View style={[styles.loadingDot, styles.loadingDot2]} />
                      <View style={[styles.loadingDot, styles.loadingDot3]} />
                    </View>
                  ) : (
                    <Text onPress={navigateToSignUp} style={styles.primaryButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Apple Sign-In */}
              <TouchableOpacity style={styles.appleButton} onPress={() => Alert.alert("Coming Soon")}>
                <Ionicons name="logo-apple" size={18} color="#fff" />
                <Text style={styles.appleButtonText}>Sign in with Apple</Text>
              </TouchableOpacity>

              {/* Create Account */}
              <TouchableOpacity
                style={styles.tertiaryButton}
                onPress={navigateToSignUp}
              >
                <Text style={styles.tertiaryButtonText}>Create New Account</Text>
                <Ionicons name="arrow-forward" size={16} color="#cf0c0c" />
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing, you agree to our{"\n"}
              <Text style={styles.termsLink}>Terms of Service</Text> &{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#b30000',
  },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: width * 0.05,
    alignItems: "center",
  },
  modernBackground: {
    position: "absolute",
    top: 0,
    width: width,
    height: height * 0.4,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    zIndex: -1,
  },
  authHeader: {
    alignItems: "center",
    marginTop: height * 0.08,
    marginBottom: 30,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#f8f8f8",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  glassMorphism: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
  },
  roleSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#cc0000",
  },
  roleIconContainer: {
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 8,
  },
  roleIconActive: {
    backgroundColor: "#fff",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cc0000",
  },
  roleTextActive: {
    color: "#fff",
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 48,
    backgroundColor: "rgba(224, 8, 8, 0.3)",
    borderRadius: 12,
    color: "#610303ff",
    fontSize: 14,
  },
  inputIcon: {
    position: "absolute",
    left: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingDot: {
    width: 8,
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  loadingDot2: { opacity: 0.6 },
  loadingDot3: { opacity: 0.9 },
  appleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 8,
  },
  appleButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  tertiaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 16,
    borderColor: "#cc0000",
    borderWidth: 1.2,
    backgroundColor: "transparent",
    gap: 6,
  },
  tertiaryButtonText: {
    color: "#b30000",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 30,
  },
  termsLink: {
    fontWeight: "600",
    color: "#b30000",
  },
});