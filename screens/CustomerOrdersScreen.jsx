import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import moment from "moment";
import { AntDesign, MaterialIcons, Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";



// Services
import {
  handleChangeOrderStatus,
  handleGetOrders,
  handleChefPostReview,
  handleGetAllUserReview,
  handleOrderReviewAndRating,
} from "@/services/order";

import { handleGetDefaultSetting } from "@/services/default_setting";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomerOrdersScreen = () => {
  const router = useRouter();
  const { userInfo, authToken } = useSelector((state) => state.user);
  const [defaultSettings, setDefaultSettings] = useState([]);
  const [refetchOrder, setRefetchOrder] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = orderDetails.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(orderDetails.length / rowsPerPage);
  const [error, setError] = useState({ rating: "", review: "" });
  const [reviewAndRating, setReviewAndRating] = useState({
    order_id: null,
    rating: 0,
    review: "",
    order_code: null,
    dish_name: null,
    created_at: null,
  });
  const handleBackPress = useCallback(() => {
        router.back();
      }, [router]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(null);

  // Haptic feedback helper
  const triggerHaptic = (type = "light") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle status change
  const handleStatusChange = async (id) => {
    triggerHaptic("medium");
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const ordersRetrieved = await handleChangeOrderStatus(
                authToken,
                { status: "canceled" },
                id
              );
              
              if (ordersRetrieved.success) {
                Toast.show({
                  type: "success",
                  text1: "Order Canceled!",
                });
                setRefetchOrder((prev) => !prev);
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Failed to cancel order",
              });
            }
          }
        }
      ]
    );
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsFetching(true);
        const ordersRetrieved = await handleGetOrders(authToken, {
          user_id: userInfo?.id,
        });

        const mappedOrderDetails = ordersRetrieved.reduce((acc, order) => {
          const details = order.order_details.map((detail) => ({
            order_id: order.order_code,
            id: order.id,
            dish_name: detail.name,
            quantity: detail.quantity,
            spice_level: detail.user_menu.spice_level?.name,
            portion_size: detail.user_menu.portion_size,
            reviews: order?.reviews,
            created_at: order?.created_at,
            status: order?.status
              ? order?.status.charAt(0).toUpperCase() + order?.status.slice(1)
              : "",
            delivery_time: order?.delivery_time,
            delivery_slot: order?.delivery_slot,
            totalPrice: (
              detail?.delivery_price +
              detail?.platform_price -
              order?.discount_price +
              order?.tip_price +
              detail?.unit_price * detail.quantity
            ).toFixed(2),
          }));
          return acc.concat(details);
        }, []);

        setOrderDetails(mappedOrderDetails);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error fetching orders",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [authToken, refetchOrder, userInfo]);

  // Fetch default settings
  useEffect(() => {
    const getDefaultSettings = async () => {
      try {
        const retrieveDefaultSettings = await handleGetDefaultSetting(authToken);
        setDefaultSettings(retrieveDefaultSettings);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error fetching settings",
        });
      }
    };
    getDefaultSettings();
  }, [authToken]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await handleGetAllUserReview(authToken);
        setReviews(response.data.data.original.data.reviews);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error fetching reviews",
        });
      }
    };
    fetchReviews();
  }, [authToken]);

  // Handle review change
  const handleReviewChange = (text) => {
    setReviewAndRating((prev) => ({
      ...prev,
      review: text,
    }));

    if (error.review) {
      setError((prev) => ({ ...prev, review: "" }));
    }
  };

  // Handle rating change
  const handleRatingChange = (rate) => {
    triggerHaptic("light");
    setReviewAndRating((prev) => ({
      ...prev,
      rating: rate,
    }));

    if (error.rating) {
      setError((prev) => ({ ...prev, rating: "" }));
    }
  };

  // Submit rating
  const ratingSubmit = async () => {
    const newErrors = {};
    if (!reviewAndRating.rating) newErrors.rating = "Please select a rating";
    if (!reviewAndRating.review) newErrors.review = "Please enter your review";

    setError(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        order_id: reviewAndRating.order_id,
        rating: reviewAndRating.rating,
        review: reviewAndRating.review,
      };
      
      const response = await handleOrderReviewAndRating(authToken, payload);
      Toast.show({
        type: "success",
        text1: "Rating Submitted!",
      });
      setIsModalVisible(false);
      setRefetchOrder((prev) => !prev);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.message || "Rating failed",
      });
    }
  };

  // Submit reply
  const submitReply = async (reviewId, replyText) => {
    if (!replyText.trim()) {
      Toast.show({
        type: "error",
        text1: "Please write a reply",
      });
      return;
    }

    try {
      await handleChefPostReview(authToken, reviewId, replyText);
      Toast.show({
        type: "success",
        text1: "Reply submitted!",
      });
      
      // Update UI
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            replies: [
              ...(review.replies || []),
              {
                reply: replyText,
                created_at: new Date().toISOString(),
              }
            ]
          };
        }
        return review;
      }));
      
      setActiveReviewIndex(null);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to submit reply",
      });
    }
  };

  // Convert time format
  const convertTimeFormat = (timeRange) => {
    return timeRange
      .split("-")
      .map((time) => {
        const [hour, minute] = time.split(":");
        const hourInt = parseInt(hour, 10);
        const ampm = hourInt >= 12 ? "PM" : "AM";
        const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
        return `${formattedHour}:${minute}${ampm}`;
      })
      .join(" - ");
  };

  // Render rating stars
  const renderStars = (rating, size = 24) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AntDesign
            key={star}
            name={star <= rating ? "star" : "staro"}
            size={size}
            color={star <= rating ? "#FFD700" : "#E4E4E7"}
          />
        ))}
      </View>
    );
  };

  // Render order item
  const renderOrderItem = ({ item, index }) => {
    const status = item?.status?.toLowerCase();
    const hasReviews = item?.reviews?.length > 0;
    const orderCreatedTime = moment(item.created_at);
    const currentTime = moment();
    const timeSinceCreation = moment.duration(currentTime.diff(orderCreatedTime));
    const canCancel = timeSinceCreation.asMinutes() <= defaultSettings.cancellation_time_span;
    const isDeliveredOrDelivering = status === "delivered" || status === "delivering";
    
    const statusColors = {
      canceled: "#FF3B30",
      accepted: "#FF9500",
      delivered: "#34C759",
      default: "#000"
    }
    const statusColor = statusColors[status] || statusColors.default;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{item.order_id}</Text>
          <Text style={[styles.orderStatus, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
        
        <Text style={styles.dishName}>{item.dish_name}</Text>
        
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>x{item.quantity}</Text>
        </View>
        
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Spice Level:</Text>
          <Text style={styles.detailValue}>{item.spice_level}</Text>
        </View>
        
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Portion Size:</Text>
          <Text style={styles.detailValue}>{item.portion_size}</Text>
        </View>
        
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Delivery:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.delivery_time).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {convertTimeFormat(item.delivery_slot)}
          </Text>
        </View>
        
        <View style={styles.orderDetailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={[styles.detailValue, styles.priceText]}>
            ${item.totalPrice}
          </Text>
        </View>
        
        <View style={styles.orderActions}>
          {!hasReviews && status === "delivered" ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                const deliveryDate = new Date(item.delivery_time);
                setReviewAndRating({
                  order_id: item.id,
                  order_code: item.order_id,
                  dish_name: item.dish_name,
                  created_at: `${deliveryDate.toLocaleDateString()} - ${deliveryDate.toLocaleDateString("en-US", { weekday: "long" })} - ${deliveryDate.toLocaleTimeString()}`,
                  rating: 0,
                  review: ""
                });
                setIsModalVisible(true);
                triggerHaptic("light");
              }}
            >
              <MaterialIcons name="rate-review" size={20} color="#007AFF" />
              <Text style={styles.actionText}>Add Rating</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.ratedContainer}>
              <Feather name="check-circle" size={20} color="#34C759" />
              <Text style={styles.ratedText}>Reviewed</Text>
            </View>
          )}
          
          {canCancel && status !== "canceled" && !isDeliveredOrDelivering && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusChange(item.id)}
            >
              <MaterialIcons name="cancel" size={20} color="#FF3B30" />
              <Text style={[styles.actionText, styles.cancelText]}>
                Cancel Order
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render review item
  const renderReviewItem = ({ item, index }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png" }}
          style={styles.reviewAvatar}
        />
        <View>
          <Text style={styles.reviewName}>
            {item.user_menu?.chef?.first_name} {item.user_menu?.chef?.last_name}
          </Text>
          <View style={styles.reviewMeta}>
            {renderStars(item.rating, 18)}
            <Text style={styles.reviewDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.reviewText}>{item.review}</Text>
      
      {/* Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply, replyIndex) => (
            <View key={replyIndex} style={styles.replyCard}>
              <Text style={styles.replyHeader}>Chef's Reply</Text>
              <Text style={styles.replyText}>{reply.reply}</Text>
              <Text style={styles.replyDate}>
                {new Date(reply.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Reply Section */}
      <TouchableOpacity
        style={styles.replyButton}
        onPress={() => {
          triggerHaptic("light");
          setActiveReviewIndex(activeReviewIndex === index ? null : index);
        }}
      >
        <Text style={styles.replyButtonText}>
          {activeReviewIndex === index ? "Close" : "Reply"}
        </Text>
      </TouchableOpacity>
      
      {activeReviewIndex === index && (
        <View style={styles.replyForm}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            multiline
          />
          <TouchableOpacity
            style={styles.submitReplyButton}
            onPress={() => {
              // In a real app, you would get the text from state
              submitReply(item.id, "Sample reply text");
            }}
          >
            <Text style={styles.submitReplyText}>Submit Reply</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );  

  return (
   <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
    
          {/* Gradient Header */}
          <LinearGradient
            colors={["#DC2626", "#B91C1C"]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              {/* Back button */}
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBackPress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#DC2626" />
              </TouchableOpacity>
    
              {/* Title */}
              <Text style={styles.headerTitle}>Your Orders</Text>
    
              {/* Spacer to balance back button */}
              <View style={styles.rightSpacer} />
            </View>
          </LinearGradient>
     <ScrollView contentContainerStyle={styles.scrollContainer}>     
        {/* Orders Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order History</Text>
          
          {isFetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Fetching orders...</Text>
            </View>
          ) : orderDetails.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="package" size={48} color="#AEAEB2" />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>
                Your delicious meals will appear here
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={currentRows}
                renderItem={renderOrderItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
              
              {/* Pagination */}
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === 1 && styles.disabledButton
                  ]}
                  disabled={currentPage === 1}
                  onPress={() => {
                    triggerHaptic("light");
                    setCurrentPage(currentPage - 1);
                  }}
                >
                  <Text style={styles.paginationText}>Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === totalPages && styles.disabledButton
                  ]}
                  disabled={currentPage === totalPages}
                  onPress={() => {
                    triggerHaptic("light");
                    setCurrentPage(currentPage + 1);
                  }}
                >
                  <Text style={styles.paginationText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        
        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Reviews</Text>
          
          {reviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={48} color="#AEAEB2" />
              <Text style={styles.emptyText}>No reviews yet</Text>
              <Text style={styles.emptySubtext}>
                Your feedback will appear here
              </Text>
            </View>
          ) : (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Rating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Review & Rating</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalInfo}>
                <Text style={styles.infoLabel}>Order Code:</Text> #{reviewAndRating.order_code}
              </Text>
              
              <Text style={styles.modalInfo}>
                <Text style={styles.infoLabel}>Dish Name:</Text> {reviewAndRating.dish_name}
              </Text>
              
              <Text style={styles.modalInfo}>
                <Text style={styles.infoLabel}>Delivery:</Text> {reviewAndRating.created_at}
              </Text>
              
              <Text style={styles.modalLabel}>Add Reviews</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Write your review here..."
                multiline
                numberOfLines={4}
                value={reviewAndRating.review}
                onChangeText={handleReviewChange}
              />
              {error.review && (
                <Text style={styles.errorText}>{error.review}</Text>
              )}
              
              <Text style={styles.modalLabel}>Rating: ({reviewAndRating.rating})</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRatingChange(star)}
                  >
                    <AntDesign
                      name={star <= reviewAndRating.rating ? "star" : "staro"}
                      size={32}
                      color={star <= reviewAndRating.rating ? "#FFD700" : "#E4E4E7"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {error.rating && (
                <Text style={styles.errorText}>{error.rating}</Text>
              )}
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={ratingSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  rightSpacer: {
    width: 40, // balances back button
  },
sectionContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1C1C1E",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingBottom: 8,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  dishName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1C1C1E",
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  priceText: {
    fontWeight: "bold",
    color: "#34C759",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F0F7FF",
  },
  actionText: {
    marginLeft: 6,
    color: "#007AFF",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#FFF0F0",
  },
  cancelText: {
    color: "#FF3B30",
  },
  ratedContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ratedText: {
    marginLeft: 6,
    color: "#34C759",
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1C1C1E",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyCard: {
    backgroundColor: "#F9F9FB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  replyHeader: {
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: "#1C1C1E",
    marginBottom: 4,
  },
  replyDate: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
  },
  replyButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  replyButtonText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  replyForm: {
    marginTop: 12,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
    backgroundColor: "#F9F9FB",
  },
  submitReplyButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  submitReplyText: {
    color: "#FFF",
    fontWeight: "500",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F0F7FF",
  },
  paginationText: {
    color: "#4b5563",
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageInfo: {
    color: "#8E8E93",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: "#8E8E93",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    color: "#1C1C1E",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  modalContent: {
    padding: 16,
  },
  modalInfo: {
    fontSize: 14,
    marginBottom: 12,
    color: "#1C1C1E",
  },
  infoLabel: {
    fontWeight: "bold",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
    color: "#1C1C1E",
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: "#F9F9FB",
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CustomerOrdersScreen;