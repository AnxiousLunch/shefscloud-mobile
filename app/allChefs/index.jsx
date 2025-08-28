import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Animated,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { handleGetAllChefs } from "@/services/get_methods";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; 

const ChefCard = ({ chef, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    const delay = index * 120;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => router.navigate(`/chefProfile/${chef.id}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: translateYAnim }, { scale: scaleAnim }] },
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.chefInfoContainer}>
            <Image
              source={
                chef.profile_pic 
                  ? { uri: chef.profile_pic } 
                  : require("../../assets/default-profile.png")
              }
              style={styles.chefImage}
            />
            <View style={styles.chefInfo}>
              <Text style={styles.chefName}>
                {`${chef.first_name} `}
              </Text>
              <Text style={styles.chefTitle}>Professional Chef</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#DC2626" style={{ marginTop: 6 }} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const AllChef = () => {
  const [chefs, setChefs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const regionString = await AsyncStorage.getItem("region");
        if (!regionString) return;
        const city = JSON.parse(regionString);
        const response = await handleGetAllChefs(city.id);
        setChefs(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchChefs();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Status bar color same as header */}
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      <LinearGradient colors={["#DC2626", "#B91C1C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#DC2626" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Chefs</Text>
          <View style={styles.rightSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <FlatList
          data={chefs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <ChefCard chef={item} index={index} />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  rightSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
    card: {
    width: CARD_WIDTH,
    height: 200, // 🔥 fixed uniform height
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flex: 1,              // 🔥 takes full space
    justifyContent: "center", // centers content vertically
    alignItems: "center",
    padding: 16,
  },
  chefInfoContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center", // 🔥 keeps image+text centered
  },
  chefImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  chefInfo: {
    alignItems: "center",
  },
  chefName: {
  fontWeight: "700",
  fontSize: 15,
  color: "#111827",
  marginBottom: 4,
  textAlign: "center",
  maxWidth: "90%",  // 🔥 prevents overflow
},
  chefTitle: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
  },
});

export default AllChef;
