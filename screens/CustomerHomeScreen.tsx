"use client"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useEffect } from "react"
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ProfileDropdown from "../components/ProfileDropdown"
import { useAuth } from "../contexts/AuthContext"
import { Image } from "react-native"
import {handleGetFoodCategory, handleGetPopularChefWithDishes} from '../services/get_methods'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Feather } from "@expo/vector-icons"
import { User, City, FoodCategory } from "@/types/types"
import { useRouter } from "expo-router"

const { width, height } = Dimensions.get("window")


function isValidURL(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

export default function CustomerHomeScreen() {
  const { user } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [foodCategory, setFoodCategory] = useState<FoodCategory[]>([{id: "", name: "", image: "", created_at: "", updated_at: null, deleted_at: null}]);
  const [mostLoveChef, setMostLovedChef] = useState<User[]>([]);
  const [activeChefIndex, setActiveChefIndex] = useState(0);
  const [city, setCity] = useState<City>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const response = await handleGetFoodCategory();
        setFoodCategory(response);
      } catch (error) {
        console.error("Error while fetching food category", error);
      }
    })();
  }, []);

  useEffect(() => {
  (async () => {
    try {
      // Replace localStorage.getItem with AsyncStorage.getItem
      const cityData = await AsyncStorage.getItem("region");
      if (!cityData) return;
      
      const city = JSON.parse(cityData);
      setCity(city);
      if (!city?.id) return;
      
      const lovedChef = await handleGetPopularChefWithDishes(city.id);
      setMostLovedChef(lovedChef);
    } catch (error) {
      console.error(error);
    }
  })();
}, []);

  const handleChefNav = (direction: string) => {
    if (direction === "next") {
      setActiveChefIndex((prev) => (prev + 1) % mostLoveChef.length);
    } else {
      setActiveChefIndex((prev) => (prev - 1 + mostLoveChef.length) % mostLoveChef.length);
    }
  };

  if (mostLoveChef.length < 1) return null;

  const activeChef = mostLoveChef[activeChefIndex];
  const chefImage = activeChef?.profile_pic && isValidURL(activeChef.profile_pic)
    ? activeChef.profile_pic
    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";


  const handleProfilePress = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const handleFoodCategoryPress = (categoryId: string) => {
    // navigation.navigate('foodCategoryScreen', { categoryId });
    router.navigate(`/foodCategoryScreen/${categoryId}`);
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good Evening, {user?.name?.split(" ")[0]}!</Text>
              <View style={styles.location}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{city?.name}, {city?.countries.name}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileAvatar} onPress={handleProfilePress}>
              <Text style={styles.profileAvatarText}>{user?.name?.charAt(0) || "U"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={width * 0.05}
              color="#6b7280"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cuisines, chefs, or dishes..."
              placeholderTextColor="#6b7280"
              numberOfLines={1}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Cuisine</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {foodCategory.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleFoodCategoryPress(category.id)}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Chefs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Chefs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chefCard}>
            <View style={styles.chefHeader}>
              <View style={styles.chefAvatar}>
                <Image
                  source={{ uri: chefImage }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.chefInfo}>
                <Text style={styles.chefName}>{activeChef?.first_name} {activeChef?.last_name}</Text>
                <View style={styles.chefBadge}>
                  <Text style={styles.chefBadgeText}>✓ Verified Chef</Text>
                </View>
                <View style={styles.chefStats}>
                  <Text style={styles.stat}>⭐ 4.9</Text>
                  <Text style={styles.stat}>🍽 1.2k orders</Text>
                  <Text style={styles.stat}>📍 Italian Cuisine</Text>
                </View>
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.chefNavButtons}>
              <TouchableOpacity onPress={() => handleChefNav("previous")} style={styles.navButton}>
                <Text style={styles.navButtonText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleChefNav("next")} style={styles.navButton}>
                <Text style={styles.navButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Special */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Special</Text>
          </View>
          <LinearGradient colors={["#7f1d1d", "#991b1b", "#dc2626"]} style={styles.featuredCard}>
            <Text style={styles.featuredTitle}>Chef's Signature Menu</Text>
            <Text style={styles.featuredSubtitle}>
              Discover exclusive dishes crafted by our top-rated chefs. Limited time offer with premium ingredients and
              authentic flavors.
            </Text>
            <TouchableOpacity style={styles.featuredButton}>
              <Text style={styles.featuredButtonText}>Explore Menu</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Profile Dropdown */}
      <ProfileDropdown isVisible={showProfileDropdown} onClose={() => setShowProfileDropdown(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.03,
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: width * 0.065,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationText: {
    color: "#6b7280",
    fontSize: width * 0.035,
  },
  profileAvatar: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  searchSection: {
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.03,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#f1f5f9",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  searchIcon: {
    marginRight: width * 0.025,
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    color: "#1f2937",
    paddingVertical: 0, // Prevents vertical overflow
  },

  section: {
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.03,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.015,
  },
  sectionTitle: {
    fontSize: width * 0.055,
    fontWeight: "800",
    color: "#1f2937",
  },
  seeAll: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: width * 0.035,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: (width - width * 0.18) / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  categoryImage: {
    width: "100%",
    height: width * 0.28,
    borderRadius: 15,
    marginBottom: 15,
  },
  categoryName: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: width * 0.04,
    marginBottom: 5,
  },
  categoryCount: {
    color: "#6b7280",
    fontSize: width * 0.032,
    textAlign: "center",
  },
  chefCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: width * 0.06,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  chefHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  chefAvatar: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  chefAvatarText: {
    fontSize: 24,
    color: "#ffffff",
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
    fontSize: width * 0.04,
  },
  chefBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  chefBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  chefStats: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  stat: {
    fontSize: width * 0.033,
    color: "#6b7280",
  },
  featuredCard: {
    borderRadius: 25,
    padding: width * 0.08,
    position: "relative",
    overflow: "hidden",
  },
  featuredTitle: {
    fontSize: width * 0.06,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
  },
  featuredSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 25,
    lineHeight: 22,
    fontSize: width * 0.035,
  },
  featuredButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  featuredButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  chefNavButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#1f2937",
  },
})
