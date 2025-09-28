<template>
  <div class="livestream-player-page">
    <!-- Back Navigation -->
    <div class="container mx-auto px-6 py-4">
      <button 
        @click="$router.go(-1)"
        class="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{{ t('backToStreams') || 'Back to Streams' }}</span>
      </button>
    </div>

    <div class="container mx-auto px-6 pb-12">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="stream" class="grid lg:grid-cols-3 gap-8">
        <!-- Video Player Section -->
        <div class="lg:col-span-2">
          <!-- Video Player -->
          <div class="bg-black rounded-lg overflow-hidden shadow-xl mb-6">
            <div class="relative aspect-video">
              <video 
                v-if="stream.videoUrl"
                ref="videoPlayer"
                :src="stream.videoUrl.startsWith('http') ? stream.videoUrl : `${apiUrl}/${stream.videoUrl.replace(/^\/+/, '')}`"
                controls
                class="w-full h-full"
                @loadstart="onVideoLoadStart"
                @canplay="onVideoCanPlay"
                @error="onVideoError"
                @play="onVideoPlay"
              >
                {{ t('videoNotSupported') || 'Your browser does not support the video tag.' }}
              </video>
              <div v-else class="flex items-center justify-center h-full text-white">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <h3 class="text-xl font-semibold mb-2">{{ t('videoNotAvailable') || 'Video Not Available' }}</h3>
                  <p class="text-gray-400">{{ t('videoNotAvailableDesc') || 'The recording for this stream is not available.' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Stream Information -->
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 class="text-2xl lg:text-3xl font-bold mb-4">{{ stream.title }}</h1>
            <p class="text-gray-600 mb-6">{{ stream.description }}</p>
            
            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{{ stream.viewCount?.toLocaleString() || 0 }} {{ t('views') || 'views' }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ formatDuration(stream.duration) }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatDate(stream.endTime || stream.createdAt) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-4">
              <button 
                @click="toggleLike"
                :class="{ 'text-red-500': isLiked, 'text-gray-500': !isLiked }"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                <span>{{ stream.likes || 0 }}</span>
              </button>
              
              <button 
                @click="shareStream"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg border text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>{{ t('share') || 'Share' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Chat Messages (if available) -->
          <div v-if="stream.chatMessages && stream.chatMessages.length > 0" class="bg-white rounded-lg shadow-lg mb-6">
            <div class="p-4 border-b">
              <h3 class="font-semibold text-lg">{{ t('chatHighlights') || 'Chat Highlights' }}</h3>
              <p class="text-sm text-gray-500">{{ t('chatFromLiveStream') || 'Messages from the live stream' }}</p>
            </div>
            
            <div class="max-h-64 overflow-y-auto p-4 space-y-3">
              <div v-for="message in stream.chatMessages.slice(-10)" :key="`${message.timestamp}-${message.username}`" class="flex space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold chat-avatar">
                  {{ message.username?.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-sm" :class="{ 'text-primary-600': message.isAdmin }">
                      {{ message.username }}
                    </span>
                    <span v-if="message.isAdmin" class="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                      {{ t('admin') || 'Admin' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700">{{ message.message }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Streams -->
          <div v-if="relatedStreams.length > 0" class="bg-white rounded-lg shadow-lg">
            <div class="p-4 border-b">
              <h3 class="font-semibold text-lg">{{ t('relatedStreams') || 'Related Streams' }}</h3>
            </div>
            
            <div class="p-4 space-y-4">
              <div 
                v-for="relatedStream in relatedStreams" 
                :key="relatedStream._id"
                class="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                @click="() => $router.push(`/live-stream/watch/${relatedStream._id}`)"
              >
                <div class="w-20 h-14 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                  <img 
                    v-if="relatedStream.thumbnailUrl" 
                    :src="relatedStream.thumbnailUrl" 
                    :alt="relatedStream.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z" />
                    </svg>
                  </div>
                  <div class="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {{ formatDuration(relatedStream.duration) }}
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm line-clamp-2 mb-1">{{ relatedStream.title }}</h4>
                  <p class="text-xs text-gray-500">{{ relatedStream.viewCount?.toLocaleString() || 0 }} {{ t('views') || 'views' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(relatedStream.endTime || relatedStream.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('streamNotFound') || 'Stream Not Found' }}</h2>
        <p class="text-gray-500 mb-6">{{ t('streamNotFoundDesc') || 'The livestream you\'re looking for doesn\'t exist or has been removed.' }}</p>
        <button 
          @click="$router.push('/live-stream')"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ t('backToStreams') || 'Back to Streams' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Reactive data
const stream = ref(null);
const loading = ref(true);
const isLiked = ref(false);
const relatedStreams = ref([]);
const videoPlayer = ref(null);
const apiUrl = 'http://localhost:3000';

// Methods
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
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const fetchStream = async () => {
  try {
    loading.value = true;
    const streamId = route.params.id;
    
    const response = await fetch(`${apiUrl}/livestreams/${streamId}`);
    if (!response.ok) {
      throw new Error('Stream not found');
    }
    
    const data = await response.json();
    stream.value = data.livestream;
    
    // Fetch related streams
    await fetchRelatedStreams();
  } catch (error) {
    console.error('Error fetching stream:', error);
    stream.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchRelatedStreams = async () => {
  try {
    const response = await fetch(`${apiUrl}/livestreams/past?limit=5`);
    if (response.ok) {
      const data = await response.json();
      // Filter out the current stream and limit to 4 related streams
      relatedStreams.value = data.livestreams
        .filter(s => s._id !== stream.value?._id)
        .slice(0, 4);
    }
  } catch (error) {
    console.error('Error fetching related streams:', error);
  }
};

const incrementViewCount = async () => {
  if (!stream.value) return;
  
  try {
    await fetch(`${apiUrl}/livestreams/${stream.value._id}/view`, {
      method: 'POST'
    });
    // Update local view count
    stream.value.viewCount = (stream.value.viewCount || 0) + 1;
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  // In a real app, this would send a request to update likes in the backend
  if (stream.value) {
    stream.value.likes = (stream.value.likes || 0) + (isLiked.value ? 1 : -1);
  }
};

const shareStream = () => {
  const shareData = {
    title: stream.value?.title || 'WrenCos Livestream',
    text: `Check out this livestream: ${stream.value?.title}`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback to copying URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert(t('linkCopied') || 'Link copied to clipboard!');
    });
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
  console.error('Video src attempted:', event.target.src);
  console.error('Stream videoUrl:', stream.value?.videoUrl);
};

const onVideoPlay = () => {
  // Increment view count when video starts playing
  incrementViewCount();
};

onMounted(() => {
  fetchStream();
});

onUnmounted(() => {
  // Clean up video if needed
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
});
</script>

<style scoped>
/* Chat avatar gradient background */
.chat-avatar {
  background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%);
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Loading animation */
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