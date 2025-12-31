<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Financial Forecasting</h1>
        <p class="text-gray-600">AI-powered predictions, trends, and scenario planning</p>
      </div>
      <button @click="openCreateModal" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        + New Forecast
      </button>
    </div>

    <!-- Dashboard Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Total Forecasts</p>
        <p class="text-2xl font-bold">{{ dashboard.counts?.total || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Active Forecasts</p>
        <p class="text-2xl font-bold text-green-600">{{ dashboard.counts?.active || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Forecasted Revenue</p>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(dashboard.latestForecast?.summary?.forecastedRevenue) }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Avg Confidence</p>
        <p class="text-2xl font-bold text-purple-600">{{ (dashboard.latestForecast?.summary?.averageConfidence || 0).toFixed(0) }}%</p>
      </div>
    </div>

    <!-- Latest Forecast Highlights -->
    <div v-if="dashboard.latestForecast" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <!-- Key Trends -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-semibold mb-3">Key Trends</h3>
        <div class="space-y-2">
          <div v-for="trend in dashboard.latestForecast.keyTrends" :key="trend.metric" 
            class="flex items-center justify-between p-2 rounded bg-gray-50">
            <span class="capitalize">{{ trend.metric }}</span>
            <div class="flex items-center gap-2">
              <span :class="getTrendClass(trend.direction)">
                {{ getTrendIcon(trend.direction) }} {{ trend.direction }}
              </span>
              <span class="text-xs text-gray-500">{{ trend.strength }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Recommendations -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-semibold mb-3">Top Recommendations</h3>
        <div class="space-y-2">
          <div v-for="rec in dashboard.latestForecast.topRecommendations" :key="rec.title"
            class="p-2 rounded border-l-4" :class="getRecBorderClass(rec.priority)">
            <p class="font-medium text-sm">{{ rec.title }}</p>
            <p class="text-xs text-gray-600">{{ rec.suggestedAction }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Forecasts List -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="font-semibold">All Forecasts</h3>
        <div class="flex gap-3">
          <select v-model="filters.status" @change="loadForecasts" class="border rounded px-3 py-1.5 text-sm">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="approved">Approved</option>
          </select>
          <select v-model="filters.forecastType" @change="loadForecasts" class="border rounded px-3 py-1.5 text-sm">
            <option value="">All Types</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
            <option value="cash_flow">Cash Flow</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forecast</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeframe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="forecast in forecasts" :key="forecast._id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="font-medium">{{ forecast.name }}</div>
                <div class="text-xs text-gray-500">{{ forecast.description }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                  {{ forecast.forecastType?.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                {{ formatDate(forecast.timeframe?.startDate) }} - {{ formatDate(forecast.timeframe?.endDate) }}
              </td>
              <td class="px-4 py-3 text-sm font-medium text-green-600">
                {{ formatCurrency(forecast.summary?.forecastedRevenue) }}
              </td>
              <td class="px-4 py-3 text-sm font-medium" :class="forecast.summary?.forecastedProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(forecast.summary?.forecastedProfit) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div class="bg-purple-600 h-2 rounded-full" :style="{ width: (forecast.summary?.averageConfidence || 0) + '%' }"></div>
                  </div>
                  <span class="text-xs">{{ (forecast.summary?.averageConfidence || 0).toFixed(0) }}%</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(forecast.status)]">
                  {{ forecast.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="viewForecast(forecast)" class="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  <button v-if="forecast.status === 'draft'" @click="generatePredictions(forecast)" 
                    class="text-purple-600 hover:text-purple-800 text-sm">Generate</button>
                  <button v-if="forecast.status === 'ready'" @click="approveForecast(forecast)"
                    class="text-green-600 hover:text-green-800 text-sm">Approve</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t flex justify-between items-center">
        <p class="text-sm text-gray-600">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button @click="changePage(-1)" :disabled="pagination.page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button @click="changePage(1)" :disabled="pagination.page >= pagination.pages" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>

    <!-- Create Forecast Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-xl">
        <h3 class="text-lg font-semibold mb-4">Create New Forecast</h3>
        <form @submit.prevent="createForecast" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Forecast Name *</label>
            <input v-model="createForm.name" type="text" required class="w-full border rounded-lg px-3 py-2" 
              placeholder="Q1 2025 Revenue Forecast" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="createForm.description" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Forecast Type</label>
              <select v-model="createForm.forecastType" class="w-full border rounded-lg px-3 py-2">
                <option value="comprehensive">Comprehensive</option>
                <option value="revenue">Revenue Only</option>
                <option value="expense">Expense Only</option>
                <option value="profit">Profit</option>
                <option value="cash_flow">Cash Flow</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Granularity</label>
              <select v-model="createForm.timeframe.granularity" class="w-full border rounded-lg px-3 py-2">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Start Date *</label>
              <input v-model="createForm.timeframe.startDate" type="date" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">End Date *</label>
              <input v-model="createForm.timeframe.endDate" type="date" required class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Forecasting Model</label>
            <select v-model="createForm.methodology.primaryModel" class="w-full border rounded-lg px-3 py-2">
              <option value="linear_regression">Linear Regression</option>
              <option value="moving_average">Moving Average</option>
              <option value="exponential_smoothing">Exponential Smoothing</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Forecast</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Forecast Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold">{{ selectedForecast?.name }}</h3>
            <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(selectedForecast?.status)]">
              {{ selectedForecast?.status }}
            </span>
          </div>
          <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Summary -->
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500">Forecasted Revenue</p>
              <p class="text-xl font-bold text-green-600">{{ formatCurrency(selectedForecast?.summary?.forecastedRevenue) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500">Forecasted Expenses</p>
              <p class="text-xl font-bold text-orange-600">{{ formatCurrency(selectedForecast?.summary?.forecastedExpenses) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500">Net Profit</p>
              <p class="text-xl font-bold" :class="selectedForecast?.summary?.forecastedProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(selectedForecast?.summary?.forecastedProfit) }}
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500">Confidence</p>
              <p class="text-xl font-bold text-purple-600">{{ (selectedForecast?.summary?.averageConfidence || 0).toFixed(0) }}%</p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b">
            <nav class="flex gap-4">
              <button v-for="tab in ['predictions', 'trends', 'scenarios', 'recommendations']" :key="tab"
                @click="activeTab = tab"
                :class="['py-2 px-4 text-sm font-medium capitalize', activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500']">
                {{ tab }}
              </button>
            </nav>
          </div>

          <!-- Predictions Tab -->
          <div v-if="activeTab === 'predictions'">
            <h4 class="font-semibold mb-3">Revenue Predictions</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left">Period</th>
                    <th class="px-3 py-2 text-right">Predicted</th>
                    <th class="px-3 py-2 text-right">Lower Bound</th>
                    <th class="px-3 py-2 text-right">Upper Bound</th>
                    <th class="px-3 py-2 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="p in (selectedForecast?.predictions?.revenue || []).slice(0, 12)" :key="p.date">
                    <td class="px-3 py-2">{{ formatDate(p.date) }}</td>
                    <td class="px-3 py-2 text-right font-medium">{{ formatCurrency(p.value) }}</td>
                    <td class="px-3 py-2 text-right text-gray-500">{{ formatCurrency(p.lowerBound) }}</td>
                    <td class="px-3 py-2 text-right text-gray-500">{{ formatCurrency(p.upperBound) }}</td>
                    <td class="px-3 py-2 text-right">{{ p.confidence?.toFixed(0) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Trends Tab -->
          <div v-if="activeTab === 'trends'">
            <div class="space-y-4">
              <div v-for="trend in selectedForecast?.trends" :key="trend.metric" class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-semibold capitalize">{{ trend.metric }}</h4>
                  <span :class="getTrendClass(trend.direction)">
                    {{ getTrendIcon(trend.direction) }} {{ trend.direction }} ({{ trend.strength }}% strength)
                  </span>
                </div>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li v-for="(insight, i) in trend.insights" :key="i">• {{ insight }}</li>
                </ul>
              </div>

              <!-- Anomalies -->
              <div v-if="selectedForecast?.anomalies?.length" class="mt-4">
                <h4 class="font-semibold mb-2">Detected Anomalies</h4>
                <div class="space-y-2">
                  <div v-for="anomaly in selectedForecast.anomalies" :key="anomaly.date"
                    class="p-3 rounded-lg border-l-4" :class="anomaly.severity === 'high' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'">
                    <p class="font-medium">{{ anomaly.metric }} - {{ anomaly.type }}</p>
                    <p class="text-sm text-gray-600">{{ anomaly.explanation }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(anomaly.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scenarios Tab -->
          <div v-if="activeTab === 'scenarios'">
            <div class="grid grid-cols-3 gap-4">
              <div v-for="scenario in selectedForecast?.scenarios" :key="scenario.name"
                class="border rounded-lg p-4" :class="getScenarioClass(scenario.type)">
                <h4 class="font-semibold capitalize">{{ scenario.name }}</h4>
                <p class="text-xs text-gray-500 mb-3">{{ scenario.type?.replace('_', ' ') }}</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Revenue</span>
                    <span class="font-medium">{{ formatCurrency(scenario.summary?.totalRevenue) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Expenses</span>
                    <span class="font-medium">{{ formatCurrency(scenario.summary?.totalExpenses) }}</span>
                  </div>
                  <div class="flex justify-between border-t pt-2">
                    <span>Net Profit</span>
                    <span class="font-bold" :class="scenario.summary?.netProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ formatCurrency(scenario.summary?.netProfit) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>Margin</span>
                    <span>{{ (scenario.summary?.profitMargin || 0).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations Tab -->
          <div v-if="activeTab === 'recommendations'">
            <div class="space-y-3">
              <div v-for="rec in selectedForecast?.recommendations" :key="rec.title"
                class="border rounded-lg p-4" :class="getRecBgClass(rec.type)">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-semibold">{{ rec.title }}</h4>
                  <span :class="['px-2 py-1 text-xs rounded-full', getPriorityClass(rec.priority)]">{{ rec.priority }}</span>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ rec.description }}</p>
                <div class="text-sm">
                  <p><strong>Impact:</strong> {{ rec.impact }}</p>
                  <p><strong>Suggested Action:</strong> {{ rec.suggestedAction }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end gap-3">
          <button v-if="selectedForecast?.status === 'ready'" @click="approveForecast(selectedForecast)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
          <button @click="showDetailModal = false" class="px-4 py-2 border rounded-lg">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import financeService from '@/services/financeService';

const forecasts = ref([]);
const dashboard = ref({});
const selectedForecast = ref(null);
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const activeTab = ref('predictions');

const filters = reactive({ status: '', forecastType: '' });
const pagination = reactive({ page: 1, limit: 20, total: 0, pages: 0 });

const createForm = reactive({
  name: '',
  description: '',
  forecastType: 'comprehensive',
  timeframe: { startDate: '', endDate: '', granularity: 'monthly' },
  methodology: { primaryModel: 'linear_regression' }
});

onMounted(() => { loadDashboard(); loadForecasts(); });

const loadDashboard = async () => {
  try {
    const res = await financeService.getForecastDashboard();
    dashboard.value = res.data;
  } catch (error) { console.error('Failed to load dashboard:', error); }
};

const loadForecasts = async () => {
  try {
    const res = await financeService.getForecasts({ ...filters, page: pagination.page, limit: pagination.limit });
    forecasts.value = res.data;
    Object.assign(pagination, res.pagination);
  } catch (error) { console.error('Failed to load forecasts:', error); }
};

const openCreateModal = () => {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  Object.assign(createForm, {
    name: '',
    description: '',
    forecastType: 'comprehensive',
    timeframe: { 
      startDate: today.toISOString().split('T')[0], 
      endDate: nextYear.toISOString().split('T')[0], 
      granularity: 'monthly' 
    },
    methodology: { primaryModel: 'linear_regression' }
  });
  showCreateModal.value = true;
};

const createForecast = async () => {
  try {
    await financeService.createForecast(createForm);
    showCreateModal.value = false;
    loadForecasts();
  } catch (error) { console.error('Failed to create forecast:', error); alert(error.message); }
};

const viewForecast = async (forecast) => {
  try {
    const res = await financeService.getForecast(forecast._id);
    selectedForecast.value = res.data;
    activeTab.value = 'predictions';
    showDetailModal.value = true;
  } catch (error) { console.error('Failed to load forecast:', error); }
};

const generatePredictions = async (forecast) => {
  try {
    const res = await financeService.generateForecastPredictions(forecast._id);
    alert('Predictions generated successfully!');
    loadForecasts();
    selectedForecast.value = res.data;
    showDetailModal.value = true;
  } catch (error) { console.error('Failed to generate:', error); alert(error.message); }
};

const approveForecast = async (forecast) => {
  if (!confirm('Approve this forecast?')) return;
  try {
    await financeService.approveForecast(forecast._id);
    loadForecasts();
    loadDashboard();
    showDetailModal.value = false;
  } catch (error) { console.error('Failed to approve:', error); alert(error.message); }
};

const changePage = (delta) => { pagination.page += delta; loadForecasts(); };

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';
const formatCurrency = (v) => v != null ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0';

const getStatusClass = (status) => ({
  draft: 'bg-gray-100 text-gray-800',
  generating: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800'
}[status] || 'bg-gray-100 text-gray-800');

const getTrendClass = (direction) => ({
  increasing: 'text-green-600',
  decreasing: 'text-red-600',
  stable: 'text-blue-600',
  volatile: 'text-orange-600'
}[direction] || 'text-gray-600');

const getTrendIcon = (direction) => ({ increasing: '📈', decreasing: '📉', stable: '➡️', volatile: '📊' }[direction] || '•');

const getRecBorderClass = (priority) => ({
  critical: 'border-red-500 bg-red-50',
  high: 'border-orange-500 bg-orange-50',
  medium: 'border-yellow-500 bg-yellow-50',
  low: 'border-blue-500 bg-blue-50'
}[priority] || 'border-gray-500 bg-gray-50');

const getRecBgClass = (type) => ({
  risk: 'border-red-200 bg-red-50',
  opportunity: 'border-green-200 bg-green-50',
  action: 'border-blue-200 bg-blue-50',
  insight: 'border-purple-200 bg-purple-50'
}[type] || 'border-gray-200');

const getPriorityClass = (priority) => ({
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800'
}[priority] || 'bg-gray-100 text-gray-800');

const getScenarioClass = (type) => ({
  optimistic: 'border-green-300 bg-green-50',
  pessimistic: 'border-red-300 bg-red-50',
  most_likely: 'border-blue-300 bg-blue-50',
  custom: 'border-gray-300'
}[type] || 'border-gray-300');
</script>
