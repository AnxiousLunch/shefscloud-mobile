import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRoute } from "@react-navigation/native"
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
import { initializeUserCart } from "@/store/cart"


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
  const foodId = route.params;
  console.log("foodID", foodId);
  const [foodItem, setFoodItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeliverDateAndSlot, setSelectedDeliveryDateAndSlot] = useState({
    delivery_date: null, 
    delivery_slot: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const {cart} = useSelector((state) => state.cart);
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
        const dish = await handleGetSingleDish(foodId);
        // Fetch all chefs in region
        const chefs = await handleGetAllChefs(region.id);
        const timeslotResponse = await handleGetAvailabilityTimeSlot();

        // Match user_id with chef.id
        const matchingChef = chefs.find((chef) => chef.id === dish.user_id);
        if (matchingChef) {
          dish.user = matchingChef;
        }

        const formatedTimeSlotArray = timeslotResponse.map((time) => ({
          id: time.id,
          time_start: time.time_start.slice(0, 5),
          time_end: time.time_end.slice(0, 5),
        }));

        if (dish.availability_time_slots?.length > 0) {
          dish.availability_time_slots = formatedTimeSlotArray.filter(
            (time) =>
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



  const handleAddToCart =  async () => {
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
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        Alert.alert("You must be logged in to add to cart");
        return;
      }
      const user = JSON.parse(userStr);

      await dispatch(initializeUserCart(user.id));
    }

    try {
      dispatch(addToCartThunk(payload));
      Alert.alert(`${existingCartQuantity > 0 ? 'Updated' : 'Added to'} Cart`);
      router.back();
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
    router.back();
  }



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
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
              {(foodItem.chef_earning_fee + foodItem.platform_price + foodItem.delivery_price)
                .toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
            </Text>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{foodItem.description}</Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Portion Size</Text>
                  <Text style={styles.infoValue}>{foodItem.portion_size || "Standard"}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Spice Level</Text>
                  <Text style={styles.infoValue}>{foodItem.spice_level.name || "Mild"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Select Delivery Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerText}>
                    {selectedDate ? selectedDate.toLocaleDateString() : "Pick a delivery date"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
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

              <View style={styles.inputGroup}>
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
                    style={{color: "#000000"}}
                  >
                    <Picker.Item label="Pick a delivery slot" value="" />
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
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.qtyButton} 
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.qtyButton} 
                  onPress={() => setQuantity((q) => q + 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>
                Add to Cart - Rs{(foodItem.chef_earning_fee + foodItem.platform_price + foodItem.delivery_price).toFixed(2)}
              </Text>
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
    backgroundColor: "#f8fafc",
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },

  // Image Styles
  foodImageLarge: {
    height: 240,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Content Section
  detailContent: {
    padding: 24,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 32,
  },
  chefName: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    fontWeight: "500",
  },

  // Rating Section
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fef9e7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  starsLarge: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginRight: 6,
  },
  reviewCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Price Section
  priceText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#dc2626",
    marginBottom: 24,
    textAlign: "center",
    paddingVertical: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
  },

  // Description Section
  descriptionSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
    textAlign: "justify",
  },
  sectionContent: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 4,
    fontWeight: "500",
  },

  // Form Elements
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  required: {
    color: "#dc2626",
    fontSize: 14,
  },

  // Date Picker Styles
  datePickerButton: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
  },
  datePickerText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },

  // Picker Styles
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    minHeight: 52,
  },

  // Quantity Section
  quantitySection: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  qtyButton: {
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: "center",
  },

  // Info Cards (for portion size, spice level, etc.)
  infoSection: {
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },

  // Add to Cart Button
  addToCartButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },

  // Interactive States
  activeInput: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  
  // Accessibility improvements
  touchableArea: {
    minHeight: 44,
    minWidth: 44,
  },
});