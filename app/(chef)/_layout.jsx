import { Tabs } from "expo-router";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Responsive helpers
const isTablet = width >= 768;
const isSmallPhone = width < 375;
const responsiveWidth = (percentage) => width * (percentage / 100);

function TabBarIcon({
  iconName,
  focused,
  badge,
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName}
          size={isTablet ? 28 : 24}
          color={focused ? "#ffffff" : "#6b7280"}
        />
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ChefLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // 🔹 Hides text labels under icons
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="grid-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="receipt-outline" focused={focused} badge={5} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="restaurant-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications" // 👈 must have a file `app/(chef)/notifications.tsx`
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="notifications-outline" focused={focused} badge={1} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="person-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    paddingBottom: isTablet ? 35 : isSmallPhone ? 25 : 28,
    paddingTop: isTablet ? 20 : 16,
    height: isTablet ? 110 : isSmallPhone ? 85 : 95,
    paddingHorizontal: Math.min(responsiveWidth(2), 16),
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 16 : isSmallPhone ? 8 : 12,
    borderRadius: isTablet ? 28 : 24,
    minWidth: isTablet ? 90 : isSmallPhone ? 60 : 70,
    minHeight: isTablet ? 70 : isSmallPhone ? 50 : 60,
    flex: 1,
    maxWidth: isTablet ? 120 : 100,
  },
  tabItemActive: {
    backgroundColor: "#dc2626",
    transform: [{ scale: isTablet ? 1.08 : 1.05 }],
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: isTablet ? 10 : 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: isTablet ? -8 : -6,
    right: isTablet ? -16 : -12,
    backgroundColor: "#ef4444",
    borderRadius: isTablet ? 14 : 12,
    paddingHorizontal: isTablet ? 8 : 6,
    paddingVertical: isTablet ? 3 : 2,
    minWidth: isTablet ? 24 : 20,
    minHeight: isTablet ? 24 : 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: isTablet ? 12 : 10,
    fontWeight: "800",
    textAlign: "center",
  },
});
