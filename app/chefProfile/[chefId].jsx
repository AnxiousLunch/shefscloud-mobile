// ChefDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { handleGetChefWithDishes } from "@/services/get_methods";
import { handleChefPostReview, handleGetAllReview } from "@/services/order";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/types/types";
import isValidURL from "@/components/ValidateURL";
import StarRating from "@/components/StarRating";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ChefDetailScreen = () => {
  const route = useRoute();
  const { chefId } = route.params;
  const { authToken } = useSelector((state) => state.user);
  const [chefAndDishes, setChefAndDishes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [expandedReviews, setExpandedReviews] = useState({});
  const router = useRouter();

  // Fetch chef data
  useEffect(() => {
    const fetchChefData = async () => {
      try {
        const cityData = await AsyncStorage.getItem("region");
        const city = cityData ? JSON.parse(cityData) : null;
        
        if (!city || !city.id) {
          Alert.alert("Error", "Location not set");
          return;
        }

        const response = await handleGetChefWithDishes(chefId, city.id);
        setChefAndDishes(response);
      } catch (error) {
        console.error(error);
        if (error.message !== "Request failed with status code 404") {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert("Error", "Chef not found in this city");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChefData();
  }, [chefId]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!authToken) return;
      
      try {
        const response = await handleGetAllReview(authToken, chefId);
        setReviews(response.data.original.data.data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load reviews");
      }
    };

    fetchReviews();
  }, [chefId, authToken]);

  const toggleReadMore = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const toggleReplies = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [`replies_${reviewId}`]: !prev[`replies_${reviewId}`]
    }));
  };

  const handlePostFeedback = async () => {
    if (!feedbackMessage.trim()) {
      Alert.alert("Error", "Please type some feedback");
      return;
    }

    try {
      await handleChefPostReview(authToken, chefId, feedbackMessage);
      setFeedbackMessage("");
      Alert.alert("Success", "Review posted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to post review");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!chefAndDishes) {
    return (
      <View style={styles.centered}>
        <Text>Chef not found</Text>
      </View>
    );
  }
  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <ChefContent chefAndDishes={chefAndDishes} />
        <FilterAndDate chefAndDishes={chefAndDishes} />
        
        <View style={styles.reviewsContainer}>
          <Text style={styles.sectionTitle}>REVIEWS</Text>
          
          <View style={styles.reviewsScrollContainer}>
            {reviews.length > 0 ? (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    {review.user_menu?.user?.profile_pic ? (
                      <Image 
                        source={{ uri: review.user_menu.user.profile_pic }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text>N/A</Text>
                      </View>
                    )}
                    
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewerName}>
                        {review?.user_menu?.user?.first_name} {review?.user_menu?.user?.last_name}
                      </Text>
                      <StarRating 
                        rating={review?.user_menu?.average_rating || 0} 
                        reviewCount={review?.user_menu?.total_reviews || 0}
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.reviewText}>
                    {expandedReviews[review.id] 
                      ? review.review 
                      : (review.review?.slice(0, 150) || "No message provided")}
                    {review.review?.length > 150 && (
                      <Text 
                        style={styles.readMore} 
                        onPress={() => toggleReadMore(review.id)}
                      >
                        {expandedReviews[review.id] ? " Read Less" : " Read More"}
                      </Text>
                    )}
                  </Text>
                  
                  {review.replies.length > 0 && (
                    <TouchableOpacity onPress={() => toggleReplies(review.id)}>
                      <Text style={styles.viewReplies}>
                        {expandedReviews[`replies_${review.id}`]
                          ? "Hide Replies"
                          : `View Replies (${review.replies.length})`}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {expandedReviews[`replies_${review.id}`] && (
                    <View style={styles.repliesContainer}>
                      {review.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyCard}>
                          {reply.user?.profile_pic ? (
                            <Image 
                              source={{ uri: reply.user.profile_pic }}
                              style={styles.smallAvatar}
                            />
                          ) : (
                            <View style={styles.smallAvatarPlaceholder}>
                              <Text style={styles.smallText}>N/A</Text>
                            </View>
                          )}
                          
                          <View>
                            <Text style={styles.replyText}>{reply.reply}</Text>
                            <Text style={styles.replyInfo}>
                              By: {reply.user.first_name} {reply.user.last_name}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noReviews}>
                <Text style={styles.noReviewsText}>No Reviews Available</Text>
              </View>
            )}
          </View>
          
          <View style={styles.feedbackContainer}>
            <TextInput
              style={styles.feedbackInput}
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              placeholder="Write your feedback..."
              multiline
            />
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handlePostFeedback}
            >
              <Text style={styles.buttonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ChefContent.tsx
const ChefContent = ({ chefAndDishes }) => {
  return (
    <View style={styles.chefContainer}>
      <Image 
        source={{ 
          uri: chefAndDishes.cover_pic && isValidURL(chefAndDishes.cover_pic) 
            ? chefAndDishes.cover_pic 
            : 'https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg'
        }}
        style={styles.coverImage}
      />
      
      <View style={styles.profileContainer}>
        <Image 
          source={{ 
            uri: chefAndDishes.profile_pic && isValidURL(chefAndDishes.profile_pic) 
              ? chefAndDishes.profile_pic 
              : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
          }}
          style={styles.profileImage}
        />
        
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.chefName}>
              {chefAndDishes.first_name} {chefAndDishes.last_name}
            </Text>
            {chefAndDishes.email_verified_at && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>{chefAndDishes.menus?.length} Dishes</Text>
            </View>
          </View>
          
          <Text style={styles.bioText}>
            {chefAndDishes.bio === ""? chefAndDishes.bio : 'Bio Unavailable'}
          </Text>
          
          {chefAndDishes.food_handle_certificate && (
            <View style={styles.certifiedBadge}>
              <Text style={styles.certifiedText}>Certified</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// FilterAndDate.tsx
const FilterAndDate = ({ chefAndDishes }) => {
  const [sortingWithDays, setSortingWithDays] = useState("");
  const [sortingWithSlot, setSortingWithSlot] = useState("");
  const [dishes, setDishes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    // Filter dishes based on selected day and time slot
    const filteredDishes = chefAndDishes?.menus
      ?.filter((menu) => menu.is_live === 1)
      ?.filter((dish) => {
        const dayMatch = !sortingWithDays || dish[sortingWithDays.toLowerCase()] === 1;
        const slotMatch = !sortingWithSlot || dish.availability_time_slots?.some(
          (slot) => sortingWithSlot === slot.availability_time_slots_id
        );
        return dayMatch && slotMatch;
      }) || [];
    
    setDishes(filteredDishes);
  }, [chefAndDishes, sortingWithDays, sortingWithSlot]);

  // Fetch time slots (simplified)
  useEffect(() => {
    // This would normally be an API call
    const mockTimeSlots = [
      { id: 1, time_start: "09:00", time_end: "12:00" },
      { id: 2, time_start: "12:00", time_end: "15:00" },
      { id: 3, time_start: "15:00", time_end: "18:00" },
    ];
    setTimeSlots(mockTimeSlots);
  }, []);

  const days = [
    { name: "Mon", value: "is_monday" },
    { name: "Tue", value: "is_tuesday" },
    { name: "Wed", value: "is_wednesday" },
    { name: "Thu", value: "is_thursday" },
    { name: "Fri", value: "is_friday" },
    { name: "Sat", value: "is_saturday" },
    { name: "Sun", value: "is_sunday" },
  ];

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Select Delivery Day</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayButton,
              sortingWithDays === day.value && styles.activeDayButton
            ]}
            onPress={() => setSortingWithDays(day.value)}
          >
            <Text style={styles.dayText}>{day.name}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setSortingWithDays("")}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.timeSlotContainer}>
        <Text style={styles.timeSlotLabel}>Delivery Time</Text>
        <View style={styles.pickerContainer}>
          {timeSlots.map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlotButton,
                sortingWithSlot === slot.id && styles.activeTimeSlot
              ]}
              onPress={() => setSortingWithSlot(slot.id)}
            >
              <Text>{slot.time_start} - {slot.time_end}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <Text style={styles.dishesTitle}>MAIN ITEMS</Text>
      
      <FlatList
        data={dishes}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.dishCard}>
            <Image 
              source={{ 
                uri: item.logo && isValidURL(item.logo) 
                  ? item.logo 
                  : 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg'
              }}
              style={styles.dishImage}
            />
            <Text style={styles.dishName}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <StarRating 
                rating={item.average_rating || 0} 
                reviewCount={item.total_reviews || 0}
              />
            </View>
            <Text style={styles.dishPrice}>
              {calculateTotalPrice(item).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noDishes}>
            <Text>No dishes available</Text>
          </View>
        }
      />
    </View>
  );
};

