<template>
  <div class="admin-live-stream-page">
    <!-- Page Header -->
    <div class="text-white py-16 admin-stream-header">
      <div class="container mx-auto px-6">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4 text-primary-700">
            {{ t('adminLiveStream') }}
          </h1>
          <p class="text-xl md:text-2xl opacity-90 mb-8 text-primary-700">
            {{ t('broadcastToCustomers') }}
          </p>
          <div class="flex justify-center items-center space-x-2">
            <div :class="{ 'bg-red-500 animate-pulse': isStreaming, 'bg-gray-400': !isStreaming }" class="w-3 h-3 rounded-full"></div>
            <span class="text-lg font-semibold text-primary-700">
              {{ isStreaming ? t('streamingLive') : t('streamOffline') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-12">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Streaming Controls -->
        <div class="lg:col-span-2">
          <!-- Camera Preview/Stream -->
          <div class="bg-black rounded-lg overflow-hidden mb-6">
            <div class="relative aspect-video bg-gray-900 flex items-center justify-center">
              <video 
                v-if="isStreaming || isPreviewing"
                ref="videoPreview"
                :srcObject="localStream"
                autoplay
                muted
                class="w-full h-full object-cover"
              />
              <div v-else class="text-center text-white">
                <div class="mb-4">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">{{ t('cameraNotActive') }}</h3>
                <p class="text-gray-400">{{ t('clickStartToBegin') }}</p>
              </div>
              
              <!-- Stream Status Overlay -->
              <div v-if="isStreaming" class="absolute top-4 left-4 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                <div class="w-2 h-2 bg-red-700 rounded-full animate-pulse"></div>
                <span>{{ t('live') }}</span>
              </div>
              
              <!-- Recording Status Overlay -->
              <div v-if="isRecording" class="absolute top-4 right-4 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                <div class="w-2 h-2 bg-red-700 rounded-full animate-pulse"></div>
                <span>{{ t('recording') || 'REC' }}</span>
              </div>
              
              <!-- Duration -->
              <div v-else-if="isStreaming" class="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                {{ formatDuration(streamDuration) }}
              </div>
            </div>
          </div>
          
          <!-- Stream Controls -->
          <div class="bg-white rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">{{ t('streamControls') }}</h3>
            
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <!-- Start/Stop Stream -->
              <button
                @click="toggleStream"
                :disabled="isLoading"
                :class="{ 'bg-red-300': isStreaming }"
                :style="{ backgroundColor: !isStreaming ? '#F1F2CE' : '' }"
                class="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <svg v-if="!isStreaming" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{{ isStreaming ? t('stopStream') : t('startStream') }}</span>
              </button>
              
              <!-- Camera Toggle -->
                            <!-- Camera Toggle -->
              <button
                @click="toggleCamera"
                :disabled="isLoading"
                :class="{ 'bg-gray-200': !cameraEnabled }"
                :style="{ backgroundColor: cameraEnabled ? '#DBEDEC' : '' }"
                class="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <i class="fas fa-video"></i>
                <span>Camera</span>
              </button>

              <!-- Microphone Toggle -->
              <button
                @click="toggleMicrophone"
                :disabled="isLoading"
                :class="{ 'bg-gray-200': !micEnabled }"
                :style="{ backgroundColor: micEnabled ? '#f9dbd1' : '' }"
                class="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <i class="fas fa-microphone"></i>
                <span>Microphone</span>
              </button>

              <!-- Preview Toggle -->
              <button
                @click="togglePreview"
                :disabled="isLoading"
                :class="{ 'bg-gray-200': !isPreviewing }"
                :style="{ backgroundColor: isPreviewing ? '#F7E0E5' : '' }"
                class="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <i class="fas fa-eye"></i>
                <span>Preview</span>
              </button>
            </div>

            <!-- Recording Status Indicator -->
            <div v-if="isRecording" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                <span class="font-medium">Recording in Progress</span>
                <span class="ml-2 text-sm">({{ formatRecordingTime(recordingDuration) }})</span>
              </div>
            </div>
          </div>
          
          <!-- Pinned Products Management -->
          <div class="bg-white rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">{{ t('pinnedProducts') || 'Pinned Products' }}</h3>
            
            <!-- Add Product Section -->
            <div class="mb-4">
              <div class="flex space-x-2">
                <select
                  v-model="selectedProductToPin"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="">{{ t('selectProduct') || 'Select Product' }}</option>
                  <option 
                    v-for="product in availableProducts" 
                    :key="product._id" 
                    :value="product._id"
                  >
                    {{ product.name }} - ${{ product.price }}
                  </option>
                </select>
                <button
                  @click="pinSelectedProduct"
                  :disabled="!selectedProductToPin || !currentStreamId"
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {{ t('pin') || 'Pin' }}
                </button>
              </div>
            </div>
            
            <!-- Pinned Products List -->
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div 
                v-for="(pinnedProduct, index) in livestreamStore.pinnedProducts" 
                :key="pinnedProduct._id"
                class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <img 
                  :src="getProductImageUrl(pinnedProduct.productId?.image)" 
                  :alt="pinnedProduct.productId?.name"
                  class="w-12 h-12 rounded-lg object-cover"
                  @error="(e) => e.target.src = '/images/fallback-image.jpg'"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm text-gray-900 truncate">
                    {{ pinnedProduct.productId?.name }}
                  </h4>
                  <p class="text-sm text-gray-500">${{ pinnedProduct.productId?.price }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="movePinnedProduct(index, -1)"
                    :disabled="index === 0"
                    class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    :title="t('moveUp') || 'Move Up'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    @click="movePinnedProduct(index, 1)"
                    :disabled="index === livestreamStore.pinnedProducts.length - 1"
                    class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    :title="t('moveDown') || 'Move Down'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    @click="unpinProduct(pinnedProduct.productId._id)"
                    class="p-1 text-red-400 hover:text-red-600"
                    :title="t('unpin') || 'Unpin'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div v-if="livestreamStore.pinnedProducts.length === 0" class="text-center py-4 text-gray-500 text-sm">
                {{ t('noPinnedProducts') || 'No products pinned yet' }}
              </div>
            </div>
          </div>
          
          <!-- Stream Settings -->
          <div class="bg-white rounded-lg p-6">
            <h3 class="text-xl font-bold mb-4">{{ t('streamSettings') }}</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('streamTitle') }}</label>
                <input
                  v-model="streamTitle"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :placeholder="t('enterStreamTitle')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('streamDescription') }}</label>
                <textarea
                  v-model="streamDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :placeholder="t('enterStreamDescription')"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('streamQuality') }}</label>
                <select
                  v-model="streamQuality"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="480p">480p (SD)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Stream Management Sidebar -->
        <div class="lg:col-span-1">
          <!-- Stream Stats -->
          <div class="bg-white rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">{{ t('streamStats') }}</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('viewers') }}</span>
                <span class="font-semibold text-lg">{{ viewerCount }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('likes') }}</span>
                <span class="font-semibold text-lg">{{ likes }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('chatMessages') }}</span>
                <span class="font-semibold text-lg">{{ livestreamStore.chatMessages.length }}</span>
              </div>
              
              <div v-if="isStreaming" class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('duration') }}</span>
                <span class="font-semibold text-lg">{{ formatDuration(streamDuration) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Live Chat Monitor -->
          <div class="bg-white rounded-lg h-96 flex flex-col">
            <div class="p-4 border-b">
              <h3 class="font-semibold text-lg">{{ t('liveChat') }}</h3>
              <p class="text-sm text-gray-500">{{ t('monitorCustomerMessages') }}</p>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="chatContainer">
              <div v-for="message in livestreamStore.chatMessages" :key="message.id" class="flex space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold chat-avatar">
                  {{ message.username?.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-sm">{{ message.username }}</span>
                    <span class="text-xs text-gray-400">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <p class="text-sm text-gray-700">{{ message.message }}</p>
                </div>
              </div>
            </div>
            
            <!-- Admin can respond to chat -->
            <div class="p-4">
              <div class="flex space-x-2">
                <input
                  v-model="newMessage"
                  @keypress.enter="sendAdminMessage"
                  type="text"
                  :placeholder="t('respondToChat')"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  @click="sendAdminMessage"
                  :disabled="!newMessage.trim()"
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stream History -->
      <div class="mt-16">
        <h2 class="text-3xl font-bold mb-8 text-center text-primary-700">{{ t('streamHistory') }}</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="stream in pastStreams" :key="stream.id" class="bg-white rounded-lg overflow-hidden">
            <div class="aspect-video bg-gray-200 flex items-center justify-center relative">
              <img 
                v-if="stream.thumbnailUrl" 
                :src="stream.thumbnailUrl" 
                :alt="stream.title"
                class="w-full h-full object-cover"
                @error="(e) => e.target.style.display = 'none'"
              />
              <div v-else class="flex items-center justify-center w-full h-full">
                <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <!-- Play button overlay -->
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" @click="() => router.push(`/admin/live-stream/watch/${stream.id}`)">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg v-if="stream.videoUrl && stream.videoUrl.trim() !== ''" class="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                  <svg v-else class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <!-- Recording status indicator -->
              <div v-if="!stream.videoUrl || stream.videoUrl.trim() === ''" class="absolute top-2 left-2 bg-orange-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                {{ t('noRecording') || 'No Recording' }}
              </div>
              
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {{ stream.duration }}
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-semibold text-lg mb-2">{{ stream.title }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ stream.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ formatDate(stream.date) }}</span>
                <div class="flex items-center space-x-4">
                  <span class="text-sm primary-text">{{ stream.views }} {{ t('views') }}</span>
                  <button class="text-sm text-red-500 hover:text-red-700" @click="deleteStream(stream.id)">
                    {{ t('delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { livestreamStore } from '@/stores/livestreamStore';

const { t } = useI18n();
const router = useRouter();

// Reactive data
const isStreaming = ref(false);
const isPreviewing = ref(false);
const isLoading = ref(false);
const cameraEnabled = ref(true);
const micEnabled = ref(true);
const localStream = ref(null);
const videoPreview = ref(null);
const streamDuration = ref(0);
const streamTimer = ref(null);
const actualStreamUrl = ref('');

// Stream settings
const streamTitle = ref('WrenCos Beauty Live Session');
const streamDescription = ref('Join us for an exclusive live beauty session with tips, tricks, and product demonstrations.');
const streamQuality = ref('720p');

// Chat and stats
const viewerCount = computed(() => livestreamStore.adminStreamData.viewerCount);
const likes = computed(() => livestreamStore.adminStreamData.likes);
// Use livestreamStore.chatMessages instead of local array
const newMessage = ref('');
const chatContainer = ref(null);

// Backend integration
const currentStreamId = ref(null);
const apiUrl = 'http://localhost:3000';

// Pinned products management
const availableProducts = ref([]);
const selectedProductToPin = ref('');

// Video recording
    const mediaRecorder = ref(null);
    const recordedChunks = ref([]);
    const isRecording = ref(false);
    const recordingDuration = ref(0);
    const recordingTimer = ref(null);// Mock past streams data - will be replaced with API call
const pastStreams = ref([]);

// API functions
const stopAnyActiveStreams = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/livestreams/active`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.livestream) {
        console.log('Found active stream, stopping it...');
        const stopResponse = await fetch(`${apiUrl}/livestreams/${data.livestream._id}/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });
        
        if (stopResponse.ok) {
          console.log('Successfully stopped active stream');
        }
      }
    }
  } catch (error) {
    console.error('Error checking/stopping active streams:', error);
  }
};

const createLiveStream = async () => {
  try {
    // First, stop any active streams as a safety measure
    await stopAnyActiveStreams();
    
    // Debug: Log the stream URL being sent
    console.log('🔍 Creating livestream with data:', {
      title: streamTitle.value,
      description: streamDescription.value,
      quality: streamQuality.value,
      streamUrl: actualStreamUrl.value,
      isAutoGenerated: actualStreamUrl.value.startsWith('blob:')
    });
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/livestreams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: streamTitle.value,
        description: streamDescription.value,
        quality: streamQuality.value,
        streamUrl: actualStreamUrl.value || ''
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Failed to create livestream';
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    currentStreamId.value = data.livestream._id;
    
    // Fetch pinned products for this stream
    await livestreamStore.fetchPinnedProducts(currentStreamId.value);
    
    return data.livestream;
  } catch (error) {
    console.error('Error creating livestream:', error);
    alert(error.message || t('failedToCreateStream') || 'Failed to create livestream');
    throw error;
  }
};

const stopLiveStream = async () => {
  if (!currentStreamId.value) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/livestreams/${currentStreamId.value}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        maxViewers: viewerCount.value,
        viewCount: viewerCount.value,
        likes: likes.value
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to stop livestream');
    }
    
    const data = await response.json();
    currentStreamId.value = null;
    
    // Clear pinned products when stream stops
    livestreamStore.clearPinnedProducts();
    
    // Don't refresh past streams immediately - let recording upload complete first
    // fetchPastStreams() will be called after recording upload finishes
    
    return data.livestream;
  } catch (error) {
    console.error('Error stopping livestream:', error);
    alert(t('failedToStopStream') || 'Failed to stop livestream');
    throw error;
  }
};

