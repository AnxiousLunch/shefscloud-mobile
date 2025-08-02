import { Tabs } from "expo-router"
import { StyleSheet, Text, View, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

// Responsive helper functions
const isTablet = width >= 768
const isSmallPhone = width < 375
const responsiveWidth = (percentage: number) => width * (percentage / 100)
const responsiveFontSize = (size: number) => {
  if (isTablet) return size * 1.2
  if (isSmallPhone) return size * 0.9
  return size
}

function TabBarIcon({
  iconName,
  focused,
  badge,
}: {
  iconName: keyof typeof Ionicons.glyphMap
  focused: boolean
  badge?: number
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={isTablet ? 28 : 24} color={focused ? "#ffffff" : "#6b7280"} />
        </View>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function ChefLayout() {
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
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabBarIcon iconName="grid-outline"  focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconName="receipt-outline"  focused={focused} badge={5} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ focused }) => <TabBarIcon iconName="restaurant-outline"  focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabBarIcon iconName="person-outline"  focused={focused} />,
        }}
      />
    </Tabs>
  )
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: isTablet ? 10 : 8,
    elevation: 8,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isTablet ? 6 : 4,
    height: isTablet ? 32 : 28,
  },
  tabLabel: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: responsiveFontSize(14),
  },
  tabLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
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
    fontSize: responsiveFontSize(10),
    fontWeight: "800",
    textAlign: "center",
    lineHeight: responsiveFontSize(12),
  },
})
