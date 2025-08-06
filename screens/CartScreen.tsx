import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';

// Import the custom hook for the cart context
import { useCart } from '@/contexts/CartContext';
import isValidURL from '@/components/ValidateURL';
import { useRouter } from 'expo-router';


const convertTo12Hour = (time: string) => {
  if (!time) return '';
  let [hoursString, minutes] = time.split(':');
  let hours = parseInt(hoursString, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight
  return `${hours}:${minutes} ${ampm}`;
};

// --- SVG Icons (converted for react-native-svg) ---
const EmptyBoxIcon = () => (
  <Svg width="72" height="72" viewBox="0 0 24 24" fill="#dcdcdc">
    <Path d="M4 4V2C4 1.44772 4.44772 1 5 1H19C19.5523 1 20 1.44772 20 2V4H22V6H20V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V6H2V4H4ZM6 6V19H18V6H6ZM6 3V4H18V3H6Z" />
  </Svg>
);

const EmptyCartIcon = () => (
  <Svg width="96" height="96" viewBox="0 0 24 24" fill="#dcdcdc">
    <Path d="M6.50488 2H17.5049C17.8196 2 18.116 2.14819 18.3049 2.4L21.0049 6V21C21.0049 21.5523 20.5572 22 20.0049 22H4.00488C3.4526 22 3.00488 21.5523 3.00488 21V6L5.70488 2.4C5.89374 2.14819 6.19013 2 6.50488 2ZM19.0049 8H5.00488V20H19.0049V8ZM18.5049 6L17.0049 4H7.00488L5.50488 6H18.5049ZM9.00488 10V12C9.00488 13.6569 10.348 15 12.0049 15C13.6617 15 15.0049 13.6569 15.0049 12V10H17.0049V12C17.0049 14.7614 14.7663 17 12.0049 17C9.24346 17 7.00488 14.7614 7.00488 12V10H9.00488Z" />
  </Svg>
);

const CheckoutIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,1)">
        <Path d="M4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V15H18.4433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 21C20.0049 22.1046 19.1095 23 18.0049 23Z" />
    </Svg>
);

// --- Mock Data for Chef Details (Workaround for data structure) ---
// The provided CartContext does not include chef details in the cart group.
// This mock data simulates fetching or having access to that info.
const MOCK_CHEF_DATA = {
  "chef-123": {
    first_name: "John",
    last_name: "Doe",
    profile_pic: "https://i.pravatar.cc/150?u=chef123"
  },
  "chef-456": {
    first_name: "Jane",
    last_name: "Smith",
    profile_pic: "https://i.pravatar.cc/150?u=chef456"
  }
};