const fetchPastStreams = async () => {
  try {
    console.log('Fetching past streams from:', `${apiUrl}/livestreams/past?limit=6`);
    const response = await fetch(`${apiUrl}/livestreams/past?limit=6`);
    if (!response.ok) {
      throw new Error('Failed to fetch past streams');
    }
    
    const data = await response.json();
    console.log('Received past streams data:', data);
    pastStreams.value = data.livestreams.map(stream => ({
      id: stream._id,
      title: stream.title,
      description: stream.description,
      date: new Date(stream.endTime || stream.createdAt),
      duration: stream.formattedDuration || formatDuration(stream.duration),
      views: stream.viewCount.toLocaleString(),
      videoUrl: stream.videoUrl,
      thumbnailUrl: stream.thumbnailUrl ? `${apiUrl}${stream.thumbnailUrl}` : ''
    }));
    console.log('Mapped past streams:', pastStreams.value);
  } catch (error) {
    console.error('Error fetching past streams:', error);
  }
};

// Fetch available products for pinning
const fetchAvailableProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/products`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      availableProducts.value = products;
      console.log('Fetched available products:', products.length);
    }
  } catch (error) {
    console.error('Error fetching available products:', error);
  }
};

// Get product image URL
const getProductImageUrl = (imagePath) => {
  if (!imagePath) return '/images/fallback-image.jpg';
  return `${apiUrl}/${imagePath}`;
};

// Pin selected product
const pinSelectedProduct = async () => {
  if (!selectedProductToPin.value || !currentStreamId.value) return;
  
  try {
    await livestreamStore.pinProduct(currentStreamId.value, selectedProductToPin.value);
    selectedProductToPin.value = '';
    console.log('Product pinned successfully');
  } catch (error) {
    console.error('Error pinning product:', error);
    alert(error.message || 'Failed to pin product');
  }
};

// Unpin product
const unpinProduct = async (productId) => {
  if (!currentStreamId.value) return;
  
  try {
    await livestreamStore.unpinProduct(currentStreamId.value, productId);
    console.log('Product unpinned successfully');
  } catch (error) {
    console.error('Error unpinning product:', error);
    alert(error.message || 'Failed to unpin product');
  }
};

// Move pinned product up or down
const movePinnedProduct = async (currentIndex, direction) => {
  const newIndex = currentIndex + direction;
  if (newIndex < 0 || newIndex >= livestreamStore.pinnedProducts.length) return;
  
  // Create new order array
  const productOrders = livestreamStore.pinnedProducts.map((product, index) => {
    let newOrder = index;
    if (index === currentIndex) {
      newOrder = newIndex;
    } else if (index === newIndex) {
      newOrder = currentIndex;
    }
    
    return {
      productId: product.productId._id,
      displayOrder: newOrder
    };
  });
  
  try {
    await livestreamStore.updatePinnedProductOrder(currentStreamId.value, productOrders);
    console.log('Product order updated successfully');
  } catch (error) {
    console.error('Error updating product order:', error);
    alert(error.message || 'Failed to update product order');
  }
};

const addChatMessage = async (username, message, isAdmin = false) => {
  if (!currentStreamId.value) return;
  
  try {
    const response = await fetch(`${apiUrl}/livestreams/${currentStreamId.value}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        message,
        isAdmin
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add chat message');
    }
  } catch (error) {
    console.error('Error adding chat message:', error);
  }
};

