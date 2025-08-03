// import React, { useEffect, useRef, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   FlatList,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import { handleGetCitites } from "@/services/get_methods";
// import { useRouter } from "expo-router";

// const RegionDropdown = ({ OnSelectRegion, isHome = false }) => {
//   const [selected, setSelected] = useState({ id: "", name: "" });
//   const [cities, setCities] = useState([]);
//   const [filteredCities, setFilteredCities] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [isFetching, setIsFetching] = useState(false);
//   const [isLoadingLocation, setIsLoadingLocation] = useState(false);

//   const hasRequestedLocation = useRef(false);

//   const router = useRouter();

//   // Function to handle city selection
//   const onCitySelect = async (city) => {
//     setSelected(city);
//     try {
//       await AsyncStorage.setItem("region", JSON.stringify(city));
//       setIsModalVisible(false);
//       setSearchText("");
//       if (isHome) {
//         OnSelectRegion();
//       } else {
//         router.replace('/(customer)');
//       }
//     } catch (error) {
//       console.error("Error saving region to AsyncStorage:", error);
//     }
//   };

//   // Function to handle search input change
//   const handleSearchChange = (text) => {
//     setSearchText(text);
//     if (text.trim() === "") {
//       setFilteredCities(cities);
//     } else {
//       const filtered = cities.filter((city) =>
//         city.name.toLowerCase().includes(text.toLowerCase())
//       );
//       setFilteredCities(filtered);
//     }
//   };

//   // Function to fetch cities from the backend
//   const fetchCities = async () => {
//     try {
//       if (isFetching) return;
//       setIsFetching(true);
//       const response = await handleGetCitites();
//       // Sort cities alphabetically
//       const sortedData = response.sort((a, b) => a.name.localeCompare(b.name));
//       setCities(sortedData);
//       setFilteredCities(sortedData);
//     } catch (error) {
//       console.error("Error fetching cities:", error);
//       Alert.alert("Error", "Failed to fetch cities. Please try again.");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   // Function to get city from coordinates using reverse geocoding
//   const getCityFromCoordinates = async (latitude, longitude) => {
//     try {
//       const reverseGeocode = await Location.reverseGeocodeAsync({
//         latitude,
//         longitude,
//       });

//       if (reverseGeocode.length > 0) {
//         const location = reverseGeocode[0];
//         const cityName = location.city || location.subregion || location.region;
        
//         if (cityName) {
//           // Find matching city in your cities list (case-insensitive)
//           const selectedCity = cities.find(
//             (c) => c.name.toLowerCase() === cityName.toLowerCase()
//           );
          
//           if (selectedCity) {
//             await onCitySelect(selectedCity);
//             return true;
//           }
//         }
//       }
//       return false;
//     } catch (error) {
//       console.error("Error reverse geocoding:", error);
//       return false;
//     }
//   };

//   // Function to get user's current location
//   const getUserLocation = useCallback(async () => {
//     try {
//       setIsLoadingLocation(true);
      
//       // Request permission
//       const { status } = await Location.requestForegroundPermissionsAsync();
      
//       if (status !== "granted") {
//         console.log("Permission to access location was denied");
//         selectDefaultCity();
//         return;
//       }

//       // Get current position
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       const { latitude, longitude } = location.coords;
      
//       // Try to get city from coordinates
//       const success = await getCityFromCoordinates(latitude, longitude);
      
//       if (!success) {
//         selectDefaultCity();
//       }
//     } catch (error) {
//       console.error("Error getting location:", error);
//       selectDefaultCity();
//     } finally {
//       setIsLoadingLocation(false);
//     }
//   }, [cities]);

//   // Function to select default city (Karachi)
//   const selectDefaultCity = async () => {
//     const defaultCity = cities.find((c) => c.name.toLowerCase() === "karachi");
//     if (defaultCity) {
//       await onCitySelect(defaultCity);
//     }
//   };

//   // Load cities on component mount
//   useEffect(() => {
//     fetchCities();
//   }, []);

//   // Set selected city based on AsyncStorage or user location
//   useEffect(() => {
//     const initializeRegion = async () => {
//       if (cities.length > 0) {
//         try {
//           const storedRegion = await AsyncStorage.getItem("region");
          
