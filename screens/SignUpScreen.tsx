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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "expo-router";
import { AppDispatch } from "../store/store";
import { useAppSelector } from "@/hooks/hooks";
import { loadUserFromStorage } from "@/store/user";
import { TextInputMask } from 'react-native-masked-text';
import { handleUserSignUp } from "@/auth_endpoints/AuthEndpoints";

const { width, height } = Dimensions.get("window");

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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Load user data from AsyncStorage
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Redirect if user is authenticated
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
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#b30000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#5a0000", "#8b0000", "#b30000", "#e40c0c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modernBackground}
          />

          <View style={styles.authHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <LinearGradient colors={["#b30000", "#ff0000"]} style={styles.logoGradient}>
              <Text style={styles.logoText}>SC</Text>
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Shefs Cloud to discover culinary experiences
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.glassMorphism} />

            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#530202" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#7a7979ff"
                  value={first_name}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#530202" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#7a7979ff"
                  value={last_name}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

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
            <View>
              <Ionicons name="call-outline" size={20} color="#530202" style={styles.inputIconCall}/>
              <TextInputMask
                  type={'custom'}
                  options={{
                      mask: '03999999999',
                  }}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="numeric"
                  placeholder="03XXXXXXXXX"
                  style={styles.input}
                />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#530202" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#530202" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#7a7979ff"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#b30000", "#e40c0c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.tertiaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to our{"\n"}
            <Text style={styles.termsLink}>Terms of Service</Text> &{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
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
  inputIconCall: {
    position: "absolute",
    left: 16,
    marginTop: 16,
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 15,
    zIndex: 10,
  },
});