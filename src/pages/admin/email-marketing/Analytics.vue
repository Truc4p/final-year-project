<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Email Marketing Analytics</h1>
            <p class="text-gray-600 mt-2">Track performance and engagement across all your email campaigns</p>
          </div>
          <div class="flex space-x-3">
            <select
              v-model="dateRange"
              @change="loadAnalytics"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            <button
              @click="exportAnalytics"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Analytics Dashboard -->
      <div v-else class="space-y-6">
        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p class="text-2xl font-bold text-gray-900">{{ analytics.totalCampaigns || 0 }}</p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <span :class="getChangeClass(analytics.campaignChange)">
                {{ formatChange(analytics.campaignChange) }}
              </span>
              <span class="text-gray-500 text-sm ml-1">vs previous period</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Emails Sent</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(analytics.totalEmailsSent) || 0 }}</p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <span :class="getChangeClass(analytics.emailsSentChange)">
                {{ formatChange(analytics.emailsSentChange) }}
              </span>
              <span class="text-gray-500 text-sm ml-1">vs previous period</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Average Open Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatPercentage(analytics.averageOpenRate) }}</p>
              </div>
              <div class="p-3 bg-yellow-100 rounded-full">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <span :class="getChangeClass(analytics.openRateChange)">
                {{ formatChange(analytics.openRateChange) }}
              </span>
              <span class="text-gray-500 text-sm ml-1">vs previous period</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Average Click Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatPercentage(analytics.averageClickRate) }}</p>
              </div>
              <div class="p-3 bg-purple-100 rounded-full">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <span :class="getChangeClass(analytics.clickRateChange)">
                {{ formatChange(analytics.clickRateChange) }}
              </span>
              <span class="text-gray-500 text-sm ml-1">vs previous period</span>
            </div>
          </div>
        </div>

        <!-- Performance Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Campaign Performance Chart -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Campaign Performance Trends</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p>Chart visualization would be displayed here</p>
                <p class="text-sm">(Integration with Chart.js or similar required)</p>
              </div>
            </div>
          </div>

          <!-- Engagement Breakdown -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Emails Delivered</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-600 h-2 rounded-full" 
                      :style="{ width: `${getDeliveryRate()}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ formatPercentage(getDeliveryRate()) }}</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Emails Opened</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: `${analytics.averageOpenRate || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ formatPercentage(analytics.averageOpenRate) }}</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Links Clicked</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-purple-600 h-2 rounded-full" 
                      :style="{ width: `${analytics.averageClickRate || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ formatPercentage(analytics.averageClickRate) }}</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Unsubscribes</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-red-600 h-2 rounded-full" 
                      :style="{ width: `${analytics.averageUnsubscribeRate || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ formatPercentage(analytics.averageUnsubscribeRate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Campaigns -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Recent Campaign Performance</h3>
              <router-link
                to="/admin/email-marketing/campaigns"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Campaigns →
              </router-link>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="recentCampaigns.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <p>No campaigns found</p>
              <p class="text-sm">Create your first email campaign to see analytics here.</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="campaign in recentCampaigns" :key="campaign._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ campaign.name }}</div>
                        <div class="text-sm text-gray-500">{{ campaign.subject }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatNumber(campaign.totalRecipients) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatPercentage(campaign.openRate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatPercentage(campaign.clickRate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(campaign.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ formatStatus(campaign.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(campaign.sentAt || campaign.createdAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Subscriber Growth -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Subscriber Growth</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600">{{ formatNumber(subscriberStats.total) }}</p>
              <p class="text-gray-600">Total Subscribers</p>
              <div class="mt-2">
                <span :class="getChangeClass(subscriberStats.totalChange)">
                  {{ formatChange(subscriberStats.totalChange) }}
                </span>
                <span class="text-gray-500 text-sm ml-1">this period</span>
              </div>
            </div>
            
            <div class="text-center">
              <p class="text-3xl font-bold text-green-600">{{ formatNumber(subscriberStats.newSubscribers) }}</p>
              <p class="text-gray-600">New Subscribers</p>
              <div class="mt-2">
                <span :class="getChangeClass(subscriberStats.newChange)">
                  {{ formatChange(subscriberStats.newChange) }}
                </span>
                <span class="text-gray-500 text-sm ml-1">vs previous period</span>
              </div>
            </div>
            
            <div class="text-center">
              <p class="text-3xl font-bold text-red-600">{{ formatNumber(subscriberStats.unsubscribed) }}</p>
              <p class="text-gray-600">Unsubscribed</p>
              <div class="mt-2">
                <span :class="getChangeClass(-subscriberStats.unsubscribedChange)">
                  {{ formatChange(subscriberStats.unsubscribedChange) }}
                </span>
                <span class="text-gray-500 text-sm ml-1">vs previous period</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'EmailAnalytics',
  setup() {
    // State
    const loading = ref(false)
    const dateRange = ref('30')
    
    const analytics = reactive({
      totalCampaigns: 0,
      totalEmailsSent: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
      averageUnsubscribeRate: 0,
      campaignChange: 0,
      emailsSentChange: 0,
      openRateChange: 0,
      clickRateChange: 0
    })
    
    const recentCampaigns = ref([])
    
    const subscriberStats = reactive({
      total: 0,
      newSubscribers: 0,
      unsubscribed: 0,
      totalChange: 0,
      newChange: 0,
      unsubscribedChange: 0
    })
    
    // Methods
    const loadAnalytics = async () => {
      loading.value = true
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/email-campaigns/analytics?days=${dateRange.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) throw new Error('Failed to load analytics')
        
        const data = await response.json()
        Object.assign(analytics, data.analytics)
        recentCampaigns.value = data.recentCampaigns || []
        Object.assign(subscriberStats, data.subscriberStats || {})
      } catch (error) {
        console.error('Error loading analytics:', error)
        alert('Failed to load analytics')
      } finally {
        loading.value = false
      }
    }
    
    const exportAnalytics = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/email-campaigns/analytics/export?days=${dateRange.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to export analytics')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `email-analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error exporting analytics:', error)
        alert('Failed to export analytics')
      }
    }
    
    // Utility functions
    const formatNumber = (num) => {
      if (!num) return '0'
      return new Intl.NumberFormat().format(num)
    }
    
    const formatPercentage = (num) => {
      if (num === null || num === undefined) return '0%'
      return `${Math.round(num * 100) / 100}%`
    }
    
    const formatChange = (change) => {
      if (!change) return '0%'
      const prefix = change > 0 ? '+' : ''
      return `${prefix}${Math.round(change * 100) / 100}%`
    }
    
    const getChangeClass = (change) => {
      if (!change) return 'text-gray-500'
      return change > 0 ? 'text-green-600' : 'text-red-600'
    }
    
    const getDeliveryRate = () => {
      const sent = analytics.totalEmailsSent || 0
      const bounced = analytics.totalBounced || 0
      if (sent === 0) return 0
      return ((sent - bounced) / sent) * 100
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'sent': 'bg-green-100 text-green-800',
        'scheduled': 'bg-blue-100 text-blue-800',
        'draft': 'bg-gray-100 text-gray-800',
        'sending': 'bg-yellow-100 text-yellow-800',
        'failed': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
    
    // Lifecycle
    onMounted(() => {
      loadAnalytics()
    })
    
    return {
      // State
      loading,
      dateRange,
      analytics,
      recentCampaigns,
      subscriberStats,
      
      // Methods
      loadAnalytics,
      exportAnalytics,
      formatNumber,
      formatPercentage,
      formatChange,
      getChangeClass,
      getDeliveryRate,
      getStatusClass,
      formatStatus,
      formatDate
    }
  }
}
</script>