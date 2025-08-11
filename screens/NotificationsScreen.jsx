import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from "@/hooks/hooks";
import { useAuth } from "@/contexts/AuthContext";
import * as orderService from "@/services/order";
import { useRouter } from "expo-router";
import moment from "moment";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";

export default function NotificationsScreen() {
  const { authToken } = useAppSelector((state) => state.user);
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const soundRef = useRef(null);
  const lastNotificationTime = useRef(new Date());

  // Initialize notification sound and permissions
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Load notification sound
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/notifications.mp3')
        );
        soundRef.current = sound;

        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notification permission not granted');
        }

        // Configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      } catch (error) {
        console.error("Notification setup error:", error);
      }
    };

    setupNotifications();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playNotificationSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await orderService.handleGetOrders(authToken);
      const chefOrders = (
        Array.isArray(ordersResponse)
          ? ordersResponse
          : Array.isArray(ordersResponse?.orders)
            ? ordersResponse.orders
            : []
      ).filter(order => order.chef_id === user.id);

      // Fetch reviews
      const reviewsResponse = await orderService.handleGetAllReview(authToken, user.id);
      const reviewsOriginalData = reviewsResponse?.data?.original?.data;
      const reviewsArray = Array.isArray(reviewsOriginalData?.data)
        ? reviewsOriginalData.data
        : Array.isArray(reviewsResponse?.reviews)
          ? reviewsResponse.reviews
          : [];

      // Create notifications with "isNew" flag
      const createNotifications = (items, type) => {
        return items
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(item => ({
            id: `${type}-${item.id}`,
            type,
            created_at: item.created_at,
            title: type === "order" ? "New Order" : "New Review",
            message: type === "order" 
              ? `Order #${item.id} from ${item.name || 'a customer'}` 
              : item.comment || "New rating received",
            data: item,
            isNew: new Date(item.created_at) > lastNotificationTime.current,
          }));
      };

      const orderNotifications = createNotifications(chefOrders, "order");
      const reviewNotifications = createNotifications(reviewsArray, "review");

      const combined = [...orderNotifications, ...reviewNotifications].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // Check for new notifications to play sound
      const newNotifications = combined.filter(n => n.isNew);
      if (newNotifications.length > 0) {
        await playNotificationSound();
        lastNotificationTime.current = new Date();
      }

      setNotifications(combined);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authToken || !user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [authToken, user?.id]);

  const handleNotificationPress = (notification) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? {...n, isNew: false} : n
    );
    setNotifications(updatedNotifications);

    if (notification.type === "order") {
      router.push("/orders");
    } else if (notification.type === "review") {
      router.push("/reviews");
    }
  };

  const getNotificationIcon = (type) => {
    return type === "order" ? "restaurant" : "star";
  };

  const getNotificationColor = (type) => {
    return type === "order" ? "#DC2626" : "#059669";
  };

  const formatTime = (createdAt) => {
    const now = moment();
    const time = moment(createdAt);
    const diffMinutes = now.diff(time, 'minutes');
    const diffHours = now.diff(time, 'hours');
    const diffDays = now.diff(time, 'days');

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return time.format("MMM D");
    }
  };

  const renderNotificationItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.isNew && styles.newNotificationItem
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) }
        ]}>
          <MaterialIcons 
            name={getNotificationIcon(item.type)} 
            size={24} 
            color="white" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[
              styles.titleText,
              item.isNew && styles.newTitleText
            ]}>
              {item.title}
            </Text>
            {item.isNew && <View style={styles.newBadge} />}
          </View>
          
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
          
          <Text style={styles.timeText}>
            {formatTime(item.created_at)}
          </Text>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#9CA3AF" 
          style={styles.chevronIcon}
        />
      </View>
      
      {item.isNew && <View style={styles.newIndicatorLine} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Notifications</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="notifications" size={48} color="#DC2626" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      <LinearGradient
        colors={['#DC2626', '#B91C1C']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.filter(n => n.isNew).length}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={80} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! New orders and reviews will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  newNotificationItem: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  newTitleText: {
    color: '#DC2626',
  },
  newBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chevronIcon: {
    marginLeft: 8,
  },
  newIndicatorLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#DC2626',
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});