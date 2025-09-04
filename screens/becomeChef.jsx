// expo code:
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { signOutUser } from "../store/user";
import { handleChefSignUp } from "../auth_endpoints/AuthEndpoints";
import { TextInputMask } from 'react-native-masked-text';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get("window");

// Responsive helper functions (matching SignUpScreen)
const isTablet = width >= 768;
const isSmallPhone = width < 375;
const responsiveValue = (phoneValue, tabletValue, smallPhoneValue) => {
  if (isTablet) return tabletValue;
  if (isSmallPhone && smallPhoneValue !== undefined) return smallPhoneValue;
  return phoneValue;
};
const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (size) => {
  const baseSize = responsiveValue(size, size * 1.2, size * 0.85);
  return Math.min(baseSize, size * 1.5);
};

const BecomeAChefScreen = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    profile_pic: null,
    cover_pic: null,
    is_chef: 1,
    longitude: "",
    latitude: "",
  });

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [acknowledge, setAcknowledge] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { authToken } = useSelector((state) => state.user);

  // Get location
  const getGeolocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError("Location access is required to register as a chef.");
      setIsModalOpen(true);
      return;
    }
    try {
      let loc = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        latitude: String(loc.coords.latitude),
        longitude: String(loc.coords.longitude),
      }));
    } catch (error) {
      setLocationError("Unable to get location. Please try again.");
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    getGeolocation();
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear previous errors when user starts typing
    if (error && !value.includes(" ")) setError("");
    if (emailError) setEmailError("");
    
    // Validations
    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setEmailError(emailRegex.test(value) ? "" : "Please enter a valid email address.");
    }

    if (name === "password") {
      // Check for spaces in password
      if (value.includes(" ")) {
        setError("Password should not contain spaces");
        return;
      }
      // Check password length
      if (value.length > 0 && value.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      setError("");
    }

    if (name === "phone") {
      const phoneRegex = /^03\d{9}$/;
      setError(phoneRegex.test(value) ? "" : "Phone number must be in the format 03XXXXXXXXX");
    }

    // Handle name fields
    if (name === "first_name" || name === "last_name") {
      // Check for spaces
      if (value.includes(" ")) {
        setError(`${name.replace('_', ' ')} should not contain spaces`);
        return;
      }
      // Check for special characters using regex (only allow letters and hyphens)
      if (!/^[a-zA-Z-]+$/.test(value)) {
        setError(`${name.replace('_', ' ')} should only contain letters`);
        return;
      }
      setError("");
    }
  };

  const pickImage = async (field) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: field === 'profile_pic' ? [1, 1] : [16, 9],
      });

      if (!result.canceled) {
        setFormData((prev) => ({ ...prev, [field]: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Convert URI to file object for upload
  const uriToFile = async (uri, fileName) => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    return {
      uri,
      name: fileName,
      type: 'image/jpeg',
    };
  };

  const onSubmit = async () => {
    // Validation checks
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (error || emailError) {
      Alert.alert("Error", error || emailError);
      return;
    }

    if (!formData.longitude || !formData.latitude) {
      Alert.alert("Error", "Location is required to register as a chef");
      return;
    }

    if (!formData.profile_pic) {
      Alert.alert("Error", "Profile picture is required");
      return;
    }

    if (!formData.cover_pic) {
      Alert.alert("Error", "Cover picture is required");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert("Error", "You must agree to the Terms of Service");
      return;
    }

    if (!acknowledge) {
      Alert.alert("Error", "You must acknowledge that you are an independent business");
      return;
    }

    try {
      setIsLoadingForm(true);
      
      // Convert image URIs to file objects
      const profilePicFile = await uriToFile(formData.profile_pic, 'profile.jpg');
      const coverPicFile = await uriToFile(formData.cover_pic, 'cover.jpg');
      
      // Create form data with files
      const submitData = new FormData();
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('phone', formData.phone);
      submitData.append('is_chef', formData.is_chef);
      submitData.append('longitude', formData.longitude);
      submitData.append('latitude', formData.latitude);
      submitData.append('profile_pic', profilePicFile);
      submitData.append('cover_pic', coverPicFile);
      
      const res = await handleChefSignUp(submitData);
      
      if (authToken) {
        dispatch(signOutUser());
      }
      
      Alert.alert("Success", res.message || "Chef registration successful!");

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        profile_pic: null,
        cover_pic: null,
        is_chef: 1,
        longitude: "",
        latitude: "",
      });
      setAgreeToTerms(false);
      setAcknowledge(false);

      // Navigate back to auth screen
      router.replace('/(auth)');
    } catch (err) {
      Alert.alert("Error", err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoadingForm(false);
    }
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
              <View style={styles.chefIconContainer}>
                <LinearGradient
                  colors={["#b30000", "#d42c2c", "#ff4444"]}
                  style={styles.chefIconGradient}
                >
                  <Ionicons name="restaurant" size={responsiveValue(32, 40, 28)} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Become a Chef</Text>
              <Text style={styles.subtitle}>
                Share your culinary passion and connect with food lovers in your community
              </Text>
            </View>

            {/* Main Form Card */}
            <View style={styles.formCard}>
              <View style={styles.cardShadow} />
              
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Join Our Chef Community!</Text>
                <Text style={styles.welcomeSubtitle}>Fill in your details to start your culinary journey</Text>
              </View>

              {/* Image Upload Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Photos</Text>
                
                {/* Profile Picture */}
                <View style={styles.imageGroup}>
                  <Text style={styles.inputLabel}>Profile Picture *</Text>
                  <TouchableOpacity 
                    style={[styles.imageUploadContainer, styles.profileImageContainer]} 
                    onPress={() => pickImage("profile_pic")}
                    activeOpacity={0.8}
                  >
                    {formData.profile_pic ? (
                      <Image source={{ uri: formData.profile_pic }} style={styles.profileImage} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="person-add" size={responsiveValue(32, 40, 28)} color="#b30000" />
                        <Text style={styles.imagePlaceholderText}>Add Profile Photo</Text>
                        <Text style={styles.imagePlaceholderSubtext}>Tap to upload</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Cover Picture */}
                <View style={styles.imageGroup}>
                  <Text style={styles.inputLabel}>Cover Picture *</Text>
                  <TouchableOpacity 
                    style={[styles.imageUploadContainer, styles.coverImageContainer]} 
                    onPress={() => pickImage("cover_pic")}
                    activeOpacity={0.8}
                  >
                    {formData.cover_pic ? (
                      <Image source={{ uri: formData.cover_pic }} style={styles.coverImage} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image" size={responsiveValue(32, 40, 28)} color="#b30000" />
                        <Text style={styles.imagePlaceholderText}>Add Cover Photo</Text>
                        <Text style={styles.imagePlaceholderSubtext}>Show your culinary space</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Input Fields Section */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                {/* First Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <View style={[styles.inputContainer, formData.first_name && styles.inputContainerActive]}>
                    <Ionicons name="person" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your first name"
                      placeholderTextColor="#999"
                      value={formData.first_name}
                      onChangeText={(text) => handleChange("first_name", text)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Last Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <View style={[styles.inputContainer, formData.last_name && styles.inputContainerActive]}>
                    <Ionicons name="person" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your last name"
                      placeholderTextColor="#999"
                      value={formData.last_name}
                      onChangeText={(text) => handleChange("last_name", text)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <View style={[styles.inputContainer, formData.email && styles.inputContainerActive]}>
                    <Ionicons name="mail" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      value={formData.email}
                      onChangeText={(text) => handleChange("email", text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <View style={[styles.inputContainer, formData.phone && styles.inputContainerActive]}>
                    <Ionicons name="call" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                    <TextInputMask
                      type={'custom'}
                      options={{ mask: '03999999999' }}
                      style={styles.input}
                      placeholder="03XXXXXXXXX"
                      placeholderTextColor="#999"
                      value={formData.phone}
                      onChangeText={(text) => handleChange("phone", text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <View style={[styles.inputContainer, formData.password && styles.inputContainerActive]}>
                    <Ionicons name="lock-closed" size={responsiveValue(18, 20, 16)} color="#b30000" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a secure password"
                      placeholderTextColor="#999"
                      value={formData.password}
                      onChangeText={(text) => handleChange("password", text)}
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
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
              </View>

              {/* Checkboxes */}
              <View style={styles.checkboxSection}>
                <View style={styles.checkboxGroup}>
                  <CheckBox
                    value={agreeToTerms}
                    onValueChange={setAgreeToTerms}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxText}>
                    I agree to Shef's Terms of Service, and to receive marketing text messages.
                  </Text>
                </View>
                
                <View style={styles.checkboxGroup}>
                  <CheckBox
                    value={acknowledge}
                    onValueChange={setAcknowledge}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxText}>
                    I acknowledge and agree that I am an independent business and authorized to earn income.
                  </Text>
                </View>
              </View>

              {/* Location Status */}
              <View style={styles.locationSection}>
                <View style={styles.locationStatus}>
                  <Ionicons 
                    name={formData.latitude ? "location" : "location-outline"} 
                    size={responsiveValue(18, 20, 16)} 
                    color={formData.latitude ? "#4CAF50" : "#b30000"} 
                  />
                  <Text style={[styles.locationText, formData.latitude && styles.locationTextActive]}>
                    {formData.latitude ? "Location acquired" : "Getting location..."}
                  </Text>
                  {!formData.latitude && (
                    <TouchableOpacity onPress={getGeolocation} style={styles.refreshButton}>
                      <Ionicons name="refresh" size={responsiveValue(16, 18, 14)} color="#b30000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoadingForm && styles.buttonDisabled]}
                onPress={onSubmit}
                disabled={isLoadingForm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#b30000", "#d42c2c", "#ff4444"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  <View style={styles.buttonContent}>
                    {isLoadingForm ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.primaryButtonText}>Registering...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Become a Chef</Text>
                        <Ionicons name="restaurant" size={responsiveValue(16, 20, 14)} color="#fff" />
                      </>
                    )}
                  </View>
                </LinearGradient>
                <View style={styles.buttonHighlight} />
              </TouchableOpacity>

              {/* Back to Sign Up Link */}
              <View style={styles.backToSignupSection}>
                <Text style={styles.backToSignupText}>Want to join as a customer instead?</Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/signup')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToSignupLink}>Customer Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Location Error Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="location-outline" size={responsiveValue(32, 40, 28)} color="#b30000" />
              </View>
              <Text style={styles.modalTitle}>Location Required</Text>
            </View>
            
            <Text style={styles.modalText}>
              {locationError || "We need your location to connect you with customers in your area."}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={getGeolocation} 
                style={styles.modalPrimaryButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#b30000", "#d42c2c"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalPrimaryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setIsModalOpen(false)} 
                style={styles.modalSecondaryButton}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

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

  // Decorative Elements (matching SignUpScreen)
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
    top: responsiveHeight(55),
    right: responsiveWidth(8),
    width: responsiveValue(30, 40, 25),
    height: responsiveValue(30, 40, 25),
    backgroundColor: "rgba(179, 0, 0, 0.06)",
    borderRadius: 20,
  },
  decorativeElement4: {
    position: "absolute",
    top: responsiveHeight(65),
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Header Section
  authHeader: {
    alignItems: "center",
    marginTop: responsiveHeight(6),
    marginBottom: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
  },
  chefIconContainer: {
    marginBottom: responsiveHeight(2),
  },
  chefIconGradient: {
    width: responsiveValue(80, 100, 70),
    height: responsiveValue(80, 100, 70),
    borderRadius: responsiveValue(20, 25, 18),
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: "800",
    color: "#2d2d2d",
    marginBottom: responsiveHeight(1),
    textAlign: "center",
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
    padding: responsiveValue(20, 28, 18),
    borderRadius: responsiveValue(16, 20, 14),
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
    borderRadius: responsiveValue(17, 21, 15),
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

  // Section Titles
  sectionTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: responsiveHeight(1.5),
    marginTop: responsiveHeight(1),
  },

  // Image Section
  imageSection: {
    marginBottom: responsiveHeight(2),
  },
  imageGroup: {
    marginBottom: responsiveHeight(2),
  },
  imageUploadContainer: {
    borderRadius: responsiveValue(12, 16, 10),
    borderWidth: responsiveValue(2, 3, 2),
    borderColor: "#e9ecef",
    borderStyle: "dashed",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  profileImageContainer: {
    height: responsiveValue(120, 150, 100),
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: responsiveValue(60, 75, 50),
  },
  coverImageContainer: {
    height: responsiveValue(140, 180, 120),
    width: "100%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: responsiveValue(60, 75, 50),
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  imagePlaceholderText: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
    color: "#b30000",
    marginTop: responsiveHeight(1),
  },
  imagePlaceholderSubtext: {
    fontSize: responsiveFontSize(10),
    color: "#666",
    marginTop: responsiveHeight(0.5),
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: responsiveValue(8, 10, 6),
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "#e9ecef",
    paddingVertical: responsiveValue(12, 14, 10),
    paddingHorizontal: responsiveValue(14, 16, 12),
  },
  inputContainerActive: {
    borderColor: "#b30000",
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: responsiveValue(10, 12, 8),
  },
  input: {
    flex: 1,
    color: "#2d2d2d",
    fontSize: responsiveFontSize(13),
    fontWeight: "500",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: responsiveValue(4, 6, 3),
  },
  errorText: {
    fontSize: responsiveFontSize(10),
    color: "#dc3545",
    marginTop: responsiveHeight(0.5),
    marginLeft: responsiveValue(2, 3, 1),
  },

  // Checkbox Section
  checkboxSection: {
    marginBottom: responsiveHeight(2),
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(1),
  },
  checkbox: {
    marginRight: responsiveValue(8, 10, 6),
    marginTop: responsiveValue(2, 3, 1),
  },
  checkboxText: {
    flex: 1,
    fontSize: responsiveFontSize(11),
    color: "#666",
    lineHeight: responsiveFontSize(16),
  },

  // Location Section
  locationSection: {
    marginBottom: responsiveHeight(3),
    padding: responsiveValue(12, 16, 10),
    backgroundColor: "#f8f9fa",
    borderRadius: responsiveValue(8, 10, 6),
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "#e9ecef",
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    marginLeft: responsiveValue(8, 10, 6),
    flex: 1,
  },
  locationTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  refreshButton: {
    padding: responsiveValue(4, 6, 3),
  },

  // Primary Button
  primaryButton: {
    borderRadius: responsiveValue(12, 15, 10),
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: "relative",
    marginBottom: responsiveHeight(2),
  },
  primaryButtonGradient: {
    paddingVertical: responsiveValue(14, 18, 12),
    paddingHorizontal: responsiveValue(18, 22, 16),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveValue(6, 8, 4),
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

  // Back to Sign Up Section
  backToSignupSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveValue(4, 6, 3),
  },
  backToSignupText: {
    fontSize: responsiveFontSize(11),
    color: "#666",
    fontWeight: "500",
  },
  backToSignupLink: {
    fontSize: responsiveFontSize(11),
    color: "#b30000",
    fontWeight: "700",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: responsiveWidth(5),
  },
  modalContainer: {
    width: "100%",
    maxWidth: Math.min(responsiveWidth(85), 350),
    backgroundColor: "#fff",
    borderRadius: responsiveValue(16, 20, 14),
    padding: responsiveValue(24, 30, 20),
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: responsiveHeight(2),
  },
  modalIconContainer: {
    width: responsiveValue(60, 75, 50),
    height: responsiveValue(60, 75, 50),
    backgroundColor: "rgba(179, 0, 0, 0.1)",
    borderRadius: responsiveValue(30, 37, 25),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1.5),
  },
  modalTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "700",
    color: "#2d2d2d",
    textAlign: "center",
  },
  modalText: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    textAlign: "center",
    lineHeight: responsiveFontSize(18),
    marginBottom: responsiveHeight(3),
  },
  modalButtons: {
    gap: responsiveHeight(1),
  },
  modalPrimaryButton: {
    borderRadius: responsiveValue(10, 12, 8),
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#b30000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalButtonGradient: {
    paddingVertical: responsiveValue(12, 15, 10),
    paddingHorizontal: responsiveValue(16, 20, 14),
    alignItems: "center",
  },
  modalPrimaryButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(13),
    fontWeight: "600",
  },
  modalSecondaryButton: {
    paddingVertical: responsiveValue(10, 12, 8),
    paddingHorizontal: responsiveValue(16, 20, 14),
    backgroundColor: "#f8f9fa",
    borderRadius: responsiveValue(8, 10, 6),
    alignItems: "center",
    borderWidth: responsiveValue(1, 1.5, 1),
    borderColor: "#e9ecef",
  },
  modalSecondaryButtonText: {
    color: "#666",
    fontSize: responsiveFontSize(13),
    fontWeight: "600",
  },
});

export default BecomeAChefScreen;