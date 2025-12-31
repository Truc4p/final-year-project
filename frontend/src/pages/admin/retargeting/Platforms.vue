<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🔗 Ad Platforms</h1>
      <p class="text-gray-600">Connect and manage your advertising platform accounts</p>
    </div>

    <!-- Available Platforms -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Google Ads -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="text-4xl mr-4">🔵</div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Google Ads</h3>
            <p class="text-sm text-gray-600">Search, Display, YouTube, Shopping</p>
          </div>
        </div>
        
        <div v-if="!isConnected('google_ads')">
          <p class="text-sm text-gray-600 mb-4">
            Connect your Google Ads account to create and manage campaigns across Google's advertising network.
          </p>
          <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Connect Google Ads
          </button>
        </div>
        
        <div v-else class="border-t pt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Status</span>
            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Account ID</span>
            <span class="text-sm text-gray-600">123-456-7890</span>
          </div>
          <button class="w-full mt-3 text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
            Disconnect
          </button>
        </div>
      </div>

      <!-- Facebook Ads -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="text-4xl mr-4">📘</div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Facebook Ads</h3>
            <p class="text-sm text-gray-600">Facebook, Instagram, Messenger</p>
          </div>
        </div>
        
        <div v-if="!isConnected('facebook')">
          <p class="text-sm text-gray-600 mb-4">
            Connect your Facebook Business account to run ads on Facebook, Instagram, and Messenger.
          </p>
          <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Connect Facebook Ads
          </button>
        </div>
        
        <div v-else class="border-t pt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Status</span>
            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Account ID</span>
            <span class="text-sm text-gray-600">act_123456789</span>
          </div>
          <button class="w-full mt-3 text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
            Disconnect
          </button>
        </div>
      </div>
    </div>

    <!-- Connected Platforms List -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Connected Platforms</h2>
      
      <div v-if="connectedPlatforms.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔗</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Platforms Connected</h3>
        <p class="text-gray-600">Connect an advertising platform above to start creating campaigns</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="platform in connectedPlatforms" :key="platform._id" class="border rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900">{{ platform.name }}</h3>
              <p class="text-sm text-gray-600">{{ platform.platform }}</p>
              <p class="text-xs text-gray-500">Connected on {{ formatDate(platform.connectedAt) }}</p>
            </div>
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-600 rounded">
                Test Connection
              </button>
              <button class="text-red-600 hover:text-red-700 px-3 py-1 border border-red-600 rounded">
                Remove
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

const connectedPlatforms = ref([]);

onMounted(() => {
  loadConnectedPlatforms();
});

const loadConnectedPlatforms = async () => {
  // TODO: Implement API call
  connectedPlatforms.value = [];
};

const isConnected = (platform) => {
  return connectedPlatforms.value.some(p => p.platform === platform);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>
