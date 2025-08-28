"use client"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useEffect } from "react"
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ProfileDropdown from "../components/ProfileDropdown"
import { useAuth } from "../contexts/AuthContext"
import { Image } from "react-native"
import {handleGetFoodCategory, handleGetPopularChefWithDishes} from '../services/get_methods'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useDispatch, useSelector } from "react-redux"
import { loadUserFromStorage } from "@/store/user"

const { width, height } = Dimensions.get("window")

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

export default function CustomerHomeScreen() {
  const user = useSelector(state => state.user.userInfo);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [foodCategory, setFoodCategory] = useState([{id: "", name: "", image: "", created_at: "", updated_at: null, deleted_at: null}]);
  const [mostLoveChef, setMostLovedChef] = useState([]);
  const [activeChefIndex, setActiveChefIndex] = useState(0);
  const [city, setCity] = useState();
  const [search, setSearch] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

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
      const res = await dispatch(loadUserFromStorage()).unwrap();
      console.log("This is res", res);
      
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

  const handleChefNav = (direction) => {
    if (direction === "next") {
      setActiveChefIndex((prev) => (prev + 1) % mostLoveChef.length);
    } else {
      setActiveChefIndex((prev) => (prev - 1 + mostLoveChef.length) % mostLoveChef.length);
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = search.trim();
    if (trimmed) {
      router.navigate(`/search/${trimmed}`);
      setSearch(""); // optional: clear after submit
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

  const handleFoodCategoryPress = (categoryId) => {
    // navigation.navigate('foodCategoryScreen', { categoryId });
    router.navigate(`/foodCategoryScreen/${categoryId}`);
  }


  return (
<SafeAreaView style={[styles.container, { backgroundColor: "transparent" }]}>
       <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.first_name || user?.name || "User"}!
              </Text>
              <View style={styles.location}>
                <View style={styles.locationIconContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                </View>
                <Text style={styles.locationText}>
                  {city?.name}, {city?.countries?.name}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.profileAvatar} 
              onPress={handleProfilePress}
              activeOpacity={0.8}
            >
              {user?.profile_pic ? (
                <Image 
                  source={{ uri: user.profile_pic }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.profileAvatarText}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchIconContainer}>
              <TouchableOpacity onPress={handleSearchSubmit}>
                <Feather
                  name="search"
                  size={width * 0.05}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cuisines, chefs, or dishes..."
              placeholderTextColor="#9ca3af"
              numberOfLines={1}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Feather name="filter" size={width * 0.045} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Cuisine</Text>
            <TouchableOpacity onPress={() => router.push("/browse")}>
  <Text style={styles.seeAll}>See All</Text>
</TouchableOpacity>

          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {foodCategory.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { marginRight: index === foodCategory.length - 1 ? width * 0.06 : 16 }]}
                onPress={() => handleFoodCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryImageContainer}>
                  <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                  <View style={styles.categoryOverlay} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Chefs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Chefs</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/allChefs')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chefCard}>
            <View style={styles.chefHeader}>
              <View style={styles.chefAvatarContainer}>
                <Image
                  source={{ uri: chefImage }}
                  style={styles.chefAvatarImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.chefInfo}>
                <Text style={styles.chefName}>{activeChef?.first_name} {activeChef?.last_name}</Text>
                <View style={styles.chefBadge}>
                  <Feather name="check" size={12} color="#ffffff" />
                  <Text style={styles.chefBadgeText}>Verified Chef</Text>
                </View>
                <View style={styles.chefStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.stat}>4.9</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🍽</Text>
                    <Text style={styles.stat}>1.2k orders</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>📍</Text>
                    <Text style={styles.stat}>Italian Cuisine</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.chefNavButtons}>
              <TouchableOpacity 
                onPress={() => handleChefNav("previous")} 
                style={[styles.navButton, styles.prevButton]}
                activeOpacity={0.8}
              >
                <Feather name="chevron-left" size={16} color="#6b7280" />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleChefNav("next")} 
                style={[styles.navButton, styles.nextButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <Feather name="chevron-right" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Special */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Special</Text>
          </View>
          <LinearGradient 
            colors={["#7f1d1d", "#991b1b", "#dc2626"]} 
            style={styles.featuredCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featuredContent}>
              <View style={styles.featuredIcon}>
                <Feather name="star" size={24} color="#ffffff" />
              </View>
              <Text style={styles.featuredTitle}>Chef's Signature Menu</Text>
              <Text style={styles.featuredSubtitle}>
                Discover exclusive dishes crafted by our top-rated chefs. Limited time offer with premium ingredients and
                authentic flavors.
              </Text>
              <TouchableOpacity
  style={styles.featuredButton}
  activeOpacity={0.9}
  onPress={() => router.push("/browse")}
>
  <Text style={styles.featuredButtonText}>Explore Menu</Text>
  <Feather name="arrow-right" size={16} color="#ffffff" />
</TouchableOpacity>

            </View>
            <View style={styles.featuredDecoration} />
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
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.025,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: width * 0.065,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIconContainer: {
    marginRight: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    color: "#6b7280",
    fontSize: width * 0.035,
    fontWeight: "500",
  },
  profileAvatar: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  profileAvatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: width * 0.045,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: width * 0.06,
  },
  searchSection: {
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.025,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: width * 0.03,
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    color: "#1f2937",
    paddingVertical: height * 0.008,
    fontWeight: "400",
  },
  filterButton: {
    padding: 4,
  },
  section: {
    marginBottom: height * 0.03,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.06,
  },
  sectionTitle: {
    fontSize: width * 0.055,
    fontWeight: "800",
    color: "#1f2937",
    letterSpacing: -0.3,
  },
  seeAll: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: width * 0.035,
  },
  categoriesContainer: {
    paddingLeft: width * 0.06,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: width * 0.35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  categoryImageContainer: {
    position: "relative",
    width: "100%",
    height: width * 0.25,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  categoryName: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: width * 0.038,
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  chefCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: width * 0.05,
    marginHorizontal: width * 0.06,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  chefHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  chefAvatarContainer: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chefAvatarImage: {
    width: "100%",
    height: "100%",
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
    fontSize: width * 0.042,
  },
  chefBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  chefBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  chefStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  stat: {
    fontSize: width * 0.032,
    color: "#6b7280",
    fontWeight: "500",
  },
  chefNavButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  prevButton: {
    marginRight: 6,
  },
  nextButton: {
    marginLeft: 6,
  },
  navButtonText: {
    fontSize: width * 0.034,
    fontWeight: "600",
    color: "#4b5563",
    marginHorizontal: 4,
  },
  featuredCard: {
    borderRadius: 24,
    marginHorizontal: width * 0.06,
    overflow: "hidden",
    position: "relative",
  },
  featuredContent: {
    padding: width * 0.06,
    zIndex: 1,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: width * 0.058,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  featuredSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
    lineHeight: 22,
    fontSize: width * 0.035,
    fontWeight: "400",
  },
  featuredButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
  },
  featuredButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: width * 0.038,
    marginRight: 8,
  },
  featuredDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
})
