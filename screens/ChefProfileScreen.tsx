"use client"
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import {
  handleGetStats,
  handleUpdateChefProfile,
} from "../services/shef";

export default function ChefProfileScreen() {
  
  const { user, logout, updateUser } = useAuth();
  const [stats, setStats] = useState({
    earning: 0,
    dishes_sold: 0,
    success_review: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    profile_pic: "",
    cover_pic: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (user?.access_token && user?.id) {
      setProfileData({
        id: user.id || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profile_pic: user.profile_pic || "",
        cover_pic: user.cover_pic || "",
        address: user.chef_addresses?.[0]?.address || "",
        latitude: user.chef_addresses?.[0]?.latitude || null,
        longitude: user.chef_addresses?.[0]?.longitude || null,
      });

      fetchStats(user.access_token, user.id);
    }
  }, [user]);

  const fetchStats = async (token: string, chefId: number) => {
    try {
      const res = await handleGetStats(token, chefId);
      if (res?.data) {
        setStats(res.data);
      } else {
        console.warn("Unexpected stats response:", res);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      Alert.alert("Error", "Failed to load statistics");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleImagePick = async (type: "profile" | "cover") => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photos to upload images"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [3, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setProfileData((prev) => ({
        ...prev,
        [type === "profile" ? "profile_pic" : "cover_pic"]: uri,
      }));
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await handleUpdateChefProfile(user.access_token, profileData);
      if (res?.data) {
        updateUser(res.data);
        Alert.alert("Success", "Profile updated successfully");
        setIsEditing(false);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Header */}
      <LinearGradient
        colors={['#DC2626', '#B91C1C']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Chef Profile</Text>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isEditing ? styles.saveButton : styles.editButton
          ]}
          onPress={() => (isEditing ? handleSubmit() : setIsEditing(true))}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons 
                name={isEditing ? "checkmark" : "create"} 
                size={16} 
                color="white" 
                style={styles.buttonIcon}
              />
              <Text style={styles.actionButtonText}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Photo Section */}
        <View style={styles.coverSection}>
          <TouchableOpacity
            onPress={() => isEditing && handleImagePick("cover")}
            disabled={!isEditing}
            style={styles.coverContainer}
          >
            {profileData.cover_pic ? (
              <Image
                source={{ uri: profileData.cover_pic }}
                style={styles.coverImage}
              />
            ) : (
              <LinearGradient
                colors={['#FCA5A5', '#DC2626']}
                style={styles.coverPlaceholder}
              >
                <Ionicons name="camera" size={32} color="white" />
                <Text style={styles.coverPlaceholderText}>
                  Add Cover Photo
                </Text>
              </LinearGradient>
            )}
            {isEditing && (
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Picture */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={() => isEditing && handleImagePick("profile")}
              disabled={!isEditing}
              style={styles.avatarContainer}
            >
              <View style={styles.avatar}>
                {profileData.profile_pic ? (
                  <Image
                    source={{ uri: profileData.profile_pic }}
                    style={styles.profileImage}
                  />
                ) : (
                  <LinearGradient
                    colors={['#FCA5A5', '#DC2626']}
                    style={styles.avatarPlaceholder}
                  >
                    <Ionicons name="person" size={40} color="white" />
                  </LinearGradient>
                )}
                {isEditing && (
                  <View style={styles.profileEditBadge}>
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Chef Info */}
            <View style={styles.chefInfo}>
              <Text style={styles.chefName}>
                Chef {profileData.first_name} {profileData.last_name}
              </Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={16} color="#6B7280" />
                  <Text style={styles.contactText}>{profileData.email}</Text>
                </View>
                {profileData.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={16} color="#6B7280" />
                    <Text style={styles.contactText}>{profileData.phone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              style={styles.statGradient}
            >
              <MaterialIcons name="attach-money" size={24} color="white" />
              <Text style={styles.statValue}>{stats.earning}</Text>
              <Text style={styles.statLabel}>Total Earning</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.statGradient}
            >
              <MaterialIcons name="restaurant" size={24} color="white" />
              <Text style={styles.statValue}>{stats.dishes_sold}</Text>
              <Text style={styles.statLabel}>Dishes Sold</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              style={styles.statGradient}
            >
              <MaterialIcons name="star" size={24} color="white" />
              <Text style={styles.statValue}>{stats.success_review}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={24} color="#DC2626" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={[styles.inputContainer, isEditing && styles.editableInput]}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.first_name}
                  onChangeText={(text) => handleInputChange("first_name", text)}
                  editable={isEditing}
                  placeholder="Enter first name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={[styles.inputContainer, isEditing && styles.editableInput]}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.last_name}
                  onChangeText={(text) => handleInputChange("last_name", text)}
                  editable={isEditing}
                  placeholder="Enter last name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledInputText]}
                value={profileData.email}
                editable={false}
              />
              <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.inputContainer, isEditing && styles.editableInput]}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profileData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
                editable={isEditing}
                placeholder="03XXXXXXXXX"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={[styles.inputContainer, isEditing && styles.editableInput]}>
              <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profileData.address}
                onChangeText={(text) => handleInputChange("address", text)}
                editable={isEditing}
                placeholder="Enter your address"
                placeholderTextColor="#9CA3AF"
                multiline
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Chef Bio</Text>
            <View style={[styles.inputContainer, styles.bioContainer, isEditing && styles.editableInput]}>
              <Ionicons name="document-text-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={profileData.bio}
                onChangeText={(text) => handleInputChange("bio", text)}
                editable={isEditing}
                multiline
                numberOfLines={4}
                placeholder="Tell us about your culinary journey..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="settings" size={24} color="#DC2626" />
            <Text style={styles.cardTitle}>Account Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={24} color="#DC2626" />
              <View style={styles.logoutTextContainer}>
                <Text style={styles.logoutTitle}>Sign Out</Text>
                <Text style={styles.logoutSubtitle}>Sign out from your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#DC2626" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  saveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
  },
  coverSection: {
    position: "relative",
  },
  coverContainer: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  editOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginTop: -50,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  chefInfo: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  chefName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  contactInfo: {
    alignItems: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  statGradient: {
    padding: 20,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 12,
  },
  formGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editableInput: {
    borderColor: "#DC2626",
    backgroundColor: "white",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  disabledInputText: {
    color: "#9CA3AF",
  },
  bioContainer: {
    alignItems: "flex-start",
    paddingTop: 16,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actionsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  logoutSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  bottomPadding: {
    height: 24,
  },
});