//           if (storedRegion) {
//             const parsed = JSON.parse(storedRegion);
//             const selectedCity = cities.find(
//               (c) =>
//                 c.id === parsed.id &&
//                 c.name.toLowerCase() === parsed.name.toLowerCase()
//             );

//             if (selectedCity) {
//               setSelected(parsed);
//             } else {
//               // Remove invalid stored region
//               await AsyncStorage.removeItem("region");
//               if (!hasRequestedLocation.current) {
//                 hasRequestedLocation.current = true;
//                 getUserLocation();
//               }
//             }
//           } else if (!hasRequestedLocation.current) {
//             hasRequestedLocation.current = true;
//             getUserLocation();
//           }
//         } catch (error) {
//           console.error("Error reading from AsyncStorage:", error);
//         }
//       }
//     };

//     initializeRegion();
//   }, [cities, getUserLocation]);

//   // Render city item for FlatList
//   const renderCityItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.cityItem}
//       onPress={() => onCitySelect(item)}
//     >
//       <Text style={styles.cityText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={styles.dropdown}
//         onPress={() => setIsModalVisible(true)}
//       >
//         <Text style={styles.dropdownText}>
//           {isLoadingLocation
//             ? "Getting location..."
//             : selected.name || "Select City"}
//         </Text>
//         <Text style={styles.arrow}>▼</Text>
//       </TouchableOpacity>

//       <Modal
//         visible={isModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select City</Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => {
//                   setIsModalVisible(false);
//                   setSearchText("");
//                 }}
//               >
//                 <Text style={styles.closeButtonText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search City"
//               value={searchText}
//               onChangeText={handleSearchChange}
//               autoCapitalize="words"
//             />

//             <FlatList
//               data={filteredCities}
//               renderItem={renderCityItem}
//               keyExtractor={(item) => item.id.toString()}
//               style={styles.cityList}
//               showsVerticalScrollIndicator={false}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     marginTop: 64,
//   },
//   dropdown: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#a0a3a7",
//     borderRadius: 6,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "white",
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: "#374151",
//     flex: 1,
//   },
//   arrow: {
//     fontSize: 12,
//     color: "#6b7280",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 20,
//     width: "90%",
//     maxHeight: "80%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1f2937",
//   },
//   closeButton: {
//     padding: 4,
//   },
//   closeButtonText: {
//     fontSize: 18,
//     color: "#6b7280",
//   },
//   searchInput: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   cityList: {
//     maxHeight: 300,
//   },
//   cityItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f3f4f6",
//   },
//   cityText: {
//     fontSize: 14,
//     color: "#374151",
//     fontWeight: "500",
//   },
// });

// export default RegionDropdown;



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
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const hasRequestedLocation = useRef(false);

  const router = useRouter();

  // Function to handle city selection
  const onCitySelect = async (city, isAuto = false) => {
    setSelected(city);
    try {
      await AsyncStorage.setItem("region", JSON.stringify(city));
      setIsModalVisible(false);
      setSearchText("");
      if (isHome && !isAuto) {
        OnSelectRegion();
      } else {
        router.replace('/(customer)');
      }
    } catch (error) {
      console.error("Error saving region to AsyncStorage:", error);
    }
  };


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

  // Function to fetch cities from the backend
  const fetchCities = async () => {
    try {
      if (isFetching) return;
      setIsFetching(true);
      const response = await handleGetCitites();
      // Sort cities alphabetically
      const sortedData = response.sort((a, b) => a.name.localeCompare(b.name));
      setCities(sortedData);
      setFilteredCities(sortedData);
    } catch (error) {
      console.error("Error fetching cities:", error);
      Alert.alert("Error", "Failed to fetch cities. Please try again.");
    } finally {
      setIsFetching(false);
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
  }, [cities, getUserLocation]);

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
    borderColor: "#a0a3a7",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  dropdownText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6b7280",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  cityList: {
    maxHeight: 300,
  },
  cityItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cityText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
});

export default RegionDropdown;