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
import AgoraViewer from '../components/AgoraViewer';

const { width, height } = Dimensions.get('window');

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
    // console.log('📨 Full message data:', JSON.stringify(data, null, 2));
    
    switch (data.type) {
      case 'stream_started':
        console.log('🎥 STREAM_STARTED received!');
        // console.log('🎥 Stream data:', data.streamData);
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
    // console.log('❤️ Checking like status:', { identifier, liked, likedByCount: likedBy.length });
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

  // console.log('🎬 Rendering LivestreamScreen with state:', {
  //   isLive,
  //   hasCurrentStream: !!currentStream,
  //   currentStreamTitle: currentStream?.title,
  //   viewerCount,
  //   likes,
  //   chatMessagesCount: chatMessages.length,
  //   pinnedProductsCount: pinnedProducts.length,
  //   pastStreamsCount: pastStreams.length
  // });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {/* Full-screen Agora Video Viewer */}
        <AgoraViewer
          streamId={currentStream?._id}
          isLive={isLive}
        />
        
        {/* Overlays */}
        <View style={styles.overlayContainer}>
          {/* Top Overlay */}
          <View style={styles.topOverlay}>
            <View style={styles.topLeft}>
              {isLive && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Overlay - Right Side */}
          <View style={styles.rightOverlay}>
            {isLive && (
              <View style={styles.statBubble}>
                <Text style={styles.statIcon}>👁️</Text>
                <Text style={styles.statText}>{viewerCount}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.actionBubble}
              onPress={toggleLike}
            >
              <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionText}>{likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBubble}
              onPress={shareStream}
            >
              <Text style={styles.actionIcon}>🔗</Text>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Stream Info - Left Bottom */}
          <View style={styles.streamInfoOverlay}>
            <Text style={styles.streamTitleOverlay} numberOfLines={1}>
              {currentStream?.title || 'Live Stream'}
            </Text>
            {currentStream?.description && (
              <Text style={styles.streamDescOverlay} numberOfLines={2}>
                {currentStream.description}
              </Text>
            )}
          </View>

          {/* Pinned Products Overlay */}
          {pinnedProducts.length > 0 && (
            <View style={styles.productsOverlay}>
              <FlatList
                data={pinnedProducts}
                renderItem={renderPinnedProduct}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Chat Overlay - Bottom 1/3 */}
          <View style={styles.chatOverlay}>
            <ScrollView
              ref={chatScrollRef}
              style={styles.chatMessages}
              contentContainerStyle={styles.chatMessagesContent}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd()}
            >
              {chatMessages.map((msg) => (
                <View key={msg.id} style={styles.chatMessageBubble}>
                  <Text style={styles.chatUsername}>
                    {msg.username}
                    {msg.isAdmin && <Text style={styles.adminBadge}> 👑</Text>}
                  </Text>
                  <Text style={styles.chatText}>{msg.message}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputOverlay}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Write a comment..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                style={styles.chatSendButton}
                onPress={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Text style={styles.chatSendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  topOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  topLeft: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rightOverlay: {
    position: 'absolute',
    right: 12,
    top: 80,
    alignItems: 'center',
  },
  statBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  streamInfoOverlay: {
    position: 'absolute',
    left: 12,
    bottom: height / 3 + 80,
    right: 80,
    paddingHorizontal: 4,
  },
  streamTitleOverlay: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  streamDescOverlay: {
    color: '#fff',
    fontSize: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  productsOverlay: {
    position: 'absolute',
    left: 0,
    bottom: height / 3 + 20,
    right: 0,
    height: 60,
    paddingLeft: 12,
  },
  pinnedProductCard: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  pinnedProductImage: {
    width: '100%',
    height: '100%',
  },
  pinnedProductInfo: {
    display: 'none',
  },
  pinnedProductName: {
    display: 'none',
  },
  pinnedProductCategory: {
    display: 'none',
  },
  pinnedProductFooter: {
    display: 'none',
  },
  pinnedProductPrice: {
    display: 'none',
  },
  pinnedProductButton: {
    display: 'none',
  },
  pinnedProductButtonDisabled: {
    display: 'none',
  },
  pinnedProductButtonText: {
    display: 'none',
  },
  chatOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: height / 3,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 8,
  },
  chatMessagesContent: {
    paddingBottom: 8,
  },
  chatMessageBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  chatUsername: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  adminBadge: {
    fontSize: 12,
  },
  chatText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  chatInputOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendIcon: {
    fontSize: 18,
    color: '#fff',
  },
});
