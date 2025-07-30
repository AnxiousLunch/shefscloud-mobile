import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

function TabBarIcon({
  icon,
  label,
  focused,
  badge,
}: {
  icon: string;
  label: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.iconContainer}>
        <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
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
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🏠" label="Dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📋" label="Orders" focused={focused} badge={5} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📝" label="Menu" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabBarIcon icon="👨‍🍳" label="Profile" focused={focused} />,
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
  iconContainer: {
    position: "relative",
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