// Video recording functions
const startRecording = (stream) => {
  try {
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus'
    };
    
    // Fallback MIME types if VP9 is not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/mp4';
        }
      }
    }
    
    mediaRecorder.value = new MediaRecorder(stream, options);
    recordedChunks.value = [];
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data);
      }
    };
    
    mediaRecorder.value.onstop = async () => {
      // Clear the timer when recording stops
      if (recordingTimer.value) {
        clearInterval(recordingTimer.value);
        recordingTimer.value = null;
      }
      
      const recordedBlob = new Blob(recordedChunks.value, { type: 'video/webm' });
      await uploadRecording(recordedBlob);
      isRecording.value = false;
    };
    
    mediaRecorder.value.start(1000); // Record in 1-second chunks
    isRecording.value = true;
    recordingDuration.value = 0;
    
    // Start timer
    recordingTimer.value = setInterval(() => {
      recordingDuration.value++;
    }, 1000);
    
    console.log('Started recording stream');
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Recording not supported in this browser');
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
    
    // Clear the timer
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value);
      recordingTimer.value = null;
    }
    
    console.log('Stopped recording stream');
  }
};

const uploadRecording = async (videoBlob) => {
  // Use the stored stream ID, don't rely on currentStreamId which might be null
  const streamId = currentStreamId.value;
  if (!streamId) {
    console.warn('⚠️ No stream ID available for recording upload');
    return;
  }
  
  try {
    // Create FormData to upload the video
    const formData = new FormData();
    formData.append('video', videoBlob, `stream-${streamId}-${Date.now()}.webm`);
    
    const token = localStorage.getItem('token');
    
    // Upload the video file
    const uploadResponse = await fetch(`${apiUrl}/livestreams/${streamId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload video');
    }
    
    const uploadData = await uploadResponse.json();
    console.log('Video uploaded successfully:', uploadData);
    
    // Generate thumbnail
    console.log('🖼️ Generating thumbnail for recorded video...');
    const thumbnail = await generateThumbnail(videoBlob);
    let thumbnailUrl = '';
    
    if (thumbnail) {
      console.log('✅ Thumbnail generated, uploading...');
      thumbnailUrl = await uploadThumbnail(thumbnail, streamId);
      if (thumbnailUrl) {
        console.log('✅ Thumbnail upload completed:', thumbnailUrl);
      } else {
        console.warn('⚠️ Thumbnail upload returned empty URL');
      }
    } else {
      console.warn('⚠️ Thumbnail generation failed - video will be saved without thumbnail');
    }
    
    // Update the livestream record with video URL and thumbnail
    const updateResponse = await fetch(`${apiUrl}/livestreams/${streamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        videoUrl: `uploads/livestreams/${uploadData.filename}`,
        thumbnailUrl: thumbnailUrl,
        isRecorded: true
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update livestream record');
    }
    
    console.log('Livestream updated with recording details');
    
    // Now refresh the past streams to show the completed recording with thumbnail
    console.log('🔄 Refreshing past streams with completed recording...');
    await fetchPastStreams();
  } catch (error) {
    console.error('Error uploading recording:', error);
    alert('Failed to save recording');
  }
};

const generateThumbnail = (videoBlob) => {
  return new Promise((resolve) => {
    console.log('🖼️ Starting thumbnail generation for video blob:', videoBlob.size, 'bytes');
    
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let thumbnailGenerated = false;
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!thumbnailGenerated) {
        console.error('❌ Thumbnail generation timed out after 10 seconds');
        URL.revokeObjectURL(video.src);
        resolve(null);
      }
    }, 10000);
    
    video.onloadeddata = () => {
      console.log('📹 Video loaded - Duration:', video.duration, 'Size:', video.videoWidth + 'x' + video.videoHeight);
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('❌ Invalid video dimensions');
        clearTimeout(timeout);
        URL.revokeObjectURL(video.src);
        resolve(null);
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Seek to 1 second (or 10% of video duration)
      const seekTime = Math.min(1, video.duration * 0.1);
      console.log('⏭️ Seeking to time:', seekTime);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      try {
        console.log('🎯 Video seek completed, drawing to canvas');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          thumbnailGenerated = true;
          clearTimeout(timeout);
          URL.revokeObjectURL(video.src);
          
          if (blob) {
            console.log('✅ Thumbnail generated successfully:', blob.size, 'bytes');
            resolve(blob);
          } else {
            console.error('❌ Failed to create thumbnail blob');
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        console.error('❌ Error during thumbnail generation:', error);
        thumbnailGenerated = true;
        clearTimeout(timeout);
        URL.revokeObjectURL(video.src);
        resolve(null);
      }
    };
    
    video.onerror = (error) => {
      console.error('❌ Video error during thumbnail generation:', error);
      thumbnailGenerated = true;
      clearTimeout(timeout);
      URL.revokeObjectURL(video.src);
      resolve(null);
    };
    
    try {
      video.src = URL.createObjectURL(videoBlob);
      video.load();
    } catch (error) {
      console.error('❌ Error creating video URL:', error);
      clearTimeout(timeout);
      resolve(null);
    }
  });
};

