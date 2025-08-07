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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chef Profile</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSubmit() : setIsEditing(true))}
        >
          <Text style={styles.editButton}>
            {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <TouchableOpacity
          onPress={() => isEditing && handleImagePick("cover")}
          disabled={!isEditing}
        >
          <View style={styles.coverContainer}>
            {profileData.cover_pic ? (
              <Image
                source={{ uri: profileData.cover_pic }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.placeholderText}>
                  Tap to add cover photo
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={() => isEditing && handleImagePick("profile")}
            disabled={!isEditing}
          >
            <View style={styles.avatar}>
              {profileData.profile_pic ? (
                <Image
                  source={{ uri: profileData.profile_pic }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.avatarText}>👨‍🍳</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.chefName}>
            {profileData.first_name} {profileData.last_name}
          </Text>
          <Text style={styles.chefEmail}>{profileData.email}</Text>
          <Text style={styles.chefPhone}>{profileData.phone}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.earning}</Text>
              <Text style={styles.statLabel}>Earning</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.dishes_sold}</Text>
              <Text style={styles.statLabel}>Dishes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.success_review}%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Profile Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.first_name}
              onChangeText={(text) => handleInputChange("first_name", text)}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.last_name}
              onChangeText={(text) => handleInputChange("last_name", text)}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profileData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              keyboardType="phone-pad"
              editable={isEditing}
              placeholder="03XXXXXXXXX"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={profileData.address}
              onChangeText={(text) => handleInputChange("address", text)}
              editable={isEditing}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={profileData.bio}
              onChangeText={(text) => handleInputChange("bio", text)}
              editable={isEditing}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  editButton: {
    fontSize: 16,
    color: "#dc3545",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  coverContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 80,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6c757d",
    fontSize: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: -70,
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 60,
  },
  chefName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    color: "#212529",
  },
  chefEmail: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  chefPhone: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
  },
  statLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#212529",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#495057",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212529",
  },
  disabledInput: {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#f8d7da",
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#721c24",
  },
});