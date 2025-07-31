"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../contexts/AuthContext"

const { width } = Dimensions.get("window")

export default function ChefDashboardScreen() {
  const { user } = useAuth()
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.name?.split(" ")[1]}!</Text>
          <Text style={styles.location}>📍 Professional Kitchen Dashboard</Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  location: {
    color: "#6b7280",
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    paddingHorizontal: 25,
    paddingVertical: 25,
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    width: (width - 68) / 2,
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
    fontSize: 28,
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: 8,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 20,
  },
  orderAlert: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    marginBottom: 15,
    padding: 20,
    borderRadius: 18,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alertTitle: {
    fontWeight: "700",
    color: "#dc2626",
    fontSize: 16,
  },
  alertTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  alertDetails: {
    marginBottom: 15,
  },
  alertText: {
    lineHeight: 22,
    color: "#374151",
  },
  alertLabel: {
    fontWeight: "600",
  },
  alertActions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  noOrdersContainer: {
    backgroundColor: "#ffffff",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  noOrdersText: {
    color: "#6b7280",
    fontSize: 16,
    textAlign: "center",
  },
})
