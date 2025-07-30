import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useCart } from "../contexts/CartContext"

export default function FoodDetailScreen() {
  const router = useRouter()
  const { addItem } = useCart()
  const { foodId } = useLocalSearchParams<{ foodId: string }>()

  // Mock data - in real app, fetch based on foodId
  const foodItem = {
    id: "pasta",
    name: "Truffle Pasta Carbonara",
    chef: "Chef Marco Rossi",
    price: 24.99,
    rating: 4.9,
    reviews: 124,
    icon: "🍝",
    description:
      "Authentic Italian pasta carbonara elevated with premium black truffle shavings. Made with fresh farm eggs, aged pecorino Romano, crispy pancetta, and freshly cracked black pepper. A luxurious take on the classic Roman dish.",
    ingredients: "Fresh Pasta, Farm Eggs, Pecorino Romano, Pancetta, Black Truffle, Black Pepper",
    prepTime: "25 min",
    spiceLevel: "Mild",
    serves: "2 people",
  }

  const handleAddToCart = () => {
    addItem({
      id: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      chef: foodItem.chef,
      image: foodItem.icon,
    })

    Alert.alert("Added to Cart!", `${foodItem.name} has been added to your cart.`, [{ text: "OK" }])
  }

  const handleBackPress = () => {
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dish Details</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailCard}>
          <View style={styles.foodImageLarge}>
            <Text style={styles.foodIconLarge}>{foodItem.icon}</Text>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Popular Choice</Text>
            </View>
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.foodTitle}>{foodItem.name}</Text>
            <Text style={styles.chefName}>by {foodItem.chef} ✓ Verified</Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.starsLarge}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.ratingNumber}>{foodItem.rating}</Text>
              <Text style={styles.reviewCount}>({foodItem.reviews} reviews)</Text>
            </View>

            <Text style={styles.priceText}>${foodItem.price}</Text>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{foodItem.description}</Text>
            </View>

            <View style={styles.ingredientsSection}>
              <Text style={styles.sectionTitle}>Premium Ingredients</Text>
              <Text style={styles.ingredientsText}>{foodItem.ingredients}</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoLabel}>Prep Time</Text>
                <Text style={styles.infoValue}>{foodItem.prepTime}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>🌶️</Text>
                <Text style={styles.infoLabel}>Spice Level</Text>
                <Text style={styles.infoValue}>{foodItem.spiceLevel}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>🍽️</Text>
                <Text style={styles.infoLabel}>Serves</Text>
                <Text style={styles.infoValue}>{foodItem.serves}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>Add to Cart - ${foodItem.price}</Text>
            </TouchableOpacity>
          </View>
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
    padding: 25,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 15,
  },
  foodImageLarge: {
    height: 250,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  foodIconLarge: {
    fontSize: 100,
    color: "#ffffff",
  },
  popularBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  popularBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  detailContent: {
    padding: 30,
  },
  foodTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
    color: "#1f2937",
  },
  chefName: {
    color: "#6b7280",
    marginBottom: 15,
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  starsLarge: {
    color: "#fbbf24",
    fontSize: 16,
  },
  ratingNumber: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: 16,
  },
  reviewCount: {
    color: "#6b7280",
  },
  priceText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: 25,
  },
  descriptionSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 18,
    color: "#1f2937",
  },
  descriptionText: {
    color: "#6b7280",
    lineHeight: 24,
    fontSize: 15,
  },
  ingredientsSection: {
    marginBottom: 25,
  },
  ingredientsText: {
    color: "#6b7280",
    fontSize: 15,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 15,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: "700",
    color: "#1f2937",
  },
  addToCartButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
})
