import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useEffect, useState } from "react";
import { handleGetChefOrders, handleUpdateOrderStatus, handleGetPendingOrdersCount } from "@/services/get_methods";
import { Order } from "@/types/types";
import moment from "moment";
import { Picker } from "@react-native-picker/picker";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function ChefOrdersScreen() {
  const { user } = useAuth();
  const { authToken } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterBy, setFilterBy] = useState("delivery_date_time");
  const [groupBy, setGroupBy] = useState("delivery_address");
  const [currentTab, setCurrentTab] = useState("all_orders");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      if (!user?.id || !authToken) return;
      
      setIsLoading(true);
      
      // Fetch orders
      const ordersData = await handleGetChefOrders(user.id, authToken);
      setOrders(ordersData || []);
      
      // Fetch pending count
      const pendingData = await handleGetPendingOrdersCount(user.id, authToken);
      setPendingCount(pendingData?.count || 0);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id, authToken]);

  useEffect(() => {
    // Apply filters
    let processedOrders = [...orders];
    
    // Filter by search term
    if (filterSearch) {
      processedOrders = processedOrders.filter(order => 
        order.order_code?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        order.items?.some(item => 
          item.name.toLowerCase().includes(filterSearch.toLowerCase())
        )
      );
    }
    
    // Filter by date
    if (filterDate) {
      processedOrders = processedOrders.filter(order => {
        const orderDate = order.delivery_date || 
                         (order.delivery_date_time ? moment(order.delivery_date_time).format("YYYY-MM-DD") : "");
        return orderDate === filterDate;
      });
    }
    
    // Filter by tab
    if (currentTab !== "all_orders") {
      processedOrders = processedOrders.filter(order => order.status === currentTab);
    }
    
    // Sort orders
    processedOrders = sortOrders(processedOrders, filterBy);
    
    // Group orders (simplified for mobile)
    if (groupBy !== "none") {
      processedOrders = groupOrders(processedOrders, groupBy);
    }
    
    setFilteredOrders(processedOrders);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, filterSearch, filterDate, filterBy, groupBy, currentTab]);

  const sortOrders = (ordersToSort, sortBy) => {
    const bottomStatuses = new Set(['delivered', 'delivering', 'canceled']);
    
    return [...ordersToSort].sort((a, b) => {
      // Primary sort: active orders first
      const aIsBottom = bottomStatuses.has(a.status);
      const bIsBottom = bottomStatuses.has(b.status);
      if (aIsBottom && !bIsBottom) return 1;
      if (!aIsBottom && bIsBottom) return -1;
      
      // Secondary sort: by selected field
      switch (sortBy) {
        case "delivery_date_time":
          const dateA = a.delivery_date_time ? moment(a.delivery_date_time) : moment.invalid();
          const dateB = b.delivery_date_time ? moment(b.delivery_date_time) : moment.invalid();
          if (!dateA.isValid()) return 1;
          if (!dateB.isValid()) return -1;
          return dateA.diff(dateB);
          
        case "created_at":
          return moment(b.created_at).diff(moment(a.created_at));
          
        case "total_price":
          return (a.total_price || 0) - (b.total_price || 0);
          
        case "customer_name":
          return (a.customer?.name || "").localeCompare(b.customer?.name || "");
          
        default:
          return 0;
      }
    });
  };

  const groupOrders = (ordersToGroup, groupByOption) => {
    if (groupByOption === "none") return ordersToGroup;
    
    // Simplified grouping for mobile - we'll just add section headers
    const grouped = {};
    
    ordersToGroup.forEach(order => {
      let key;
      switch (groupByOption) {
        case "delivery_address":
          key = extractAreaFromAddress(order.delivery_address);
          break;
        case "status":
          key = order.status || "Unknown";
          break;
        case "delivery_date":
          key = order.delivery_date ? moment(order.delivery_date).format("LL") : "No Date";
          break;
        case "customer":
          key = order.customer?.name || "Unknown Customer";
          break;
        default:
          key = "all";
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(order);
    });
    
    // Flatten with section headers
    const result = [];
    Object.keys(grouped).sort().forEach(key => {
      result.push({ isHeader: true, title: key });
      result.push(...grouped[key]);
    });
    
    return result;
  };

  const extractAreaFromAddress = (address) => {
    if (!address) return "Unknown Area";
    // Simplified version for mobile
    const parts = address.split(",");
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (!authToken) return;
      
      await handleUpdateOrderStatus(orderId, newStatus, authToken);
      Alert.alert("Success", `Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh data
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status");
    }
  };

  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const resetFilters = () => {
    setFilterSearch("");
    setFilterDate("");
    setFilterBy("delivery_date_time");
    setGroupBy("delivery_address");
    setCurrentTab("all_orders");
  };

  const renderStatusBadge = (status) => {
    let bgColor, textColor, statusText;
    
    switch (status) {
      case 'pending':
        bgColor = '#fef3c7';
        textColor = '#d97706';
        statusText = 'Pending';
        break;
      case 'accepted':
        bgColor = '#d1fae5';
        textColor = '#065f46';
        statusText = 'Accepted';
        break;
      case 'preparing':
        bgColor = '#dbeafe';
        textColor = '#1e40af';
        statusText = 'Preparing';
        break;
      case 'delivering':
        bgColor = '#e9d5ff';
        textColor = '#6b21a8';
        statusText = 'Ready';
        break;
      case 'delivered':
        bgColor = '#ccfbf1';
        textColor = '#0d9488';
        statusText = 'Delivered';
        break;
      case 'canceled':
        bgColor = '#fee2e2';
        textColor = '#b91c1c';
        statusText = 'Canceled';
        break;
      default:
        bgColor = '#e5e7eb';
        textColor = '#4b5563';
        statusText = 'Unknown';
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>{statusText}</Text>
      </View>
    );
  };

  const renderOrderItem = (item) => {
    if (item.isHeader) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }
    
    const order = item as Order;
    const deliveryDateTime = order.delivery_date_time 
      ? moment(order.delivery_date_time).format("MMM D, YYYY h:mm A")
      : "Not specified";
    
    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{order.order_number || order.order_code}</Text>
          {renderStatusBadge(order.status)}
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.customerName}>
            {order.customer?.name || "Unknown Customer"}
          </Text>
          
          <View style={styles.contactInfo}>
            <Text>📞 {order.customer?.phone || "N/A"}</Text>
            <Text>📍 {order.delivery_address || "N/A"}</Text>
            <Text>⏰ {deliveryDateTime}</Text>
          </View>
          
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>Order Items:</Text>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemText}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString("en-PK", {
                    style: "currency",
                    currency: "PKR",
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {order.total_price?.toLocaleString("en-PK", {
              style: "currency",
              currency: "PKR",
            }) || "N/A"}
          </Text>
        </View>
        
        {order.status === 'preparing' && (
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={() => handleStatusChange(order.id, 'delivering')}
          >
            <Text style={styles.completeButtonText}>Mark as Ready for Delivery</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleStatusChange(order.id, 'accepted')}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleStatusChange(order.id, 'canceled')}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
          <Text style={styles.headerTitle}>Order Management</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Text style={styles.pendingCount}>
          Pending Orders: {pendingCount}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            tintColor="#dc2626"
          />
        }
      >
        {/* Filters Section */}
        <View style={styles.filtersCard}>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              value={filterSearch}
              onChangeText={setFilterSearch}
            />
            <TouchableOpacity 
              style={styles.filterIcon}
              onPress={() => {}} // Could implement advanced filter modal
            >
              <Ionicons name="filter" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterRow}>
            <TextInput
              style={styles.dateInput}
              placeholder="Select date"
              value={filterDate}
              onChangeText={setFilterDate}
            />
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Sort By:</Text>
            <Picker
              selectedValue={filterBy}
              style={styles.picker}
              onValueChange={setFilterBy}
            >
              <Picker.Item label="Delivery Date" value="delivery_date_time" />
              <Picker.Item label="Order Date" value="created_at" />
              <Picker.Item label="Total Price" value="total_price" />
              <Picker.Item label="Customer Name" value="customer_name" />
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Group By:</Text>
            <Picker
              selectedValue={groupBy}
              style={styles.picker}
              onValueChange={setGroupBy}
            >
              <Picker.Item label="Delivery Area" value="delivery_address" />
              <Picker.Item label="Status" value="status" />
              <Picker.Item label="Delivery Date" value="delivery_date" />
              <Picker.Item label="Customer" value="customer" />
              <Picker.Item label="None" value="none" />
            </Picker>
          </View>
        </View>

        {/* Status Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "all_orders" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("all_orders")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "all_orders" && styles.activeTabText
            ]}>
              All ({filteredOrders.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "pending" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("pending")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "pending" && styles.activeTabText
            ]}>
              Pending ({getStatusCount("pending")})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "accepted" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("accepted")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "accepted" && styles.activeTabText
            ]}>
              Accepted ({getStatusCount("accepted")})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "preparing" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("preparing")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "preparing" && styles.activeTabText
            ]}>
              Preparing ({getStatusCount("preparing")})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "delivering" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("delivering")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "delivering" && styles.activeTabText
            ]}>
              Ready ({getStatusCount("delivering")})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "delivered" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("delivered")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "delivered" && styles.activeTabText
            ]}>
              Delivered ({getStatusCount("delivered")})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "canceled" && styles.activeTab
            ]}
            onPress={() => setCurrentTab("canceled")}
          >
            <Text style={[
              styles.tabText,
              currentTab === "canceled" && styles.activeTabText
            ]}>
              Canceled ({getStatusCount("canceled")})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Orders List */}
        {currentOrders.length > 0 ? (
          <>
            {currentOrders.map(renderOrderItem)}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <TouchableOpacity
                    key={page}
                    style={[
                      styles.pageButton,
                      currentPage === page && styles.activePageButton
                    ]}
                    onPress={() => paginate(page)}
                  >
                    <Text style={[
                      styles.pageText,
                      currentPage === page && styles.activePageText
                    ]}>
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {filterSearch || filterDate || currentTab !== "all_orders"
                ? "Try adjusting your filters"
                : "New orders will appear here"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 5,
  },
  pendingCount: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  filtersCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  filterIcon: {
    marginLeft: 10,
    justifyContent: "center",
    padding: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  resetButton: {
    marginLeft: 10,
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },
  resetButtonText: {
    fontWeight: "600",
    color: "#4b5563",
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerLabel: {
    marginBottom: 5,
    fontWeight: "600",
    color: "#4b5563",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },
  tabsContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  tabsContent: {
    paddingRight: 30,
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  activeTab: {
    backgroundColor: "#dc2626",
  },
  tabText: {
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 5,
    borderRadius: 10,
  },
  sectionHeaderText: {
    fontWeight: "700",
    color: "#374151",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  orderId: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontWeight: "600",
    fontSize: 12,
  },
  orderDetails: {
    marginBottom: 15,
  },
  customerName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 10,
    color: "#1f2937",
  },
  contactInfo: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  itemsContainer: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  itemsTitle: {
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemText: {
    color: "#4b5563",
  },
  itemPrice: {
    fontWeight: "600",
    color: "#1f2937",
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
    fontWeight: "700",
    fontSize: 16,
    color: "#1f2937",
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 16,
    color: "#dc2626",
  },
  completeButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 5,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#f3f4f6",
  },
  activePageButton: {
    backgroundColor: "#dc2626",
  },
  pageText: {
    fontWeight: "600",
    color: "#6b7280",
  },
  activePageText: {
    color: "#ffffff",
  },
});