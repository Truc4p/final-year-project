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
                <div class="text-xs text-gray-500">{{ campaign.objective }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'bg-green-100 text-green-800': campaign.status === 'active',
                  'bg-yellow-100 text-yellow-800': campaign.status === 'paused',
                  'bg-gray-100 text-gray-800': campaign.status === 'draft',
                  'bg-red-100 text-red-800': campaign.status === 'cancelled'
                }" class="px-2 py-1 text-xs rounded-full capitalize">
                  {{ campaign.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="campaign.platforms && campaign.platforms.length > 0" class="flex flex-col gap-1">
                  <span v-for="platform in campaign.platforms" :key="platform.platform" class="text-xs">
                    {{ platform.platform.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </span>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="campaign.budget">
                  <div class="font-medium">${{ campaign.budget.amount }}</div>
                  <div class="text-xs text-gray-500">{{ campaign.budget.budgetType }}</div>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="campaign.performance">
                  <div>ROAS: {{ campaign.performance.roas || 0 }}x</div>
                  <div class="text-xs text-gray-500">
                    {{ campaign.performance.clicks || 0 }} clicks
                  </div>
                </div>
                <span v-else class="text-gray-400">No data</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button @click="editCampaign(campaign._id)" class="text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                <button @click="deleteCampaign(campaign._id)" class="text-red-600 hover:text-red-700">Delete</button>
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
import { useRouter } from 'vue-router';

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const campaigns = ref([]);

onMounted(() => {
  loadCampaigns();
});

const loadCampaigns = async () => {
  try {
    console.log('📊 Loading campaigns from API...');
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/marketing/campaigns`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Campaigns data:', data);
      campaigns.value = data.campaigns || [];
      console.log('📋 Loaded campaigns:', campaigns.value.length);
    } else {
      console.error('❌ Failed to load campaigns:', response.status);
    }
  } catch (error) {
    console.error('❌ Error loading campaigns:', error);
  }
};

const editCampaign = (id) => {
  router.push(`/admin/retargeting/campaigns/${id}/edit`);
};

const deleteCampaign = async (id) => {
  if (!confirm('Are you sure you want to delete this campaign?')) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/marketing/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      alert('Campaign deleted successfully');
      loadCampaigns();
    } else {
      alert('Failed to delete campaign');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error deleting campaign');
  }
};
</script>
