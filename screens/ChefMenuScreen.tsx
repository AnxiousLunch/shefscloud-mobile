import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const menuItems = [
  {
    id: "pasta",
    name: "Truffle Pasta Carbonara",
    category: "Italian • Premium",
    price: 24.99,
    rating: 4.9,
    reviews: 124,
    icon: "🍝",
    available: true,
  },
  {
    id: "pizza",
    name: "Authentic Margherita",
    category: "Italian • Classic",
    price: 22.5,
    rating: 4.8,
    reviews: 89,
    icon: "🍕",
    available: false,
  },
  {
    id: "risotto",
    name: "Wild Mushroom Risotto",
    category: "Italian • Vegetarian",
    price: 19.75,
    rating: 4.7,
    reviews: 67,
    icon: "🍚",
    available: true,
  },
]

export default function ChefMenuScreen() {
  const handleAddDish = () => {
    Alert.alert(
      "Add New Dish",
      "Add new dish functionality would open a form to:\n• Upload dish photo\n• Enter dish name, description\n• Set price and category\n• Add ingredients and allergens\n• Set availability status",
      [{ text: "OK" }],
    )
  }

  const handleEditDish = (dishName: string) => {
    Alert.alert("Edit Dish", `Edit ${dishName} functionality would be implemented here.`)
  }

  const handleDeleteDish = (dishName: string) => {
    Alert.alert("Delete Dish", `Are you sure you want to delete ${dishName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive" },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Management</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
            <Text style={styles.addButtonText}>+ Add New Dish</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Menu Items</Text>

          {menuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.itemImage}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
              </View>
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEditDish(item.name)}>
                      <Text style={styles.actionButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDish(item.name)}>
                      <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                  <View style={styles.itemStats}>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.starIcon}>⭐</Text>
                      <Text style={styles.ratingText}>
                        {item.rating} ({item.reviews})
                      </Text>
                    </View>
                    <View
                      style={[styles.availabilityBadge, item.available ? styles.availableBadge : styles.soldOutBadge]}
                    >
                      <Text
                        style={[styles.availabilityText, item.available ? styles.availableText : styles.soldOutText]}
                      >
                        {item.available ? "Available" : "Sold Out"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
  },
  addButtonContainer: {
    paddingHorizontal: 25,
    paddingTop: 25,
  },
  addButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
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
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    gap: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: "#f59e0b",
    borderRadius: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemName: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: 16,
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
  },
  itemCategory: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontWeight: "800",
    color: "#dc2626",
    fontSize: 16,
  },
  itemStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    color: "#fbbf24",
    fontSize: 14,
  },
  ratingText: {
    fontSize: 13,
    color: "#6b7280",
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: "#d1fae5",
  },
  soldOutBadge: {
    backgroundColor: "#fee2e2",
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  availableText: {
    color: "#059669",
  },
  soldOutText: {
    color: "#dc2626",
  },
})
