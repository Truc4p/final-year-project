<template>
  <div class="live-stream-page">
    <!-- Page Header -->
    <div class="text-white py-16 live-stream-header">
      <div class="container mx-auto px-6">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4 text-primary-700">
            {{ t('liveStream') }}
          </h1>
          <p class="text-xl md:text-2xl opacity-90 mb-8 text-primary-700">
            {{ t('watchOurLatestLiveStreams') }}
          </p>
          <div class="flex justify-center items-center space-x-2">
            <div class="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            <span class="text-lg font-semibold text-primary-700">{{ isLive ? t('liveNow') : t('nextStreamSoon') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-12">
      <!-- Live Stream Section -->
      <div class="mb-16">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Video Player -->
          <div class="lg:col-span-2">
            <div class="bg-black rounded-lg overflow-hidden shadow-xl">
              <div class="relative aspect-video bg-gray-100 flex items-center justify-center">
                <div v-if="!streamUrl" class="text-center text-white">
                  <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 000 2h8a1 1 0 100-2H5z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">{{ t('noActiveStream') }}</h3>
                  <p class="text-gray-400">{{ t('streamWillStartSoon') }}</p>
                </div>
                <video 
                  v-else
                  ref="videoPlayer"
                  controls
                  autoplay
                  muted
                  playsinline
                  class="w-full h-full"
                  @loadstart="onVideoLoadStart"
                  @canplay="onVideoCanPlay"
                  @error="onVideoError"
                >
                  {{ t('videoNotSupported') }}
                </video>
              </div>
            </div>
            
            <!-- Stream Info -->
            <div class="bg-white rounded-lg shadow-lg mt-6 p-6">
              <h2 class="text-2xl font-bold mb-4">{{ currentStream?.title || t('liveStreamTitle') }}</h2>
              <p class="text-gray-600 mb-4">{{ currentStream?.description || t('liveStreamDescription') }}</p>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div v-if="isLive" class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span class="text-sm font-medium text-red-600">{{ viewerCount }} {{ t('viewers') }}</span>
                  </div>
                  <div v-if="isLive" class="text-sm text-gray-500">
                    {{ t('startedAt') }}: {{ formatTime(currentStream?.startTime) }}
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="toggleLike"
                    :class="{ 'text-red-500': isLiked, 'text-gray-400': !isLiked }"
                    class="flex items-center space-x-1 hover:text-red-500 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ likes }}</span>
                  </button>
                  
                  <button 
                    @click="shareStream"
                    class="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>{{ t('share') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-lg h-full max-h-96 lg:max-h-[500px] flex flex-col">
              <div class="p-4 border-b">
                <h3 class="font-semibold text-lg">{{ t('liveChat') }}</h3>
                <p class="text-sm text-gray-500">{{ chatMessages.length }} {{ t('messages') }}</p>
              </div>
              
              <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="chatContainer">
                <div v-for="message in chatMessages" :key="message.id" class="flex space-x-3">
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
              
              <div class="p-4 border-t">
                <div class="flex space-x-2">
                  <input
                    v-model="newMessage"
                    @keypress.enter="sendMessage"
                    type="text"
                    :placeholder="t('typeMessage')"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent chat-input"
                  />
                  <button
                    @click="sendMessage"
                    :disabled="!newMessage.trim()"
                    class="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors send-button"
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
      </div>

      <!-- Upcoming Streams -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-8 text-center text-primary-700">{{ t('upcomingStreams') }}</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="stream in upcomingStreams" :key="stream.id" class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div class="aspect-video flex items-center justify-center stream-placeholder">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="p-6">
              <h3 class="font-semibold text-lg mb-2">{{ stream.title }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ stream.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ formatDate(stream.scheduledTime) }}</span>
                <button class="font-medium text-sm primary-text-hover">
                  {{ t('setReminder') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Streams -->
      <div>
        <h2 class="text-3xl font-bold mb-8 text-center text-primary-700">{{ t('pastStreams') }}</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="stream in pastStreams" :key="stream.id" class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" @click="watchRecording(stream)">
            <div class="aspect-video bg-gray-200 flex items-center justify-center relative group">
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
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div v-if="stream.recordingUrl && stream.recordingUrl.trim() !== ''" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <svg class="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </div>
                <div v-else class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <!-- Recording status indicator -->
              <div v-if="!stream.recordingUrl || stream.recordingUrl.trim() === ''" class="absolute top-2 left-2 bg-gray-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                {{ t('noRecording') || 'No Recording' }}
              </div>
              
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {{ stream.duration }}
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-semibold text-lg mb-2 line-clamp-1">{{ stream.title }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ stream.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ formatDate(stream.date) }}</span>
                <span class="text-sm primary-text font-medium">{{ stream.views }} {{ t('views') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { livestreamStore } from '@/stores/livestreamStore';

const { t } = useI18n();
const router = useRouter();

// Reactive data - now using shared store for live stream data
const isLive = computed(() => livestreamStore.isAdminStreaming);
const streamUrl = computed(() => {
  if (!livestreamStore.isAdminStreaming) return '';
  
  // For WebRTC streaming, we don't use URLs - return placeholder
  if (livestreamStore.sharedMediaStream) {
    return 'mediastream://active'; // Placeholder to indicate stream is active
  }
  
  // Since we're using WebRTC, don't fall back to blob URLs
  // They don't work cross-browser which is why we implemented WebRTC
  return 'webrtc://waiting'; // Placeholder indicating WebRTC connection expected
});
const currentStream = computed(() => livestreamStore.isAdminStreaming ? livestreamStore.adminStreamData : null);
const viewerCount = computed(() => livestreamStore.adminStreamData.viewerCount);
const likes = computed(() => livestreamStore.adminStreamData.likes);

// Generate or retrieve user session ID
const getUserSessionId = () => {
  let sessionId = localStorage.getItem('livestream_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('livestream_session_id', sessionId);
  }
  return sessionId;
};

// Get user ID from token if authenticated
const getUserId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.user?.id;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const userId = ref(getUserId());
const sessionId = ref(getUserSessionId());

// Check if current user has liked
const isLiked = computed(() => {
  return livestreamStore.hasUserLiked(userId.value, sessionId.value);
});

const chatMessages = computed(() => livestreamStore.chatMessages);
const newMessage = ref('');
const chatContainer = ref(null);
const videoPlayer = ref(null);

// Mock data for demonstration
const upcomingStreams = ref([
  {
    id: 1,
    title: 'New Product Launch',
    description: 'Discover our latest skincare collection',
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  },
  {
    id: 2,
    title: 'Beauty Tips & Tricks',
    description: 'Learn professional makeup techniques',
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  {
    id: 3,
    title: 'Q&A Session',
    description: 'Ask our beauty experts anything',
    scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  },
]);

const pastStreams = ref([]);

// Backend integration
const apiUrl = 'http://localhost:3000';

const fetchPastStreams = async () => {
  try {
    console.log('Customer: Fetching past streams from:', `${apiUrl}/livestreams/past?limit=12`);
    const response = await fetch(`${apiUrl}/livestreams/past?limit=12`);
    if (!response.ok) {
      throw new Error('Failed to fetch past streams');
    }
    
    const data = await response.json();
    console.log('Customer: Received past streams data:', data);
    pastStreams.value = data.livestreams.map(stream => ({
      id: stream._id,
      title: stream.title,
      description: stream.description,
      date: new Date(stream.endTime || stream.createdAt),
      duration: stream.formattedDuration || formatDuration(stream.duration),
      views: stream.viewCount.toLocaleString(),
      recordingUrl: stream.videoUrl,
      thumbnailUrl: stream.thumbnailUrl ? `${apiUrl}${stream.thumbnailUrl}` : '',
      streamId: stream._id
    }));
    console.log('Customer: Mapped past streams:', pastStreams.value);
  } catch (error) {
    console.error('Error fetching past streams:', error);
    // Keep mock data as fallback
    pastStreams.value = [
      {
        id: 1,
        title: 'Holiday Makeup Tutorial',
        description: 'Perfect looks for the holiday season',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: '45:32',
        views: '1.2K',
        recordingUrl: '/recordings/holiday-makeup.mp4'
      },
      {
        id: 2,
        title: 'Skincare Routine Demo',
        description: 'Step-by-step skincare for all skin types',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        duration: '38:15',
        views: '2.8K',
        recordingUrl: '/recordings/skincare-routine.mp4'
      }
    ];
  }
};

const incrementViewCount = async (streamId) => {
  try {
    await fetch(`${apiUrl}/livestreams/${streamId}/view`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
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

const toggleLike = () => {
  // Send toggle request to WebSocket server
  livestreamStore.toggleLike(userId.value, sessionId.value);
};

const shareStream = () => {
  if (navigator.share) {
    navigator.share({
      title: 'WrenCos Live Stream',
      text: 'Check out this live stream!',
      url: window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert(t('linkCopied'));
  }
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  
  const message = {
    id: Date.now(),
    username: 'Customer', // In real app, get from auth
    message: newMessage.value,
    timestamp: new Date(),
    isAdmin: false
  };
  
  // Send via WebSocket - will be broadcast back to all clients including us
  livestreamStore.addChatMessage(message);
  newMessage.value = '';
  
  // Auto scroll to bottom
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const watchRecording = (stream) => {
  // Increment view count regardless
  if (stream.streamId) {
    incrementViewCount(stream.streamId);
  }
  
  // Navigate to dedicated video player or show info
  if (stream.recordingUrl && stream.recordingUrl.trim() !== '') {
    if (stream.recordingUrl.startsWith('http')) {
      // External URL - open in new tab
      window.open(stream.recordingUrl, '_blank');
    } else {
      // Internal route - navigate to video player page
      router.push(`/live-stream/watch/${stream.id}`);
    }
  } else {
    // Show stream details even if no recording available
    router.push(`/live-stream/watch/${stream.id}`);
  }
};

// Video event handlers
const onVideoLoadStart = () => {
  console.log('Video loading started');
};

const onVideoCanPlay = () => {
  console.log('Video can play');
};

const onVideoError = (event) => {
  console.error('Video error:', event);
  
  // Get more specific error information
  const video = event.target;
  const error = video.error;
  
  if (error) {
    let errorMessage = 'Unknown video error';
    
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        errorMessage = 'Video playback was aborted';
        break;
      case error.MEDIA_ERR_NETWORK:
        errorMessage = 'Network error occurred while loading video';
        break;
      case error.MEDIA_ERR_DECODE:
        errorMessage = 'Video decoding error';
        break;
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = 'Video format not supported or source URL invalid';
        break;
    }
    
    console.error('Specific video error:', errorMessage);
    console.error('Stream URL:', streamUrl.value);
    
    // For WebRTC streaming, blob URL errors are expected - we don't use URLs
    if (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED && streamUrl.value.startsWith('webrtc://')) {
      console.log('ℹ️ Waiting for WebRTC stream connection...');
      return; // Don't show error for WebRTC waiting state
    }
    
    // Optionally, show user-friendly error message for other errors
    if (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      console.warn('Stream URL appears to be invalid or the video format is not supported by the browser');
    }
  }
};

onMounted(async () => {
  // Fetch past streams from backend
  fetchPastStreams();
  
  // Connect to WebSocket as customer - WebRTC will auto-initialize after registration
  const token = localStorage.getItem('token'); // May be null for anonymous users
  livestreamStore.connectWebSocket('customer', token);
  
  // Auto scroll chat to bottom when new messages arrive
  setInterval(() => {
    if (chatContainer.value && livestreamStore.chatMessages.length > 0) {
      nextTick(() => {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      });
    }
  }, 1000);
  
  // For demo purposes, we're not setting a real stream URL
  // In production, this would come from your streaming service
  // streamUrl.value = 'your-stream-url-here';
});

// Watch for shared MediaStream and WebRTC remote streams
watch([
  () => livestreamStore.sharedMediaStream,
  () => livestreamStore.remoteMediaStreams.size > 0 ? Array.from(livestreamStore.remoteMediaStreams.values())[0] : null
], ([sharedStream, remoteStream]) => {
  console.log('🔍 Watcher triggered:', {
    sharedStreamExists: !!sharedStream,
    remoteStreamExists: !!remoteStream,
    videoPlayerExists: !!videoPlayer.value,
    remoteStreamMapSize: livestreamStore.remoteMediaStreams.size
  });
  
  // Use nextTick to ensure video element is ready
  nextTick(() => {
    if (!videoPlayer.value) {
      console.log('⚠️ videoPlayer.value is null, retrying...');
      // Retry after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (videoPlayer.value) {
          applyStreamToVideo(sharedStream, remoteStream);
        }
      }, 100);
      return;
    }
    
    applyStreamToVideo(sharedStream, remoteStream);
  });
}, { immediate: true });

// Helper function to apply stream to video element
const applyStreamToVideo = (sharedStream, remoteStream) => {
  if (!videoPlayer.value) return;
  
  // Priority: WebRTC remote stream (cross-browser) > shared stream (same context)
  const streamToUse = remoteStream || sharedStream;
  
  if (streamToUse) {
    // Check if this is the same stream already playing
    const currentStream = videoPlayer.value.srcObject;
    if (currentStream && currentStream.id === streamToUse.id) {
      console.log('ℹ️ Same stream already playing, skipping update');
      return;
    }
    
    console.log('🎥 Customer: Setting stream to video element:', remoteStream ? 'WebRTC Remote Stream' : 'Shared MediaStream');
    
    // Clear any existing src to avoid conflicts
    videoPlayer.value.src = '';
    videoPlayer.value.removeAttribute('src');
    videoPlayer.value.srcObject = streamToUse;
    
    // Force the video to play
    videoPlayer.value.play().then(() => {
      console.log('✅ Video playing successfully');
    }).catch(error => {
      console.error('❌ Error playing stream:', error);
      
      // Try to play again without autoplay restrictions
      setTimeout(() => {
        if (videoPlayer.value && videoPlayer.value.srcObject) {
          videoPlayer.value.play().catch(err => console.error('❌ Retry failed:', err));
        }
      }, 100);
    });
  } else if (!isLive.value) {
    // Only clear if there's actually no active stream
    console.log('🎥 Customer: No active stream - clearing video element');
    videoPlayer.value.srcObject = null;
    videoPlayer.value.src = '';
    videoPlayer.value.removeAttribute('src');
  } else {
    // Stream is active but not received yet - don't clear, just wait
    console.log('⏳ Stream active but not received yet - waiting for WebRTC stream...');
  }
};

onUnmounted(() => {
  // Disconnect WebSocket when component is unmounted
  livestreamStore.disconnectWebSocket();
});
</script>

<style scoped>
/* Header gradient background */
.live-stream-header {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-300) 100%);
  position: relative;
  overflow: hidden;
}

.live-stream-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(251, 249, 251, 0.3);
}

.live-stream-header::after {
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

/* Chat input focus ring color */
.chat-input {
  --tw-ring-color: var(--primary-500);
}

/* Send button styles */
.send-button {
  background-color: var(--primary-600);
}

.send-button:hover:not(:disabled) {
  background-color: var(--primary-700);
}

.send-button:disabled {
  background-color: var(--primary-600);
}

/* Stream placeholder gradient background */
.stream-placeholder {
  background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 50%, var(--primary-600) 100%);
}

/* Primary text color */
.primary-text {
  color: var(--primary-600);
}

/* Primary text with hover effect */
.primary-text-hover {
  color: var(--primary-600);
  transition: color 0.3s ease;
}

.primary-text-hover:hover {
  color: var(--primary-800);
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s infinite;
}

@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

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
</style>