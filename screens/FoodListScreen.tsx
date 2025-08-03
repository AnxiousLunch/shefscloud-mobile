import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleGetAllDishesOfCity } from "@/services/get_methods";

const { width } = Dimensions.get("window");

export default function FoodListScreen() {
  const navigation = useNavigation();
  const [dishes, setDishes] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const handleFoodPress = (foodId: string) => {
    navigation.navigate("FoodDetail", { foodId });
  };

  useEffect(() => {
    const fetchAllDishes = async () => {
      try {
        const region = await AsyncStorage.getItem("region");
        const user = await AsyncStorage.getItem("user");
        if (region && user) {
          const city = JSON.parse(region);
          const currentUser = JSON.parse(user);
            setIsFetching(true);
            const dishResponse = await handleGetAllDishesOfCity(city.id);
            let filteredDishes = dishResponse;
            if (currentUser && currentUser.id) {
              filteredDishes = dishResponse.filter(dish => dish.user_id !== currentUser.id);
              console.log("Filtered out own dishes for chef:", currentUser.id);
            }
            setDishes(filteredDishes);
          }
        }
        catch (error) {
          console.error("Error while fetching dishes \n", error);
        } finally {
          setIsFetching(false);
        }
    }
    fetchAllDishes(); 
  }, []);

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
          {dishes.map((item) => (
            <TouchableOpacity key={item.id} style={styles.foodCard} onPress={() => handleFoodPress(item.id)}>
              <View>
              </View>
              <View style={styles.foodImage}>
                <Image
                  source={{uri: item.logo }}
                  style={styles.foodImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodChef}>by {item.user?.first_name}{" "}{item.user?.last_name}</Text>
                <View style={styles.foodRating}>
                  <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                  <Text style={styles.ratingText}>
                    ({item.average_rating}) • {item.total_reviews} reviews
                  </Text>
                </View>
                <Text style={styles.foodPrice}>${(
                        item.chef_earning_fee +
                        item.platform_price +
                        item.delivery_price
                      ).toLocaleString("en-PK", {
                        style: "currency",
                        currency: "PKR",
                      })}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardWidth = (width - 70) / 2;

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
