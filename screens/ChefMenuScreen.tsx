import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  FlatList,
  Modal,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { handleGetAllDishes } from "@/services/get_methods";
import { ChefDish } from "@/types/types";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ChefMenuScreen() {
  const { authToken } = useSelector((state: RootState) => state.user);
  const [menuItems, setMenuItems] = useState<ChefDish[]>([]);
  const [filteredItems, setFilteredItems] = useState<ChefDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState("");
  const [weekdayFilter, setWeekdayFilter] = useState("");
  const [showFoodTypeModal, setShowFoodTypeModal] = useState(false);
  const [showWeekdayModal, setShowWeekdayModal] = useState(false);

  const foodTypes = [
    { id: "1", name: "Appetizers" },
    { id: "2", name: "Main Course" },
    { id: "3", name: "Desserts" },
    { id: "4", name: "Beverages" },
    { id: "5", name: "Salads" },
    { id: "6", name: "Soups" },
  ];

  const weekdays = [
    { id: "is_monday", name: "Monday" },
    { id: "is_tuesday", name: "Tuesday" },
    { id: "is_wednesday", name: "Wednesday" },
    { id: "is_thursday", name: "Thursday" },
    { id: "is_friday", name: "Friday" },
    { id: "is_saturday", name: "Saturday" },
    { id: "is_sunday", name: "Sunday" },
    { id: "is_all_day", name: "All Days" },
  ];

  const fetchMenuItems = useCallback(async () => {
    if (!authToken) return;
    try {
      const data = await handleGetAllDishes(authToken);
      
      const transformedData = data.map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || "No description",
        chef_earning_fee: dish.chef_earning_fee,
        platform_price: dish.platform_price,
        delivery_price: dish.delivery_price,
        average_rating: dish.average_rating || 0,
        total_reviews: dish.total_reviews || 0,
        logo: dish.logo 
          ? dish.logo.startsWith('http') 
            ? dish.logo 
            : `https://backend-shef.shefscloud.com/${dish.logo}`
          : "https://via.placeholder.com/80",
        is_live: dish.is_live === 1,
        food_type_id: dish.food_type_id,
        is_monday: dish.is_monday,
        is_tuesday: dish.is_tuesday,
        is_wednesday: dish.is_wednesday,
        is_thursday: dish.is_thursday,
        is_friday: dish.is_friday,
        is_saturday: dish.is_saturday,
        is_sunday: dish.is_sunday,
        tags: dish.tags,
      }));
      
      setMenuItems(transformedData);
      setFilteredItems(transformedData);
    } catch (error) {
      console.log("Error fetching menu items", error);
      Alert.alert("Error", "Unable to fetch menu items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    applyFilters();
  }, [searchText, foodTypeFilter, weekdayFilter, menuItems]);

  const applyFilters = () => {
    let filtered = [...menuItems];

    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (foodTypeFilter) {
      filtered = filtered.filter(item =>
        item.food_type_id.toString() === foodTypeFilter
      );
    }

    if (weekdayFilter) {
      if (weekdayFilter === "is_all_day") {
        filtered = filtered.filter(item =>
          item.is_monday === 1 &&
          item.is_tuesday === 1 &&
          item.is_wednesday === 1 &&
          item.is_thursday === 1 &&
          item.is_friday === 1 &&
          item.is_saturday === 1 &&
          item.is_sunday === 1
        );
      } else {
        filtered = filtered.filter(item => item[weekdayFilter] === 1);
      }
    }

    setFilteredItems(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenuItems();
  }, [fetchMenuItems]);

//   const handleAddDish = () => {
//   Navigator.navigate('AddDish', { dishToEdit: null });
// };

