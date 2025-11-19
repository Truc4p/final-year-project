import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { livestreamService } from '../services/livestreamService';
import { COLORS, API_BASE_URL } from '../constants';

const { width } = Dimensions.get('window');

export default function LivestreamScreen({ navigation }) {
  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [likedBy, setLikedBy] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatScrollRef = useRef(null);

  // Pinned products state
  const [pinnedProducts, setPinnedProducts] = useState([]);

  // Past streams state
  const [pastStreams, setPastStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User session
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    initializeSession();
    loadData();
    connectWebSocket();

    return () => {
      livestreamService.disconnectWebSocket();
    };
  }, []);

  // Initialize user session
  const initializeSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id || payload.user?.id);
      }
      
      const sid = livestreamService.getUserSessionId();
      setSessionId(sid);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  // Load data from API
  const loadData = async () => {
    console.log('🔄 loadData called - fetching streams and products');
    try {
      // Fetch active stream
      const activeStream = await livestreamService.getActiveStream();
      console.log('🔍 Active stream fetched:', activeStream);
      
      if (activeStream) {
        console.log('✅ Active stream found! Setting isLive to TRUE');
        setIsLive(true);
        setCurrentStream(activeStream);
        setViewerCount(activeStream.viewerCount || 0);
        setLikes(activeStream.likes || 0);
        setLikedBy(activeStream.likedBy || []);
        console.log('✅ Stream state updated:', {
          title: activeStream.title,
          viewerCount: activeStream.viewerCount,
          likes: activeStream.likes
        });

        // Fetch pinned products
        const products = await livestreamService.getPinnedProducts(activeStream._id);
        console.log('📌 Pinned products fetched:', products.length);
        setPinnedProducts(products);
      } else {
        console.log('❌ No active stream found');
      }

      // Fetch past streams
      const past = await livestreamService.getPastStreams(12);
      console.log('📚 Past streams fetched:', past.length);
      setPastStreams(past);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('✅ loadData completed');
    }
  };

  // Connect to WebSocket
  const connectWebSocket = async () => {
    const token = await AsyncStorage.getItem('token');
    livestreamService.connectWebSocket(token);

    // Register message handler
    livestreamService.addMessageHandler(handleWebSocketMessage);
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    console.log('📨 handleWebSocketMessage called with type:', data.type);
    console.log('📨 Full message data:', JSON.stringify(data, null, 2));
    
    switch (data.type) {
      case 'stream_started':
        console.log('🎥 STREAM_STARTED received!');
        console.log('🎥 Stream data:', data.streamData);
        console.log('🎥 Setting isLive to TRUE');
        setIsLive(true);
        setCurrentStream(data.streamData);
        setViewerCount(data.streamData.viewerCount || 0);
        setLikes(data.streamData.likes || 0);
        setLikedBy(data.streamData.likedBy || []);
        console.log('🎥 State updated - isLive should now be true');
        break;

      case 'stream_stopped':
        console.log('⏹️ STREAM_STOPPED received!');
        console.log('⏹️ Setting isLive to FALSE');
        setIsLive(false);
        setCurrentStream(null);
        console.log('⏹️ State updated - isLive should now be false');
        break;

      case 'stream_update':
        console.log('📊 STREAM_UPDATE received!');
        console.log('📊 Update data:', { viewerCount: data.viewerCount, likes: data.likes, likedBy: data.likedBy });
        if (data.viewerCount !== undefined) setViewerCount(data.viewerCount);
        if (data.likes !== undefined) setLikes(data.likes);
        if (data.likedBy !== undefined) setLikedBy(data.likedBy);
        break;

      case 'chat_message':
        console.log('💬 CHAT_MESSAGE received:', data.message);
        setChatMessages((prev) => [
          ...prev,
          {
            id: data.id || Date.now(),
            username: data.username,
            message: data.message,
            timestamp: new Date(data.timestamp),
            isAdmin: data.isAdmin || false,
          },
        ]);
        // Auto scroll to bottom
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
        break;

      case 'chat_history':
        console.log('📜 CHAT_HISTORY received:', data.messages.length, 'messages');
        setChatMessages(
          data.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
        break;

      case 'pinned_products_updated':
        console.log('📌 PINNED_PRODUCTS_UPDATED received:', data.pinnedProducts?.length, 'products');
        setPinnedProducts(data.pinnedProducts || []);
        break;

      default:
        console.log('❓ Unknown message type received:', data.type);
        break;
    }
  };

  // Check if user has liked
  useEffect(() => {
    const identifier = userId || sessionId;
    const liked = likedBy.includes(identifier);
    console.log('❤️ Checking like status:', { identifier, liked, likedByCount: likedBy.length });
    setIsLiked(liked);
  }, [likedBy, userId, sessionId]);

  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    livestreamService.sendChatMessage(newMessage);
    setNewMessage('');
  };

  // Toggle like
  const toggleLike = () => {
    livestreamService.toggleLike(userId, sessionId);
  };

  // Share stream
  const shareStream = () => {
    Alert.alert('Share', 'Link copied to clipboard!');
  };

  // Add product to cart
  const addToCart = async (product) => {
    if (!product || product.stockQuantity <= 0) return;

    try {
      const cartJson = await AsyncStorage.getItem('cart');
      const cart = cartJson ? JSON.parse(cartJson) : [];

      const existingItemIndex = cart.findIndex((item) => item.productId === product._id);

      if (existingItemIndex > -1) {
        const newQuantity = cart[existingItemIndex].quantity + 1;
        if (newQuantity <= product.stockQuantity) {
          cart[existingItemIndex].quantity = newQuantity;
        } else {
          Alert.alert('Error', 'Maximum quantity reached for this product');
          return;
        }
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.image,
          quantity: 1,
          stockQuantity: product.stockQuantity,
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  // Navigate to product detail
  const navigateToProduct = (product) => {
    if (!product || !product._id) return;
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  // Watch recording
  const watchRecording = (stream) => {
    if (stream._id) {
      livestreamService.incrementViewCount(stream._id);
    }

    if (!stream.videoUrl || stream.videoUrl.trim() === '') {
      Alert.alert('No Recording', 'This stream recording is not available');
    } else {
      Alert.alert('Watch Recording', 'Video player feature coming soon!');
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Get product image URL
  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${API_BASE_URL}/${imagePath}`;
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Render chat message
  const renderChatMessage = ({ item }) => (
    <View style={styles.chatMessage}>
      <View style={[styles.chatAvatar, item.isAdmin && styles.chatAvatarAdmin]}>
        <Text style={styles.chatAvatarText}>
          {item.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.chatMessageContent}>
        <View style={styles.chatMessageHeader}>
          <Text style={styles.chatUsername}>{item.username}</Text>
          <Text style={styles.chatTimestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.chatText}>{item.message}</Text>
      </View>
    </View>
  );

  // Render pinned product
  const renderPinnedProduct = ({ item }) => {
    const product = item.productId;
    if (!product) return null;

    return (
      <TouchableOpacity
        style={styles.pinnedProductCard}
        onPress={() => navigateToProduct(product)}
      >
        <Image
          source={{ uri: getProductImageUrl(product.image) }}
          style={styles.pinnedProductImage}
        />
        <View style={styles.pinnedProductInfo}>
          <Text style={styles.pinnedProductName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.pinnedProductCategory}>
            {product.category?.name}
          </Text>
          <View style={styles.pinnedProductFooter}>
            <Text style={styles.pinnedProductPrice}>${product.price}</Text>
            <TouchableOpacity
              style={[
                styles.pinnedProductButton,
                product.stockQuantity <= 0 && styles.pinnedProductButtonDisabled,
              ]}
              onPress={() => addToCart(product)}
              disabled={product.stockQuantity <= 0}
            >
              <Text style={styles.pinnedProductButtonText}>
                {product.stockQuantity <= 0 ? 'Out' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render past stream
  const renderPastStream = ({ item }) => (
    <TouchableOpacity
      style={styles.pastStreamCard}
      onPress={() => watchRecording(item)}
    >
      {item.thumbnailUrl ? (
        <Image
          source={{ uri: `${API_BASE_URL}${item.thumbnailUrl}` }}
          style={styles.pastStreamImage}
        />
      ) : (
        <View style={styles.pastStreamPlaceholder}>
          <Text style={styles.pastStreamPlaceholderText}>📹</Text>
        </View>
      )}
      {(!item.videoUrl || item.videoUrl.trim() === '') && (
        <View style={styles.noRecordingBadge}>
          <Text style={styles.noRecordingText}>No Recording</Text>
        </View>
      )}
      <View style={styles.pastStreamInfo}>
        <Text style={styles.pastStreamTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.pastStreamDate}>{formatDate(item.endTime || item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    console.log('⏳ Component in loading state');
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  console.log('🎬 Rendering LivestreamScreen with state:', {
    isLive,
    hasCurrentStream: !!currentStream,
    currentStreamTitle: currentStream?.title,
    viewerCount,
    likes,
    chatMessagesCount: chatMessages.length,
    pinnedProductsCount: pinnedProducts.length,
    pastStreamsCount: pastStreams.length
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Stream</Text>
          <View style={styles.liveIndicator}>
            {isLive && <View style={styles.liveDot} />}
            <Text style={styles.liveText}>{isLive ? 'LIVE NOW' : 'Next Stream Soon'}</Text>
          </View>
        </View>

        {/* Video Player Section */}
        <View style={styles.videoSection}>
          <View style={styles.videoPlayer}>
            {isLive ? (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderText}>🎥</Text>
                <Text style={styles.videoPlaceholderSubtext}>
                  Live Stream Active
                </Text>
                <Text style={styles.videoPlaceholderDescription}>
                  Broadcasting from mobile app
                </Text>
                <View style={styles.liveIndicatorLarge}>
                  <View style={styles.liveDotLarge} />
                  <Text style={styles.liveTextLarge}>LIVE NOW</Text>
                </View>
              </View>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderText}>📹</Text>
                <Text style={styles.videoPlaceholderSubtext}>No Active Stream</Text>
                <Text style={styles.videoPlaceholderDescription}>
                  Stream will start soon
                </Text>
              </View>
            )}
          </View>

          {/* Stream Info */}
          <View style={styles.streamInfo}>
            <Text style={styles.streamTitle}>
              {currentStream?.title || 'Live Stream Title'}
            </Text>
            <Text style={styles.streamDescription}>
              {currentStream?.description || 'Watch our latest live streams'}
            </Text>

            <View style={styles.streamStats}>
              {isLive && (
                <View style={styles.stat}>
                  <View style={styles.liveDotSmall} />
                  <Text style={styles.statText}>{viewerCount} viewers</Text>
                </View>
              )}
              {isLive && (
                <Text style={styles.streamTime}>
                  Started: {formatTime(currentStream?.startTime)}
                </Text>
              )}
            </View>

            <View style={styles.streamActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleLike}
              >
                <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionText}>{likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareStream}
              >
                <Text style={styles.actionIcon}>🔗</Text>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pinned Products */}
        {pinnedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <FlatList
              data={pinnedProducts}
              renderItem={renderPinnedProduct}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pinnedProductsList}
            />
          </View>
        )}

        {/* Live Chat */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Chat</Text>
          <View style={styles.chatContainer}>
            <ScrollView
              ref={chatScrollRef}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              // Auto scroll when content changes
              onContentSizeChange={() => {
                chatScrollRef.current?.scrollToEnd({ animated: true });
              }}
            >
              {chatMessages.map((item) => (
                <View key={item.id}>
                  {renderChatMessage({ item })}
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                style={[
                  styles.chatSendButton,
                  !newMessage.trim() && styles.chatSendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Text style={styles.chatSendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Past Streams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Streams</Text>
          <FlatList
            data={pastStreams}
            renderItem={renderPastStream}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pastStreamsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryDarker,
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 6,
  },
  liveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDarker,
  },
  videoSection: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  videoPlayer: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.lightGray,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoPlaceholderText: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoPlaceholderSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  videoPlaceholderDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  streamInfo: {
    padding: 16,
  },
  streamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  streamDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  streamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  streamTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  streamActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  pinnedProductsList: {
    paddingRight: 16,
  },
  pinnedProductCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  pinnedProductImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundAlt,
  },
  pinnedProductInfo: {
    padding: 12,
  },
  pinnedProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  pinnedProductCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pinnedProductFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinnedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pinnedProductButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pinnedProductButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  pinnedProductButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  chatContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 12,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chatAvatarAdmin: {
    backgroundColor: COLORS.accent,
  },
  chatAvatarText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  chatMessageContent: {
    flex: 1,
  },
  chatMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  chatTimestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  chatText: {
    fontSize: 14,
    color: COLORS.text,
  },
  chatInput: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    marginRight: 8,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  chatSendIcon: {
    fontSize: 18,
    color: COLORS.white,
  },
  pastStreamsList: {
    paddingRight: 16,
  },
  pastStreamCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  pastStreamImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundAlt,
  },
  pastStreamPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastStreamPlaceholderText: {
    fontSize: 32,
  },
  noRecordingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  noRecordingText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  pastStreamInfo: {
    padding: 12,
  },
  pastStreamTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  pastStreamDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  liveIndicatorLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  liveDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  liveTextLarge: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
