import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleGetAllDishesOfCity } from "@/services/get_methods";
import { useRouter } from "expo-router";
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default function FoodListScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  
  // Responsive calculations
  const cardWidth = (screenWidth - 60) / 2;
  const responsiveScale = Math.min(screenWidth / 375, 1.2);
  const nameFontSize = Math.max(14, 16 * responsiveScale);
  const chefFontSize = Math.max(12, 13 * responsiveScale);
  const priceFontSize = Math.max(16, 18 * responsiveScale);
  
  // State management
  const [dishes, setDishes] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Navigate to food details
  const handleFoodPress = useCallback((foodId) => {
    console.log("Navigating to food details:", foodId);
    router.push(`/foodDetails/${foodId}`);
  }, [router]);

  // Fetch dishes data
  const fetchAllDishes = useCallback(async () => {
    try {
      setError(null);
      const region = await AsyncStorage.getItem("region");
      const user = await AsyncStorage.getItem("user");
      
      if (region && user) {
        const city = JSON.parse(region);
        const currentUser = JSON.parse(user);
        
        setIsFetching(true);
        const dishResponse = await handleGetAllDishesOfCity(city.id);
        
        // Filter out current user's dishes
        let filteredDishes = dishResponse;
        if (currentUser?.id) {
          filteredDishes = dishResponse.filter(dish => dish.user_id !== currentUser.id);
          console.log(`Filtered out own dishes for chef: ${currentUser.id}`);
        }
        
        setDishes(filteredDishes);
      } else {
        setError("Region or user data not found");
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setError("Failed to load dishes. Please try again.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllDishes();
    setRefreshing(false);
  }, [fetchAllDishes]);

  // Initial fetch
  useEffect(() => {
    fetchAllDishes();
  }, [fetchAllDishes]);

  // Back navigation
  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <View style={styles.starsContainer}>
        <Text>
          {"★".repeat(fullStars)}
          {hasHalfStar && "☆"}
          {"☆".repeat(emptyStars)}
        </Text>
      </View>
    );
  };

  // Format price
  const formatPrice = (chef_earning, platform_price, delivery_price) => {
    const total = chef_earning + platform_price + delivery_price;
    return total.toLocaleString("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>No Dishes Available</Text>
      <Text style={styles.emptyStateSubtitle}>
        There are no dishes available in your area at the moment.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchAllDishes}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Error state component
  const ErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchAllDishes}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
   container: {
    flex: 1,
  },
    header: {
    backgroundColor: "#dc2626",
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
backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  rightSpacer: {
    width: 40, // Same as backButton for balance
  },
   content: {
      flex: 1,
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
      width: cardWidth,
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
      height: cardWidth * 0.7,
      backgroundColor: "#f3f4f6",
      position: "relative",
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f9fafb",
    },
    foodBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    foodBadgeText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "600",
    },
    foodInfo: {
      padding: 12,
    },
    foodName: {
      fontWeight: "700",
      marginBottom: 4,
      color: "#111827",
      fontSize: nameFontSize,
      lineHeight: nameFontSize * 1.2,
      fontFamily: "System",
    },
    foodChef: {
      fontSize: chefFontSize,
      color: "#6b7280",
      marginBottom: 8,
      fontWeight: "500",
      lineHeight: chefFontSize * 1.3,
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
      fontWeight: "400",
    },
    ratingText: {
      fontSize: 11,
      color: "#9ca3af",
      fontWeight: "400",
      lineHeight: 14,
    },
    foodPrice: {
      fontWeight: "800",
      color: "#dc2626",
      fontSize: priceFontSize,
      marginTop: 4,
      fontFamily: "System",
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
      textAlign: "center",
    },
    emptyStateSubtitle: {
      fontSize: 16,
      color: "#6b7280",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
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
      textAlign: "center",
    },
    errorSubtitle: {
      fontSize: 16,
      color: "#6b7280",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: "#dc2626",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      shadowColor: "#dc2626",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    retryButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  // Main render
  return (
  <SafeAreaView style={[styles.container, { backgroundColor: "transparent" }]}>
    {/* Header */}
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>All Foods</Text>
        
        <View style={styles.rightSpacer} />
      </View>
    </View>
        {error && !isFetching ? (
          <ErrorState />
        ) : dishes.length === 0 && !isFetching ? (
          <EmptyState />
        ) : (
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor="#dc2626"
                colors={["#dc2626"]}
              />
            }
          >
            {isFetching && dishes.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.loadingText}>Loading delicious dishes...</Text>
              </View>
            ) : (
              <View style={styles.foodGrid}>
                {dishes.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.foodCard} 
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
                        <Ionicons name="image-outline" size={32} color="#d1d5db" />
                      </View>
                    )}

                    <View style={styles.foodInfo}>
                      <Text
                        style={styles.foodName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={styles.foodChef}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        by {item.user?.first_name || "Unknown"} {item.user?.last_name || "Chef"}
                      </Text>

                      <View style={styles.foodRating}>
                        <Text style={styles.stars}>
                          {renderStars(item.average_rating || 0)}
                        </Text>
                        <Text style={styles.ratingText}>
                          ({parseInt(item.average_rating).toFixed(1) || "0.0"}) • {item.total_reviews || 0} review{item.total_reviews !== 1 ? 's' : ''}
                        </Text>
                      </View>

                      <Text
                        style={styles.foodPrice}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formatPrice(
                          item.chef_earning_fee || 0,
                          item.platform_price || 0,
                          item.delivery_price || 0
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
    </SafeAreaView>
  );

}
