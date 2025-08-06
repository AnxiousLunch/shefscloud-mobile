import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, Image, TouchableOpacity, Alert, View, ScrollView } from "react-native";
import { handleGetCategorizeDishesOfCity } from "@/services/get_methods";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet } from "react-native";
import { Dish } from "@/types/types";
import { useNavigation } from "expo-router";
import isValidURL from '@/components/ValidateURL'


export default function FoodCategoryDetails() {
  const router = useRouter();
  const {categoryId} = useLocalSearchParams();
  console.log("Category ID", categoryId);
  console.log("Type of category id", typeof(categoryId));
  const [categoryDishes, setCategoryDishes] = useState<Dish[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (categoryId) {
      (async () => {
        try {
          setIsFetching(true);
          const cityString = await AsyncStorage.getItem("region");
          if (!cityString) {
            Alert.alert("City not set");
            return;
          }
          const city = JSON.parse(cityString);
          const foodTypeId = categoryId;
          const response: Dish[] = await handleGetCategorizeDishesOfCity(
            foodTypeId,
            city.id
          );
          // console.log("Categorize dish response ", response);
          // const categorize = response.filter(
          //   (dish) => dish.food_type_id === parseInt(foodCategoryId)
          // );
          // console.log("categorize dish", categoryDishes);
          const userString = await AsyncStorage.getItem("user");
          if (!userString) {
            Alert.alert("No user logged in");
            return;
        }
          const currentUser = JSON.parse(userString);
          let filteredDishes = response;
          if (currentUser && currentUser.id) {
            filteredDishes = response.filter(dish => dish.user_id !== currentUser.id);
          }
          setCategoryDishes(filteredDishes);
        } catch (error) {
          console.error(error);
        } finally {
          setIsFetching(false);
        }
      })();
    }
  }, [categoryId]);

    return (
        <View style={styles.Container}>
          <ScrollView>
            {categoryDishes.map((dish) => (
              <View key={dish.id} style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri: isValidURL(dish.logo)
                        ? dish.logo
                        : 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg',
                    }}
                    style={styles.mainImage}
                  />
                  <TouchableOpacity
                    style={styles.chefContainer}
                    onPress={() => Alert.alert("Coming Soon!")}
                  >
                    <Image
                      source={{
                        uri: isValidURL(dish?.user?.profile_pic)
                          ? dish.user.profile_pic
                          : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                      }}
                      style={styles.chefImage}
                    />
                    <View>
                      <Text style={styles.chefName}>
                        {dish?.user?.first_name} {dish?.user?.last_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(foodDetails)/${dish.id}`)}
                  >
                    <Text style={styles.dishName}>{dish.name}</Text>
                  </TouchableOpacity>

                  <View style={styles.ratingPriceRow}>
                    <View style={styles.ratingBox}>
                      <Text style={styles.ratingText}>
                        {dish?.average_rating
                          ? dish.average_rating
                          : 0}{' '}
                        ({dish?.total_reviews})
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.price}>
                        {(
                          dish.chef_earning_fee +
                          dish.platform_price +
                          dish.delivery_price
                        ).toLocaleString('en-PK', {
                          style: 'currency',
                          currency: 'PKR',
                        })}
                      </Text>
                      {dish?.auto_applied_active_discounts?.length > 0 && (
                        <Text style={styles.discountText}>
                          [
                          {dish.auto_applied_active_discounts[0].discount_type === '$'
                            ? dish.auto_applied_active_discounts[0].discount.toLocaleString('en-PK', {
                                style: 'currency',
                                currency: 'PKR',
                              })
                            : (
                                dish.chef_earning_fee *
                                (dish.auto_applied_active_discounts[0].discount / 100)
                              ).toLocaleString('en-PK', {
                                style: 'currency',
                                currency: 'PKR',
                              })}
                          <Text style={{ fontSize: 10 }}> Off</Text> ]
                        </Text>
                      )}
                    </View>
                  </View>

                </View>
              </View>
            ))}
          </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  Container: {
    marginTop: 16,
  },
  noDishesContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noDishesText: {
    fontWeight: '600',
    fontSize: 18,
    color: '#666',
  },
  card: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    marginHorizontal: 32,
    marginVertical: 32,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  chefContainer: {
    position: 'absolute',
    bottom: -30,
    left: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    elevation: 4,
  },
  chefImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  chefName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
    paddingTop: 36,
  },
  dishName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  ratingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBox: {
    backgroundColor: '#ffc00047',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  discountText: {
    fontSize: 13,
    color: 'green',
    marginTop: 2,
  },
  availabilityContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 8,
  },
  availabilityLabel: {
    fontSize: 10,
    color: '#666',
  },
  availabilityRow: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  dayCircleActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  dayTextActive: {
    color: '#fff',
  },
  detailButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: '#f43f5e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});