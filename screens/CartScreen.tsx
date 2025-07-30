import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useCart } from "../contexts/CartContext"

export default function CartScreen() {
  const { items, updateQuantity, getTotalPrice } = useCart()

  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    updateQuantity(id, newQuantity)
  }

  const handleCheckout = () => {
    Alert.alert("Checkout", "Checkout functionality would redirect to payment processing", [{ text: "OK" }])
  }

  const subtotal = getTotalPrice()
  const deliveryFee = 2.99
  const tax = subtotal * 0.08
  const total = subtotal + deliveryFee + tax

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </LinearGradient>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some delicious dishes from our talented chefs</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemImage}>
              <Text style={styles.itemIcon}>{item.image}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemChef}>{item.chef}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 15,
  },
  cartItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 25,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  itemImage: {
    width: 70,
    height: 70,
    backgroundColor: "#f59e0b",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  itemIcon: {
    fontSize: 28,
    color: "#ffffff",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "700",
    marginBottom: 5,
    color: "#1f2937",
  },
  itemChef: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  itemPrice: {
    fontWeight: "800",
    color: "#dc2626",
    fontSize: 16,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  quantityText: {
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  totalCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 25,
    marginTop: 20,
    marginBottom: 25,
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    color: "#6b7280",
  },
  totalValue: {
    fontWeight: "600",
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
    marginBottom: 25,
    marginTop: 15,
  },
  finalTotalLabel: {
    fontWeight: "800",
    fontSize: 20,
    color: "#1f2937",
  },
  finalTotalValue: {
    fontWeight: "800",
    fontSize: 20,
    color: "#dc2626",
  },
  checkoutButton: {
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
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
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
