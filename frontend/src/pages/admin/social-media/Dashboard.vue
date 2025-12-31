<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-primary-700">Social Media Marketing</h1>
            <p class="text-gray-600 mt-2">Create and manage posts across all your social media platforms</p>
          </div>
          <router-link to="/admin/social-media/posts/create" class="btn btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create Post
          </router-link>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Posts</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.posts.total || 0 }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Scheduled</p>
              <p class="text-2xl font-bold text-orange-600 mt-1">{{ stats.posts.scheduled || 0 }}</p>
            </div>
            <div class="bg-orange-100 rounded-full p-3">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Reach</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ formatNumber(stats.analytics.totalReach || 0) }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Engagement Rate</p>
              <p class="text-2xl font-bold text-purple-600 mt-1">{{ stats.engagementRate || 0 }}%</p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select v-model="filters.status" @change="loadPosts" class="form-select">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>

          <select v-model="filters.platform" @change="loadPosts" class="form-select">
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          <select v-model="filters.type" @change="loadPosts" class="form-select">
            <option value="all">All Types</option>
            <option value="regular">Regular</option>
            <option value="product_promotion">Product Promotion</option>
            <option value="announcement">Announcement</option>
            <option value="engagement">Engagement</option>
          </select>

          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search posts..."
            class="form-input"
          />

          <router-link to="/admin/social-media/calendar" class="btn btn-outline">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Calendar View
          </router-link>
        </div>
      </div>

      <!-- Posts List -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p class="text-gray-600 mt-2">Loading posts...</p>
        </div>

        <div v-else-if="posts.length === 0" class="p-8 text-center text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
          <p>No posts found</p>
          <router-link to="/admin/social-media/posts/create" class="text-blue-600 hover:underline mt-2 inline-block">
            Create your first post
          </router-link>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div v-for="post in posts" :key="post._id" class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-medium text-gray-900">{{ post.title }}</h3>
                  <span :class="getStatusClass(post.status)" class="px-2 py-1 text-xs rounded-full">
                    {{ post.status }}
                  </span>
                </div>

                <p class="text-gray-600 mb-3 line-clamp-2">{{ post.content }}</p>

                <!-- Platforms -->
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-sm text-gray-500">Platforms:</span>
                  <div class="flex gap-2">
                    <span
                      v-for="platform in post.platforms"
                      :key="platform._id"
                      :class="getPlatformClass(platform.platform)"
                      class="px-2 py-1 text-xs rounded"
                    >
                      {{ platform.platform }}
                    </span>
                  </div>
                </div>

                <!-- Hashtags -->
                <div v-if="post.hashtags && post.hashtags.length > 0" class="flex flex-wrap gap-1 mb-3">
                  <span v-for="tag in post.hashtags" :key="tag" class="text-xs text-blue-600">
                    {{ tag }}
                  </span>
                </div>

                <!-- Analytics -->
                <div v-if="post.status === 'published' && post.analytics" class="flex gap-6 text-sm text-gray-600">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    {{ formatNumber(post.analytics.totalReach) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                    </svg>
                    {{ formatNumber(post.analytics.totalLikes) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    {{ formatNumber(post.analytics.totalComments) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    {{ formatNumber(post.analytics.totalShares) }}
                  </div>
                </div>

                <!-- Date -->
                <p class="text-xs text-gray-500 mt-2">
                  {{ post.status === 'scheduled' ? 'Scheduled for' : 'Created' }}:
                  {{ formatDate(post.scheduledAt || post.createdAt) }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 ml-4">
                <router-link
                  :to="`/admin/social-media/posts/${post._id}`"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </router-link>

                <button
                  v-if="post.status === 'draft' || post.status === 'scheduled'"
                  @click="publishPost(post._id)"
                  class="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Publish Now"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>

                <button
                  @click="deletePost(post._id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 1" class="px-6 py-4 border-t">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Showing {{ (pagination.current - 1) * 20 + 1 }} to {{ Math.min(pagination.current * 20, pagination.count) }} of {{ pagination.count }} posts
            </p>
            <div class="flex gap-2">
              <button
                @click="changePage(pagination.current - 1)"
                :disabled="pagination.current === 1"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="changePage(pagination.current + 1)"
                :disabled="pagination.current === pagination.total"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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

const posts = ref([]);
const stats = ref({
  posts: {},
  analytics: {},
  engagementRate: 0
});
const loading = ref(true);
const pagination = ref({
  current: 1,
  total: 1,
  count: 0
});

const filters = ref({
  status: 'all',
  platform: 'all',
  type: 'all',
  search: ''
});

let searchTimeout = null;

const loadPosts = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: pagination.value.current,
      limit: 20,
      ...filters.value
    };
    
    const response = await axios.get(`${API_URL}/social-media/posts`, { 
      params,
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      posts.value = response.data.data;
      pagination.value = response.data.pagination;
    }
  } catch (error) {
    console.error('Load posts error:', error);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/social-media/posts/stats`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('Load stats error:', error);
  }
};

const publishPost = async (postId) => {
  if (!confirm('Are you sure you want to publish this post now?')) return;
  
  try {
    const response = await axios.post(`${API_URL}/social-media/posts/${postId}/publish`, {}, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      alert('Post published successfully!');
      await loadPosts();
      await loadStats();
    }
  } catch (error) {
    console.error('Publish post error:', error);
    alert('Failed to publish post');
  }
};

const deletePost = async (postId) => {
  if (!confirm('Are you sure you want to delete this post?')) return;
  
  try {
    const response = await axios.delete(`${API_URL}/social-media/posts/${postId}`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      await loadPosts();
      await loadStats();
    }
  } catch (error) {
    console.error('Delete post error:', error);
    alert('Failed to delete post');
  }
};

const changePage = (page) => {
  pagination.value.current = page;
  loadPosts();
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadPosts();
  }, 500);
};

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-orange-100 text-orange-800',
    publishing: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return classes[status] || classes.draft;
};

const getPlatformClass = (platform) => {
  const classes = {
    facebook: 'bg-blue-100 text-blue-800',
    instagram: 'bg-pink-100 text-pink-800',
    twitter: 'bg-sky-100 text-sky-800',
    linkedin: 'bg-indigo-100 text-indigo-800'
  };
  return classes[platform] || 'bg-gray-100 text-gray-800';
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadPosts();
  loadStats();
});
</script>

<style scoped>
.form-select,
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
