<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🎯 Retargeting Ads Dashboard</h1>
      <p class="text-gray-600">Monitor your display advertising campaigns and audience performance</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Active Campaigns</h3>
          <span class="text-2xl">📊</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ stats.activeCampaigns }}</p>
        <p class="text-xs text-gray-500 mt-1">+2 from last week</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Total Audiences</h3>
          <span class="text-2xl">👥</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ stats.totalAudiences }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ stats.totalAudienceMembers.toLocaleString() }} total visitors</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">ROAS</h3>
          <span class="text-2xl">💰</span>
        </div>
        <p class="text-3xl font-bold text-green-600">{{ stats.roas }}x</p>
        <p class="text-xs text-gray-500 mt-1">Return on ad spend</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Budget Spent</h3>
          <span class="text-2xl">💳</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">${{ stats.budgetSpent.toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-1">of ${{ stats.totalBudget.toLocaleString() }} total</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <router-link
          to="/admin/retargeting/campaigns/create"
          class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <span class="text-3xl mr-3">➕</span>
          <div>
            <p class="font-semibold text-gray-900">Create Campaign</p>
            <p class="text-xs text-gray-600">Launch new ads</p>
          </div>
        </router-link>

        <router-link
          to="/admin/retargeting/audiences/create"
          class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
        >
          <span class="text-3xl mr-3">👥</span>
          <div>
            <p class="font-semibold text-gray-900">Build Audience</p>
            <p class="text-xs text-gray-600">Segment visitors</p>
          </div>
        </router-link>

        <router-link
          to="/admin/retargeting/pixels"
          class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <span class="text-3xl mr-3">🔍</span>
          <div>
            <p class="font-semibold text-gray-900">Tracking Pixels</p>
            <p class="text-xs text-gray-600">Manage pixels</p>
          </div>
        </router-link>

        <router-link
          to="/admin/retargeting/platforms"
          class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
        >
          <span class="text-3xl mr-3">🔗</span>
          <div>
            <p class="font-semibold text-gray-900">Connect Platform</p>
            <p class="text-xs text-gray-600">Add ad account</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Campaigns -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Recent Campaigns</h2>
        <router-link to="/admin/retargeting/campaigns" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All →
        </router-link>
      </div>
      
      <div v-if="campaigns.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎯</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
        <p class="text-gray-600 mb-4">Create your first retargeting campaign to start reaching your audience</p>
        <router-link
          to="/admin/retargeting/campaigns/create"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </router-link>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="campaign in campaigns" :key="campaign._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ campaign.name }}</div>
                <div class="text-xs text-gray-500">{{ campaign.objective }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-green-100 text-green-800': campaign.status === 'active',
                    'bg-yellow-100 text-yellow-800': campaign.status === 'paused',
                    'bg-gray-100 text-gray-800': campaign.status === 'draft',
                    'bg-red-100 text-red-800': campaign.status === 'ended'
                  }"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ campaign.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ campaign.platforms.join(', ') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ campaign.impressions.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ campaign.ctr }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ campaign.spent.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="campaign.roas >= 2 ? 'text-green-600 font-semibold' : 'text-gray-900'">
                  {{ campaign.roas }}x
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Getting Started Guide -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">🚀 Getting Started</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-4">
          <div class="text-3xl mb-2">1️⃣</div>
          <h3 class="font-semibold text-gray-900 mb-2">Install Tracking Pixel</h3>
          <p class="text-sm text-gray-600 mb-3">Add the tracking code to your website to start capturing visitor events</p>
          <router-link to="/admin/retargeting/pixels" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Get Pixel Code →
          </router-link>
        </div>

        <div class="bg-white rounded-lg p-4">
          <div class="text-3xl mb-2">2️⃣</div>
          <h3 class="font-semibold text-gray-900 mb-2">Build Audiences</h3>
          <p class="text-sm text-gray-600 mb-3">Create targeted audiences based on visitor behavior and actions</p>
          <router-link to="/admin/retargeting/audiences" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Create Audience →
          </router-link>
        </div>

        <div class="bg-white rounded-lg p-4">
          <div class="text-3xl mb-2">3️⃣</div>
          <h3 class="font-semibold text-gray-900 mb-2">Launch Campaigns</h3>
          <p class="text-sm text-gray-600 mb-3">Connect ad platforms and start running retargeting campaigns</p>
          <router-link to="/admin/retargeting/platforms" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Connect Platform →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const stats = ref({
  activeCampaigns: 0,
  totalAudiences: 0,
  totalAudienceMembers: 0,
  roas: 0,
  budgetSpent: 0,
  totalBudget: 0
});

const campaigns = ref([]);

onMounted(async () => {
  await loadDashboardData();
});

const loadDashboardData = async () => {
  try {
    // TODO: Replace with actual API calls
    // For now, showing placeholder data
    stats.value = {
      activeCampaigns: 0,
      totalAudiences: 0,
      totalAudienceMembers: 0,
      roas: 0,
      budgetSpent: 0,
      totalBudget: 0
    };
    
    campaigns.value = [];
    
    // Example of how to fetch real data:
    // const response = await fetch('/api/marketing/analytics/dashboard', {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // });
    // const data = await response.json();
    // stats.value = data.stats;
    // campaigns.value = data.recentCampaigns;
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
