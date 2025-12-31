<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit Post' : 'Create Social Media Post' }}</h1>
        <router-link to="/admin/social-media" class="btn btn-outline">Back</router-link>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-medium mb-4">Post Details</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Title</label>
                <input v-model="post.title" type="text" class="form-input w-full" placeholder="Post title..." />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Content</label>
                <textarea v-model="post.content" rows="6" class="form-textarea w-full" placeholder="What would you like to share?"></textarea>
                <p class="text-xs text-gray-500 mt-1">{{ post.content.length }} characters</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Hashtags</label>
                <div class="flex gap-2 mb-2">
                  <input
                    v-model="hashtagInput"
                    @keydown.enter.prevent="addHashtag"
                    type="text"
                    class="form-input flex-1"
                    placeholder="Type hashtag and press Enter..."
                  />
                  <button @click="suggestHashtags" class="btn btn-outline">Suggest</button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(tag, index) in post.hashtags"
                    :key="index"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {{ tag }}
                    <button @click="removeHashtag(index)" class="hover:text-blue-900">×</button>
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Media</label>
                <div v-if="post.media.length > 0" class="grid grid-cols-3 gap-4 mb-4">
                  <div v-for="(media, index) in post.media" :key="index" class="relative">
                    <img :src="media.url" class="w-full h-32 object-cover rounded" />
                    <button
                      @click="removeMedia(index)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <button @click="uploadMedia" class="btn btn-outline w-full">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Upload Media
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-medium mb-4">Publishing</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Platforms</label>
                <div v-if="accounts.length === 0" class="text-sm text-gray-500 mb-2">
                  No social media accounts connected. Please connect accounts first.
                </div>
                <div class="space-y-2">
                  <label v-for="account in accounts" :key="account._id" class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      :checked="post.platforms.some(p => p.accountId === account._id)"
                      @change="togglePlatform(account)" 
                      class="rounded mr-2 h-4 w-4" 
                    />
                    <span class="text-sm capitalize">
                      <span class="font-medium">{{ account.platform }}</span>
                      <span v-if="account.accountName" class="text-gray-600"> - {{ account.accountName }}</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Schedule</label>
                <select v-model="scheduleOption" class="form-select w-full mb-2">
                  <option value="now">Publish Now</option>
                  <option value="schedule">Schedule for Later</option>
                </select>
                <input
                  v-if="scheduleOption === 'schedule'"
                  v-model="post.scheduledAt"
                  type="datetime-local"
                  class="form-input w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Post Type</label>
                <select v-model="post.type" class="form-select w-full">
                  <option value="regular">Regular</option>
                  <option value="product_promotion">Product Promotion</option>
                  <option value="announcement">Announcement</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-medium mb-4">Actions</h3>
            <div class="space-y-2">
              <button @click="saveDraft" class="btn btn-outline w-full">Save Draft</button>
              <button @click="publishPost" class="btn btn-primary w-full">
                {{ scheduleOption === 'schedule' ? 'Schedule Post' : 'Publish Now' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../../utils/config';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => !!route.params.id);

const post = ref({
  title: '',
  content: '',
  hashtags: [],
  media: [],
  platforms: [],
  type: 'regular',
  scheduledAt: null,
  status: 'draft'
});

const accounts = ref([]);
const hashtagInput = ref('');
const scheduleOption = ref('now');

const loadAccounts = async () => {
  try {
    const response = await axios.get(`${API_URL}/social-media/accounts?isActive=true`, {
      headers: getAuthHeaders()
    });
    if (response.data.success) {
      accounts.value = response.data.data;
    }
  } catch (error) {
    console.error('Load accounts error:', error);
  }
};

const togglePlatform = (account) => {
  const index = post.value.platforms.findIndex(p => p.accountId === account._id);
  if (index > -1) {
    post.value.platforms.splice(index, 1);
  } else {
    post.value.platforms.push({
      platform: account.platform,
      accountId: account._id
    });
  }
};

const addHashtag = () => {
  if (hashtagInput.value.trim()) {
    const tag = hashtagInput.value.trim().startsWith('#') 
      ? hashtagInput.value.trim() 
      : `#${hashtagInput.value.trim()}`;
    
    if (!post.value.hashtags.includes(tag)) {
      post.value.hashtags.push(tag);
    }
    hashtagInput.value = '';
  }
};

const removeHashtag = (index) => {
  post.value.hashtags.splice(index, 1);
};

const suggestHashtags = async () => {
  try {
    const response = await axios.get(`${API_URL}/social-media/hashtags/suggestions`, {
      params: { query: post.value.title || post.value.content.split(' ')[0] },
      headers: getAuthHeaders()
    });
    
    if (response.data.success && response.data.data.suggestions.length > 0) {
      // Add top 5 suggestions
      response.data.data.suggestions.slice(0, 5).forEach(suggestion => {
        if (!post.value.hashtags.includes(suggestion.tag)) {
          post.value.hashtags.push(suggestion.tag);
        }
      });
    }
  } catch (error) {
    console.error('Suggest hashtags error:', error);
  }
};

const uploadMedia = () => {
  // Implement file upload
  alert('File upload feature - integrate with your upload service');
};

const removeMedia = (index) => {
  post.value.media.splice(index, 1);
};

const saveDraft = async () => {
  try {
    post.value.status = 'draft';
    const response = isEditing.value
      ? await axios.put(`${API_URL}/social-media/posts/${route.params.id}`, post.value, {
          headers: getAuthHeaders()
        })
      : await axios.post(`${API_URL}/social-media/posts`, post.value, {
          headers: getAuthHeaders()
        });
    
    if (response.data.success) {
      alert('Draft saved successfully!');
      router.push('/admin/social-media');
    }
  } catch (error) {
    console.error('Save draft error:', error);
    alert('Failed to save draft');
  }
};

const publishPost = async () => {
  try {
    if (post.value.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }
    
    post.value.status = scheduleOption.value === 'schedule' ? 'scheduled' : 'draft';
    
    const response = isEditing.value
      ? await axios.put(`${API_URL}/social-media/posts/${route.params.id}`, post.value, {
          headers: getAuthHeaders()
        })
      : await axios.post(`${API_URL}/social-media/posts`, post.value, {
          headers: getAuthHeaders()
        });
    
    if (response.data.success) {
      const postId = response.data.data._id;
      
      if (scheduleOption.value === 'now') {
        await axios.post(`${API_URL}/social-media/posts/${postId}/publish`, {}, {
          headers: getAuthHeaders()
        });
        alert('Post published successfully!');
      } else {
        alert('Post scheduled successfully!');
      }
      
      router.push('/admin/social-media');
    }
  } catch (error) {
    console.error('Publish post error:', error);
    alert('Failed to publish post');
  }
};

onMounted(() => {
  loadAccounts();
});
</script>

<style scoped>
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-outline {
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
}

.btn-outline:hover {
  background-color: #f3f4f6;
}
</style>
