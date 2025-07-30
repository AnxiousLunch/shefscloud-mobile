"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

const categories = [
  { id: "italian", name: "Italian", icon: "🍝", count: "24 dishes available" },
  { id: "asian", name: "Asian", icon: "🍜", count: "31 dishes available" },
  { id: "mexican", name: "Mexican", icon: "🌮", count: "18 dishes available" },
  { id: "indian", name: "Indian", icon: "🍛", count: "27 dishes available" },
]

export default function CustomerHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()

  const handleCategoryPress = (categoryId: string) => {
    router.push("/(customer)/browse")
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.header}>
          <Text style={styles.greeting}>Good Evening, {user?.name?.split(" ")[0]}!</Text>
          <Text style={styles.location}>📍 Manhattan, New York</Text>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cuisines, chefs, or dishes..."
              placeholderTextColor="#6b7280"
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Cuisines</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryIconText}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
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
                <Text style={styles.chefAvatarText}>👨‍🍳</Text>
              </View>
              <View style={styles.chefInfo}>
                <Text style={styles.chefName}>Chef Marco Rossi</Text>
                <View style={styles.chefBadge}>
                  <Text style={styles.chefBadgeText}>✓ Verified Chef</Text>
                </View>
                <View style={styles.chefStats}>
                  <Text style={styles.stat}>⭐ 4.9</Text>
                  <Text style={styles.stat}>🍽️ 1.2k orders</Text>
                  <Text style={styles.stat}>📍 Italian Cuisine</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Special */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Special</Text>
          </View>
          <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.featuredCard}>
            <Text style={styles.featuredTitle}>Chef's Signature Menu</Text>
            <Text style={styles.featuredSubtitle}>
              Handcrafted dishes from our top-rated chefs, prepared with premium ingredients
            </Text>
            <TouchableOpacity style={styles.featuredButton} onPress={() => handleCategoryPress("featured")}>
              <Text style={styles.featuredButtonText}>Explore Specials</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 45,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  location: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
  },
  searchSection: {
    paddingHorizontal: 25,
    marginTop: -25,
    marginBottom: 25,
  },
  searchContainer: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  searchInput: {
    paddingVertical: 18,
    paddingLeft: 25,
    paddingRight: 55,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  searchIcon: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -10 }],
    fontSize: 20,
  },
  section: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
  },
  seeAll: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    width: (width - 68) / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  categoryIconText: {
    fontSize: 32,
    color: "#ffffff",
  },
  categoryName: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: 16,
    marginBottom: 5,
  },
  categoryCount: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
  },
  chefCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  chefHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  chefAvatar: {
    width: 60,
    height: 60,
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
    fontSize: 16,
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
  },
  stat: {
    fontSize: 13,
    color: "#6b7280",
  },
  featuredCard: {
    borderRadius: 25,
    padding: 30,
    position: "relative",
    overflow: "hidden",
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
  },
  featuredSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 25,
    lineHeight: 22,
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
})
