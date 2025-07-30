import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

const foodItems = [
  {
    id: "pasta",
    name: "Truffle Pasta Carbonara",
    chef: "Chef Marco Rossi",
    price: 24.99,
    rating: 4.9,
    reviews: 124,
    icon: "🍝",
    badge: "Popular",
  },
  {
    id: "pizza",
    name: "Authentic Margherita",
    chef: "Chef Luigi Bianchi",
    price: 22.5,
    rating: 4.8,
    reviews: 89,
    icon: "🍕",
    badge: "Chef's Choice",
  },
  {
    id: "risotto",
    name: "Wild Mushroom Risotto",
    chef: "Chef Sofia Romano",
    price: 19.75,
    rating: 4.7,
    reviews: 67,
    icon: "🍚",
  },
  {
    id: "lasagna",
    name: "Homestyle Lasagna",
    chef: "Chef Antonio Verde",
    price: 26.99,
    rating: 4.6,
    reviews: 156,
    icon: "🥘",
  },
]

export default function FoodListScreen() {
  const router = useRouter()

  const handleFoodPress = (foodId: string) => {
    router.push("/(customer)/food-detail")
  }

  const handleBackPress = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Italian Cuisine</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.foodGrid}>
          {foodItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.foodCard} onPress={() => handleFoodPress(item.id)}>
              <View style={styles.foodImage}>
                <Text style={styles.foodIcon}>{item.icon}</Text>
                {item.badge && (
                  <View style={styles.foodBadge}>
                    <Text style={styles.foodBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodChef}>by {item.chef}</Text>
                <View style={styles.foodRating}>
                  <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                  <Text style={styles.ratingText}>
                    ({item.rating}) • {item.reviews} reviews
                  </Text>
                </View>
                <Text style={styles.foodPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingVertical: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 25,
    gap: 20,
  },
  foodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    width: (width - 70) / 2,
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
  foodImage: {
    height: 140,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  foodIcon: {
    fontSize: 48,
    color: "#ffffff",
  },
  foodBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  foodInfo: {
    padding: 18,
  },
  foodName: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#1f2937",
    fontSize: 16,
  },
  foodChef: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  foodRating: {
    marginBottom: 10,
  },
  stars: {
    color: "#fbbf24",
    fontSize: 14,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  foodPrice: {
    fontWeight: "800",
    color: "#dc2626",
    fontSize: 18,
  },
})
