import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function FoodListScreen() {
  const navigation = useNavigation();

  const handleFoodPress = (foodId: string) => {
    navigation.navigate("FoodDetail", { foodId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Foods</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.foodGrid}>
          {foodItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.foodCard} onPress={() => handleFoodPress(item.id)}>
              <View style={[styles.foodImage, item.imageStyle]}>
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
  );
}

const cardWidth = (width - 70) / 2;

const foodItems = [
  {
    id: "chicken",
    name: "Grilled Chicken",
    chef: "Test Chef",
    price: 24.99,
    rating: 4.9,
    reviews: 124,
    badge: "Popular",
    imageStyle: { backgroundColor: "#f59e0b" },
  },
  {
    id: "pasta",
    name: "Truffle Pasta Carbonara",
    chef: "Chef Marco Rossi",
    price: 22.5,
    rating: 4.8,
    reviews: 89,
    badge: "Chef's Choice",
    imageStyle: { backgroundColor: "#ef4444" },
  },
  {
    id: "pizza",
    name: "Authentic Margherita",
    chef: "Chef Luigi Bianchi",
    price: 19.75,
    rating: 4.7,
    reviews: 67,
    imageStyle: { backgroundColor: "#10b981" },
  },
  {
    id: "risotto",
    name: "Wild Mushroom Risotto",
    chef: "Chef Sofia Romano",
    price: 26.99,
    rating: 4.6,
    reviews: 156,
    imageStyle: { backgroundColor: "#8b5cf6" },
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
  },
  content: {
    flex: 1,
  },
  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "space-between",
  },
  foodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    width: cardWidth,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  foodImage: {
    height: cardWidth * 0.75,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  foodBadge: {
    position: "absolute",
    top: 10,
    right: 10,
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
    padding: 14,
  },
  foodName: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#1f2937",
    fontSize: 16,
  },
  foodChef: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },
  foodRating: {
    marginBottom: 8,
  },
  stars: {
    color: "#fbbf24",
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  foodPrice: {
    fontWeight: "800",
    color: "#dc2626",
    fontSize: 18,
    marginTop: 6,
  },
});
