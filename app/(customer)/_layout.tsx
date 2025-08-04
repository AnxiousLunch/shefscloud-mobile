import { Tabs, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCart } from "../../contexts/CartContext";
import { Ionicons } from '@expo/vector-icons';

function TabBarIcon({ 
  iconName, 
  focused 
}: { 
  iconName: keyof typeof Ionicons.glyphMap; 
   
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={iconName} 
          size={24} 
          color={focused ? "#ffffff" : "#6b7280"} 
        />
      </View>
      {/* <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text> */}
    </View>
  );
}

function CartTabBarIcon({ focused }: { focused: boolean }) {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.cartIconContainer}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="bag-outline" 
            size={24} 
            color={focused ? "#ffffff" : "#6b7280"} 
          />
        </View>
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
          </View>
        )}
      </View>
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
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="home-outline"  focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="search-outline"  focused={focused} />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="receipt-outline"  focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    paddingBottom: 28,
    paddingTop: 16,
    height: 95,
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 24,
    minWidth: 70,
    minHeight: 60,
    transition: "all 0.2s ease",
  },
  tabItemActive: {
    backgroundColor: "#dc2626",
    transform: [{ scale: 1.05 }],
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    height: 28,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  cartIconContainer: {
    position: "relative",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -12,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
});