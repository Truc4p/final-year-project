<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Referral Marketing</h1>
          <p class="text-gray-600 mt-1">Grow your business through word-of-mouth</p>
        </div>
        <button @click="$router.push('/admin/referral/programs/create')" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Program
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Referrals</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalReferrals }}</p>
              <p class="text-sm text-green-600 mt-1">
                +{{ stats.newReferralsToday }} today
              </p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Successful Conversions</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.successfulReferrals }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ stats.conversionRate }}% rate
              </p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Revenue Generated</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">${{ formatNumber(stats.totalRevenue) }}</p>
              <p class="text-sm text-gray-500 mt-1">
                From referrals
              </p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Rewards Distributed</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalRewards }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ stats.pendingRewards }} pending
              </p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <button @click="$router.push('/admin/referral/programs')" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Manage Programs</h3>
              <p class="text-sm text-gray-500">View and edit referral programs</p>
            </div>
          </div>
        </button>

        <button @click="$router.push('/admin/referral/leaderboard')" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="bg-yellow-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Leaderboard</h3>
              <p class="text-sm text-gray-500">Top referrers & performance</p>
            </div>
          </div>
        </button>

        <button @click="$router.push('/admin/referral/rewards')" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="bg-green-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Manage Rewards</h3>
              <p class="text-sm text-gray-500">Approve & distribute rewards</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Active Programs -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Active Programs</h2>
        </div>
        
        <div v-if="loading" class="p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        
        <div v-else-if="programs.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No programs yet</h3>
          <p class="text-gray-500 mb-4">Create your first referral program to get started</p>
          <button @click="$router.push('/admin/referral/programs/create')" class="btn btn-primary">
            Create Program
          </button>
        </div>
        
        <div v-else class="divide-y">
          <div v-for="program in programs" :key="program._id" class="p-6 hover:bg-gray-50 cursor-pointer" @click="$router.push(`/admin/referral/programs/${program._id}`)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ program.name }}</h3>
                  <span :class="getStatusColor(program.status)" class="ml-3 px-2 py-1 text-xs font-medium rounded-full capitalize">
                    {{ program.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ program.description }}</p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">Total Referrals</p>
                    <p class="font-semibold text-gray-900">{{ program.analytics.totalReferrals }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Conversions</p>
                    <p class="font-semibold text-gray-900">{{ program.analytics.successfulReferrals }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Conversion Rate</p>
                    <p class="font-semibold text-gray-900">{{ program.analytics.conversionRate.toFixed(1) }}%</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Revenue</p>
                    <p class="font-semibold text-gray-900">${{ formatNumber(program.analytics.totalRevenueGenerated) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-2 ml-4">
                <button @click.stop="viewAnalytics(program._id)" class="btn btn-outline btn-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </button>
                <button @click.stop="$router.push(`/admin/referral/programs/${program._id}/edit`)" class="btn btn-outline btn-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
              </div>
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
import { useRouter } from 'vue-router';

const router = useRouter();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const programs = ref([]);
const loading = ref(false);
const stats = ref({
  totalReferrals: 0,
  newReferralsToday: 0,
  successfulReferrals: 0,
  conversionRate: 0,
  totalRevenue: 0,
  totalRewards: 0,
  pendingRewards: 0
});

const loadPrograms = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/referral/programs?status=active`, {
      headers: getAuthHeaders()
    });
    if (response.data.success) {
      programs.value = response.data.data;
      calculateStats();
    }
  } catch (error) {
    console.error('Load programs error:', error);
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  stats.value.totalReferrals = programs.value.reduce((sum, p) => sum + p.analytics.totalReferrals, 0);
  stats.value.successfulReferrals = programs.value.reduce((sum, p) => sum + p.analytics.successfulReferrals, 0);
  stats.value.totalRevenue = programs.value.reduce((sum, p) => sum + p.analytics.totalRevenueGenerated, 0);
  stats.value.totalRewards = programs.value.reduce((sum, p) => sum + p.analytics.totalRewardsGiven, 0);
  
  if (stats.value.totalReferrals > 0) {
    stats.value.conversionRate = ((stats.value.successfulReferrals / stats.value.totalReferrals) * 100).toFixed(1);
  }
  
  // Mock values for demonstration
  stats.value.newReferralsToday = Math.floor(stats.value.totalReferrals * 0.05);
  stats.value.pendingRewards = Math.floor(stats.value.totalRewards * 0.2);
};

const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    ended: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatNumber = (num) => {
  return num ? num.toLocaleString() : '0';
};

const viewAnalytics = (programId) => {
  router.push(`/admin/referral/programs/${programId}/analytics`);
};

onMounted(() => {
  loadPrograms();
});
</script>
