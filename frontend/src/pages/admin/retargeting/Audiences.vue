<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">👥 Audiences</h1>
      <p class="text-gray-600">Create and manage audience segments for targeted advertising</p>
    </div>

    <!-- Quick Create Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <button class="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all">
        <div class="text-2xl mb-2">🛒</div>
        <div class="font-semibold text-gray-900">Cart Abandoners</div>
        <div class="text-xs text-gray-600 mt-1">Target users who left items in cart</div>
      </button>
      
      <button class="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-all">
        <div class="text-2xl mb-2">👀</div>
        <div class="font-semibold text-gray-900">Product Viewers</div>
        <div class="text-xs text-gray-600 mt-1">Users who viewed products</div>
      </button>
      
      <button class="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-all">
        <div class="text-2xl mb-2">💰</div>
        <div class="font-semibold text-gray-900">Recent Buyers</div>
        <div class="text-xs text-gray-600 mt-1">Users who purchased recently</div>
      </button>
      
      <router-link 
        to="/admin/retargeting/audiences/create"
        class="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-4 hover:shadow-lg transition-all"
      >
        <div class="text-2xl mb-2">⚙️</div>
        <div class="font-semibold text-gray-900">Custom Audience</div>
        <div class="text-xs text-gray-600 mt-1">Build with custom rules</div>
      </router-link>
    </div>

    <!-- Audiences List -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Audiences</h2>
      
      <div v-if="audiences.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">👥</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Audiences Yet</h3>
        <p class="text-gray-600 mb-4">Create your first audience to start segmenting visitors</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="audience in audiences" :key="audience._id" class="border rounded-lg p-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900">{{ audience.name }}</h3>
              <p class="text-sm text-gray-600">{{ audience.description }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ audience.size?.toLocaleString() || 0 }} members
              </p>
            </div>
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-600 rounded">
                View
              </button>
              <button class="text-green-600 hover:text-green-700 px-3 py-1 border border-green-600 rounded">
                Sync
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

const audiences = ref([]);

onMounted(() => {
  loadAudiences();
});

const loadAudiences = async () => {
  // TODO: Implement API call
  audiences.value = [];
};
</script>
