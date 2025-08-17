import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleGetAllDishesOfCity } from "@/services/get_methods";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchResultsScreen() {
  const { term } = useLocalSearchParams();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - 60) / 2; // 20*3 padding
  
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format price function
  const formatPrice = (chef_earning, platform_price, delivery_price) => {
    const total = chef_earning + platform_price + delivery_price;
    return total.toLocaleString("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Generate star ratings
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <Text style={styles.stars}>
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </Text>
    );
  };

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const [cityData, userData] = await Promise.all([
          AsyncStorage.getItem("region"),
          AsyncStorage.getItem("user")
        ]);
        
        const city = JSON.parse(cityData);
        const currentUser = JSON.parse(userData);
        
        if (!city) {
          setError("City data not found");
          return;
        }

        const allDishes = await handleGetAllDishesOfCity(city.id);
        
        // Filter out current user's dishes
        let filteredDishes = allDishes;
        if (currentUser?.id) {
          filteredDishes = allDishes.filter(dish => dish.user_id !== currentUser.id);
        }

        // Apply search filter
        const keyword = term.toLowerCase();
        const searchResults = filteredDishes.filter(dish => 
          dish.name?.toLowerCase().includes(keyword)
        );

        setDishes(searchResults);
      } catch (err) {
        console.error(err);
        setError("Failed to load dishes");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [term]);

  const handleBackPress = () => {
    router.back();
  };

  const handleFoodPress = (foodId) => {
    router.push(`/foodDetails/${foodId}`);
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>No Dishes Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        We couldn't find any dishes matching "{term}"
      </Text>
    </View>
  );

  // Error state component
  const ErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results for: "{term}"</Text>
      </View>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Searching dishes...</Text>
        </View>
      ) : dishes.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.foodGrid}
          showsVerticalScrollIndicator={false}
        >
          {dishes.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.foodCard, { width: cardWidth }]} 
              onPress={() => handleFoodPress(item.id)}
              activeOpacity={0.9}
            >
              {item.logo ? (
                <Image
                  source={{ uri: item.logo }}
                  style={styles.foodImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.foodImage, styles.imagePlaceholder]}>
                  <Ionicons name="fast-food-outline" size={32} color="#d1d5db" />
                </View>
              )}

              <View style={styles.foodInfo}>
                <Text style={styles.foodName} numberOfLines={1}>
                  {item.name}
                </Text>
                
                <Text style={styles.foodChef} numberOfLines={1}>
                  by {item.user?.first_name || "Unknown"} {item.user?.last_name || "Chef"}
                </Text>
                
                <View style={styles.foodRating}>
                  <View style={styles.starsContainer}>
                    {renderStars(item.average_rating || 0)}
                  </View>
                  <Text style={styles.ratingText}>
                    ({item.average_rating?.toFixed(1) || "0.0"}) • {item.total_reviews || 0} reviews
                  </Text>
                </View>
                
                <Text style={styles.foodPrice}>
                  {formatPrice(
                    item.chef_earning_fee || 0,
                    item.platform_price || 0,
                    item.delivery_price || 0
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    marginRight: 56,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "space-between",
  },
  foodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  foodImage: {
    height: 150, // Fixed height for consistency
    backgroundColor: "#f3f4f6",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
    fontSize: 16,
  },
  foodChef: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  foodRating: {
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  stars: {
    color: "#fbbf24",
    fontSize: 14,
  },
  ratingText: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "400",
  },
  foodPrice: {
    fontWeight: "800",
    color: "#dc2626",
    fontSize: 16,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
});