const uploadThumbnail = async (thumbnailBlob, streamId = null) => {
  const useStreamId = streamId || currentStreamId.value;
  
  if (!useStreamId) {
    console.error('❌ No stream ID available for thumbnail upload');
    return '';
  }
  
  try {
    console.log('📤 Uploading thumbnail for stream:', useStreamId, 'Size:', thumbnailBlob.size, 'bytes');
    
    const formData = new FormData();
    formData.append('thumbnail', thumbnailBlob, `thumbnail-${useStreamId}-${Date.now()}.jpg`);
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${apiUrl}/uploads/thumbnail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Thumbnail uploaded successfully:', data);
      return data.path || '';
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Thumbnail upload failed with status:', response.status, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error uploading thumbnail:', error);
    // Don't silently fail - this helps debug thumbnail issues
    alert(`Warning: Thumbnail upload failed - ${error.message}. Video will be saved without thumbnail.`);
  }
  
  return '';
};

// Methods
const formatTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const getMediaStream = async () => {
  try {
    const constraints = {
      video: cameraEnabled.value ? { width: 1280, height: 720 } : false,
      audio: micEnabled.value
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStream.value = stream;
    
    // Store the stream in the livestream store for sharing
    livestreamStore.setSharedMediaStream(stream);
    
    // Also set for WebRTC broadcasting
    await livestreamStore.setLocalMediaStream(stream);
    
    // Set a descriptive URL for display purposes
    actualStreamUrl.value = 'blob:live-camera-stream-' + Date.now();
    console.log('📹 MediaStream obtained and stored for sharing and WebRTC');
    
    if (videoPreview.value) {
      videoPreview.value.srcObject = stream;
    }
    
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    alert(t('mediaAccessError'));
    return null;
  }
};

const stopMediaStream = () => {
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
    localStream.value = null;
  }
  // Clear the shared stream when stopping
  livestreamStore.setSharedMediaStream(null);
  actualStreamUrl.value = '';
};

