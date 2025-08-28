// ChefDetailScreen.tsx - Updated with gradient header and improved design
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
  Platform,
  ScrollView
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
        <ActivityIndicator size="large" color="#dc2626" />
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
    <View>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.dishesTitle}>MAIN ITEMS</Text>
      </View>
      <FlatList
        data={dishes}
        keyExtractor={(dish) => `dish_${dish.id}`}
        renderItem={({ item }) => <DishItem dish={item} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
        scrollEnabled={false} // so main FlatList handles scroll
      />
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
      {/* Updated Header with Gradient */}
      <LinearGradient
        colors={['#dc2626', '#dc2626']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {chefAndDishes ? `${chefAndDishes.first_name} ${chefAndDishes.last_name}` : 'Chef'}
          </Text>
          <View style={styles.rightPlaceholder} />
        </View>
      </LinearGradient>
      
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
              <Ionicons name="restaurant" size={16} color="#dc2626" />
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
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysScrollContainer}
      >
        {days.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.dayButton,
              sortingWithDays === item.value && styles.activeDayButton,
            ]}
            onPress={() => setSortingWithDays(item.value)}
          >
            <Text style={[
              styles.dayText,
              sortingWithDays === item.value && styles.activeDayText
            ]}>
              {item.name}
            </Text>
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotScrollContainer}
        >
          {timeSlots.map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlotButton,
                sortingWithSlot === slot.id && styles.activeTimeSlot
              ]}
              onPress={() => setSortingWithSlot(sortingWithSlot === slot.id ? "" : slot.id)}
            >
              <Text style={sortingWithSlot === slot.id && styles.activeTimeSlotText}>
                {slot.time_start} - {slot.time_end}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
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
            <Ionicons name="person" size={20} color="#9ca3af" />
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
                  <Ionicons name="person" size={16} color="#9ca3af" />
                </View>
              )}
              
              <View style={styles.replyContent}>
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
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  rightPlaceholder: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
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
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  statText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  bioText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12
  },
  certifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  certifiedText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#d97706',
    fontWeight: '600',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151'
  },
  daysScrollContainer: {
    paddingBottom: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  activeDayButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626'
  },
  dayText: {
    fontWeight: '500',
    color: '#6b7280'
  },
  activeDayText: {
    color: '#fff',
    fontWeight: '600'
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  resetText: {
    color: '#dc2626',
    fontWeight: '600'
  },
  timeSlotContainer: {
    marginTop: 16
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151'
  },
  timeSlotScrollContainer: {
    paddingBottom: 8,
  },
  timeSlotButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  activeTimeSlot: {
    borderColor: '#dc2626',
    backgroundColor: '#dc2626'
  },
  activeTimeSlotText: {
    color: '#fff'
  },
  dishesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginVertical: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  dishCard: {
    margin: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    width: '45%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dishImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    color: '#1f2937',
  },
  ratingContainer: {
    marginVertical: 6
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
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
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  reviewInfo: {
    marginLeft: 12
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8
  },
  readMore: {
    color: '#dc2626',
    fontWeight: '600'
  },
  viewReplies: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  smallAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  replyContent: {
    flex: 1,
  },
  replyText: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  replyInfo: {
    fontSize: 11,
    color: '#9ca3af'
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
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
});

export default ChefDetailScreen;