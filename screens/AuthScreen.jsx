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

// Enhanced responsive helper functions
const isTablet = width >= 768
const isSmallPhone = width < 375
const responsiveValue = (phoneValue, tabletValue, smallPhoneValue) => {
  if (isTablet) return tabletValue;
  if (isSmallPhone && smallPhoneValue !== undefined) return smallPhoneValue;
  return phoneValue;
}
const responsiveWidth = (percentage) => width * (percentage / 100)
const responsiveHeight = (percentage) => height * (percentage / 100)
const responsiveFontSize = (size) => {
  const baseSize = responsiveValue(size, size * 1.2, size * 0.85);
  return Math.min(baseSize, size * 1.5); // Prevent oversized text on large devices
}

export default function AuthScreen() {
  const [selectedRole, setSelectedRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });
  
 const { userInfo, isLoading: reduxLoading, isInitialized } = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
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

  const getUserInfo = async (accessToken) => {
    const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await res.json();
  };

  // Show loading screen while checking for existing user data
  if (!isInitialized || reduxLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <LinearGradient
          colors={["#fef7f0", "#fdeae1", "#f9dcc4"]}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#b30000" />
          </View>
          <Text style={styles.loadingText}>Initializing...</Text>
        </LinearGradient>
      </View>
    );
  }

  const navigateToSignUp = () => {
    router.push('/(signup)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ffffff", "#fef7f0", "#fdeae1", "#f9dcc4"]}
        style={styles.backgroundGradient}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Decorative Elements */}
            <View style={styles.decorativeElement1} />
            <View style={styles.decorativeElement2} />
            <View style={styles.decorativeElement3} />
            <View style={styles.decorativeElement4} />
            
            {/* Header Section */}
            <View style={styles.authHeader}>
              <View style={styles.logoContainer}>
                <LinearGradient 
                  colors={["#b30000", "#d42c2c", "#ff4444"]} 
                  style={styles.logoGradient}
                >
                  <View style={styles.logoInner}>
                    <Text style={styles.logoText}>SC</Text>
                  </View>
                  <View style={styles.logoShine} />
                </LinearGradient>
                <View style={styles.logoShadow} />
              </View>
              
              <Text style={styles.title}>Shefs Cloud</Text>
              <View style={styles.titleAccent}>
                <View style={styles.titleDot} />
                <View style={styles.titleLine} />
                <View style={styles.titleDot} />
              </View>
              <Text style={styles.subtitle}>
                Discover exceptional culinary experiences from verified professional chefs
              </Text>
            </View>

            {/* Main Form Card */}
            <View style={styles.formCard}>
              <View style={styles.cardShadow} />
              
              {/* Welcome Text */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>Sign in to continue your culinary journey</Text>
              </View>

              {/* Role Selector */}
              <View style={styles.roleSelectorContainer}>
                <Text style={styles.sectionLabel}>I am a</Text>
                <View style={styles.roleSelector}>
                  <View style={styles.roleSelectorBackground} />
                  {["customer", "chef"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton, 
                        selectedRole === role && styles.roleButtonActive
                      ]}
                      onPress={() => setSelectedRole(role)}
                      activeOpacity={0.7}
                    >
                      {selectedRole === role && (
                        <LinearGradient
                          colors={["#b30000", "#d42c2c"]}
                          style={styles.roleActiveBackground}
                        />
                      )}
                      <View style={styles.roleContent}>
                        <View style={[
                          styles.roleIconContainer, 
                          selectedRole === role && styles.roleIconActive
                        ]}>
                          <Ionicons
                            name={role === "customer" ? "restaurant" : "storefront"}
                            size={responsiveValue(18, 20, 16)}
                            color={selectedRole === role ? "#fff" : "#b30000"}
                          />
                        </View>
                        <Text style={[
                          styles.roleText, 
                          selectedRole === role && styles.roleTextActive
                        ]}>
                          {role === "customer" ? "Food Lover" : "Professional Chef"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Input Fields */}
              <View style={styles.inputSection}>
                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, email && styles.inputContainerActive]}>
                      <Ionicons name="mail" size={responsiveValue(18, 22, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, password && styles.inputContainerActive]}>
                      <Ionicons name="lock-closed" size={responsiveValue(18, 22, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)} 
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? "eye" : "eye-off"}
                          size={responsiveValue(18, 20, 16)}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#b30000", "#d42c2c", "#ff4444"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButtonGradient}
                  >
                    <View style={styles.buttonContent}>
                      {isLoading ? (
                        <>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={styles.primaryButtonText}>Signing In...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>Sign In</Text>
                          <Ionicons name="arrow-forward" size={responsiveValue(16, 20, 14)} color="#fff" />
                        </>
                      )}
                    </View>
                  </LinearGradient>
                  <View style={styles.buttonHighlight} />
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerTextContainer}>
                    <Text style={styles.dividerText}>or continue with</Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-In */}
                <TouchableOpacity 
                  style={styles.googleButton} 
                  onPress={handleGoogleLogin}
                  activeOpacity={0.8}
                >
                  <View style={styles.googleButtonContent}>
                    <View style={styles.googleIconContainer}>
                      <Ionicons name="logo-google" size={responsiveValue(18, 22, 16)} color="#4285f4" />
                    </View>
                    <Text style={styles.googleButtonText}>Google</Text>
                  </View>
                  <View style={styles.googleButtonBorder} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Section */}
            <View style={styles.signupSection}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={navigateToSignUp}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingSpinner: {
    marginBottom: responsiveHeight(2),
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: responsiveValue(20, 24, 18),
    elevation: 8,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loadingText: {
    fontSize: responsiveFontSize(14),
    color: '#b30000',
    fontWeight: '600',
  },
  safeArea: { 
    flex: 1 
  },
  keyboardView: { 
    flex: 1 
  },
  scrollContent: {
    paddingBottom: responsiveHeight(3),
    paddingHorizontal: Math.min(responsiveWidth(5), 24),
    alignItems: "center",
    minHeight: height,
  },
  
  // Decorative Elements
  decorativeElement1: {
    position: "absolute",
    top: responsiveHeight(15),
    right: responsiveWidth(10),
    width: responsiveValue(60, 80, 50),
    height: responsiveValue(60, 80, 50),
    backgroundColor: "rgba(179, 0, 0, 0.05)",
    borderRadius: 40,
    borderWidth: responsiveValue(1, 2, 1),
    borderColor: "rgba(179, 0, 0, 0.1)",
  },
  decorativeElement2: {
    position: "absolute",
    top: responsiveHeight(25),
    left: responsiveWidth(5),
    width: responsiveValue(50, 60, 40),
    height: responsiveValue(50, 60, 40),
    backgroundColor: "rgba(255, 68, 68, 0.08)",
    borderRadius: 30,
    transform: [{ rotate: '45deg' }],
  },
  decorativeElement3: {
    position: "absolute",
    top: responsiveHeight(45),
    right: responsiveWidth(8),
    width: responsiveValue(30, 40, 25),
    height: responsiveValue(30, 40, 25),
    backgroundColor: "rgba(179, 0, 0, 0.06)",
    borderRadius: 20,
  },
  decorativeElement4: {
    position: "absolute",
    top: responsiveHeight(35),
    left: responsiveWidth(12),
    width: responsiveValue(80, 100, 70),
    height: responsiveValue(80, 100, 70),
    backgroundColor: "rgba(255, 68, 68, 0.03)",
    borderRadius: 50,
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "rgba(179, 0, 0, 0.08)",
  },

  // Header
  authHeader: {
    alignItems: "center",
    marginTop: responsiveHeight(6),
    marginBottom: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
  },
  logoContainer: {
    position: "relative",
    marginBottom: responsiveHeight(2),
  },
  logoGradient: {
    width: responsiveValue(70, 85, 65),
    height: responsiveValue(70, 85, 65),
    borderRadius: responsiveValue(16, 20, 14),
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  logoInner: {
    width: "88%",
    height: "88%",
    borderRadius: responsiveValue(12, 16, 10),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoShine: {
    position: "absolute",
    top: responsiveValue(6, 8, 5),
    left: responsiveValue(6, 8, 5),
    width: "30%",
    height: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 8,
  },
  logoShadow: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    bottom: -4,
    backgroundColor: "rgba(179, 0, 0, 0.15)",
    borderRadius: responsiveValue(16, 20, 14),
    zIndex: -1,
  },
  logoText: {
    fontSize: responsiveFontSize(24),
    fontWeight: "900",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: responsiveFontSize(26),
    fontWeight: "800",
    color: "#2d2d2d",
    marginBottom: responsiveHeight(1),
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleAccent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1.5),
  },
  titleDot: {
    width: responsiveValue(5, 6, 4),
    height: responsiveValue(5, 6, 4),
    backgroundColor: "#b30000",
    borderRadius: 3,
  },
  titleLine: {
    width: responsiveValue(35, 40, 30),
    height: responsiveValue(1.5, 2, 1),
    backgroundColor: "#b30000",
    marginHorizontal: responsiveValue(6, 8, 5),
  },
  subtitle: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    textAlign: "center",
    lineHeight: responsiveFontSize(18),
    maxWidth: Math.min(responsiveWidth(90), 400),
    fontWeight: "400",
  },

  // Form Card
  formCard: {
    width: "100%",
    maxWidth: Math.min(responsiveWidth(90), 480),
    backgroundColor: "#ffffff",
    padding: responsiveValue(16, 24, 14),
    borderRadius: responsiveValue(14, 18, 12),
    marginBottom: responsiveHeight(3),
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "rgba(179, 0, 0, 0.08)",
  },
  cardShadow: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: "rgba(179, 0, 0, 0.03)",
    borderRadius: responsiveValue(15, 19, 13),
    zIndex: -1,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: responsiveHeight(3),
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: responsiveHeight(0.5),
  },
  welcomeSubtitle: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    textAlign: "center",
  },

  // Role Selector
  roleSelectorContainer: {
    marginBottom: responsiveHeight(2.5),
  },
  sectionLabel: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
    color: "#444",
    marginBottom: responsiveHeight(1),
    textAlign: "center",
  },
  roleSelector: {
    position: "relative",
    flexDirection: "row",
    borderRadius: responsiveValue(10, 12, 8),
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    padding: responsiveValue(3, 4, 2),
  },
  roleSelectorBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f1f3f4",
    borderRadius: responsiveValue(10, 12, 8),
  },
  roleButton: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderRadius: responsiveValue(8, 10, 6),
  },
  roleActiveBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: responsiveValue(8, 10, 6),
  },
  roleContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveValue(10, 12, 8),
    paddingHorizontal: responsiveValue(4, 6, 3),
  },
  roleIconContainer: {
    marginRight: responsiveValue(4, 6, 3),
    backgroundColor: "rgba(179, 0, 0, 0.1)",
    padding: responsiveValue(4, 5, 3),
    borderRadius: responsiveValue(4, 5, 3),
  },
  roleIconActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  roleText: {
    fontSize: responsiveFontSize(11),
    fontWeight: "600",
    color: "#b30000",
  },
  roleTextActive: {
    color: "#fff",
  },

  // Input Section
  inputSection: {
    marginBottom: responsiveHeight(2),
  },
  inputGroup: {
    marginBottom: responsiveHeight(1.8),
  },
  inputLabel: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
    color: "#444",
    marginBottom: responsiveHeight(0.8),
    marginLeft: responsiveValue(1, 2, 1),
  },
  inputWrapper: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: responsiveValue(8, 10, 6),
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "#e9ecef",
    paddingVertical: responsiveValue(10, 12, 8),
    paddingHorizontal: responsiveValue(12, 14, 10),
    transition: "all 0.2s ease",
  },
  inputContainerActive: {
    borderColor: "#b30000",
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: responsiveValue(8, 10, 6),
  },
  input: {
    flex: 1,
    color: "#2d2d2d",
    fontSize: responsiveFontSize(13),
    fontWeight: "500",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: responsiveValue(3, 4, 2),
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: responsiveHeight(0.5),
  },
  forgotPasswordText: {
    fontSize: responsiveFontSize(11),
    color: "#b30000",
    fontWeight: "600",
  },

  // Button Section
  buttonSection: {
    gap: responsiveHeight(1.2),
  },
  primaryButton: {
    borderRadius: responsiveValue(10, 12, 8),
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: "relative",
  },
  primaryButtonGradient: {
    paddingVertical: responsiveValue(12, 14, 10),
    paddingHorizontal: responsiveValue(16, 18, 14),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveValue(4, 6, 3),
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(14),
    fontWeight: "700",
  },
  buttonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: responsiveHeight(0.5),
  },
  dividerLine: {
    flex: 1,
    height: responsiveValue(0.8, 1, 0.6),
    backgroundColor: "#e9ecef",
  },
  dividerTextContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: responsiveValue(12, 14, 10),
  },
  dividerText: {
    color: "#999",
    fontSize: responsiveFontSize(10),
    fontWeight: "500",
  },

  // Google Button
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: responsiveValue(10, 12, 8),
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "#e9ecef",
    paddingVertical: responsiveValue(10, 12, 8),
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveValue(6, 8, 5),
  },
  googleIconContainer: {
    backgroundColor: "#f8f9fa",
    padding: responsiveValue(4, 5, 3),
    borderRadius: responsiveValue(4, 5, 3),
  },
  googleButtonText: {
    color: "#444",
    fontSize: responsiveFontSize(13),
    fontWeight: "600",
  },
  googleButtonBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(179, 0, 0, 0.1)",
  },

  // Signup Section
  signupSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveHeight(2),
    gap: responsiveValue(4, 6, 3),
  },
  signupText: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    fontWeight: "500",
  },
  signupLink: {
    fontSize: responsiveFontSize(12),
    color: "#b30000",
    fontWeight: "700",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(3),
  },
  termsText: {
    textAlign: "center",
    fontSize: responsiveFontSize(10),
    color: "#999",
    lineHeight: responsiveFontSize(14),
    maxWidth: Math.min(responsiveWidth(90), 350),
  },
  termsLink: {
    fontWeight: "600",
    color: "#b30000",
  },
});