const toggleStream = async () => {
  if (isStreaming.value) {
    // Stop streaming and recording
    isStreaming.value = false;
    
    if (streamTimer.value) {
      clearInterval(streamTimer.value);
      streamTimer.value = null;
    }
    
    // Stop recording if active (but keep currentStreamId for upload)
    const recordingStreamId = currentStreamId.value; // Preserve for recording upload
    if (isRecording.value) {
      stopRecording();
    }
    
    // Stop WebRTC broadcast
    livestreamStore.stopWebRTCBroadcast();
    
    stopMediaStream();
    
    // Clean up stream URL
    if (actualStreamUrl.value) {
      URL.revokeObjectURL(actualStreamUrl.value);
      actualStreamUrl.value = '';
    }
    
    try {
      // Stop livestream in database
      if (recordingStreamId) {
        await stopLiveStream();
      }
      
      // Update shared store
      livestreamStore.stopAdminStream();
      
      console.log('Stream stopped and saved to database');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
    
    streamDuration.value = 0;
  } else {
    // Start streaming
    isLoading.value = true;
    
    try {
      // Clear chat messages from previous stream
      livestreamStore.clearChatMessages();
      
      const stream = await getMediaStream();
      if (stream) {
        // Create livestream in database
        const livestream = await createLiveStream();
        
        isStreaming.value = true;
        isPreviewing.value = false;
        
        // Start WebRTC broadcast
        await livestreamStore.startWebRTCBroadcast(stream);
        console.log('🎥 WebRTC broadcast started for cross-browser streaming');
        
        // Start recording the stream
        startRecording(stream);
        
        // Start duration timer
        streamTimer.value = setInterval(() => {
          streamDuration.value++;
        }, 1000);
        
        // Update shared store with data from backend response (no stream URL needed for WebRTC)
        livestreamStore.startAdminStream({
          title: livestream.title,
          description: livestream.description,
          quality: livestream.quality,
          streamUrl: '' // Empty for WebRTC streaming
        });
        
        // Broadcast stream start without stream URL (customers use WebRTC)
        livestreamStore.broadcastStreamStatus({
          type: 'stream_started',
          streamData: {
            streamId: livestream._id, // Include stream ID for tracking likes
            title: livestream.title,
            description: livestream.description,
            startTime: livestream.startTime || new Date(),
            viewerCount: livestream.viewerCount || 0,
            likes: livestream.likes || 0,
            likedBy: livestream.likedBy || [], // Include likedBy array
            streamUrl: '', // Empty - customers get video via WebRTC
            quality: livestream.quality
          }
        });
        
        console.log('Stream started with WebRTC and recording began:', livestream);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    } finally {
      isLoading.value = false;
    }
  }
};

const togglePreview = async () => {
  if (isPreviewing.value) {
    isPreviewing.value = false;
    stopMediaStream();
  } else {
    isLoading.value = true;
    try {
      const stream = await getMediaStream();
      if (stream) {
        isPreviewing.value = true;
      }
    } catch (error) {
      console.error('Error starting preview:', error);
    } finally {
      isLoading.value = false;
    }
  }
};

const toggleCamera = async () => {
  cameraEnabled.value = !cameraEnabled.value;
  
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = cameraEnabled.value;
    }
  } else if (isPreviewing.value || isStreaming.value) {
    // Restart stream with new camera setting
    stopMediaStream();
    await getMediaStream();
  }
};

