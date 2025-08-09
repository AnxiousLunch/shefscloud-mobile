import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeUserCart } from "@/store/cart";
import isValidURL from "@/components/ValidateURL";
import convertTo12Hour from "@/components/convertTo12Hour";
import { AppDispatch, RootState } from "@/types/types";
import { useRouter } from "expo-router";
import { CartItemResponse } from "@/types/types";

export const CartScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    
    // FIX 1: Access cartItem instead of cart
    const { cartItem: cart, currentUserId } = useSelector((state: RootState) => state.cart);
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndLoadCart = async () => {
            try {
                const [authToken, userStr] = await Promise.all([
                    AsyncStorage.getItem("auth"),
                    AsyncStorage.getItem("user")
                ]);
                
                const user = userStr ? JSON.parse(userStr) : null;
                const authenticated = !!(authToken && user?.id);
                
                setIsAuthenticated(authenticated);

                // FIX 2: Dispatch cart initialization only when authenticated
                if (authenticated) {
                    await dispatch(initializeUserCart(user.id));
                }
            } catch (error) {
                console.error("Failed to load cart:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoadCart();
    }, [dispatch]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <View style={styles.loginPrompt}>
                    <Text style={styles.loginMessage}>
                        Please log in to view your cart
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push("/(auth)")}
                    >
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    console.log(cart);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Cart</Text>
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {cart && cart.length > 0 ? (
                    cart.map((chef: CartItemResponse, chefIndex: number) => (
                        <View key={`${chef.id}-${chefIndex}`} style={styles.chefCard}>
                            <View style={styles.chefHeader}>
                                <Image
                                    source={
                                        chef.profile_pic && isValidURL(chef.profile_pic)
                                            ? { uri: chef.profile_pic }
                                            : require("@/assets/default-profile.png") // FIX 3: Add fallback image
                                    }
                                    style={styles.profileImage}
                                />
                                <Text style={styles.chefName}>
                                    {`${chef.first_name} ${chef.last_name}`}
                                </Text>
                            </View>

                            <View style={styles.menuHeader}>
                                <Text style={styles.sectionTitle}>Items</Text>
                                <Text style={styles.sectionTitle}>Qty</Text>
                            </View>
                            
                            {chef.menu.map((menu, menuIndex) => (
                                <View key={`${menu.id}-${menuIndex}`} style={styles.menuItem}>
                                    <View style={styles.menuInfo}>
                                        <Image
                                            source={
                                                menu.logo && isValidURL(menu.logo)
                                                    ? { uri: menu.logo }
                                                    : require("@/assets/default-food.png") // FIX 4: Add fallback image
                                            }
                                            style={styles.menuImage}
                                        />
                                        <View>
                                            <Text style={styles.menuName}>{menu.name}</Text>
                                            <Text style={styles.menuDetail}>
                                                Date: {chef.delivery_date}
                                            </Text>
                                            <Text style={styles.menuDetail}>
                                                Time: {convertTo12Hour(chef.delivery_slot?.split("-")[0])} - 
                                                {convertTo12Hour(chef.delivery_slot?.split("-")[1])}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.quantity}>{menu.quantity}x</Text>
                                </View>
                            ))}
                            
                            <TouchableOpacity
                                style={styles.checkoutButton}
                                onPress={() => router.push(`/(checkout)/${chef.id}/${chefIndex}`)}
                            >
                                <Text style={styles.checkoutText}>Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Your cart is empty{"\n"}Add items to get started
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 50, // Add padding for status bar
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        color: "#2a2a2a",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 100, // Add space at bottom
    },
    loginPrompt: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f7f7f7",
    },
    loginMessage: {
        fontSize: 18,
        fontWeight: "500",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: "#E63946",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    chefCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e2e2e2",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chefHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    chefName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#2a2a2a",
    },
    menuHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e2e2",
        borderRadius: 10,
        padding: 12,
        marginVertical: 8,
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
        color: "#333",
        marginBottom: 4,
    },
    menuDetail: {
        fontSize: 12,
        color: "#666",
    },
    quantity: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginLeft: 10,
    },
    checkoutButton: {
        backgroundColor: "#E63946",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
    },
    checkoutText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        textAlign: "center",
        color: "#555",
        marginTop: 20,
        lineHeight: 28,
    },
});