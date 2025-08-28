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
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "expo-router";
import { useAppSelector } from "@/hooks/hooks";
import { loadUserFromStorage } from "@/store/user";
import { TextInputMask } from 'react-native-masked-text';
import { handleUserSignUp } from "@/auth_endpoints/AuthEndpoints";

const { width, height } = Dimensions.get("window");

// Responsive helper functions (same as AuthScreen)
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
  return Math.min(baseSize, size * 1.5);
}

export default function SignUpScreen() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { userInfo, isLoading: reduxLoading, isInitialized } = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && userInfo) {
      router.replace('/(customer)');
    }
  }, [userInfo, isInitialized, router]);

  const handleSignUp = async () => {
    if (!first_name || !last_name || !email || !password || !confirmPassword || !phone) {
        Alert.alert("Error", "Please fill in all fields");
        return;
    }

    const nameRegex = /^[A-Za-z]{1,20}$/;
    if (!nameRegex.test(first_name)) {
        Alert.alert("Error", "First name must be letters only, no spaces, max 20 characters.");
        return;
    }

    if (!nameRegex.test(last_name)) {
        Alert.alert("Error", "Last name must be letters only, no spaces, max 20 characters.");
        return;
    }

    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(phone)) {
        Alert.alert("Error", "Phone number must be in the format 03XXXXXXXXX.");
        return;
    }

    const passwordRegex = /^\S{8,30}$/;
    if (!passwordRegex.test(password)) {
        Alert.alert("Error", "Password must be 8-30 characters long and cannot contain spaces.");
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
    }

    setIsLoading(true);
    try {
        const res = await handleUserSignUp({email, password, phone, first_name, last_name});
        Alert.alert(
          typeof res.message === "string"
            ? res.message
            : res.message.original.message || "Registered Successfully"
        );
        setFirstName("");
        setLastName("");
        setPhone("");
        setPassword("");
        router.replace('/');
    } catch (error) {
        Alert.alert("Error", "Sign up failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

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
            
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={responsiveValue(20, 24, 18)} color="#b30000" />
            </TouchableOpacity>

            {/* Header Section */}
           <View style={styles.authHeader}>
  {/* Use the same logo as login */}
  <Image 
    resizeMode="contain"
    style={styles.logo}
    source={require('../assets/shefscloud_logo_2.png')}
  />

  <Text style={styles.subtitle}>
    Create your account to discover exceptional culinary experiences
  </Text>
</View>
            {/* Main Form Card */}
            <View style={styles.formCard}>
              <View style={styles.cardShadow} />
              
              {/* Welcome Text */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Join Us!</Text>
                <Text style={styles.welcomeSubtitle}>Create your account to get started</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputSection}>
                {/* First Name Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, first_name && styles.inputContainerActive]}>
                      <Ionicons name="person" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your first name"
                        placeholderTextColor="#999"
                        value={first_name}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </View>

                {/* Last Name Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, last_name && styles.inputContainerActive]}>
                      <Ionicons name="person" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your last name"
                        placeholderTextColor="#999"
                        value={last_name}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </View>

                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, email && styles.inputContainerActive]}>
                      <Ionicons name="mail" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
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

                {/* Phone Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, phone && styles.inputContainerActive]}>
                      <Ionicons name="call" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInputMask
                        type={'custom'}
                        options={{ mask: '03999999999' }}
                        style={styles.input}
                        placeholder="03XXXXXXXXX"
                        placeholderTextColor="#999"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, password && styles.inputContainerActive]}>
                      <Ionicons name="lock-closed" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Create a password"
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

                {/* Confirm Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, confirmPassword && styles.inputContainerActive]}>
                      <Ionicons name="lock-closed" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSignUp}
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
                          <Text style={styles.primaryButtonText}>Creating Account...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>Sign Up</Text>
                          <Ionicons name="arrow-forward" size={responsiveValue(16, 20, 14)} color="#fff" />
                        </>
                      )}
                    </View>
                  </LinearGradient>
                  <View style={styles.buttonHighlight} />
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.signinSection}>
                  <Text style={styles.signinText}>Already have an account?</Text>
                  <TouchableOpacity
                    onPress={() => router.replace('/')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signinLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsLink}
                 onPress={() => router.push('/termsofservice')}
                 >Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}
                 onPress={() => router.push('/privacy')}
                >Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// Using the same styles as AuthScreen with minor adjustments
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  authHeader: {
    alignItems: "center",
    marginTop: responsiveHeight(6),
    marginBottom: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
  },
  logo: {
    width: responsiveValue(200, 250, 180),
    height: responsiveValue(80, 100, 70),
    marginBottom: responsiveHeight(2),
  },
  subtitle: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    textAlign: "center",
    lineHeight: responsiveFontSize(18),
    maxWidth: Math.min(responsiveWidth(90), 400),
    fontWeight: "400",
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

  // Back Button
  backButton: {
    position: 'absolute',
    top: responsiveHeight(2),
    left: responsiveWidth(5),
    zIndex: 10,
    padding: responsiveValue(8, 12, 6),
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // Sign In Section
  signinSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveHeight(1),
    gap: responsiveValue(4, 6, 3),
  },
  signinText: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    fontWeight: "500",
  },
  signinLink: {
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