// Helper function
const calculateTotalPrice = (dish) => {
  return dish.chef_earning_fee + dish.platform_price + dish.delivery_price;
};


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chefContainer: {
    padding: 16
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 16
  },
  profileContainer: {
    flexDirection: 'row',
    marginTop: -60,
    paddingHorizontal: 8
  },
  profileImage: {
    width: 100,
    height: 150,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff'
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  chefName: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  verifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center'
  },
  verifiedText: {
    fontSize: 12,
    marginLeft: 4
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 8
  },
  statBadge: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
    alignItems: 'center'
  },
  statText: {
    fontSize: 12,
    marginLeft: 4
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  certifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  certifiedText: {
    fontSize: 12,
    marginLeft: 4
  },
  filterContainer: {
    padding: 16
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666'
  },
  dayButton: {
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8
  },
  activeDayButton: {
    backgroundColor: '#f02444',
    borderColor: '#f02444'
  },
  dayText: {
    fontWeight: 'bold',
    color: '#777'
  },
  resetButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#f02444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resetText: {
    color: '#f02444',
    fontWeight: 'bold'
  },
  timeSlotContainer: {
    marginTop: 16
  },
  timeSlotLabel: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
    fontSize: 12,
    color: '#666'
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  timeSlotButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },
  activeTimeSlot: {
    borderColor: '#f02444',
    backgroundColor: '#f0244420'
  },
  dishesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginVertical: 16
  },
  dishCard: {
    flex: 1,
    margin: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8
  },
  dishImage: {
    width: '100%',
    height: 120,
    borderRadius: 8
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8
  },
  ratingContainer: {
    marginVertical: 4
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f02444'
  },
  noDishes: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  reviewsContainer: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 16
  },
  reviewsScrollContainer: {
    maxHeight: 300
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  reviewInfo: {
    marginLeft: 12
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  reviewText: {
    fontSize: 14,
    marginBottom: 8
  },
  readMore: {
    color: '#1e90ff',
    fontWeight: 'bold'
  },
  viewReplies: {
    color: '#1e90ff',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginBottom: 8
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8
  },
  smallAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  smallText: {
    fontSize: 10
  },
  replyText: {
    fontSize: 14,
    flex: 1
  },
  replyInfo: {
    fontSize: 12,
    color: '#666'
  },
  noReviews: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666'
  },
  feedbackContainer: {
    marginTop: 16
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#f02444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default ChefDetailScreen;