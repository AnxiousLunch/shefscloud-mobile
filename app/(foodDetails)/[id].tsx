import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRoute } from "@react-navigation/native"
import { RouteProp } from "@react-navigation/native"
import { useState, useEffect, useMemo } from "react"
import { handleGetSingleDish, handleGetAllChefs, handleGetAvailabilityTimeSlot } from "@/services/get_methods"
import { ActivityIndicator, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {Picker} from '@react-native-picker/picker'
import { addToCartThunk } from "@/store/cart"
import { useDispatch, useSelector } from "react-redux"
import { store } from "@/store/store"
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from "expo-router"
import { CartItemResponse, Dish, RootState, TimeSlot } from "@/types/types"



function convertTo12Hour(time24) {
    if (!time24) return;
    let [hoursString, minutes] = time24.split(":");
    let hours = parseInt(hoursString);

    // Handle the edge case for "24:00"
    if (hours === 24) {
      hours = 0;
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${suffix}`;
  }

export default function FoodDetailScreen() {
  const route = useRoute();
  const {id: foodId} = useLocalSearchParams();
  const [foodItem, setFoodItem] = useState<Dish | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeliverDateAndSlot, setSelectedDeliveryDateAndSlot] = useState<{
    delivery_date: Date | null,
    delivery_slot: string
  }>({
    delivery_date: null, 
    delivery_slot: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const {cart} = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();


  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedDeliveryDateAndSlot((prev) => ({
        ...prev,
        delivery_date: date,
      }));
    }
  };

  const existingCartQuantity = useMemo(() => {
    if (!foodItem?.user?.id || !selectedDeliverDateAndSlot.delivery_date || !selectedDeliverDateAndSlot.delivery_slot) {
      return 0;
    }


    const deliveryDateString = selectedDeliverDateAndSlot.delivery_date.toLocaleDateString();

    const chefInCart = cart?.find(chef =>
      chef.id === foodItem.user.id &&
      chef.delivery_date === deliveryDateString &&
      chef.delivery_slot === selectedDeliverDateAndSlot.delivery_slot
    );

    if (chefInCart) {
      const menuInCart = chefInCart.menu?.find(menu => menu.id === foodItem.id);
      return menuInCart?.quantity || 0;
    }

    return 0;
  }, [cart, foodItem?.user?.id, foodItem?.id, selectedDeliverDateAndSlot.delivery_date, selectedDeliverDateAndSlot.delivery_slot]);

  useEffect(() => {
    if (existingCartQuantity > 0) {
      setQuantity(existingCartQuantity);
    } else {
      setQuantity(1);
    }
  }, [existingCartQuantity]);

  // Reset quantity when delivery date/slot changes to avoid confusion
  useEffect(() => {
    // When delivery details change, check if the new combination exists in the cart
    if (existingCartQuantity > 0) {
      setQuantity(existingCartQuantity);
    } else {
      // If not, reset quantity to 1
      setQuantity(1);
    }
  }, [selectedDeliverDateAndSlot.delivery_date, selectedDeliverDateAndSlot.delivery_slot, existingCartQuantity]);


  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        setIsLoading(true);

        // Fetch region (city ID) from AsyncStorage
        const regionString = await AsyncStorage.getItem("region");
        if (!regionString) throw new Error("Region not found in storage");
        const region = JSON.parse(regionString);
        // Fetch dish
        const dish: Dish = await handleGetSingleDish(foodId);
        // Fetch all chefs in region
        const chefs = await handleGetAllChefs(region.id);
        const timeslotResponse = await handleGetAvailabilityTimeSlot();

        // Match user_id with chef.id
        const matchingChef = chefs.find((chef) => chef.id === dish.user_id);
        if (matchingChef) {
          dish.user = matchingChef;
        }

        const formatedTimeSlotArray = timeslotResponse.map((time: TimeSlot) => ({
          id: time.id,
          time_start: time.time_start.slice(0, 5),
          time_end: time.time_end.slice(0, 5),
        }));

        if (dish.availability_time_slots?.length > 0) {
          dish.availability_time_slots = formatedTimeSlotArray.filter(
            (time: TimeSlot) =>
              dish.availability_time_slots?.some(
                (av_slot) => av_slot.availability_time_slots_id === time.id
              )
          );
        } else {
          dish.availability_time_slots = formatedTimeSlotArray;
        }

        setFoodItem(dish);
      } catch (error) {
        console.error("Error fetching dish or chef:", error);
        Alert.alert("Error", "Failed to load dish details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodItem();
  }, [foodId]);



  // const handleAddToCart = () => {
  //   if (!foodItem) return;

    
  //   addItem({
  //     id: foodItem.id,
  //     name: foodItem.name,
  //     price: foodItem.platform_price + foodItem.chef_earning_fee + foodItem.delivery_price,
  //     chef: [foodItem.user?.first_name, foodItem.user?.last_name].filter(Boolean).join(" "),
  //     image: foodItem.logo || "🍗",
  //   });

  //   for (let i = 1; i < quantity; i++) {
  //     addItem({
  //       id: foodItem.id,
  //       name: foodItem.name,
  //       price: foodItem.platform_price + foodItem.chef_earning_fee + foodItem.delivery_price,
  //       chef: [foodItem.user?.first_name, foodItem.user?.last_name].filter(Boolean).join(" "),
  //       image: foodItem.logo || "🍗",
  //     });
  //   }

  //   Alert.alert("Added to Cart!", `${foodItem.name} x${quantity} has been added to your cart.`, [{ text: "OK" }]);
  // };



  const handleAddToCart = () => {
    if (!foodItem) {
      Alert.alert("Cart cannot be empty");
      return;
    }
    // Validation
    if (!selectedDeliverDateAndSlot.delivery_date) {
      Alert.alert("Please pick the delivery date first.");
      return;
    }

    if (!selectedDeliverDateAndSlot.delivery_slot) {
      Alert.alert("Please pick the delivery slot first.");
      return;
    }

    if (quantity <= 0) {
      Alert.alert("Quantity must be at least 1");
      return;
    }

    // Calculate unit price
    const unit_price = parseFloat(
      (foodItem.chef_earning_fee + foodItem.platform_price + foodItem.delivery_price).toFixed(2)
    );

    // Create chef object with delivery details
    const chef = {
      ...foodItem.user,
      delivery_date: selectedDeliverDateAndSlot.delivery_date.toLocaleDateString(),
      delivery_slot: selectedDeliverDateAndSlot.delivery_slot,
    };

    // Create payload for dispatch
    const payload = {
      ...foodItem,
      quantity,
      unit_price,
      chef,
    };

    const state = store.getState().cart;
    if (!state.currentUserId || !state.cartInitialized) {
      console.error("Cannot add to cart");
      Alert.alert("Cart not initialized or user not logged in" );
      return;
    }

    try {
      dispatch(addToCartThunk(payload));
      Alert.alert(`${existingCartQuantity > 0 ? 'Updated' : 'Added to'} Cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Failed to add item to cart");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  if (!foodItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Dish not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleBackPress = () => {
    console.log('back');
  }

  console.log("Hewooo");


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{foodItem.name}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailCard}>
          {foodItem.logo ? (
            <Image
              source={{ uri: foodItem.logo }}
              style={styles.foodImageLarge}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.foodImageLarge, { backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
            </View>
          )}

          <View style={styles.detailContent}>
            <Text style={styles.foodTitle}>{foodItem.name}</Text>
            <Text style={styles.chefName}>
              by {foodItem.user?.first_name} {foodItem.user?.last_name} ✓ Verified
            </Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.starsLarge}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.ratingNumber}>{foodItem.average_rating}</Text>
              <Text style={styles.reviewCount}>({foodItem.total_reviews} reviews)</Text>
            </View>

            <Text style={styles.priceText}>
              {(
                foodItem.chef_earning_fee +
                foodItem.platform_price +
                foodItem.delivery_price
              ).toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{foodItem.description}</Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              {/* Portion Size */}
              <Text style={styles.sectionTitle}>Portion Size</Text>
              <Text style={styles.sectionContent}>{foodItem.portion_size || "Standard"}</Text>

              {/* Spicy Level */}
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Spicy Level</Text>
              <Text style={styles.sectionContent}>{foodItem.spice_level.name || "Mild"}</Text>


              <View>
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>
                    Select Delivery Date <Text style={styles.required}>*</Text>
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerText}>
                      {selectedDate
                        ? selectedDate.toLocaleDateString()
                        : "Pick a delivery date"}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={onDateChange}
                    />
                  )}
                </View>

                <Text style={styles.label}>
                  Select Delivery Time <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedDeliverDateAndSlot.delivery_slot}
                    onValueChange={(itemValue) =>
                      setSelectedDeliveryDateAndSlot((prev) => ({
                        ...prev,
                        delivery_slot: itemValue,
                      }))
                    }
                  >
                    <Picker.Item label="--- Pick a delivery slot" value="" />
                    {foodItem.availability_time_slots?.map((date, index) => (
                      <Picker.Item
                        key={index}
                        label={`${convertTo12Hour(date.time_start)} - ${convertTo12Hour(date.time_end)}`}
                        value={`${date.time_start}-${date.time_end}`}
                      />
                    ))}
                  </Picker>
                </View>
              </View>


              {/* Quantity Selector */}
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((q) => q + 1)}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>Add to Cart - ${(foodItem.chef_earning_fee + foodItem.platform_price + foodItem.delivery_price).toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 25,
    paddingVertical: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    position: "absolute",
    left: 25,
    backgroundColor: "#f3f4f6",
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#374151",
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
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
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  foodImageLarge: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#dc2626",
  },
  sectionContent: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 10,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 10,
  },

  qtyButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  qtyButtonText: {
    fontSize: 20,
    color: "#1f2937",
    fontWeight: "700",
  },

  qtyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 8,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    zIndex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  required: {
    color: '#007bff', // or whatever "primary" color you want
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9fafb',
    marginTop: 5,
  },
  datePickerText: {
    fontSize: 15,
    color: '#1f2937',
  },

})
