<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">📈 Retargeting Analytics</h1>
      <p class="text-gray-600">Track performance, ROI, and optimize your campaigns</p>
    </div>

    <!-- Date Range Selector -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex items-center space-x-4">
        <label class="text-sm font-medium text-gray-700">Date Range:</label>
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>This Month</option>
          <option>Last Month</option>
          <option>Custom Range</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-600 mb-2">Total Spend</h3>
        <p class="text-3xl font-bold text-gray-900">${{ metrics.totalSpend.toLocaleString() }}</p>
        <p class="text-xs text-green-600 mt-1">↑ 12% vs last period</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-600 mb-2">Revenue Generated</h3>
        <p class="text-3xl font-bold text-gray-900">${{ metrics.revenue.toLocaleString() }}</p>
        <p class="text-xs text-green-600 mt-1">↑ 24% vs last period</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-600 mb-2">ROAS</h3>
        <p class="text-3xl font-bold text-green-600">{{ metrics.roas }}x</p>
        <p class="text-xs text-gray-500 mt-1">Return on ad spend</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-600 mb-2">Conversions</h3>
        <p class="text-3xl font-bold text-gray-900">{{ metrics.conversions.toLocaleString() }}</p>
        <p class="text-xs text-green-600 mt-1">↑ 18% vs last period</p>
      </div>
    </div>

    <!-- Performance Chart Placeholder -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Performance Over Time</h2>
      <div class="text-center py-20 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <div class="text-4xl mb-4">📊</div>
        <p>Performance chart will be displayed here</p>
        <p class="text-sm mt-2">Spend, Revenue, ROAS trends</p>
      </div>
    </div>

    <!-- Campaign Performance Table -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Campaign Performance</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spend</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROAS</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="campaigns.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                No campaign data available
              </td>
            </tr>
            <tr v-for="campaign in campaigns" :key="campaign.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ campaign.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ campaign.impressions.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ campaign.clicks.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ campaign.ctr }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${{ campaign.spend.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ campaign.conversions }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="campaign.roas >= 2 ? 'text-green-600 font-semibold' : 'text-gray-600'">
                  {{ campaign.roas }}x
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Conversion Funnel -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
      <div class="text-center py-20 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <div class="text-4xl mb-4">🔄</div>
        <p>Conversion funnel visualization will be displayed here</p>
        <p class="text-sm mt-2">Impressions → Clicks → Views → Add to Cart → Purchase</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const metrics = ref({
  totalSpend: 0,
  revenue: 0,
  roas: 0,
  conversions: 0
});

const campaigns = ref([]);

onMounted(() => {
  loadAnalytics();
});

const loadAnalytics = async () => {
  // TODO: Implement API call
  metrics.value = {
    totalSpend: 0,
    revenue: 0,
    roas: 0,
    conversions: 0
  };
  campaigns.value = [];
};
</script>
