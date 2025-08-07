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
                      onPress={() => setSelectedRole(role as "customer" | "chef")}
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
                            size={isTablet ? 20 : 18}
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
                      <Ionicons name="mail" size={20} color="#b30000" style={styles.inputIcon} />
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
                      <Ionicons name="lock-closed" size={20} color="#b30000" style={styles.inputIcon} />
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
                          size={20}
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
                          <Ionicons name="arrow-forward" size={18} color="#fff" />
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
                      <Ionicons name="logo-google" size={20} color="#4285f4" />
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
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 20,
    elevation: 8,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
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
    width: 80,
    height: 80,
    backgroundColor: "rgba(179, 0, 0, 0.05)",
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(179, 0, 0, 0.1)",
  },
  decorativeElement2: {
    position: "absolute",
    top: responsiveHeight(25),
    left: responsiveWidth(5),
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 68, 68, 0.08)",
    borderRadius: 30,
    transform: [{ rotate: '45deg' }],
  },
  decorativeElement3: {
    position: "absolute",
    top: responsiveHeight(45),
    right: responsiveWidth(8),
    width: 40,
    height: 40,
    backgroundColor: "rgba(179, 0, 0, 0.06)",
    borderRadius: 20,
  },
  decorativeElement4: {
    position: "absolute",
    top: responsiveHeight(35),
    left: responsiveWidth(12),
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 68, 68, 0.03)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(179, 0, 0, 0.08)",
  },

  // Header
  authHeader: {
    alignItems: "center",
    marginTop: Math.max(responsiveHeight(6), 40),
    marginBottom: isTablet ? 40 : 32,
    paddingHorizontal: responsiveWidth(5),
  },
  logoContainer: {
    position: "relative",
    marginBottom: isTablet ? 20 : 16,
  },
  logoGradient: {
    width: isTablet ? 85 : isSmallPhone ? 70 : 75,
    height: isTablet ? 85 : isSmallPhone ? 70 : 75,
    borderRadius: isTablet ? 20 : 16,
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
    borderRadius: isTablet ? 16 : 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoShine: {
    position: "absolute",
    top: 8,
    left: 8,
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
    borderRadius: isTablet ? 20 : 16,
    zIndex: -1,
  },
  logoText: {
    fontSize: responsiveFontSize(28),
    fontWeight: "900",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: responsiveFontSize(30),
    fontWeight: "800",
    color: "#2d2d2d",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleAccent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  titleDot: {
    width: 6,
    height: 6,
    backgroundColor: "#b30000",
    borderRadius: 3,
  },
  titleLine: {
    width: 40,
    height: 2,
    backgroundColor: "#b30000",
    marginHorizontal: 8,
  },
  subtitle: {
    fontSize: responsiveFontSize(14),
    color: "#666",
    textAlign: "center",
    lineHeight: responsiveFontSize(20),
    maxWidth: isTablet ? 400 : 280,
    fontWeight: "400",
  },

  // Form Card
  formCard: {
    width: "100%",
    maxWidth: isTablet ? 480 : 380,
    backgroundColor: "#ffffff",
    padding: isTablet ? 28 : 22,
    borderRadius: isTablet ? 20 : 16,
    marginBottom: 24,
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(179, 0, 0, 0.08)",
  },
  cardShadow: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: "rgba(179, 0, 0, 0.03)",
    borderRadius: isTablet ? 21 : 17,
    zIndex: -1,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: isTablet ? 28 : 24,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: responsiveFontSize(22),
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: responsiveFontSize(14),
    color: "#666",
    textAlign: "center",
  },

  // Role Selector
  roleSelectorContainer: {
    marginBottom: isTablet ? 24 : 20,
  },
  sectionLabel: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
    textAlign: "center",
  },
  roleSelector: {
    position: "relative",
    flexDirection: "row",
    borderRadius: isTablet ? 14 : 12,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    padding: 4,
  },
  roleSelectorBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f1f3f4",
    borderRadius: isTablet ? 14 : 12,
  },
  roleButton: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderRadius: isTablet ? 12 : 10,
  },
  roleActiveBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: isTablet ? 12 : 10,
  },
  roleContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: 8,
  },
  roleIconContainer: {
    marginRight: isTablet ? 8 : 6,
    backgroundColor: "rgba(179, 0, 0, 0.1)",
    padding: isTablet ? 6 : 5,
    borderRadius: isTablet ? 6 : 5,
  },
  roleIconActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  roleText: {
    fontSize: responsiveFontSize(13),
    fontWeight: "600",
    color: "#b30000",
  },
  roleTextActive: {
    color: "#fff",
  },

  // Input Section
  inputSection: {
    marginBottom: isTablet ? 24 : 20,
  },
  inputGroup: {
    marginBottom: isTablet ? 18 : 16,
  },
  inputLabel: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: isTablet ? 12 : 10,
    borderWidth: 1.5,
    borderColor: "#e9ecef",
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: isTablet ? 16 : 14,
    transition: "all 0.2s ease",
  },
  inputContainerActive: {
    borderColor: "#b30000",
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: isTablet ? 12 : 10,
  },
  input: {
    flex: 1,
    color: "#2d2d2d",
    fontSize: responsiveFontSize(15),
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: responsiveFontSize(13),
    color: "#b30000",
    fontWeight: "600",
  },

  // Button Section
  buttonSection: {
    gap: isTablet ? 16 : 14,
  },
  primaryButton: {
    borderRadius: isTablet ? 14 : 12,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: "relative",
  },
  primaryButtonGradient: {
    paddingVertical: isTablet ? 16 : 14,
    paddingHorizontal: isTablet ? 20 : 18,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isTablet ? 8 : 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(16),
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
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e9ecef",
  },
  dividerTextContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  dividerText: {
    color: "#999",
    fontSize: responsiveFontSize(12),
    fontWeight: "500",
  },

  // Google Button
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: isTablet ? 14 : 12,
    borderWidth: 1.5,
    borderColor: "#e9ecef",
    paddingVertical: isTablet ? 14 : 12,
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
    gap: isTablet ? 10 : 8,
  },
  googleIconContainer: {
    backgroundColor: "#f8f9fa",
    padding: 6,
    borderRadius: 6,
  },
  googleButtonText: {
    color: "#444",
    fontSize: responsiveFontSize(15),
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
    marginBottom: 20,
    gap: 6,
  },
  signupText: {
    fontSize: responsiveFontSize(14),
    color: "#666",
    fontWeight: "500",
  },
  signupLink: {
    fontSize: responsiveFontSize(14),
    color: "#b30000",
    fontWeight: "700",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
    marginBottom: isTablet ? 30 : 24,
  },
  termsText: {
    textAlign: "center",
    fontSize: responsiveFontSize(11),
    color: "#999",
    lineHeight: responsiveFontSize(16),
    maxWidth: isTablet ? 350 : 280,
  },
  termsLink: {
    fontWeight: "600",
    color: "#b30000",
  },
});