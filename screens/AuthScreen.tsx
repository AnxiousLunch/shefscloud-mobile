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
import { loginAndSaveUser, loadUserFromStorage, saveUserToStorage } from '../store/user';
import { AppDispatch } from "@/types/types";
import { useAppSelector } from "@/hooks/hooks";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeUserCart } from "@/store/cart";

const { width, height } = Dimensions.get("window");
WebBrowser.maybeCompleteAuthSession();

// Responsive helper functions
const isTablet = width >= 768
const isSmallPhone = width < 375
const responsiveWidth = (percentage: number) => width * (percentage / 100)
const responsiveHeight = (percentage: number) => height * (percentage / 100)
const responsiveFontSize = (size: number) => {
  if (isTablet) return size * 1.2
  if (isSmallPhone) return size * 0.9
  return size
}

export default function AuthScreen() {
  const [selectedRole, setSelectedRole] = useState<"customer" | "chef">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });
  
 const { userInfo, isLoading: reduxLoading, isInitialized } = useAppSelector((state) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();


 useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const res = await handleUserLogin({ email, password });
      
      // Save role in storage
      await AsyncStorage.setItem("selectedRole", selectedRole);

      // Save user in Redux
      dispatch(loginAndSaveUser(res));
      console.log(res);
      await dispatch(initializeUserCart(res.data.id));

      Alert.alert("Successfully Logged In");

      // Go to region selection after login
      router.replace("/(region)");

    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await promptAsync();
    if (result.type === 'success') {
      if (!result.authentication) {
        Alert.alert("Failed to authenticate");
        return;
      }
      const user = await getUserInfo(result.authentication.accessToken);
      dispatch(loginAndSaveUser(user));
    } else {
      console.log('Login cancelled or failed:', result.type);
    }
  };

  const getUserInfo = async (accessToken: string) => {
    const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await res.json();
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
    router.push('/(signup)');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
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
                    style={[styles.roleButton, selectedRole === role && styles.roleButtonActive]}
                    onPress={() => setSelectedRole(role as "customer" | "chef")}
                  >
                    <View style={[styles.roleIconContainer, selectedRole === role && styles.roleIconActive]}>
                      <Ionicons
                        name={role === "customer" ? "restaurant-outline" : "storefront-outline"}
                        size={isTablet ? 24 : 20}
                        color={selectedRole === role ? "#b10707ff" : "#cc0000"}
                      />
                    </View>
                    <Text style={[styles.roleText, selectedRole === role && styles.roleTextActive]}>
                      {role === "customer" ? "Food Lover" : "Chef"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Email Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={isTablet ? 24 : 20} color="#530202" style={styles.inputIcon} />
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
                  <Ionicons
                    name="lock-closed-outline"
                    size={isTablet ? 24 : 20}
                    color="#530202"
                    style={styles.inputIcon}
                  />
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
                      size={isTablet ? 24 : 20}
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
          <Text style={styles.primaryButtonText}>Sign In</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
              {/* Google Sign-In */}
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <Ionicons name="logo-google" size={isTablet ? 22 : 18} color="#fff" />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
              {/* Create Account */}
              <TouchableOpacity
                style={styles.tertiaryButton}
                onPress={navigateToSignUp}
              >
                <Text style={styles.tertiaryButtonText}>Create New Account</Text>
                <Ionicons name="arrow-forward" size={isTablet ? 20 : 16} color="#cf0c0c" />
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
  )
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
    paddingBottom: responsiveHeight(5),
    paddingHorizontal: Math.min(responsiveWidth(5), 40),
    alignItems: "center",
    minHeight: height,
  },
  modernBackground: {
    position: "absolute",
    top: 0,
    width: width,
    height: Math.max(responsiveHeight(40), 300),
    borderBottomLeftRadius: isTablet ? 60 : 50,
    borderBottomRightRadius: isTablet ? 60 : 50,
    zIndex: -1,
  },
  authHeader: {
    alignItems: "center",
    marginTop: Math.max(responsiveHeight(8), 60),
    marginBottom: isTablet ? 40 : 30,
    paddingHorizontal: responsiveWidth(5),
  },
  logoGradient: {
    width: isTablet ? 100 : isSmallPhone ? 70 : 80,
    height: isTablet ? 100 : isSmallPhone ? 70 : 80,
    borderRadius: isTablet ? 25 : 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: isTablet ? 20 : 15,
  },
  logoText: {
    fontSize: responsiveFontSize(28),
    fontWeight: "900",
    color: "#fff",
  },
  title: {
    fontSize: responsiveFontSize(28),
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: responsiveFontSize(15),
    color: "#f8f8f8",
    textAlign: "center",
    lineHeight: responsiveFontSize(22),
    maxWidth: isTablet ? 400 : 300,
  },
  formContainer: {
    width: "100%",
    maxWidth: isTablet ? 500 : 400,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: isTablet ? 30 : 20,
    borderRadius: isTablet ? 25 : 20,
    marginBottom: 20,
  },
  glassMorphism: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: isTablet ? 25 : 20,
  },
  roleSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: isTablet ? 18 : 15,
    overflow: "hidden",
    marginBottom: isTablet ? 30 : 25,
  },
  roleButton: {
    flex: 1,
    paddingVertical: isTablet ? 18 : 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#cc0000",
  },
  roleIconContainer: {
    marginRight: isTablet ? 12 : 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: isTablet ? 8 : 6,
    borderRadius: isTablet ? 10 : 8,
  },
  roleIconActive: {
    backgroundColor: "#fff",
  },
  roleText: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#cc0000",
  },
  roleTextActive: {
    color: "#fff",
  },
  formGroup: {
    marginBottom: isTablet ? 22 : 18,
  },
  label: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: isTablet ? 8 : 6,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: isTablet ? 18 : 14,
    paddingLeft: isTablet ? 56 : 48,
    paddingRight: isTablet ? 56 : 48,
    backgroundColor: "rgba(224, 8, 8, 0.3)",
    borderRadius: isTablet ? 15 : 12,
    color: "#610303ff",
    fontSize: responsiveFontSize(14),
  },
  inputIcon: {
    position: "absolute",
    left: isTablet ? 20 : 16,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: isTablet ? 20 : 16,
    zIndex: 1,
  },
  primaryButton: {
    borderRadius: isTablet ? 18 : 14,
    overflow: "hidden",
    marginBottom: isTablet ? 20 : 16,
  },
  gradientButton: {
    paddingVertical: isTablet ? 20 : 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(16),
    fontWeight: "700",
  },
  loadingDot: {
    width: isTablet ? 10 : 8,
    height: isTablet ? 10 : 8,
    backgroundColor: "#fff",
    borderRadius: isTablet ? 5 : 4,
  },
  loadingDot2: { opacity: 0.6 },
  loadingDot3: { opacity: 0.9 },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: isTablet ? 18 : 14,
    paddingVertical: isTablet ? 20 : 16,
    marginBottom: isTablet ? 20 : 16,
    gap: isTablet ? 10 : 8,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(15),
    fontWeight: "600",
  },
  tertiaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: isTablet ? 18 : 14,
    paddingVertical: isTablet ? 20 : 16,
    borderColor: "#cc0000",
    borderWidth: 1.2,
    backgroundColor: "transparent",
    gap: isTablet ? 8 : 6,
  },
  tertiaryButtonText: {
    color: "#b30000",
    fontWeight: "600",
    fontSize: responsiveFontSize(15),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  termsText: {
    textAlign: "center",
    fontSize: responsiveFontSize(12),
    color: "#6b7280",
    marginBottom: isTablet ? 40 : 30,
    paddingHorizontal: responsiveWidth(5),
    maxWidth: isTablet ? 400 : 300,
  },
  termsLink: {
    fontWeight: "600",
    color: "#b30000",
  },
});