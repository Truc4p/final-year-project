<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Referral Leaderboard</h1>
        <p class="text-gray-600 mt-1">Top performing referrers</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6 flex gap-4">
        <select v-model="filters.timeframe" @change="loadLeaderboard" class="form-select">
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        
        <select v-model="filters.programId" @change="loadLeaderboard" class="form-select flex-1">
          <option value="">All Programs</option>
          <option v-for="program in programs" :key="program._id" :value="program._id">
            {{ program.name }}
          </option>
        </select>
      </div>

      <!-- Top 3 Podium -->
      <div v-if="leaderboard.length >= 3" class="grid grid-cols-3 gap-4 mb-6">
        <!-- 2nd Place -->
        <div class="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg p-6 text-center mt-12">
          <div class="w-16 h-16 bg-gray-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">2</div>
          <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
            {{ getInitials(leaderboard[1].customer.name) }}
          </div>
          <h3 class="font-bold text-lg">{{ leaderboard[1].customer.name }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ leaderboard[1].customer.email }}</p>
          <div class="bg-white rounded-lg p-3 mt-3">
            <p class="text-2xl font-bold text-gray-900">{{ leaderboard[1].referralCount }}</p>
            <p class="text-xs text-gray-500">Referrals</p>
          </div>
          <p class="text-sm font-semibold text-gray-700 mt-2">${{ formatNumber(leaderboard[1].totalRevenue) }}</p>
        </div>

        <!-- 1st Place -->
        <div class="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg p-6 text-center">
          <div class="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </div>
          <div class="w-24 h-24 bg-yellow-200 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl">
            {{ getInitials(leaderboard[0].customer.name) }}
          </div>
          <h3 class="font-bold text-xl">{{ leaderboard[0].customer.name }}</h3>
          <p class="text-sm text-gray-700 mb-2">{{ leaderboard[0].customer.email }}</p>
          <div class="bg-white rounded-lg p-4 mt-3">
            <p class="text-3xl font-bold text-yellow-600">{{ leaderboard[0].referralCount }}</p>
            <p class="text-sm text-gray-500">Referrals</p>
          </div>
          <p class="text-sm font-semibold text-gray-800 mt-2">${{ formatNumber(leaderboard[0].totalRevenue) }}</p>
        </div>

        <!-- 3rd Place -->
        <div class="bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg p-6 text-center mt-12">
          <div class="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">3</div>
          <div class="w-20 h-20 bg-orange-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
            {{ getInitials(leaderboard[2].customer.name) }}
          </div>
          <h3 class="font-bold text-lg">{{ leaderboard[2].customer.name }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ leaderboard[2].customer.email }}</p>
          <div class="bg-white rounded-lg p-3 mt-3">
            <p class="text-2xl font-bold text-gray-900">{{ leaderboard[2].referralCount }}</p>
            <p class="text-xs text-gray-500">Referrals</p>
          </div>
          <p class="text-sm font-semibold text-gray-700 mt-2">${{ formatNumber(leaderboard[2].totalRevenue) }}</p>
        </div>
      </div>

      <!-- Full Leaderboard Table -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral Code</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Referrals</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Referral</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(entry, index) in leaderboard" :key="entry._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span v-if="index < 3" class="text-2xl">{{ ['🥇', '🥈', '🥉'][index] }}</span>
                    <span v-else class="text-gray-900 font-medium">{{ index + 1 }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                      {{ getInitials(entry.customer.name) }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ entry.customer.name }}</div>
                      <div class="text-sm text-gray-500">{{ entry.customer.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ entry.code?.code || 'N/A' }}</code>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="text-sm font-semibold text-gray-900">{{ entry.referralCount }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="text-sm font-semibold text-green-600">${{ formatNumber(entry.totalRevenue) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(entry.lastReferralDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button @click="viewDetails(entry)" class="text-blue-600 hover:text-blue-900">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_URL } from '../../../utils/config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const leaderboard = ref([]);
const programs = ref([]);
const filters = ref({
  timeframe: 'all',
  programId: ''
});

const loadPrograms = async () => {
  try {
    const response = await axios.get(`${API_URL}/referral/programs`, {
      headers: getAuthHeaders()
    });
    if (response.data.success) {
      programs.value = response.data.data;
    }
  } catch (error) {
    console.error('Load programs error:', error);
  }
};

const loadLeaderboard = async () => {
  try {
    const params = {
      timeframe: filters.value.timeframe,
      limit: 50
    };
    if (filters.value.programId) {
      params.programId = filters.value.programId;
    }
    
    const response = await axios.get(`${API_URL}/referral/leaderboard`, {
      params,
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      leaderboard.value = response.data.data;
    }
  } catch (error) {
    console.error('Load leaderboard error:', error);
  }
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatNumber = (num) => {
  return num ? num.toLocaleString() : '0';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const viewDetails = (entry) => {
  alert(`Viewing details for ${entry.customer.name} - Feature coming soon!`);
};

onMounted(() => {
  loadPrograms();
  loadLeaderboard();
});
</script>
