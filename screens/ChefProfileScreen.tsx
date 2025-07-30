"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../contexts/AuthContext"

export default function ChefProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ])
  }

  const handleSettingPress = (setting: string) => {
    Alert.alert("Settings", `${setting} functionality would be implemented here.`)
  }

  const handleQuickAction = (action: string) => {
    Alert.alert("Quick Action", `${action} functionality would be implemented here.`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <Text style={styles.headerTitle}>Chef Profile</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🍳</Text>
          </View>
          <Text style={styles.chefName}>{user?.name}</Text>
          <Text style={styles.chefSpecialty}>Italian Cuisine Specialist</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>847</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>

          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified Professional Chef</Text>
          </View>
        </View>

        {/* Profile Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Profile Settings</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress("Personal Information")}>
            <View>
              <Text style={styles.settingTitle}>Personal Information</Text>
              <Text style={styles.settingSubtitle}>Update your profile details</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress("Kitchen Information")}>
            <View>
              <Text style={styles.settingTitle}>Kitchen Information</Text>
              <Text style={styles.settingSubtitle}>Location, hours, capacity</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress("Availability")}>
            <View>
              <Text style={styles.settingTitle}>Availability</Text>
              <Text style={styles.settingSubtitle}>Set your working hours</Text>
            </View>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={() => handleSettingPress("Payment & Earnings")}
          >
            <View>
              <Text style={styles.settingTitle}>Payment & Earnings</Text>
              <Text style={styles.settingSubtitle}>Banking details and payouts</Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, styles.analyticsButton]}
              onPress={() => handleQuickAction("View Analytics")}
            >
              <Text style={styles.actionButtonText}>📊 View Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.reviewsButton]}
              onPress={() => handleQuickAction("Customer Reviews")}
            >
              <Text style={styles.actionButtonText}>💬 Customer Reviews</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.promoteButton]}
              onPress={() => handleQuickAction("Promote Dishes")}
            >
              <Text style={styles.actionButtonText}>🎯 Promote Dishes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
              <Text style={styles.actionButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
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
    padding: 25,
  },
  profileHeader: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 30,
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: "#dc2626",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    color: "#ffffff",
  },
  chefName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  chefSpecialty: {
    color: "#6b7280",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#dc2626",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  verifiedBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verifiedText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
  },
  settingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 20,
    color: "#1f2937",
    fontSize: 18,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  settingSubtitle: {
    color: "#6b7280",
    fontSize: 14,
  },
  settingArrow: {
    color: "#dc2626",
    fontSize: 16,
  },
  onlineBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
  },
  actionsCard: {
    backgroundColor: "#ffffff",
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
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
  },
  analyticsButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  reviewsButton: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  promoteButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  logoutButton: {
    backgroundColor: "#fefbeb",
    borderColor: "#fed7aa",
  },
  actionButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
})
