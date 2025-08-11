// Screens/OrderReviewScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { handleChefPostReview, handleGetAllReview, handleGetAllReviewReplies } from '@/services/order';
import { useRouter } from 'expo-router'; // Changed to expo-router
import { RootState } from '@/types/types'; // Ensure this is correctly imported from your store
import { KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const OrderReviewScreen = () => {
  const router = useRouter(); // Using expo-router
  const { authToken } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user.userInfo);
  
  const [activeTab, setActiveTab] = useState('list');
  const [reviews, setReviews] = useState([]); // Initialize as empty array
  const [activeReview, setActiveReview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReplyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(reviews.length / rowsPerPage);
  
  // Fetch all reviews
const fetchReviews = async () => {
  setIsLoading(true);
  try {
    console.log("Current authToken:", authToken);
    console.log("Current user ID:", user.id);

    const response = await handleGetAllReview(authToken, user.id);

    console.log("Reviews API response:", JSON.stringify(response, null, 2));

    const reviewsData = response?.data?.original?.data?.data;

    if (Array.isArray(reviewsData)) {
      setReviews(reviewsData);
    } else {
      console.warn("No reviews array found", response);
      setReviews([]);
    }
  } catch (error) {
    console.error("Fetch error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    Alert.alert("Error", "Session expired or failed to fetch reviews.");
  } finally {
    setIsLoading(false);
  }
};


  // Fetch replies for a specific review
  const fetchReviewReplies = async (reviewId) => {
    setIsLoading(true);
    try {
      const response = await handleGetAllReviewReplies(authToken, reviewId);
      setMessages(response?.replies || []);
      setActiveReview(reviewId);
      setActiveTab('chat');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch replies');
      setMessages([]); // Ensure it remains an array
    } finally {
      setIsLoading(false);
    }
  };

  // Send a new reply
  const sendReply = async () => {
    if (!replyText.trim()) {
      setError('Please enter your reply');
      return;
    }
    
    try {
      await handleChefPostReview(authToken, activeReview, replyText);
      Alert.alert('Success', 'Reply submitted successfully');
      setReplyModalVisible(false);
      setReplyText('');
      fetchReviewReplies(activeReview);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send reply');
    }
  };

  // Send a message in chat
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const tempMessage = {
        id: Date.now(),
        reply: newMessage,
        created_at: new Date().toISOString(),
        user: { is_chef: 1, is_admin: 1 }
      };
      
      setMessages([...messages, tempMessage]);
      setNewMessage('');
      
      await handleChefPostReview(authToken, activeReview, newMessage);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send message');
      // Revert on error
      setMessages(messages.slice(0, -1));
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY h:mm A');
  };

  const renderReviewItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.reviewCard}
      onPress={() => fetchReviewReplies(item.id)}
    >
      <View style={styles.reviewHeader}>
        <Text style={styles.orderCode}>#{item.order?.order_code}</Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
      
      <Text style={styles.dishName}>{item.user_menu?.name}</Text>
      
      <Text style={styles.reviewText} numberOfLines={2}>
        {item.review}
      </Text>
      
      <TouchableOpacity 
        style={styles.replyButton}
        onPress={() => {
          setActiveReview(item.id);
          setReplyModalVisible(true);
        }}
      >
        <Text style={styles.replyButtonText}>Reply</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.user?.is_chef ? styles.chefMessage : styles.customerMessage
    ]}>
      <Text style={styles.messageText}>{item.reply}</Text>
      <Text style={styles.messageTime}>
        {moment(item.created_at).format('h:mm A')}
      </Text>
    </View>
  );

  if (isLoading && reviews.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#EC2044" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Reviews</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
            Reviews
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => activeReview && setActiveTab('chat')}
          disabled={!activeReview}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'chat' && styles.activeTabText,
            !activeReview && styles.disabledTab
          ]}>
            Replies
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {activeTab === 'list' && (
        <FlatList
          data={reviews.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
          )}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reviews available</Text>
            </View>
          }
        />
      )}

      {/* Chat Interface */}
{activeTab === 'chat' && (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust for header height
  >
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      contentContainerStyle={styles.chatContent}
      inverted
    />

    {/* Sticky Input that moves with keyboard */}
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type your reply..."
        placeholderTextColor="#999"
        returnKeyType="send"
        onSubmitEditing={sendMessage}
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={sendMessage}
        disabled={!newMessage.trim()}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
)}


      {/* Pagination */}
      {activeTab === 'list' && reviews.length > 0 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <Text style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </Text>
          
          <TouchableOpacity
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <Text style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reply Modal */}
      <Modal
        visible={isReplyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reply to Review</Text>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.replyInput}
              multiline
              placeholder="Write your reply here..."
              placeholderTextColor="#999"
              value={replyText}
              onChangeText={(text) => {
                setReplyText(text);
                if (error) setError('');
              }}
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={sendReply}
            >
              <Text style={styles.submitButtonText}>Submit Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#EC2044',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#EC2044',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#EC2044',
  },
  disabledTab: {
    color: '#ccc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC2044',
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  reviewText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  replyButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#EC2044',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pageButton: {
    color: '#EC2044',
    fontWeight: '500',
    padding: 8,
  },
  disabledButton: {
    color: '#ccc',
  },
  pageInfo: {
    color: '#666',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  chatContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  chefMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#EC2044',
    borderBottomRightRadius: 4,
  },
  customerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  chefMessageText: {
    color: '#fff',
  },
  customerMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    alignSelf: 'center',
    backgroundColor: '#EC2044',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
  },
  replyInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#EC2044',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OrderReviewScreen;