const toggleMicrophone = async () => {
  micEnabled.value = !micEnabled.value;
  
  if (localStream.value) {
    const audioTrack = localStream.value.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = micEnabled.value;
    }
  } else if (isPreviewing.value || isStreaming.value) {
    // Restart stream with new microphone setting
    stopMediaStream();
    await getMediaStream();
  }
};

const sendAdminMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  const message = {
    id: Date.now(),
    username: 'Admin',
    message: newMessage.value,
    timestamp: new Date(),
    isAdmin: true
  };
  
  // Only send via WebSocket - backend will save to database automatically
  livestreamStore.addChatMessage(message);
  newMessage.value = '';
  
  // Auto scroll to bottom
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const deleteStream = async (streamId) => {
  if (confirm(t('confirmDeleteStream'))) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/livestreams/${streamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchPastStreams(); // Refresh the list
      } else {
        throw new Error('Failed to delete stream');
      }
    } catch (error) {
      console.error('Error deleting stream:', error);
      alert(t('failedToDeleteStream') || 'Failed to delete stream');
    }
  }
};

onMounted(async () => {
  // Fetch past streams from backend
  fetchPastStreams();
  
  // Fetch available products for pinning
  fetchAvailableProducts();
  
  // Connect to WebSocket as admin - WebRTC will auto-initialize after registration
  const token = localStorage.getItem('token');
  livestreamStore.connectWebSocket('admin', token);
  
  // Add browser navigation protection
  window.addEventListener('beforeunload', handleBeforeUnload);
});

