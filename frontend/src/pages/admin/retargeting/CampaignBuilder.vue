<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🎯 Campaign Builder</h1>
      <p class="text-gray-600">Create a new retargeting campaign</p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <!-- Campaign Name -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
        <input
          type="text"
          v-model="campaignName"
          placeholder="e.g., Holiday Cart Abandoners"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Objective -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Objective</label>
        <select v-model="objective" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option value="conversions">Conversions</option>
          <option value="traffic">Traffic</option>
          <option value="engagement">Engagement</option>
          <option value="awareness">Awareness</option>
        </select>
      </div>

      <!-- Platform Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Ad Platform</label>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': platforms.google }">
            <input type="checkbox" v-model="platforms.google" class="mr-3" />
            <div>
              <div class="font-semibold">Google Ads</div>
              <div class="text-xs text-gray-600">Search & Display Network</div>
            </div>
          </label>
          <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': platforms.facebook }">
            <input type="checkbox" v-model="platforms.facebook" class="mr-3" />
            <div>
              <div class="font-semibold">Facebook Ads</div>
              <div class="text-xs text-gray-600">Facebook & Instagram</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Budget -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Daily Budget</label>
        <div class="flex items-center">
          <span class="mr-2 text-gray-700">$</span>
          <input
            type="number"
            v-model="budget"
            placeholder="100"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span class="ml-2 text-gray-600 text-sm">per day</span>
        </div>
      </div>

      <div class="text-center py-12 text-gray-500 border-t border-b my-6">
        <div class="text-4xl mb-4">🚧</div>
        <p>Additional campaign settings will be implemented here</p>
        <p class="text-sm mt-2">Audience selection, creatives, scheduling, etc.</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <router-link
          to="/admin/retargeting/campaigns"
          class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </router-link>
        <button @click="saveDraft" disabled class="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed">
          Save as Draft
        </button>
        <button @click="launchCampaign" :disabled="loading" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Launching...' : 'Launch Campaign' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const campaignName = ref('');
const objective = ref('conversions');
const budget = ref(100);
const platforms = ref({
  google: false,
  facebook: false
});
const loading = ref(false);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const launchCampaign = async () => {
  // Validation
  if (!campaignName.value.trim()) {
    alert('Please enter a campaign name');
    return;
  }
  
  if (!platforms.value.google && !platforms.value.facebook) {
    alert('Please select at least one ad platform');
    return;
  }
  
  if (!budget.value || budget.value <= 0) {
    alert('Please enter a valid budget');
    return;
  }
  
  try {
    loading.value = true;
    
    // Build platforms array
    const selectedPlatforms = [];
    if (platforms.value.google) {
      selectedPlatforms.push({ platform: 'google_ads' });
      console.log('✅ Added Google Ads platform');
    }
    if (platforms.value.facebook) {
      selectedPlatforms.push({ platform: 'facebook_ads' });
      console.log('✅ Added Facebook Ads platform');
    }
    
    console.log('📝 Selected platforms:', selectedPlatforms);
    
    const campaignData = {
      name: campaignName.value,
      objective: objective.value,
      status: 'active',
      platforms: selectedPlatforms,
      schedule: {
        startDate: new Date(),
        timezone: 'UTC'
      },
      budgetData: {
        name: `${campaignName.value} - Budget`,
        budgetType: 'daily',
        amount: budget.value,
        spent: 0,
        period: {
          startDate: new Date(),
          endDate: null
        }
      }
    };
    
    console.log('🚀 Sending campaign data to API:', campaignData);
    
    const response = await axios.post(`${API_URL}/api/marketing/campaigns`, campaignData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ API response:', response.data);
    
    if (response.data.success) {
      alert('Campaign launched successfully!');
      router.push('/admin/retargeting/campaigns');
    }
  } catch (error) {
    console.error('Launch campaign error:', error);
    alert(error.response?.data?.message || 'Failed to launch campaign');
  } finally {
    loading.value = false;
  }
};

const saveDraft = () => {
  alert('Save as Draft feature coming soon!');
};
</script>
