"use client"
import { useState } from "react"
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ProfileDropdown from "../components/ProfileDropdown"
import { useAuth } from "../contexts/AuthContext"

const { width, height } = Dimensions.get("window")

// Responsive helper functions
const isTablet = width >= 768
const isSmallPhone = width < 375
const responsiveWidth = (percentage: number) => width * (percentage / 100)
const responsiveHeight = (percentage: number) => height * (percentage / 100)
const responsiveFontSize = (size: number) => {
  if (isTablet) return size * 1.2
  if (isSmallPhone) return size * 0.9
  return size
}

export default function ChefDashboardScreen() {
  const { user } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: "SC-003",
      customer: "Sarah Johnson",
      items: "Truffle Pasta Carbonara",
      specialNotes: "Extra truffle please",
      total: 29.72,
      timeAgo: "2 min ago",
    },
  ])

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert("Order Accepted", `Order ${orderId} has been accepted and is being prepared.`)
    setPendingOrders((orders) => orders.filter((order) => order.id !== orderId))
  }

  const handleRejectOrder = (orderId: string) => {
    Alert.alert("Order Declined", `Order ${orderId} has been declined.`)
    setPendingOrders((orders) => orders.filter((order) => order.id !== orderId))
  }

  const handleProfilePress = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome, {user?.name?.split(" ")[1]}!</Text>
              <Text style={styles.location}>📍 Professional Kitchen Dashboard</Text>
            </View>
            <TouchableOpacity style={styles.profileAvatar} onPress={handleProfilePress}>
              <Text style={styles.profileAvatarText}>{user?.name?.charAt(0) || "C"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>32</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>$742</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>4.9</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>5</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
        </View>

        {/* New Order Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Order Alerts</Text>
          {pendingOrders.map((order) => (
            <View key={order.id} style={styles.orderAlert}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>New Order #{order.id}</Text>
                <Text style={styles.alertTime}>{order.timeAgo}</Text>
              </View>
              <View style={styles.alertDetails}>
                <Text style={styles.alertText}>
                  <Text style={styles.alertLabel}>Customer:</Text> {order.customer}
                  {"\n"}
                  <Text style={styles.alertLabel}>Items:</Text> 1x {order.items}
                  {"\n"}
                  <Text style={styles.alertLabel}>Special Notes:</Text> {order.specialNotes}
                  {"\n"}
                  <Text style={styles.alertLabel}>Total:</Text> ${order.total}
                </Text>
              </View>
              <View style={styles.alertActions}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptOrder(order.id)}>
                  <Text style={styles.acceptButtonText}>Accept Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectOrder(order.id)}>
                  <Text style={styles.rejectButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {pendingOrders.length === 0 && (
            <View style={styles.noOrdersContainer}>
              <Text style={styles.noOrdersText}>No pending orders at the moment</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Profile Dropdown */}
      <ProfileDropdown isVisible={showProfileDropdown} onClose={() => setShowProfileDropdown(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: responsiveHeight(3),
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: Math.min(responsiveWidth(6), 40),
    paddingTop: isTablet ? 45 : 35,
    paddingBottom: isTablet ? 35 : 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  greeting: {
    fontSize: responsiveFontSize(28),
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: isTablet ? 12 : 8,
  },
  location: {
    color: "#6b7280",
    fontSize: responsiveFontSize(16),
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: isTablet ? 24 : 18,
    paddingHorizontal: Math.min(responsiveWidth(6), 40),
    paddingVertical: isTablet ? 35 : 25,
    justifyContent: isTablet ? "space-between" : "center",
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: isTablet ? 30 : 25,
    borderRadius: isTablet ? 25 : 20,
    alignItems: "center",
    width: isTablet ? Math.min((width - 88) / 4, 180) : Math.min((width - 68) / 2, 160),
    minWidth: isSmallPhone ? 140 : 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  statNumber: {
    fontSize: responsiveFontSize(28),
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: isTablet ? 12 : 8,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: responsiveFontSize(14),
    textAlign: "center",
    lineHeight: responsiveFontSize(18),
  },
  section: {
    paddingHorizontal: Math.min(responsiveWidth(6), 40),
    paddingBottom: isTablet ? 30 : 20,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(22),
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: isTablet ? 25 : 20,
  },
  orderAlert: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    marginBottom: isTablet ? 20 : 15,
    padding: isTablet ? 25 : 20,
    borderRadius: isTablet ? 22 : 18,
    maxWidth: isTablet ? 600 : "100%",
    alignSelf: isTablet ? "center" : "stretch",
    width: isTablet ? "100%" : "auto",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isTablet ? 16 : 12,
    flexWrap: "wrap",
    gap: 8,
  },
  alertTitle: {
    fontWeight: "700",
    color: "#dc2626",
    fontSize: responsiveFontSize(16),
    flex: 1,
  },
  alertTime: {
    fontSize: responsiveFontSize(12),
    color: "#6b7280",
  },
  alertDetails: {
    marginBottom: isTablet ? 20 : 15,
  },
  alertText: {
    lineHeight: responsiveFontSize(22),
    color: "#374151",
    fontSize: responsiveFontSize(14),
  },
  alertLabel: {
    fontWeight: "600",
  },
  alertActions: {
    flexDirection: isSmallPhone ? "column" : "row",
    gap: isSmallPhone ? 10 : 12,
  },
  acceptButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: isTablet ? 25 : 20,
    paddingVertical: isTablet ? 15 : 10,
    borderRadius: isTablet ? 12 : 10,
    flex: isSmallPhone ? 0 : 1,
    alignItems: "center",
    minHeight: 44, // Minimum touch target
  },
  acceptButtonText: {
    color: "#ffffff",
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: isTablet ? 25 : 20,
    paddingVertical: isTablet ? 15 : 10,
    borderRadius: isTablet ? 12 : 10,
    flex: isSmallPhone ? 0 : 1,
    alignItems: "center",
    minHeight: 44, // Minimum touch target
  },
  rejectButtonText: {
    color: "#ffffff",
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
  },
  noOrdersContainer: {
    backgroundColor: "#ffffff",
    padding: isTablet ? 50 : 40,
    borderRadius: isTablet ? 25 : 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    maxWidth: isTablet ? 500 : "100%",
    alignSelf: "center",
  },
  noOrdersText: {
    color: "#6b7280",
    fontSize: responsiveFontSize(16),
    textAlign: "center",
    lineHeight: responsiveFontSize(22),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileAvatar: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: responsiveFontSize(16),
  },
})
