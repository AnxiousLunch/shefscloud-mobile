// ChefDetailScreen.tsx - Fixed visibility and contrast issues
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { handleGetChefWithDishes } from "@/services/get_methods";
import { handleChefPostReview, handleGetAllReview } from "@/services/order";
import AsyncStorage from "@react-native-async-storage/async-storage";
import isValidURL from "@/components/ValidateURL";
import StarRating from "@/components/StarRating";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ChefDetailScreen = () => {
  const route = useRoute();
  const { chefId } = route.params;
  const { authToken } = useSelector((state) => state.user);
  const [chefAndDishes, setChefAndDishes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [expandedReviews, setExpandedReviews] = useState({});
  const [dishes, setDishes] = useState([]);
  const [sortingWithDays, setSortingWithDays] = useState("");
  const [sortingWithSlot, setSortingWithSlot] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
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

  // Filter dishes based on selected day and time slot
  useEffect(() => {
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

  // Fetch time slots
  useEffect(() => {
    const mockTimeSlots = [
      { id: 1, time_start: "09:00", time_end: "12:00" },
      { id: 2, time_start: "12:00", time_end: "15:00" },
      { id: 3, time_start: "15:00", time_end: "18:00" },
    ];
    setTimeSlots(mockTimeSlots);
  }, []);

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

  const handleBackPress = () => {
    router.back();
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

  // Prepare data for FlatList - create sections
  const flatListData = [
    { type: 'chef', data: chefAndDishes },
    { type: 'filters', data: { sortingWithDays, setSortingWithDays, sortingWithSlot, setSortingWithSlot, timeSlots } },
    { type: 'dishes_header' },
    ...dishes.map(dish => ({ type: 'dish', data: dish })),
    { type: 'reviews_header' },
    ...reviews.map(review => ({ type: 'review', data: review })),
    { type: 'feedback_form' }
  ];

  const renderItem = ({ item, index }) => {
    switch (item.type) {
      case 'chef':
        return <ChefContent chefAndDishes={item.data} />;
      
      case 'filters':
        return <FilterSection {...item.data} />;
      
      case 'dishes_header':
        return (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.dishesTitle}>MAIN ITEMS</Text>
          </View>
        );
      
      case 'dish':
        return <DishItem dish={item.data} isEven={index % 2 === 0} />;
      
      case 'reviews_header':
        return (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>REVIEWS</Text>
          </View>
        );
      
      case 'review':
        return (
          <ReviewItem 
            review={item.data}
            expandedReviews={expandedReviews}
            toggleReadMore={toggleReadMore}
            toggleReplies={toggleReplies}
          />
        );
      
      case 'feedback_form':
        return (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>Write Your Review</Text>
            <TextInput
              style={styles.feedbackInput}
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              placeholder="Share your experience with this chef..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handlePostFeedback}
            >
              <Text style={styles.buttonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={flatListData}
          keyExtractor={(item, index) => `${item.type}_${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Separate components for better organization
const ChefContent = ({ chefAndDishes }) => {
  return (
    <View style={styles.chefContainer}>
      <View style={styles.coverContainer}>
        <Image 
          source={{ 
            uri: chefAndDishes.cover_pic && isValidURL(chefAndDishes.cover_pic) 
              ? chefAndDishes.cover_pic 
              : 'https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg'
          }}
          style={styles.coverImage}
        />
        {/* Dark overlay for better text contrast */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.coverGradient}
        />
        
        {/* Chef name overlay on cover image */}
        <View style={styles.chefNameOverlay}>
          <Text style={styles.chefNameText}>
            {chefAndDishes.first_name} {chefAndDishes.last_name}
          </Text>
          {chefAndDishes.email_verified_at && (
            <View style={styles.verifiedBadgeOverlay}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
              <Text style={styles.verifiedTextOverlay}>Verified</Text>
            </View>
          )}
        </View>
      </View>
      
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
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>{chefAndDishes.menus?.length || 0} Dishes</Text>
            </View>
          </View>
          
          <Text style={styles.bioText}>
            {chefAndDishes.bio || 'Bio Unavailable'}
          </Text>
          
          {chefAndDishes.food_handle_certificate && (
            <View style={styles.certifiedBadge}>
              <Ionicons name="certificate" size={16} color="#f59e0b" />
              <Text style={styles.certifiedText}>Certified</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const FilterSection = ({ sortingWithDays, setSortingWithDays, sortingWithSlot, setSortingWithSlot, timeSlots }) => {
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
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[...days, { name: "Reset", value: "reset" }]}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dayButton,
              sortingWithDays === item.value && styles.activeDayButton,
              item.value === "reset" && styles.resetButton
            ]}
            onPress={() => setSortingWithDays(item.value === "reset" ? "" : item.value)}
          >
            <Text style={[
              styles.dayText,
              item.value === "reset" && styles.resetText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      
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
    </View>
  );
};

const DishItem = ({ dish }) => {
  return (
    <View style={styles.dishCard}>
      <Image 
        source={{ 
          uri: dish.logo && isValidURL(dish.logo) 
            ? dish.logo 
            : 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg'
        }}
        style={styles.dishImage}
      />
      <Text style={styles.dishName}>{dish.name}</Text>
      <View style={styles.ratingContainer}>
        <StarRating 
          rating={dish.average_rating || 0} 
          reviewCount={dish.total_reviews || 0}
        />
      </View>
      <Text style={styles.dishPrice}>
        {calculateTotalPrice(dish).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })}
      </Text>
    </View>
  );
};

const ReviewItem = ({ review, expandedReviews, toggleReadMore, toggleReplies }) => {
  return (
    <View style={styles.reviewCard}>
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
  );
};

// Helper function
const calculateTotalPrice = (dish) => {
  return dish.chef_earning_fee + dish.platform_price + dish.delivery_price;
};

// Updated Styles
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
  keyboardAvoid: {
    flex: 1,
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
  flatListContent: {
    paddingBottom: 20,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chefContainer: {
    padding: 16
  },
  coverContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderRadius: 16,
  },
  chefNameOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  chefNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  verifiedBadgeOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  verifiedTextOverlay: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '600',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 100,
    height: 120,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff'
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12
  },
  statBadge: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center'
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  bioText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12
  },
  certifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  certifiedText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#92400e',
    fontWeight: '600',
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
    margin: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    width: '45%'
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 16
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
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
  feedbackContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    maxHeight: 150,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
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
  },
});

export default ChefDetailScreen;