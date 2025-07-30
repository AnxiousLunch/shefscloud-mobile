import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCart } from "../../contexts/CartContext";

function TabBarIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function CartTabBarIcon({ focused }: { focused: boolean }) {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.cartIconContainer}>
        <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>🛒</Text>
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Cart</Text>
    </View>
  );
}

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🔍" label="Browse" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => <CartTabBarIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📋" label="Orders" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingBottom: 25,
    paddingTop: 12,
    height: 90,
  },
  tabItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    minWidth: 65,
  },
  tabItemActive: {
    backgroundColor: "#dc2626",
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
    color: "#6b7280",
  },
  tabIconActive: {
    color: "#ffffff",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabLabelActive: {
    color: "#ffffff",
  },
  cartIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
}); 