//   const handleEditDish = (dish: ChefDish) => {
//   navigation.navigate('AddDish', { dishToEdit: dish });
// };

  const handleDeleteDish = (dishName: string) => {
    Alert.alert("Delete Dish", `Are you sure you want to delete ${dishName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {} },
    ]);
  };

  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderDayPills = (item: ChefDish) => {
    const days = [
      { key: 'is_monday', label: 'Mo' },
      { key: 'is_tuesday', label: 'Tu' },
      { key: 'is_wednesday', label: 'We' },
      { key: 'is_thursday', label: 'Th' },
      { key: 'is_friday', label: 'Fr' },
      { key: 'is_saturday', label: 'Sa' },
      { key: 'is_sunday', label: 'Su' },
    ];

    return (
      <View style={styles.dayPillsContainer}>
        {days.map(day => (
          <View 
            key={day.key} 
            style={[
              styles.dayPill,
              item[day.key] === 1 ? styles.activeDayPill : styles.inactiveDayPill
            ]}
          >
            <Text style={item[day.key] === 1 ? styles.activeDayText : styles.inactiveDayText}>
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFoodTypeModal = () => (
    <Modal
      visible={showFoodTypeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFoodTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Food Type</Text>
          <ScrollView style={styles.modalScrollView}>
            {foodTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.modalOption,
                  foodTypeFilter === type.id && styles.selectedOption
                ]}
                onPress={() => {
                  setFoodTypeFilter(type.id === foodTypeFilter ? "" : type.id);
                  setShowFoodTypeModal(false);
                }}
              >
                <Text style={foodTypeFilter === type.id ? styles.selectedOptionText : styles.modalOptionText}>
                  {type.name}
                </Text>
                {foodTypeFilter === type.id && (
                  <Ionicons name="checkmark" size={20} color="#dc2626" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFoodTypeModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderWeekdayModal = () => (
    <Modal
      visible={showWeekdayModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowWeekdayModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Weekday</Text>
          <ScrollView style={styles.modalScrollView}>
            {weekdays.map(day => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.modalOption,
                  weekdayFilter === day.id && styles.selectedOption
                ]}
                onPress={() => {
                  setWeekdayFilter(day.id === weekdayFilter ? "" : day.id);
                  setShowWeekdayModal(false);
                }}
              >
                <Text style={weekdayFilter === day.id ? styles.selectedOptionText : styles.modalOptionText}>
                  {day.name}
                </Text>
                {weekdayFilter === day.id && (
                  <Ionicons name="checkmark" size={20} color="#dc2626" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowWeekdayModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Management</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={["#dc2626"]} 
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Filter Section */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter</Text>
            
            <View style={styles.filterRow}>
              <View style={styles.filterInputContainer}>
                <Text style={styles.filterLabel}>Filter by weekday</Text>
                <TouchableOpacity 
                  style={styles.filterInput}
                  onPress={() => setShowWeekdayModal(true)}
                >
                  <Text style={styles.filterInputText}>
                    {weekdayFilter ? 
                      weekdays.find(w => w.id === weekdayFilter)?.name : 
                      "Select Any Day"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterInputContainer}>
                <Text style={styles.filterLabel}>Filter by food type</Text>
                <TouchableOpacity 
                  style={styles.filterInput}
                  onPress={() => setShowFoodTypeModal(true)}
                >
                  <Text style={styles.filterInputText}>
                    {foodTypeFilter ? 
                      foodTypes.find(f => f.id === foodTypeFilter)?.name : 
                      "Select Food Type"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.searchContainer}>
              <Text style={styles.filterLabel}>Search by name</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type Dish Name"
                  placeholderTextColor="#94a3b8"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Ionicons name="close" size={18} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Dish Catalogue Header */}
          <View style={styles.catalogueHeader}>
            <Text style={styles.catalogueTitle}>Dish Catalogue ({filteredItems.length})</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddDish}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add New Dish</Text>
            </TouchableOpacity>
          </View>

          {/* Dish List */}
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fast-food-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No dishes found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters or add a new dish</Text>
            </View>
          ) : (
            <View style={styles.dishListContainer}>
              {filteredItems.map((item) => (
                <View key={item.id} style={styles.menuItem}>
                  <View style={styles.itemImageContainer}>
                    <Image 
                      source={{ uri: item.logo }} 
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.editIcon}
                      onPress={() => handleEditDish(item.name)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Active</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {truncateDescription(item.description, 70)}
                    </Text>
                    
                    <Text style={styles.itemPrice}>
                      Rs {item.chef_earning_fee + item.platform_price + item.delivery_price}
                    </Text>
                    
                    {renderDayPills(item)}
                    
                    <Text style={styles.pendingReviewText}>
                      Changes Pending Review
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {renderFoodTypeModal()}
      {renderWeekdayModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1e293b" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  content: { 
    flex: 1,
    paddingBottom: 20,
  },
  
  // Filter Section
  filterContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterInputText: {
    color: '#1e293b',
    fontSize: 14,
  },
  
  // Search
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#1e293b',
    fontSize: 14,
  },
  
  // Dish Catalogue
  catalogueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  catalogueTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  addButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  
  // Menu Items
  dishListContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: "row",
  },
  itemImageContainer: {
    width: 120,
    height: 140,
    position: "relative",
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  editIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDescription: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 8,
  },
  dayPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  dayPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeDayPill: {
    backgroundColor: "#dc2626",
  },
  inactiveDayPill: {
    backgroundColor: "#e2e8f0",
  },
  activeDayText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  inactiveDayText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  pendingReviewText: {
    color: "#64748b",
    fontSize: 11,
    fontStyle: "italic",
  },
  
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width - 40,
    maxHeight: '70%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#fef2f2',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#1e293b',
  },
  selectedOptionText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 15,
  },
});