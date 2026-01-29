<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <router-link to="/admin/referral/programs" class="hover:text-blue-600">Referral Programs</router-link>
        <span>/</span>
        <span>Analytics</span>
      </div>
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ program?.name || 'Program Analytics' }}</h1>
          <p class="text-gray-600 mt-1">{{ program?.description }}</p>
        </div>
        <button @click="$router.push('/admin/referral/programs')" class="btn btn-outline">
          Back to Programs
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <div v-else-if="program">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Referrals</p>
              <p class="text-2xl font-bold text-gray-900">{{ program.analytics.totalReferrals }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Successful</p>
              <p class="text-2xl font-bold text-gray-900">{{ program.analytics.successfulReferrals }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Conversion Rate</p>
              <p class="text-2xl font-bold text-gray-900">{{ program.analytics.conversionRate.toFixed(1) }}%</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Revenue Generated</p>
              <p class="text-2xl font-bold text-gray-900">${{ formatNumber(program.analytics.totalRevenueGenerated) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-pink-100 rounded-lg">
              <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Rewards Given</p>
              <p class="text-2xl font-bold text-gray-900">${{ formatNumber(program.analytics.totalRewardsGiven) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Program Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-lg font-semibold mb-4">Program Details</h2>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Status</span>
              <span :class="getStatusColor(program.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ program.status }}
              </span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Start Date</span>
              <span class="font-medium">{{ formatDate(program.startDate) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">End Date</span>
              <span class="font-medium">{{ formatDate(program.endDate) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Created</span>
              <span class="font-medium">{{ formatDate(program.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-lg font-semibold mb-4">Reward Configuration</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Referrer Rewards</h3>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm">
                  <span class="font-medium">{{ program.referrerRewards.rewardValue }}</span>
                  <span class="text-gray-600">
                    {{ program.referrerRewards.rewardUnit === 'percentage' ? '%' : '' }}
                    {{ program.referrerRewards.rewardType }}
                  </span>
                </p>
                <p class="text-xs text-gray-600 mt-1">{{ program.referrerRewards.description }}</p>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Referee Rewards</h3>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm">
                  <span class="font-medium">{{ program.refereeRewards.rewardValue }}</span>
                  <span class="text-gray-600">
                    {{ program.refereeRewards.rewardUnit === 'percentage' ? '%' : '' }}
                    {{ program.refereeRewards.rewardType }}
                  </span>
                </p>
                <p class="text-xs text-gray-600 mt-1">{{ program.refereeRewards.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-lg font-semibold mb-4">Program Requirements</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-600">Minimum Purchase Amount</p>
            <p class="text-lg font-semibold">${{ program.requirements.minimumPurchaseAmount }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Max Referrals Per Customer</p>
            <p class="text-lg font-semibold">{{ program.requirements.maxReferralsPerCustomer || 'Unlimited' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Max Rewards Per Customer</p>
            <p class="text-lg font-semibold">{{ program.requirements.maxRewardsPerCustomer || 'Unlimited' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-600">Program not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const program = ref(null);
const loading = ref(true);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const loadProgram = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/referral/programs/${route.params.id}`, {
      headers: getAuthHeaders()
    });
    if (response.data.success) {
      program.value = response.data.data;
    }
  } catch (error) {
    console.error('Load program error:', error);
    alert('Failed to load program analytics');
  } finally {
    loading.value = false;
  }
};

const formatNumber = (num) => {
  return num ? num.toLocaleString() : '0';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    ended: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadProgram();
});
</script>
