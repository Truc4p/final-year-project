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
  const [cameraFacing, setCameraFacing] = useState('front');
  
  console.log('📷 Initial permission state:', permission);
  console.log('🎤 Initial mic permission state:', micPermission);
  console.log('📷 Initial cameraFacing:', cameraFacing, 'Type:', typeof cameraFacing);
  
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(null);
  const recordingUriRef = useRef(null); // Store video URI in ref for immediate access

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

  useEffect(() => {
    checkAuthStatus();
    requestPermissions();
    loadProducts();
    initializeWebSocket();

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
      
      livestreamService.disconnectWebSocket();
    };
  }, [isStreaming, currentStreamId, viewerCount, likes]);

  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem('adminToken');
    if (!token) {
      navigation.replace('Login');
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

      // Start recording
      startRecording();

      // Notify via WebSocket
      livestreamService.startStream(response.livestream._id);

      Alert.alert('Success', 'Livestream started!');
    } catch (error) {
      console.error('Error starting stream:', error);
      Alert.alert('Error', 'Failed to start livestream');
    }
  };

  const startRecording = async () => {
    console.log('🔴 Start recording called, isRecording:', isRecording);
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        recordingUriRef.current = null; // Reset previous recording
        console.log('🎬 Starting camera recording...');
        const video = await cameraRef.current.recordAsync();
        setRecording(video);
        recordingUriRef.current = video.uri; // Store in ref for immediate access
        console.log('✅ Recording saved:', video.uri);
      } catch (error) {
        console.error('❌ Error recording:', error);
        
        // If simulator error, continue streaming without recording
        if (error.message.includes('simulator')) {
          console.log('⚠️ Running on simulator - streaming without video recording');
          Alert.alert(
            'Simulator Limitation',
            'Video recording is not supported on iOS Simulator. The livestream will continue without recording. Test on a physical device for full functionality.',
            [{ text: 'OK' }]
          );
          // Keep isRecording true to maintain streaming state
        } else {
          setIsRecording(false);
        }
      }
    }
  };

  const stopRecording = async () => {
    console.log('⏹️ Stop recording called, isRecording:', isRecording);
    if (cameraRef.current && isRecording) {
      try {
        cameraRef.current.stopRecording();
        setIsRecording(false);
        console.log('✅ Recording stopped');
      } catch (error) {
        console.error('❌ Error stopping recording:', error);
      }
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
      // Stop recording first
      if (cameraRef.current && isRecording) {
        try {
          console.log('⏹️ Stopping recording...');
          cameraRef.current.stopRecording();
          setIsRecording(false);
          
          // Wait for the recording to finish saving (up to 3 seconds)
          let attempts = 0;
          while (!recordingUriRef.current && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          console.log('✅ Recording stopped, URI:', recordingUriRef.current);
        } catch (error) {
          console.error('❌ Error stopping recording:', error);
        }
      }

      // Stop livestream in backend
      if (currentStreamId) {
        await livestreamService.stopLivestream(currentStreamId, {
          maxViewers: viewerCount,
          viewCount: viewerCount,
          likes,
        });

        // Show success immediately, upload video in background
        const videoUri = recordingUriRef.current || recording?.uri;
        if (videoUri) {
          Alert.alert('Success', 'Livestream stopped! Video is being uploaded...');
          console.log('📤 Uploading video to server:', videoUri);
          
          // Upload in background (don't await)
          livestreamService.uploadVideo(currentStreamId, videoUri)
            .then(() => {
              console.log('✅ Video uploaded successfully');
            })
            .catch(uploadError => {
              console.error('❌ Error uploading video:', uploadError);
            });
        } else {
          console.log('⚠️ No video recording to upload');
          Alert.alert('Success', 'Livestream stopped!');
        }

        // Notify via WebSocket
        livestreamService.stopStream(currentStreamId);
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
      setRecording(null);
    } catch (error) {
      console.error('Error stopping stream:', error);
      Alert.alert('Error', 'Failed to stop livestream properly');
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    livestreamService.sendChatMessage(newMessage);
    setNewMessage('');
  };

  const toggleProductPin = async (product) => {
    try {
      const isPinned = pinnedProducts.some((p) => p.productId._id === product._id);

      if (isPinned) {
        await livestreamService.unpinProduct(currentStreamId, product._id);
      } else {
        await livestreamService.pinProduct(currentStreamId, product._id);
      }
    } catch (error) {
      console.error('Error toggling product pin:', error);
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const flipCamera = () => {
    console.log('🔄 Flipping camera from:', cameraFacing);
    setCameraFacing(current => {
      const newFacing = current === 'back' ? 'front' : 'back';
      console.log('🔄 Camera flipped to:', newFacing);
      return newFacing;
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (isStreaming) {
              await stopStream();
            }
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
  console.log('📷 Camera facing:', cameraFacing, 'Type:', typeof cameraFacing);

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
      {/* Agora Broadcaster - broadcasts camera feed to viewers */}
      <AgoraBroadcaster
        streamId={currentStreamId}
        isStreaming={isStreaming}
        cameraFacing={cameraFacing}
        onError={(error) => Alert.alert('Streaming Error', error)}
      />
      
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {console.log('🎥 Rendering CameraView with facing:', cameraFacing, 'Type:', typeof cameraFacing)}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          mode="video"
        >
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

          {/* Bottom Controls */}
          <View style={styles.bottomOverlay}>
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recordButton,
                isStreaming && styles.recordButtonActive,
              ]}
              onPress={isStreaming ? handleStopStream : handleStartStream}
            >
              <View style={[styles.recordButtonInner, isStreaming && styles.recordButtonInnerActive]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.productsButton}
              onPress={() => setShowProductPicker(!showProductPicker)}
              disabled={!isStreaming}
            >
              <Text style={styles.productsButtonText}>🛍️</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {/* Chat Section */}
      {isStreaming && (
        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>Live Chat</Text>
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatMessages}
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd()}
          >
            {chatMessages.map((msg) => (
              <View key={msg.id} style={styles.chatMessage}>
                <Text style={styles.chatUsername}>{msg.username}:</Text>
                <Text style={styles.chatText}>{msg.message}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Send a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendChatMessage}
            />
            <TouchableOpacity style={styles.chatSendButton} onPress={sendChatMessage}>
              <Text style={styles.chatSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    height: height * 0.6,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  recordButtonInnerActive: {
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
  chatSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 12,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chatUsername: {
    fontWeight: 'bold',
    marginRight: 6,
  },
  chatText: {
    flex: 1,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  chatSendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chatSendText: {
    color: COLORS.white,
    fontWeight: '600',
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
