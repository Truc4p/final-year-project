<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Content Calendar</h1>
        <router-link to="/admin/social-media" class="btn btn-outline">Back to Posts</router-link>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="mb-4 flex justify-between items-center">
          <h2 class="text-xl font-medium">{{ currentMonth }}</h2>
          <div class="flex gap-2">
            <button @click="previousMonth" class="btn btn-outline">←</button>
            <button @click="nextMonth" class="btn btn-outline">→</button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center font-medium text-gray-600 p-2">
            {{ day }}
          </div>

          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="['border rounded p-2 min-h-32', day.isCurrentMonth ? 'bg-white' : 'bg-gray-50']"
          >
            <div class="font-medium text-sm" :class="day.isToday ? 'text-blue-600' : ''">
              {{ day.date.getDate() }}
            </div>
            <div class="mt-2 space-y-1">
              <div
                v-for="post in day.posts"
                :key="post._id"
                @click="viewPost(post._id)"
                class="text-xs p-1 rounded cursor-pointer hover:shadow"
                :class="getPostClass(post.status)"
              >
                <div class="font-medium truncate">{{ post.title }}</div>
                <div class="text-xs opacity-75">{{ formatTime(post.scheduledAt || post.publishedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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

const router = useRouter();
const currentDate = ref(new Date());
const posts = ref([]);

const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      posts: getPostsForDate(date)
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      posts: getPostsForDate(date)
    });
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      posts: getPostsForDate(date)
    });
  }
  
  return days;
});

const getPostsForDate = (date) => {
  return posts.value.filter(post => {
    const postDate = new Date(post.scheduledAt || post.publishedAt);
    return (
      postDate.getFullYear() === date.getFullYear() &&
      postDate.getMonth() === date.getMonth() &&
      postDate.getDate() === date.getDate()
    );
  });
};

const loadPosts = async () => {
  try {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    const response = await axios.get(`${API_URL}/social-media/posts/calendar`, {
      params: { startDate, endDate },
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      posts.value = response.data.data;
    }
  } catch (error) {
    console.error('Load posts error:', error);
  }
};

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
  loadPosts();
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
  loadPosts();
};

const viewPost = (postId) => {
  router.push(`/admin/social-media/posts/${postId}`);
};

const getPostClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-orange-100 text-orange-800',
    published: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };
  return classes[status] || classes.draft;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
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
