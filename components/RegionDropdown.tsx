import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { handleGetCitites } from "@/services/get_methods";
import { useRouter } from "expo-router";

const RegionDropdown = ({ OnSelectRegion, isHome = false }) => {
  const [selected, setSelected] = useState({ id: "", name: "" });
  const [selectedRole, setSelectedRole] = useState("customer");
  const [roleLoaded, setRoleLoaded] = useState(false); // NEW
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const hasRequestedLocation = useRef(false);
  const hasAutoNavigated = useRef(false);
  const router = useRouter();

  // Load role first
  useEffect(() => {
    (async () => {
      const role = await AsyncStorage.getItem("selectedRole");
      if (role) {
        setSelectedRole(role);
        console.log("Loaded role from storage:", role);
      }
      setRoleLoaded(true); // Mark as loaded
    })();
  }, []);

  // Handle city selection
  const onCitySelect = async (city, isAuto = false) => {
    setSelected(city);
    try {
      await AsyncStorage.setItem("region", JSON.stringify(city));
      setIsModalVisible(false);
      setSearchText("");

      if (isHome) {
        OnSelectRegion();
      } else if (!isAuto || !hasAutoNavigated.current) {
        hasAutoNavigated.current = isAuto;
        console.log("Navigating to:", selectedRole);
        if (selectedRole === "chef") {
          router.replace("/(chef)");
        } else {
          router.replace("/(customer)");
        }
      }
    } catch (error) {
      console.error("Error saving region:", error);
    }
  };

  // Fetch cities
  const fetchCities = async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const response = await handleGetCitites();
      const sortedData = response.sort((a, b) => a.name.localeCompare(b.name));
      setCities(sortedData);
      setFilteredCities(sortedData);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // Only run initialization if role is loaded
  useEffect(() => {
    if (!roleLoaded || cities.length === 0) return;

    const initializeRegion = async () => {
      try {
        const storedRegion = await AsyncStorage.getItem("region");
        if (storedRegion) {
          const parsed = JSON.parse(storedRegion);
          const selectedCity = cities.find(
            (c) =>
              c.id === parsed.id &&
              c.name.toLowerCase() === parsed.name.toLowerCase()
          );
          if (selectedCity) {
            setSelected(parsed);
            if (!isHome && !hasAutoNavigated.current) {
              hasAutoNavigated.current = true;
              console.log("Auto navigating with role:", selectedRole);
              if (selectedRole === "chef") {
                router.replace("/(chef)");
              } else {
                router.replace("/(customer)");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error initializing region:", error);
      }
    };

    initializeRegion();
  }, [cities, roleLoaded]); 
    // Function to handle search input change
  const handleSearchChange = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  };



  // Function to get city from coordinates using reverse geocoding
  const getCityFromCoordinates = async (latitude, longitude) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        const cityName = location.city || location.subregion || location.region;
        
        if (cityName) {
          // Find matching city in your cities list (case-insensitive)
          const selectedCity = cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase()
          );
          
          if (selectedCity) {
            await onCitySelect(selectedCity, true);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return false;
    }
  };

  // Function to get user's current location
  const getUserLocation = useCallback(async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        selectDefaultCity();
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Try to get city from coordinates
      const success = await getCityFromCoordinates(latitude, longitude);
      
      if (!success) {
        selectDefaultCity();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      selectDefaultCity();
    } finally {
      setIsLoadingLocation(false);
    }
  }, [cities]);

  // Function to select default city (Karachi)
  const selectDefaultCity = async () => {
    const defaultCity = cities.find((c) => c.name.toLowerCase() === "karachi");
    if (defaultCity) {
      await onCitySelect(defaultCity, true);
    }
  };

  // Load cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Set selected city based on AsyncStorage or user location
  useEffect(() => {
    const initializeRegion = async () => {
      if (cities.length > 0) {
        try {
          const storedRegion = await AsyncStorage.getItem("region");
          
          if (storedRegion) {
            const parsed = JSON.parse(storedRegion);
            const selectedCity = cities.find(
              (c) =>
                c.id === parsed.id &&
                c.name.toLowerCase() === parsed.name.toLowerCase()
            );

            if (selectedCity) {
              setSelected(parsed);
              // If we have a stored region and we're not on home screen, navigate
              if (!isHome && !hasAutoNavigated.current) {
                hasAutoNavigated.current = true;
                router.replace("/(customer)");
              }
            } else {
              // Remove invalid stored region
              await AsyncStorage.removeItem("region");
              if (!hasRequestedLocation.current) {
                hasRequestedLocation.current = true;
                getUserLocation();
              }
            }
          } else if (!hasRequestedLocation.current) {
            hasRequestedLocation.current = true;
            getUserLocation();
          }
        } catch (error) {
          console.error("Error reading from AsyncStorage:", error);
        }
      }
    };

    initializeRegion();
  }, [cities, getUserLocation, isHome]);

  // Render city item for FlatList
  const renderCityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => onCitySelect(item)}
    >
      <Text style={styles.cityText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {isLoadingLocation
            ? "Getting location..."
            : selected.name || "Select City"}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setSearchText("");
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search City"
              value={searchText}
              onChangeText={handleSearchChange}
              autoCapitalize="words"
            />

            <FlatList
              data={filteredCities}
              renderItem={renderCityItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.cityList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 64,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb", // Lighter border
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1f2937", // Darker text
    flex: 1,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 22,
    color: "#9ca3af",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    color: "#1f2937",
  },
  cityList: {
    maxHeight: 300,
  },
  cityItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cityText: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  },
});

export default RegionDropdown;