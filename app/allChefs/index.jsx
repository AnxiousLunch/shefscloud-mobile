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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { handleGetAllChefs } from "@/services/get_methods";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 16*3 = 48 (padding + gap)

const ChefCard = ({ chef, index }) => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fce7f3", "#b91c1c"]
  });

  return (
    <Pressable
      onPress={() => router.navigate(`/chefProfile/${chef.id}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        styles.card,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }]
        }
      ]}>
        <Animated.View style={[styles.topBorder, { backgroundColor: borderColor }]} />
        
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
                {`${chef.first_name} ${chef.last_name}`}
              </Text>
              <Text style={styles.chefTitle}>Professional Chef</Text>
            </View>
            
            <Animated.View style={[styles.arrow, { opacity: borderAnim }]}>
              <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const AllChef = () => {
  const [chefs, setChefs] = useState([]);
  const navigation = useNavigation();
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Chefs</Text>
      </View>
      <View style={styles.container}>
        
        <View style={styles.content}>
          <FlatList
            data={chefs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <ChefCard chef={item} index={index} />
            )}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
          />
        </View>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8",
  },
  titleUnderline: {
    height: 2,
    backgroundColor: "#e5e7eb",
    marginTop: 4,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topBorder: {
    height: 3,
    width: "100%",
  },
  cardContent: {
    padding: 16,
  },
  chefInfoContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  chefImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 12,
  },
  chefInfo: {
    flex: 1,
    alignItems: "center",
  },
  chefName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  chefTitle: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
  arrow: {
    opacity: 0.5,
    marginTop: 8,
  },
  
});

export default AllChef;