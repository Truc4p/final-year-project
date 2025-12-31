<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">📊 Campaigns</h1>
        <p class="text-gray-600">Manage your retargeting campaigns across platforms</p>
      </div>
      <router-link
        to="/admin/retargeting/campaigns/create"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Create Campaign
      </router-link>
    </div>

    <!-- Campaign Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Paused</option>
          <option>Ended</option>
        </select>
        
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>All Platforms</option>
          <option>Google Ads</option>
          <option>Facebook Ads</option>
        </select>
        
        <input
          type="text"
          placeholder="Search campaigns..."
          class="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
        />
      </div>
    </div>

    <!-- Campaigns List -->
    <div class="bg-white rounded-lg shadow p-6">
      <div v-if="campaigns.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
        <p class="text-gray-600 mb-4">Create your first campaign to start retargeting your audience</p>
        <router-link
          to="/admin/retargeting/campaigns/create"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Create First Campaign
        </router-link>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="campaign in campaigns" :key="campaign._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ campaign.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  {{ campaign.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ campaign.platform }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${{ campaign.budget }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                ROAS: {{ campaign.roas }}x
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                <button class="text-red-600 hover:text-red-700">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const campaigns = ref([]);

onMounted(() => {
  loadCampaigns();
});

const loadCampaigns = async () => {
  // TODO: Implement API call
  campaigns.value = [];
};
</script>