export const CartScreen = () => {
    const navigation = useNavigation();
    const { cart, currentUserId } = useCart();
    const router = useRouter();

    // Show login prompt if user is not authenticated
    if (!currentUserId) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={[styles.container, styles.centerContent]}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Your cart</Text>
                        <View style={styles.titleUnderline} />
                    </View>
                    <View style={styles.promptBox}>
                        <EmptyBoxIcon />
                        <Text style={styles.promptText}>
                            Please log in to view your cart
                        </Text>
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={() => router.push('/(auth)')}
                        >
                            <Text style={styles.signInButtonText}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
    
    // Enrich cart data with chef details for rendering
    const cartWithChefDetails = cart.map(group => {
        const chefDetails = MOCK_CHEF_DATA[group.chefId] || {
            first_name: "Unknown",
            last_name: "Chef",
            profile_pic: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        };
        return { ...group, ...chefDetails };
    });

    const renderCartGroup = ({ item: group }) => (
        <View style={styles.chefCard}>
            <View style={styles.chefHeader}>
                <Image
                    source={{
                        uri: isValidURL(group.profile_pic)
                            ? group.profile_pic
                            : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }}
                    style={styles.chefImage}
                />
                <View>
                    <Text style={styles.chefName}>{`${group.first_name} ${group.last_name}`}</Text>
                </View>
            </View>

            <View style={styles.itemsHeader}>
                <Text style={styles.itemsHeaderText}>Items</Text>
                <Text style={styles.itemsHeaderText}>Qty</Text>
            </View>

            {group.menu.map((menuItem, index) => (
                <View key={`${menuItem.id}-${index}`} style={styles.menuItemContainer}>
                    <View style={styles.menuItemInfo}>
                        <Image
                            source={{
                                uri: menuItem.image && isValidURL(menuItem.image)
                                    ? menuItem.image
                                    : "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg"
                            }}
                            style={styles.menuItemImage}
                        />
                        <View style={styles.menuItemDetails}>
                            <Text style={styles.menuItemName}>{menuItem.name}</Text>
                            <Text style={styles.menuItemSubText}>
                                Date: {new Date(group.delivery_date).toDateString()}
                            </Text>
                            <Text style={styles.menuItemSlotText}>
                                Slot: {convertTo12Hour(group.delivery_slot?.split("-")[0])} - {convertTo12Hour(group.delivery_slot?.split("-")[1])}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.menuItemQuantity}>{menuItem.quantity}x</Text>
                </View>
            ))}

            <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => navigation.navigate('Checkout', { // Navigate to checkout with group identifiers
                    chefId: group.chefId,
                    delivery_date: group.delivery_date,
                    delivery_slot: group.delivery_slot
                })}
            >
                <CheckoutIcon />
                <Text style={styles.checkoutButtonText}>To Checkout</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={[styles.titleContainer, { alignItems: 'flex-start' }]}>
                    <Text style={styles.title}>Your cart</Text>
                    <View style={styles.titleUnderline} />
                </View>

                {cartWithChefDetails && cartWithChefDetails.length > 0 ? (
                    <FlatList
                        data={cartWithChefDetails}
                        renderItem={renderCartGroup}
                        keyExtractor={(item) => `${item.chefId}-${item.delivery_date}-${item.delivery_slot}`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View style={styles.emptyCartContainer}>
                        <EmptyCartIcon />
                        <Text style={styles.emptyCartText}>
                            Your cart is empty {'\n'} Add items to get started
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

// --- Stylesheet ---
const colors = {
    primary: '#ff6347', // Example: Tomato
    primaryLight: '#ffcccb',
    secondary: '#333333',
    white: '#ffffff',
    lightGray: '#f7f7f7',
    mediumGray: '#dcdcdc',
    headGray: '#6c757d',
    border: '#dee2e6',
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.white },
    container: { flex: 1, padding: 16 },
    centerContent: { justifyContent: 'center' },
    headerPlaceholder: { height: 60, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
    footerPlaceholder: { height: 60, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
    titleContainer: { marginBottom: 24 },
    title: { fontWeight: '600', fontSize: 28, textTransform: 'uppercase', color: colors.secondary, letterSpacing: 1.5 },
    titleUnderline: { width: 60, height: 2, backgroundColor: colors.primary, marginTop: 12 },
    promptBox: { width: '100%', backgroundColor: colors.lightGray, padding: 32, borderRadius: 8, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    promptText: { fontSize: 18, fontWeight: '500', color: colors.secondary, marginVertical: 16, textAlign: 'center' },
    signInButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    signInButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
    emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 8, paddingVertical: 48 },
    emptyCartText: { fontSize: 18, textAlign: 'center', color: colors.secondary, marginTop: 12, lineHeight: 24 },
    chefCard: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.white, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2 },
    chefHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    chefImage: { width: 80, height: 80, borderRadius: 8 },
    chefName: { color: colors.secondary, fontSize: 24, fontWeight: '600' },
    itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 12, marginBottom: 8 },
    itemsHeaderText: { fontSize: 18, fontWeight: '600' },
    menuItemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 8, padding: 8, marginTop: 8, gap: 8 },
    menuItemInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    menuItemImage: { width: 70, height: 60, borderRadius: 8 },
    menuItemDetails: { flex: 1 },
    menuItemName: { fontSize: 18, fontWeight: '600', color: colors.secondary, marginBottom: 4 },
    menuItemSubText: { fontSize: 12, color: colors.headGray, letterSpacing: 0.5 },
    menuItemSlotText: { fontSize: 12, color: colors.headGray, letterSpacing: 0.5, marginTop: 2 },
    menuItemQuantity: { fontSize: 18, fontWeight: '600', textAlign: 'right', paddingRight: 8, minWidth: 40 },
    checkoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, marginTop: 32 },
    checkoutButtonText: { color: colors.white, fontSize: 20, fontWeight: '600' },
});

export default CartScreen;