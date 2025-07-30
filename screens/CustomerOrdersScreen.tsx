import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

const orders = [
  {
    id: "#SC-2024-001",
    chef: "Chef Marco Rossi",
    status: "preparing",
    statusText: "Preparing",
    orderTime: "Ordered today at 2:30 PM",
    estimatedTime: "Estimated delivery: 3:15 PM",
    items: [{ name: "Truffle Pasta Carbonara", price: 24.99, quantity: 1 }],
    total: 29.72,
  },
  {
    id: "#SC-2024-002",
    chef: "Chef Luigi Bianchi",
    status: "completed",
    statusText: "Delivered",
    orderTime: "Delivered yesterday at 7:45 PM",
    items: [{ name: "Authentic Margherita Pizza", price: 22.5, quantity: 1 }],
    total: 27.23,
  },
]

export default function CustomerOrdersScreen() {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "preparing":
        return styles.statusPreparing
      case "completed":
        return styles.statusCompleted
      case "cancelled":
        return styles.statusCancelled
      default:
        return styles.statusPreparing
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={[styles.orderStatus, getStatusStyle(order.status)]}>
                <Text style={styles.orderStatusText}>{order.statusText}</Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <Text style={styles.chefName}>{order.chef}</Text>
              <Text style={styles.orderTime}>
                {order.orderTime}
                {order.estimatedTime && `\n${order.estimatedTime}`}
              </Text>

              {order.items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemText}>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
              ))}
            </View>

            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total}</Text>
            </View>

            {order.status === "completed" && (
              <TouchableOpacity style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>Rate & Review</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 25,
    paddingVertical: 25,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 25,
    marginBottom: 15,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  orderId: {
    fontWeight: "800",
    color: "#1f2937",
    fontSize: 16,
  },
  orderStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusPreparing: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  statusCompleted: {
    backgroundColor: "#d1fae5",
    color: "#059669",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  orderDetails: {
    marginBottom: 18,
  },
  chefName: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  orderTime: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemText: {
    color: "#374151",
  },
  itemPrice: {
    fontWeight: "600",
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "800",
    fontSize: 18,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
  totalLabel: {
    fontWeight: "800",
    fontSize: 18,
    color: "#1f2937",
  },
  totalValue: {
    fontWeight: "800",
    fontSize: 18,
    color: "#dc2626",
  },
  reviewButton: {
    width: "100%",
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    alignItems: "center",
  },
  reviewButtonText: {
    fontWeight: "600",
    color: "#374151",
  },
})