// Handle browser navigation/close while streaming
const handleBeforeUnload = (event) => {
  if (isStreaming.value) {
    event.preventDefault();
    event.returnValue = 'Please click the "Stop Stream" button to end your livestream before navigating away from this page.';
    return event.returnValue;
  }
};

// Handle Vue Router navigation while streaming
onBeforeRouteLeave((to, from, next) => {
  if (isStreaming.value) {
    alert('Please click the "Stop Stream" button to end your livestream before navigating to another page.');
    next(false); // Cancel navigation
  } else {
    next(); // Allow navigation
  }
});

// Utility function to format recording duration
const formatRecordingTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

onUnmounted(() => {
  // Clean up
  if (streamTimer.value) {
    clearInterval(streamTimer.value);
  }
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
  }
  
  // Remove browser navigation protection
  window.removeEventListener('beforeunload', handleBeforeUnload);
  
  stopMediaStream();
  
  // Disconnect WebSocket
  livestreamStore.disconnectWebSocket();
});
</script>

<style scoped>
/* Header gradient background */
.admin-stream-header {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-300) 100%);
  position: relative;
  overflow: hidden;
}

.admin-stream-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(251, 249, 251, 0.3);
}

.admin-stream-header::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -25%;
  width: 150%;
  height: 200%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(243, 176, 250, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(230, 120, 249, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(252, 248, 252, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Chat avatar gradient background */
.chat-avatar {
  background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%);
}

/* Primary text color */
.primary-text {
  color: var(--primary-600);
}

/* Animation for slide up */
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>