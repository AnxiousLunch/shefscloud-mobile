"use client";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileDropdown from "../components/ProfileDropdown";
import { useAuth } from "../contexts/AuthContext";
import { handleGetAllDishes, handlePostTransaction } from "@/services/shef";
import { handleGetOrders, handleGetPendingOrdersForChef } from "@/services/order";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "@/store/user";

const { width, height } = Dimensions.get("window");

const isTablet = width >= 768;
const isSmallPhone = width < 375;
const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (size) => {
  if (isTablet) return size * 1.2;
  if (isSmallPhone) return size * 0.9;
  return size;
};

const StatCard = ({ value, label, color = "#dc2626" }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statNumber, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SalesCard = ({ title, amount }) => (
  <View style={styles.salesCard}>
    <Text style={styles.salesTitle}>{title}</Text>
    <Text style={styles.salesAmount}>{title.includes("Total Sales") ? amount : `₨${amount}`}</Text>
  </View>
);

const MenuItem = ({ dish, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Image
      source={{
        uri: dish.logo 
          ? dish.logo
          : "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
      }}
      style={styles.dishImage}
    />
    <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
  </TouchableOpacity>
);

export default function ChefDashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  // const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const token = authToken || user?.access_token; 
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const [dishes, setDishes] = useState([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [sales, setSales] = useState({
    total_amount: 0,
    service_charges: 0,
    commission_received: 0,
    net_delivery_charges: 0,
    sale_amount: 0
  });
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [upcomingOrdersCount, setUpcomingOrdersCount] = useState({
    accepted: 0,
    preparing: 0,
    delivering: 0,
    canceled: 0,
    delivered: 0
  });


  useEffect(() => {
    const fetchUserInfo = async () => {
      const res = await dispatch(loadUserFromStorage());
      if (loadUserFromStorage.fulfilled.match(res)) {
        const { userInfo } = res.payload;
        setUser(userInfo);
        setAuthToken(userInfo.access_token);
      } else {
        console.warn("Failed to load user:", res.error);
      }
    };
    fetchUserInfo();
  }, [dispatch]);

  useEffect(() => {
    if (!token || !user?.id) {
      console.warn("Waiting for auth data...");
      return;
    }

    console.log(" Using Token:", token);
    console.log(" User ID:", user.id);
    

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchDishes(),
          fetchSales(),
          fetchOrders(),
          fetchPendingOrderCount()
        ]);
      } catch (error) {
        console.error("Global fetch error:", error);
        Alert.alert("Error", "Failed to load dashboard data");
      }
    };

    const fetchDishes = async () => {
      try {
        setIsLoadingDishes(true);
        const res = await handleGetAllDishes(token);
        console.log("📦 Dishes API Response:", res);
        setDishes(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Dishes error:", error);
        Alert.alert("Error", "Failed to load menu items");
      } finally {
        setIsLoadingDishes(false);
      }
    };

    const fetchSales = async () => {
      try {
        setIsLoadingSales(true);
       setIsLoadingSales(true);
    const startDate = "2020-01-01";
    const endDate = "2025-08-09"
    console.log("User ID:", user?.id);
    console.log("Possible Chef ID:", user?.id || user?.last_order_address?.chef_id);

const chefIdToUse = user?.id;  // ✅ Always use the current user's ID


    console.log("Chef ID being used for sales:", chefIdToUse);

const res = await handlePostTransaction(user?.access_token, user?.id, startDate, endDate);

    console.log("Sales API Response:", res);
        let data = [];
        if (res?.reports?.original?.reports) {
          data = res.reports.original.reports;
        } else if (res?.reports?.original?.data) {
          data = res.reports.original.data;
        } else if (Array.isArray(res?.reports)) {
          data = res.reports;
        }

        const transformedOrders = data.flatMap((order) => {
          if (order?.reports && Array.isArray(order.reports)) {
            return order.reports.map((report) => ({
              ...order,
              ...report,
              reports: undefined,
            }));
          }
          return [];
        });

        const calculatedSales = transformedOrders.reduce(
          (acc, item) => {
            acc.total_amount += Number(item.total_amount) || 0;
            acc.service_charges += Number(item.service_charges) || 0;
            acc.commission_received += Number(item.commission_received) || 0;
            acc.net_delivery_charges += Number(item.net_delivery_charges) || 0;
            acc.sale_amount += Number(item.sale_amount) || 0;
            return acc;
          },
          {
            total_amount: 0,
            service_charges: 0,
            commission_received: 0,
            net_delivery_charges: 0,
            sale_amount: 0,
          }
        );
        setSales(calculatedSales);
      } catch (error) {
        console.error("Sales error:", error);
        Alert.alert("Error", "Failed to load sales data");
      } finally {
        setIsLoadingSales(false);
      }
    };

    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const ordersRetrieved = await handleGetOrders(token, { chef_id: user.id });
        console.log("📦 Orders API Response:", ordersRetrieved);

        const updatedOrdersCount = {
          accepted: 0,
          preparing: 0,
          delivering: 0,
          canceled: 0,
          delivered: 0,
        };

        if (Array.isArray(ordersRetrieved)) {
          ordersRetrieved.forEach((order) => {
            if (order?.status && updatedOrdersCount.hasOwnProperty(order.status)) {
              updatedOrdersCount[order.status]++;
            }
          });
        }

        setUpcomingOrdersCount(updatedOrdersCount);
      } catch (error) {
        console.error("Orders error:", error);
        Alert.alert("Error", "Failed to load orders");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    const fetchPendingOrderCount = async () => {
      try {
        setIsLoadingPending(true);
        const pendingOrderResponse = await handleGetPendingOrdersForChef(user.id, token);
        console.log("⏳ Pending Orders API Response:", pendingOrderResponse);

        if (typeof pendingOrderResponse === 'number') {
          setPendingOrderCount(pendingOrderResponse);
        } else if (Array.isArray(pendingOrderResponse)) {
          setPendingOrderCount(pendingOrderResponse.length);
        } else {
          setPendingOrderCount(0);
        }
      } catch (error) {
        console.error("Pending orders error:", error);
        setPendingOrderCount(0);
      } finally {
        setIsLoadingPending(false);
      }
    };

    fetchData();

    const intervalId = setInterval(() => {
      fetchOrders();
      fetchPendingOrderCount();
    }, 300000);

    return () => clearInterval(intervalId);
  }, [token, user]);

  
  
  const handleAddDish = () => {
  router.push("/add-new-dish");
  };
  
  const handleDishPress = (dish) => {
    router.push("/menu", { dish });
  };

  console.log("user", user)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header - ADDED PROFILE PHOTO SUPPORT */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Welcome Back, {user?.first_name || user?.name?.split(" ")[0] || "Chef"}!
              </Text>
              <Text style={styles.location}>📍 Here's what's happening with your kitchen</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileAvatar} 
              onPress={() => setShowProfileDropdown(true)}
            >
              {user?.profile_pic ? (
                <Image 
                  source={{ uri: user.profile_pic }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.profileAvatarText}>
                  {user?.name?.charAt(0) || "C"}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>

        {/* Orders Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📋</Text>
            </View>
            <Text style={styles.sectionTitle}>Your Orders Overview</Text>
          </View>
          
          {isLoadingOrders ? (
            <ActivityIndicator size="large" color="#dc2626" style={styles.loader} />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ordersContainer}
            >
              <StatCard 
                value={upcomingOrdersCount.accepted || 0} 
                label="Accepted Orders" 
                color="#3b82f6" 
              />
              <StatCard 
                value={upcomingOrdersCount.canceled || 0} 
                label="Cancelled Orders" 
                color="#ef4444" 
              />
              <StatCard 
                value={upcomingOrdersCount.preparing || 0} 
                label="Preparing Orders" 
                color="#f59e0b" 
              />
              <StatCard 
                value={upcomingOrdersCount.delivering || 0} 
                label="Delivering Orders" 
                color="#8b5cf6" 
              />
              <StatCard 
                value={upcomingOrdersCount.delivered || 0} 
                label="Delivered Orders" 
                color="#10b981" 
              />
            </ScrollView>
          )}
        </View>

        {/* Pending Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⏳</Text>
            </View>
            <Text style={styles.sectionTitle}>Pending Orders</Text>
          </View>
          
          <View style={styles.pendingContainer}>
            <View style={styles.pendingContent}>
              <Text style={styles.pendingTitle}>Orders Awaiting Action</Text>
              <Text style={styles.pendingCount}>{pendingOrderCount || 0}</Text>
              <Text style={styles.pendingText}>
                {pendingOrderCount === 0 
                  ? "All caught up! No pending orders" 
                  : "You have orders to review!"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sales Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>💰</Text>
            </View>
            <Text style={styles.sectionTitle}>Your Sales Performance</Text>
          </View>
          
          {isLoadingSales ? (
            <ActivityIndicator size="large" color="#dc2626" style={styles.loader} />
          ) : (
            <View style={styles.salesGrid}>
              <SalesCard title="Total Sales" amount={sales.sale_amount} />
              <SalesCard title="Total Amount" amount={sales.total_amount} />
              <SalesCard title="Delivery Charges" amount={sales.net_delivery_charges} />
              <SalesCard title="Commission" amount={sales.commission_received} />
              <SalesCard title="Service Charges" amount={sales.service_charges} />
            </View>
          )}
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🍽️</Text>
            </View>
            <Text style={styles.sectionTitle}>Your Menu</Text>
          </View>
          
          {isLoadingDishes ? (
            <ActivityIndicator size="large" color="#dc2626" style={styles.loader} />
          ) : dishes.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuContainer}
            >
              {dishes.map((dish, index) => (
                <MenuItem key={index} dish={dish} onPress={() => handleDishPress(dish)} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyMenu}>
              <Text style={styles.emptyMenuIcon}>🍽️</Text>
              <Text style={styles.emptyMenuTitle}>Your menu is empty</Text>
              <Text style={styles.emptyMenuText}>
                No dishes found in your menu. Add your delicious creations to start receiving orders!
              </Text>
            </View>
          )}
          
          <View style={styles.menuButtons}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddDish}
            >
              <Text style={styles.addButtonText}>+ Add New Dish</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={() => router.push("/menu")}
            >
              <Text style={styles.manageButtonText}>Manage Menu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <Text style={styles.cardTitle}>Your Profile</Text>
            <Text style={styles.cardSubtitle}>Update your Profile!</Text>
            <Text style={styles.cardButton}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push("/reviews")}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>📝</Text>
            </View>
            <Text style={styles.cardTitle}>Order Reviews</Text>
            <Text style={styles.cardSubtitle}>See your Order Reviews!</Text>
            <Text style={styles.cardButton}>View Reviews</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ProfileDropdown isVisible={showProfileDropdown} onClose={() => setShowProfileDropdown(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: responsiveHeight(3),
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: Math.min(responsiveWidth(6), 24),
    paddingTop: isTablet ? 30 : 20,
    paddingBottom: isTablet ? 25 : 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  greeting: {
    fontSize: responsiveFontSize(20),
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  location: {
    color: "#64748b",
    fontSize: responsiveFontSize(12),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileAvatar: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileAvatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: responsiveFontSize(20),
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: Math.min(responsiveWidth(5), 20),
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: responsiveFontSize(18),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: "700",
    color: "#1e293b",
  },
  ordersContainer: {
    paddingBottom: 10,
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    width: responsiveWidth(40),
    minWidth: 150,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  statNumber: {
    fontSize: responsiveFontSize(24),
    fontWeight: "800",
    marginBottom: 6,
  },
  statLabel: {
    color: "#64748b",
    fontSize: responsiveFontSize(12),
    textAlign: "center",
    fontWeight: "600",
  },
  pendingContainer: {
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  pendingContent: {
    alignItems: "center",
  },
  pendingTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#b45309",
    marginBottom: 8,
  },
  pendingCount: {
    fontSize: responsiveFontSize(32),
    fontWeight: "800",
    color: "#b45309",
    marginBottom: 4,
  },
  pendingText: {
    fontSize: responsiveFontSize(14),
    color: "#b45309",
    fontWeight: "500",
    textAlign: "center",
  },
  loader: {
    paddingVertical: 30,
  },
  salesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  salesCard: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 12,
  },
  salesTitle: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 6,
  },
  salesAmount: {
    fontSize: responsiveFontSize(16),
    fontWeight: "700",
    color: "#1e293b",
  },
  menuContainer: {
    paddingBottom: 10,
  },
  menuItem: {
    width: responsiveWidth(30),
    marginRight: 16,
    alignItems: "center",
  },
  dishImage: {
    width: "100%",
    height: responsiveHeight(15),
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f1f5f9",
  },
  dishName: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  emptyMenu: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyMenuIcon: {
    fontSize: responsiveFontSize(36),
    marginBottom: 12,
  },
  emptyMenuTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    textAlign: "center",
  },
  emptyMenuText: {
    fontSize: responsiveFontSize(14),
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  menuButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 12,
  },
  addButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  manageButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dc2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
  },
  manageButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: Math.min(responsiveWidth(5), 20),
    marginTop: 16,
    gap: 16,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#fee2e2",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: responsiveFontSize(12),
    color: "#dc2626",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  cardButton: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    fontWeight: "600",
    fontSize: responsiveFontSize(14),
    marginTop: 4,
  },
});