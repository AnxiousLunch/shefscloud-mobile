import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, CartItemResponse } from "@/types/types";
import { 
  handleCheckDiscount,
  handleCreateOrder
} from "@/services/order"
import {handleGetDefaultSetting} from "@/services/default_setting"
import { updateCartItem, removeFromCart, onOrderSubmit, removeFromCartThunk } from "@/store/cart";
import { updateUser } from "@/store/user";
import { ScrollView, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import convertTo12Hour from "@/components/convertTo12Hour";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";

const CheckoutLogic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [chefAddress, setChefAddress] = useState<any>(null);
  const [bykeaToken, setBykeaToken] = useState("");
  const [bykeaFare, setBykeaFare] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const [promoCode, setPromoCode] = useState({
    code: "",
    order_total: 0,
    menus: [],
  });
  const [defaultSetting, setDefaultSetting] = useState<any>(null);
  const [coordinates, setCoordinates] = useState({ lat: 24.8607, lng: 67.0011 }); // Dummy Karachi coordinates
  const [addressPlace, setAddressPlace] = useState<"home" | "office" | "apartment">("home");

  const route = useRoute();
  // Redux state
  const { userInfo, authToken } = useSelector((state: RootState) => state.user);
  const { cartItem: cart } = useSelector((state: RootState) => state.cart);
  const {chefId, chefIndex} = useLocalSearchParams<{chefId: string, chefIndex: string}>();

  // Order state
  const [order, setOrder] = useState({
    chef_id: 1,
    chef_availability_id: 1,
    delivery_time: "",
    delivery_slot: "",
    name: `${userInfo?.first_name} ${userInfo?.last_name}` || "",
    email: userInfo?.email || "",
    phone: userInfo?.phone || "",
    status: 1,
    payment_mode: 1,
    delivery_notes: "",
    sub_total: 0,
    delivery_percentage: 0,
    delivery_price: 0,
    service_fee: 0,
    discount_price: 0,
    tip_price: 0,
    chef_earning_price: 0,
    total_price: 0,
  });

  const [orderDetails, setOrderDetails] = useState([
    {
      name: "",
      user_menu_id: 1,
      unit_price: 0,
      quantity: 0,
      platform_percentage: 0,
      platform_price: 0,
      delivery_percentage: 0,
      delivery_price: 0,
      chef_price: 0,
    },
  ]);

  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState({
    home_house_no: "",
    home_street_address: "",
    home_city: "",
    home_addition_direction: "",
    office_department: "",
    office_floor: "",
    office_company: "",
    office_building_no: "",
    office_street_address: "",
    office_city: "",
    office_addition_direction: "",
    apartment_name: "",
    apartment_apartment_no: "",
    apartment_floor: "",
    apartment_street_address: "",
    apartment_city: "",
    apartment_addition_direction: "",
    line2: "",
    latitude: 24.8607, // Dummy latitude
    longitude: 67.0011, // Dummy longitude
    name: `${userInfo?.first_name} ${userInfo?.last_name}` || "",
    phone: userInfo?.phone || "",
    postal_code: "",
    city: "Karachi", // Dummy city
    state: "",
    delivery_instruction: "",
    delivery_notes: "",
    address_type: "home",
  });

  // Helper functions
  const handleButtonClick = (buttonId: string, percent: number) => {
    setActiveButton(buttonId);
    calculateTip(percent);
  };

  const updateOrder = (field: Partial<typeof order>) => {
    setOrder(prev => ({ ...prev, ...field }));
  };

  const updateOrderDeliveryAddress = (field: Partial<typeof orderDeliveryAddress>) => {
    setOrderDeliveryAddress(prev => ({ ...prev, ...field }));
  };

  const calculateTip = (percent: number) => {
    const tip_amount = parseFloat(
      (order.chef_earning_price * (percent / 100)).toFixed(2)
    );
    updateOrder({ tip_price: tip_amount });
  };

  // Dummy initialization instead of actual geocoding
  const initDummyLocation = () => {
    setBykeaToken("dummy_bykea_token");
    setBykeaFare(150); // Fixed delivery fare
    setChefAddress({ 
      addresses: [{ 
        latitude: "24.8607", 
        longitude: "67.0011" 
      }] 
    });
  };

  const fetchDefaultSetting = async () => {
    try {
      const defaultSetting = await handleGetDefaultSetting(authToken);
      setDefaultSetting(defaultSetting);
    } catch (error) {
      console.error("Error fetching default settings:", error);
    }
  };

  // Handle promo code submission
  const handlePromoCodeSubmit = async () => {
    try {
      const discountResponse = await handleCheckDiscount(authToken, promoCode);
      
      if (discountResponse?.error) {
        Alert.alert("Promo Code Error", discountResponse.error);
        return;
      }

      const { discounted_amount } = discountResponse;
      updateOrder({
        discount_price: discounted_amount,
        total_price: order.total_price - discounted_amount,
      });
      
      Alert.alert("Discount Applied", `PKR ${discounted_amount} discount applied`);
    } catch (error) {
      Alert.alert("Error", "Failed to apply promo code");
    }
  };

  // Update quantity in cart
  const updateQuantityInStore = (
    chefIndex: number,
    menuIndex: number,
    quantity: number,
    operation: "increment" | "decrement"
  ) => {
    const updatedQuantity = operation === "increment" 
      ? quantity + 1 
      : Math.max(1, quantity - 1);
    
    dispatch(
      updateCartItem({
        chefIndex,
        menuIndex,
        key: "quantity",
        value: updatedQuantity,
      })
    );
  };

  // Calculate order details
  const calculateOrderDetails = async () => {
    if (!defaultSetting || !cart.length) return;

    let sub_total = 0;
    let deliverPriceSum = 0;
    let platformPriceSum = 0;
    let chefEarningSum = 0;
    let deliveryDate = "";
    let deliverySlot = "";
    let newOrderDetails: typeof orderDetails = [];

    cart.forEach((chef: CartItemResponse, chef_index: number) => {
      if (chef.id === parseInt(chefId) && chef_index === parseInt(chefIndex)) {
        deliveryDate = chef.delivery_date;
        deliverySlot = chef.delivery_slot;

        chef.menu.forEach((menu) => {
          const chef_earning_fee = menu.chef_earning_fee || 0;
          const quantity = menu.quantity || 0;
          const delivery_price = bykeaFare;

          const platformPercentageFee =
            (defaultSetting?.platform_charge_percentage / 100) * chef_earning_fee;

          const platform_price =
            platformPercentageFee > defaultSetting?.platform_charge
              ? platformPercentageFee
              : defaultSetting?.platform_charge;

          chefEarningSum += chef_earning_fee * quantity;
          sub_total += chef_earning_fee * quantity;
          deliverPriceSum = delivery_price;
          platformPriceSum += platform_price * quantity;

          // Push each menu as an order detail with proper name
          newOrderDetails.push({
            name: menu.name || "Unnamed Item",
            user_menu_id: menu.id,
            unit_price: chef_earning_fee,
            quantity,
            platform_percentage: defaultSetting?.platform_charge_percentage || 0,
            platform_price,
            delivery_percentage: 0,
            delivery_price,
            chef_price: chef_earning_fee,
          });
        });
      }
    });

    setOrderDetails(newOrderDetails);

    updateOrder({
      sub_total,
      chef_earning_price: chefEarningSum,
      delivery_price: deliverPriceSum,
      service_fee: platformPriceSum,
      delivery_time: deliveryDate,
      delivery_slot: deliverySlot,
      total_price:
        sub_total +
        deliverPriceSum +
        platformPriceSum -
        order.discount_price +
        order.tip_price,
    });
  };

  const handleCreateOrderPress = async () => {
  try {
    setIsPending(true);

    // Transform orderDeliveryAddress to match web payload
    const transformedAddress = {
      address_type: orderDeliveryAddress.address_type || "home",
      apartment_addition_direction: orderDeliveryAddress.apartment_addition_direction || "",
      apartment_apartment_no: orderDeliveryAddress.apartment_apartment_no || "",
      apartment_city: orderDeliveryAddress.apartment_city || "",
      apartment_floor: orderDeliveryAddress.apartment_floor || "",
      apartment_name: orderDeliveryAddress.apartment_name || "",
      apartment_street_address: orderDeliveryAddress.apartment_street_address || "",
      city: orderDeliveryAddress.city || "Karachi",
      delivery_instruction: orderDeliveryAddress.delivery_instruction || "",
      delivery_notes: orderDeliveryAddress.delivery_notes || "",
      home_addition_direction: orderDeliveryAddress.home_addition_direction || "",
      home_city: orderDeliveryAddress.home_city || "Karachi",
      home_house_no: orderDeliveryAddress.home_house_no || "",
      home_street_address: orderDeliveryAddress.home_street_address || "",
      latitude: orderDeliveryAddress.latitude || "",
      line2: orderDeliveryAddress.line2 || "",
      longitude: orderDeliveryAddress.longitude || "",
      name: orderDeliveryAddress.name || "",
      office_addition_direction: orderDeliveryAddress.office_addition_direction || "",
      office_building_no: orderDeliveryAddress.office_building_no || "",
      office_city: orderDeliveryAddress.office_city || "",
      office_company: orderDeliveryAddress.office_company || "",
      office_department: orderDeliveryAddress.office_department || "",
      office_floor: orderDeliveryAddress.office_floor || "",
      office_street_address: orderDeliveryAddress.office_street_address || "",
      phone: orderDeliveryAddress.phone || "",
      postal_code: orderDeliveryAddress.postal_code || "",
      state: orderDeliveryAddress.state || "",
    };

    // Transform orderDetails to ensure required fields are filled
    const transformedDetails = orderDetails.map(d => ({
      chef_price: d.chef_price || 0,
      delivery_percentage: d.delivery_percentage || "0.00",
      delivery_price: d.delivery_price || 0,
      name: d.name || "",
      platform_percentage: d.platform_percentage || "0.00",
      platform_price: d.platform_price || 0,
      quantity: d.quantity || 1,
      unit_price: d.unit_price || 0,
      user_menu_id: d.user_menu_id,
    }));

    // Final payload structure
    const payload = {
      chef_availability_id: order.chef_availability_id,
      chef_earning_price: order.chef_earning_price,
      chef_id: order.chef_id,
      city_id: order.city_id,
      delivery_notes: order.delivery_notes || "",
      delivery_percentage: order.delivery_percentage || "0.00",
      delivery_price: order.delivery_price,
      delivery_slot: order.delivery_slot,
      delivery_time: order.delivery_time,
      discount_price: order.discount_price,
      email: order.email,
      name: order.name,
      orderDeliveryAddress: transformedAddress,
      orderDetails: transformedDetails,
      payment_mode: order.payment_mode,
      phone: order.phone,
      service_fee: order.service_fee,
      status: order.status,
      sub_total: order.sub_total,
      tip_price: order.tip_price,
      total_price: order.total_price,
    };

    console.log("Payload is", payload);

    const response = await handleCreateOrder(authToken, payload);

    // Update user info
    const updatedUserInfo = {
      ...userInfo,
      last_order_address: {
        order_delivery_address: transformedAddress,
      },
    };

    await AsyncStorage.setItem("user", JSON.stringify(updatedUserInfo));
    dispatch(updateUser(updatedUserInfo));

    dispatch(
      onOrderSubmit({
        chefId: order.chef_id,
        delivery_date: order.delivery_time,
        delivery_slot: order.delivery_slot,
      })
    );
    dispatch(removeFromCart({ chefId: parseInt(chefId), chefIndex: parseInt(chefIndex) }));

    setOrder({ ...order, tip_price: 0, discount_price: 0 });
    setPromoCode({ code: "", order_total: 0, menus: [] });

    Alert.alert("OrderConfirmation");
    router.push(`/(customer)`);
  } catch (error) {
    Alert.alert("Order Error", error.message || "Failed to place order");
  } finally {
    setIsPending(false);
  }
};

  // Initialization
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch default settings
        await fetchDefaultSetting();
        
        // Initialize dummy location and Bykea values
        initDummyLocation();
        console.log("user info", userInfo);
        
        // Load last order address if exists
        if (userInfo?.last_order_address?.order_delivery_address) {
          updateOrderDeliveryAddress(
            userInfo.last_order_address.order_delivery_address
          );
        }
        
        // Load region from AsyncStorage
        const region = await AsyncStorage.getItem("region");
        if (region) {
          const { name, id } = JSON.parse(region);
          updateOrderDeliveryAddress({ city: name });
          updateOrder({ city_id: id });
        }
        
      } catch (error) {
        setError("Initialization error: " + error.message);
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Update order details when dependencies change
  useEffect(() => {
    if (defaultSetting && cart.length) {
      calculateOrderDetails();
    }
  }, [defaultSetting, cart, order.tip_price]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log('back')}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        
        {/* Personal Info */}
        <View style={styles.card}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={order.name}
            onChangeText={text => setOrder(prev => ({ ...prev, name: text }))}
            placeholder="Enter Name"
          />

          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={order.phone}
            onChangeText={text => setOrder(prev => ({ ...prev, phone: text }))}
            placeholder="Enter Phone"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={order.email}
            onChangeText={text => setOrder(prev => ({ ...prev, email: text }))}
            placeholder="Enter Email"
            keyboardType="email-address"
          />
        </View>

        {/* Address Type Selector */}
        <View style={styles.addressTypeContainer}>
          <Text style={styles.note}>* Select where you want your food delivered</Text>
          
          <View style={styles.addressButtons}>
            <TouchableOpacity
              style={[
                styles.addressButton,
                addressPlace === "home" && styles.activeAddressButton
              ]}
              onPress={() => setAddressPlace("home")}
            >
              <MaterialIcons name="house" size={20} color={addressPlace === "home" ? "white" : "black"} />
              <Text style={[styles.buttonText, addressPlace === "home" && { color: "white" }]}>
                Bunglow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addressButton,
                addressPlace === "office" && styles.activeAddressButton
              ]}
              onPress={() => setAddressPlace("office")}
            >
              <MaterialIcons name="work" size={20} color={addressPlace === "office" ? "white" : "black"} />
              <Text style={[styles.buttonText, addressPlace === "office" && { color: "white" }]}>
                Office
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addressButton,
                addressPlace === "apartment" && styles.activeAddressButton
              ]}
              onPress={() => setAddressPlace("apartment")}
            >
              <MaterialIcons name="apartment" size={20} color={addressPlace === "apartment" ? "white" : "black"} />
              <Text style={[styles.buttonText, addressPlace === "apartment" && { color: "white" }]}>
                Apartment
              </Text>
            </TouchableOpacity>
          </View>

          {/* Address Form - Home */}
          {addressPlace === "home" && (
            <View style={styles.addressForm}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={orderDeliveryAddress.home_street_address}
                onChangeText={text => setOrderDeliveryAddress(prev => ({ ...prev, home_street_address: text }))}
                placeholder="Street Address"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>House Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={orderDeliveryAddress.home_house_no}
                    onChangeText={text => setOrderDeliveryAddress(prev => ({ ...prev, home_house_no: text }))}
                    placeholder="House no."
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    value={orderDeliveryAddress.home_city}
                    onChangeText={text => setOrderDeliveryAddress(prev => ({ ...prev, home_city: text }))}
                    placeholder="City"
                  />
                </View>
              </View>

              <Text style={styles.label}>Additional Direction</Text>
              <TextInput
                style={styles.input}
                value={orderDeliveryAddress.home_addition_direction}
                onChangeText={text => setOrderDeliveryAddress(prev => ({ ...prev, home_addition_direction: text }))}
                placeholder="Additional direction"
              />
            </View>
          )}

          {/* Other address types would go here... */}
        </View>

        {/* Delivery Instructions */}
        <View style={styles.card}>
          <Text style={styles.label}>Delivery Instruction</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
            value={orderDeliveryAddress.delivery_instruction}
            onChangeText={text => setOrderDeliveryAddress(prev => ({ ...prev, delivery_instruction: text }))}
            placeholder="Special instructions for delivery"
          />
        </View>

        {/* Delivery Time */}
        <View style={styles.card}>
          <Text style={styles.note}>
            * To change the delivery time, remove this item and place a new order.
          </Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Delivery Date *</Text>
              <Text style={styles.valueText}>
                {order.delivery_time}
              </Text>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Delivery Time *</Text>
              <Text style={styles.valueText}>
                {(convertTo12Hour(order.delivery_slot?.split("-")[0]))} - 
                {convertTo12Hour(order.delivery_slot?.split("-")[1])}
              </Text>
            </View>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.card}>
          <Text style={styles.label}>Promo code or Gift card</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={[styles.input, styles.promoInput]}
              value={promoCode.code}
              onChangeText={text => setPromoCode(prev => ({ ...prev, code: text }))}
              placeholder="Enter promo code"
            />
            <TouchableOpacity style={styles.promoButton} onPress={handlePromoCodeSubmit}>
              <Text style={styles.promoButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.card}>
          <View style={styles.tipHeader}>
            <Text style={styles.sectionTitle}>Tip Chef:</Text>
            <Text style={styles.tipAmount}>
              {order.tip_price.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>
          </View>

          <View style={styles.tipButtons}>
            {["No Tip", "10%", "15%", "20%", "25%"].map((label, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tipButton,
                  activeButton === `btn${index + 1}` && styles.activeTipButton
                ]}
                onPress={() => handleButtonClick(`btn${index + 1}`, index * 5)}
              >
                <Text style={styles.tipButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By placing your order, you agree to Shef's updated Terms of Service, 
          Privacy Policy, and to receive order updates and marketing text messages.
        </Text>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Text style={styles.note}>All transactions are secure and encrypted.</Text>

          <View style={styles.paymentOptions}>
            <TouchableOpacity 
              style={styles.paymentOption}
              onPress={() => setOrder(prev => ({ ...prev, payment_mode: 1 }))}
            >
              <MaterialIcons 
                name={order.payment_mode === 1 ? "radio-button-checked" : "radio-button-unchecked"} 
                size={24} 
                color="#E63946" 
              />
              <Text style={styles.paymentLabel}>Cash on Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, styles.disabledOption]}
              disabled
            >
              <MaterialIcons name="radio-button-unchecked" size={24} color="#ccc" />
              <Text style={[styles.paymentLabel, styles.disabledLabel]}>Card (Unavailable)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Order</Text>
        
        {cart.map((chef: CartItemResponse, chef_index: number) => {
          if (
            chef.id === parseInt(chefId) &&
            chef_index === parseInt(chefIndex)
          ) {
            return (
              <View key={chef.id}>
                <View style={styles.chefInfo}>
                  <Image
                    source={{ uri: chef.profile_pic || "https://via.placeholder.com/50" }}
                    style={styles.chefImage}
                  />
                  <Text style={styles.chefName}>
                    {chef.first_name} {chef.last_name}
                  </Text>
                </View>

                {chef.menu.map((menuItem, menuIndex) => (
                  <View key={menuIndex} style={styles.menuItem}>
                    <View style={styles.menuInfo}>
                      <Image
                        source={{ uri: menuItem.logo || "https://via.placeholder.com/60" }}
                        style={styles.menuImage}
                      />
                      <View>
                        <Text style={styles.menuName}>{menuItem.name}</Text>
                        <Text style={styles.menuPrice}>
                          {menuItem.quantity} x{" "}
                          {menuItem.unit_price.toLocaleString("en-PK", {
                            style: "currency",
                            currency: "PKR",
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => dispatch(removeFromCartThunk({chefIndex: chef_index, menuIndex: menuIndex}))}
                        style={styles.removeButton}
                      >
                        <Feather name="trash-2" size={20} color="#E63946" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          }

          return null; // make sure something is returned from the map
        })}
        {/* Menu Items */}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {order.sub_total.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {order.delivery_price.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fees & Taxes</Text>
            <Text style={styles.summaryValue}>
              {order.service_fee.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shef Tip</Text>
            <Text style={styles.summaryValue}>
              {order.tip_price.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>
          </View>
          
          {order.discount_price > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValueDiscount}>
                -{order.discount_price.toLocaleString("en-PK", {
                  style: "currency",
                  currency: "PKR",
                })}
              </Text>
            </View>
          )}
          
          <View style={styles.summaryTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {order.total_price.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </Text>
          </View>
          
          <Text style={styles.summaryNote}>
            Note: Delivery price may vary based on time and location.
          </Text>
        </View>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity 
        style={styles.placeOrderButton}
        onPress={() => handleCreateOrderPress()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.placeOrderText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    height: 2,
    width: 60,
    backgroundColor: '#FF0000',
    marginBottom: 16,
  },
  section: {
    borderWidth: 1,
    borderColor: '#FF0000',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    position: 'absolute',
    top: -8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
  },
  addressTypeContainer: {
    marginBottom: 16,
  },
  addressTypeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeAddressType: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#2a2a2a",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  note: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 12,
    textAlign: "center",
  },
  addressButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addressButton: {
    flex: 1,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 25,
  },
  activeAddressButton: {
    backgroundColor: "#E63946",
    borderColor: "#E63946",
  },
  buttonText: {
    marginLeft: 5,
    fontWeight: "500",
  },
  addressForm: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  promoContainer: {
    flexDirection: "row",
  },
  promoInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  promoButton: {
    backgroundColor: "#E63946",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  promoButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  tipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tipAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E63946",
  },
  tipButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tipButton: {
    width: "18%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
  },
  activeTipButton: {
    backgroundColor: "#E63946",
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  termsText: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 20,
    textAlign: "center",
  },
  paymentOptions: {
    marginTop: 10,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  disabledOption: {
    opacity: 0.5,
  },
  paymentLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  disabledLabel: {
    color: "#6c757d",
  },
  chefInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  chefImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chefName: {
    fontSize: 18,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 14,
    color: "#6c757d",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: "#2a2a2a",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6c757d",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryValueDiscount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#28a745",
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e2e2",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E63946",
  },
  summaryNote: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 10,
    fontStyle: "italic",
  },
  placeOrderButton: {
    backgroundColor: "#E63946",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  placeOrderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  valueText: {
    fontSize: 16,
    paddingVertical: 12,
  },
});


export default CheckoutLogic;