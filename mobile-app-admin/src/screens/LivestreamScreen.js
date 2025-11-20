import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Image,
  SafeAreaView,
  Dimensions,
  AppState,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, API_BASE_URL } from '../constants';
import livestreamService from '../services/livestreamService';
import AgoraBroadcaster from '../components/AgoraBroadcaster';

const { width, height } = Dimensions.get('window');

export default function LivestreamScreen({ navigation }) {
  console.log('🚀 LivestreamScreen component initialized');
  
  // Camera and permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  
  console.log('📷 Initial permission state:', permission);
  console.log('🎤 Initial mic permission state:', micPermission);
  
  const cameraRef = useRef(null);

  // Stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const [streamDuration, setStreamDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);

  // Stream setup
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [showStreamSetup, setShowStreamSetup] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminUsername, setAdminUsername] = useState('Admin');
  const chatScrollRef = useRef(null);

  // Products
  const [products, setProducts] = useState([]);
  const [pinnedProducts, setPinnedProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Timer
  const timerRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Handle app going to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to background, stop stream if active
        if (isStreaming && currentStreamId) {
          console.log('📱 App going to background, stopping active stream');
          livestreamService.stopLivestream(currentStreamId, {
            maxViewers: viewerCount,
            viewCount: viewerCount,
            likes,
          }).catch(err => console.error('Error stopping stream on background:', err));
          setIsStreaming(false);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isStreaming, currentStreamId, viewerCount, likes]);

  // Block navigation when streaming
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isStreaming) {
        // If not streaming, allow navigation
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user to stop streaming first
      Alert.alert(
        'Livestream Active',
        'You must stop the livestream before leaving this screen.',
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {} 
          },
          {
            text: 'Stop Stream & Leave',
            style: 'destructive',
            onPress: async () => {
              // Stop the stream
              await stopStream();
              // Allow navigation after stopping
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isStreaming]);

  useEffect(() => {
    checkAuthStatus();
    requestPermissions();
    loadProducts();
    initializeWebSocket();
    // Note: cleanupStuckStreams() removed from here to prevent stopping newly created streams
    // It was causing streams to be stopped immediately after creation
    // Cleanup now only happens on server startup or via manual endpoint

    // Cleanup function: stop stream if active when component unmounts
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Only stop stream if it's actually streaming
      // Use a ref to check the latest state since this runs after component unmounts
      const streamIdToCleanup = currentStreamId;
      const isCurrentlyStreaming = isStreaming;
      
      if (isCurrentlyStreaming && streamIdToCleanup) {
        console.log('🧹 Component unmounting with active stream, cleaning up:', streamIdToCleanup);
        livestreamService.stopLivestream(streamIdToCleanup, {
          maxViewers: viewerCount,
          viewCount: viewerCount,
          likes,
        }).catch(err => {
          // Ignore 400 errors (stream already stopped)
          if (!err.message?.includes('400')) {
            console.error('Error stopping stream on unmount:', err);
          }
        });
      }
      
      // Remove message handler and disconnect WebSocket
      livestreamService.removeMessageHandler(handleWebSocketMessage);
      livestreamService.disconnectWebSocket();
    };
  }, [isStreaming, currentStreamId, viewerCount, likes]);

  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem('adminToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    
    // Get admin username from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const username = payload.user?.username || payload.username || 'Admin';
      setAdminUsername(username);
      console.log('👤 Admin username:', username);
    } catch (error) {
      console.error('Error parsing admin username:', error);
    }
  };

  const cleanupStuckStreams = async () => {
    try {
      const result = await livestreamService.forceCleanupStreams();
      if (result.cleaned > 0) {
        console.log(`✅ Cleaned up ${result.cleaned} stuck stream(s) on app start`);
      }
    } catch (error) {
      console.error('Error cleaning up stuck streams:', error);
      // Don't block app startup if cleanup fails
    }
  };

  useEffect(() => {
    if (isStreaming) {
      timerRef.current = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStreaming]);

  const requestPermissions = async () => {
    await requestPermission();
    await requestMicPermission();
    await MediaLibrary.requestPermissionsAsync();
  };

  const initializeWebSocket = async () => {
    const token = await AsyncStorage.getItem('adminToken');
    
    // Remove any existing handlers before adding new one to prevent duplicates
    livestreamService.removeMessageHandler(handleWebSocketMessage);
    
    livestreamService.connectWebSocket(token);
    livestreamService.addMessageHandler(handleWebSocketMessage);
  };

  const handleWebSocketMessage = (data) => {
    console.log('📨 WebSocket message:', data.type);
    
    switch (data.type) {
      case 'stream_update':
        if (data.viewerCount !== undefined) setViewerCount(data.viewerCount);
        if (data.likes !== undefined) setLikes(data.likes);
        break;
      
      case 'chat_message':
        // Check for duplicate messages using unique ID
        setChatMessages((prev) => {
          const messageId = data.id || `${data.username}-${data.timestamp}`;
          const isDuplicate = prev.some(msg => msg.id === messageId);
          
          if (isDuplicate) {
            console.log('⚠️ Duplicate message detected, skipping:', messageId);
            return prev;
          }
          
          return [
            ...prev,
            {
              id: messageId,
              username: data.username,
              message: data.message,
              timestamp: new Date(data.timestamp),
              isAdmin: data.isAdmin || false,
            },
          ];
        });
        // Auto scroll to bottom when new message arrives
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
        break;
      
      case 'pinned_products_updated':
        setPinnedProducts(data.pinnedProducts || []);
        break;
      
      default:
        break;
    }
  };

  const loadProducts = async () => {
    try {
      const productList = await livestreamService.getProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleStartStream = () => {
    setShowStreamSetup(true);
  };

  const startStreamWithDetails = async () => {
    if (!streamTitle.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    try {
      // Create livestream in backend
      const response = await livestreamService.createLivestream({
        title: streamTitle,
        description: streamDescription,
        quality: '720p',
        streamUrl: `mobile-stream-${Date.now()}`,
      });

      setCurrentStreamId(response.livestream._id);
      setIsStreaming(true);
      setStreamDuration(0);
      setShowStreamSetup(false);

      // Notify via WebSocket
      livestreamService.startStream(response.livestream._id);

      Alert.alert('Success', 'Livestream started!');
    } catch (error) {
      console.error('Error starting stream:', error);
      Alert.alert('Error', 'Failed to start livestream');
    }
  };

  const handleStopStream = async () => {
    Alert.alert(
      'Stop Livestream',
      'Are you sure you want to stop the livestream?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop', style: 'destructive', onPress: stopStream },
      ]
    );
  };

  const stopStream = async () => {
    try {
      // Stop livestream in backend
      if (currentStreamId) {
        await livestreamService.stopLivestream(currentStreamId, {
          maxViewers: viewerCount,
          viewCount: viewerCount,
          likes,
        });

        // Notify via WebSocket
        livestreamService.stopStream(currentStreamId);
        
        Alert.alert('Success', 'Livestream stopped!');
      }

      // Reset state
      setIsStreaming(false);
      setCurrentStreamId(null);
      setStreamDuration(0);
      setViewerCount(0);
      setLikes(0);
      setChatMessages([]);
      setPinnedProducts([]);
      setStreamTitle('');
      setStreamDescription('');
    } catch (error) {
      console.error('Error stopping stream:', error);
      Alert.alert('Error', 'Failed to stop livestream properly');
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    livestreamService.sendChatMessage(newMessage, adminUsername);
    setNewMessage('');
  };

  const toggleProductPin = async (product) => {
    if (!currentStreamId) {
      Alert.alert('Error', 'No active stream. Start streaming first.');
      return;
    }
    
    try {
      const isPinned = pinnedProducts.some((p) => p.productId?._id === product._id);

      if (isPinned) {
        await livestreamService.unpinProduct(currentStreamId, product._id);
      } else {
        await livestreamService.pinProduct(currentStreamId, product._id);
      }
      
      // Refresh pinned products after toggle
      const products = await livestreamService.getPinnedProducts(currentStreamId);
      setPinnedProducts(products);
    } catch (error) {
      console.error('Error toggling product pin:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update product';
      Alert.alert('Error', errorMsg);
    }
  };



  const handleLogout = async () => {
    if (isStreaming) {
      Alert.alert(
        'Livestream Active',
        'You must stop the livestream before logging out.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop Stream & Logout',
            style: 'destructive',
            onPress: async () => {
              await stopStream();
              await AsyncStorage.clear();
              livestreamService.disconnectWebSocket();
              navigation.replace('Login');
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            livestreamService.disconnectWebSocket();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permission || !micPermission) {
    console.log('⏳ Permission object is null, waiting...');
    return (
      <View style={styles.centerContainer}>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  console.log('📷 Camera permission status:', permission);
  console.log('🎤 Microphone permission status:', micPermission);

  if (!permission.granted || !micPermission.granted) {
    console.log('❌ Camera or microphone permission not granted');
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Camera and microphone access required for livestreaming</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        {/* CameraView - only for preview before streaming */}
        {!isStreaming && (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            mode="video"
          />
        )}
        
        {/* Agora Broadcaster - shows local video when streaming */}
        {isStreaming && (
          <AgoraBroadcaster
            streamId={currentStreamId}
            isStreaming={isStreaming}
            onError={(error) => Alert.alert('Streaming Error', error)}
          />
        )}
        
        {/* Overlays - always visible regardless of streaming state */}
        <View style={styles.overlayContainer}>
          {/* Top Overlay */}
          <View style={styles.topOverlay}>
            <View style={styles.statusContainer}>
              {isStreaming && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                  <Text style={styles.durationText}>{formatDuration(streamDuration)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Overlay */}
          {isStreaming && (
            <View style={styles.statsOverlay}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👁️</Text>
                <Text style={styles.statText}>{viewerCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={styles.statText}>{likes}</Text>
              </View>
            </View>
          )}

          {/* Chat Section - Overlaid at bottom 1/3 */}
          {isStreaming && (
            <View style={styles.chatOverlay}>
              <ScrollView
                ref={chatScrollRef}
                style={styles.chatMessages}
                contentContainerStyle={styles.chatMessagesContent}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
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
                  onSubmitEditing={sendChatMessage}
                />
                <TouchableOpacity
                  style={styles.chatSendButton}
                  onPress={sendChatMessage}
                  disabled={!newMessage.trim()}
                >
                  <Text style={styles.chatSendIcon}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomOverlay}>
            <TouchableOpacity
              style={[
                styles.streamButton,
                isStreaming && styles.streamButtonActive,
              ]}
              onPress={isStreaming ? handleStopStream : handleStartStream}
            >
              <View style={[styles.streamButtonInner, isStreaming && styles.streamButtonInnerActive]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.productsButton}
              onPress={() => setShowProductPicker(!showProductPicker)}
              disabled={!isStreaming}
            >
              <Text style={styles.productsButtonText}>🛍️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stream Setup Modal */}
      <Modal visible={showStreamSetup} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Livestream</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Stream Title *"
              value={streamTitle}
              onChangeText={setStreamTitle}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Description (optional)"
              value={streamDescription}
              onChangeText={setStreamDescription}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowStreamSetup(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonStart]}
                onPress={startStreamWithDetails}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>
                  Start
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Picker Modal */}
      <Modal visible={showProductPicker} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pin Products</Text>
            
            <FlatList
              data={products}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const isPinned = pinnedProducts.some((p) => p.productId._id === item._id);
                return (
                  <TouchableOpacity
                    style={styles.productItem}
                    onPress={() => toggleProductPin(item)}
                  >
                    <Image
                      source={{ uri: `${API_BASE_URL}/${item.image}` }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productPrice}>${item.price}</Text>
                    </View>
                    <View style={[styles.productCheckbox, isPinned && styles.productCheckboxActive]}>
                      {isPinned && <Text style={styles.productCheckmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonStart]}
              onPress={() => setShowProductPicker(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
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
  },
  statusContainer: {
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
    marginRight: 8,
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  statsOverlay: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  streamButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  streamButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  streamButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  productsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsButtonText: {
    fontSize: 24,
  },
  chatOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: height / 3,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  chatMessages: {
    flex: 1,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  chatMessagesContent: {
    paddingBottom: 8,
  },
  chatMessageBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 6,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: COLORS.lightGray,
  },
  modalButtonStart: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalButtonTextWhite: {
    color: COLORS.white,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundAlt,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  productCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCheckboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  productCheckmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
