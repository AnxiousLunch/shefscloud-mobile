import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store/user";
import {
  handleShowProfile,
  handleUpdateProfile,
} from "../auth_endpoints/AuthEndpoints";
import { useRouter } from "expo-router";

const UserProfileScreen = () => {
  const router = useRouter();  
  const dispatch = useDispatch();
  const { authToken } = useSelector((state) => state.user);

  const [isPending, setIsPending] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);

  const [profileData, setProfileData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_pic: null, // will hold { uri, type, fileName }
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await handleShowProfile(authToken);
        console.log("response", response)
        if (response) {
          dispatch(updateUser(response));
          setProfileData({
            ...response,
            profile_pic: response.profile_pic
              ? { uri: response.profile_pic, type: "image/jpeg", fileName: "profile.jpg" }
              : null,
          });
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load profile.");
      }
    })();
  }, [authToken, dispatch, shouldReload]);

  console.log("profiledata", profileData)

  // Pick image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera roll permissions needed");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setProfileData({
          ...profileData,
          profile_pic: {
            uri: asset.uri,
            type: asset.type || "image/jpeg",
            fileName: asset.fileName || `profile_${Date.now()}.jpg`,
          }
        });
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Submit update
  const handleSubmit = async () => {
    try {
      setIsPending(true);

      const formData = new FormData();
      formData.append("id", String(profileData.id));
      formData.append("first_name", String(profileData.first_name));
      formData.append("last_name", String(profileData.last_name));
      formData.append("email", String(profileData.email));
      formData.append("phone", String(profileData.phone));

      // ✅ Only append if user picked a NEW image
      if (profileData.profile_pic?.uri) {
        const uriParts = profileData.profile_pic.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("profile_pic", {
          uri: profileData.profile_pic.uri,
          name: `profile_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }


      // Debug
      formData._parts.forEach(([key, value]) => console.log(key, value));

      const response = await handleUpdateProfile(authToken, formData);
      dispatch(updateUser(response.data));
      setProfileData({
        ...response,
        profile_pic: response.profile_pic
          ? { uri: response.profile_pic, type: "image/jpeg", fileName: "profile.jpg" }
          : null,
      });

      setShouldReload((prev) => !prev);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.log("Error", error.message || "Something went wrong");
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <LinearGradient
        colors={["#bc0000", "#dc2626"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </LinearGradient>

      {/* Body */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Picture */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
            {profileData.profile_pic?.uri ? (
              <Image
                source={{ uri: profileData.profile_pic.uri }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={{ color: "#777" }}>Tap to add Profile</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadText}>Upload Your Profile</Text>
        </View>

        {/* Form */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            First Name <Text style={{ color: "#dc2626" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={profileData.first_name}
            onChangeText={(text) =>
              setProfileData({ ...profileData, first_name: text })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            value={profileData.last_name}
            onChangeText={(text) =>
              setProfileData({ ...profileData, last_name: text })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Email <Text style={{ color: "#dc2626" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#f3f3f3" }]}
            placeholder="Enter Email"
            value={profileData.email}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Mobile Number <Text style={{ color: "#dc2626" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="+92xxxxxxxxxx"
            keyboardType="phone-pad"
            value={profileData.phone}
            onChangeText={(text) =>
              setProfileData({ ...profileData, phone: text })
            }
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, isPending && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  header: {
  height: 120,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  paddingHorizontal: 16,
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "center",

  justifyContent: "center", 
},
backButton: {
  backgroundColor: "#fff",
  borderRadius: 24,
  padding: 6,
  position: "absolute", // place it absolutely
  left: 16,             // stick to the left           // adjust vertical position
},
headerTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#fff",
  textAlign: "center",
},
  container: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  imageBox: {
    width: 170,
    height: 190,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadText: {
    marginTop: 8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
