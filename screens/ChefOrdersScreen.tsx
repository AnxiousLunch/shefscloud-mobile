import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

const activeOrders = [
  {
    id: "#SC-2024-001",
    customer: "John Smith",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Manhattan, NY 10001",
    orderTime: "2:30 PM",
    items: [{ name: "Truffle Pasta Carbonara", price: 24.99, quantity: 1 }],
    total: 29.72,
    status: "preparing",
  },
]

export default function ChefOrdersScreen() {
  const handleMarkCompleted = (orderId: string) => {
    Alert.alert("Order Completed", `Order ${orderId} has been marked as ready for delivery!`, [{ text: "OK" }])
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={styles.orderStatus}>
                <Text style={styles.orderStatusText}>In Progress</Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <Text style={styles.customerName}>Customer: {order.customer}</Text>
              <Text style={styles.contactInfo}>
                📞 {order.phone}
                {"\n"}📍 {order.address}
                {"\n"}⏰ Ordered at {order.orderTime}
              </Text>

              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>Order Items:</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.itemText}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total}</Text>
            </View>

            <TouchableOpacity style={styles.completeButton} onPress={() => handleMarkCompleted(order.id)}>
              <Text style={styles.completeButtonText}>Mark as Ready for Delivery</Text>
            </TouchableOpacity>
          </View>
        ))}

        {activeOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No active orders</Text>
            <Text style={styles.emptySubtitle}>New orders will appear here when customers place them</Text>
          </View>
        )}
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
    paddingVertical: 25,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
  },
  content: {
    flex: 1,
    paddingTop: 15,
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
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
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
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  orderStatusText: {
    color: "#d97706",
    fontSize: 12,
    fontWeight: "700",
  },
  orderDetails: {
    marginBottom: 18,
  },
  customerName: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  contactInfo: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemsContainer: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  itemsTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
    marginBottom: 20,
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
  completeButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 18,
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
  completeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 25,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#374151",
  },
  emptySubtitle: {
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
})
