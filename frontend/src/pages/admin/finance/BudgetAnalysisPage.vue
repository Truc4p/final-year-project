<template>
  <div class="budget-analysis-page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="back-btn">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <h1>Budget Analysis</h1>
        <p class="subtitle" v-if="budget">{{ budget.name }}</p>
      </div>
      <button @click="refreshAnalysis" class="btn-primary">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading analysis...
    </div>

    <div v-else-if="analysis" class="analysis-content">
      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e3f2fd;">
            <i class="fas fa-wallet" style="color: #2196f3;"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Budgeted</span>
            <span class="stat-value">${{ formatNumber(analysis.overview.totalBudgeted) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fff3e0;">
            <i class="fas fa-receipt" style="color: #ff9800;"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Actual</span>
            <span class="stat-value">${{ formatNumber(analysis.overview.totalActual) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" :style="varianceStyle">
            <i class="fas fa-exchange-alt" :style="{ color: varianceColor }"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Variance</span>
            <span class="stat-value" :style="{ color: varianceColor }">
              ${{ formatNumber(Math.abs(analysis.overview.totalVariance)) }}
            </span>
            <span class="stat-badge" :class="analysis.overview.totalVariance >= 0 ? 'positive' : 'negative'">
              {{ analysis.overview.totalVariance >= 0 ? 'Under Budget' : 'Over Budget' }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" :style="utilizationIconStyle">
            <i class="fas fa-chart-pie" :style="{ color: utilizationColor }"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Utilization</span>
            <span class="stat-value" :style="{ color: utilizationColor }">
              {{ analysis.overview.utilizationPercentage.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Health Metrics -->
      <div class="section">
        <h2><i class="fas fa-heartbeat"></i> Budget Health</h2>
        <div class="health-grid">
          <div class="health-card">
            <span class="health-label">Status</span>
            <span class="health-value" :class="`status-${analysis.healthMetrics.status}`">
              {{ formatStatus(analysis.healthMetrics.status) }}
            </span>
          </div>
          <div class="health-card">
            <span class="health-label">Remaining Budget</span>
            <span class="health-value">${{ formatNumber(analysis.healthMetrics.remainingBudget) }}</span>
          </div>
          <div class="health-card">
            <span class="health-label">Days Remaining</span>
            <span class="health-value">{{ analysis.healthMetrics.daysRemaining }} days</span>
          </div>
          <div class="health-card">
            <span class="health-label">Daily Burn Rate</span>
            <span class="health-value">${{ formatNumber(analysis.healthMetrics.burnRate) }}</span>
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="section">
        <h2><i class="fas fa-layer-group"></i> Category Analysis</h2>
        <div class="category-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Budgeted</th>
                <th>Actual</th>
                <th>Variance</th>
                <th>Utilization</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, category) in analysis.categoryAnalysis" :key="category">
                <td class="category-name">{{ formatCategory(category) }}</td>
                <td>${{ formatNumber(data.budgeted) }}</td>
                <td>${{ formatNumber(data.actual) }}</td>
                <td :class="data.variance >= 0 ? 'positive' : 'negative'">
                  ${{ formatNumber(Math.abs(data.variance)) }}
                  <span class="variance-badge" :class="data.variance >= 0 ? 'positive' : 'negative'">
                    {{ data.variance >= 0 ? '▼' : '▲' }}
                  </span>
                </td>
                <td>
                  <div class="utilization-bar">
                    <div 
                      class="utilization-fill" 
                      :class="getUtilizationClass(data.actual / data.budgeted * 100)"
                      :style="{ width: Math.min((data.actual / data.budgeted * 100), 100) + '%' }"
                    ></div>
                    <span class="utilization-text">{{ ((data.actual / data.budgeted * 100).toFixed(0)) }}%</span>
                  </div>
                </td>
                <td>{{ data.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Overages & Savings -->
      <div class="insights-grid">
        <div class="section">
          <h2><i class="fas fa-arrow-up text-danger"></i> Top Overages</h2>
          <div v-if="analysis.topOverages.length > 0" class="insights-list">
            <div v-for="(item, index) in analysis.topOverages" :key="index" class="insight-item overage">
              <div class="insight-header">
                <span class="category-badge">{{ formatCategory(item.category) }}</span>
                <span class="amount negative">${{ formatNumber(item.actualAmount - item.budgetedAmount) }}</span>
              </div>
              <div class="insight-details">
                <span>Budgeted: ${{ formatNumber(item.budgetedAmount) }}</span>
                <span>Actual: ${{ formatNumber(item.actualAmount) }}</span>
              </div>
              <div class="progress-mini">
                <div class="progress-fill-mini critical" :style="{ width: Math.min((item.actualAmount / item.budgetedAmount * 100), 100) + '%' }"></div>
              </div>
            </div>
          </div>
          <div v-else class="no-data-small">
            <i class="fas fa-check-circle"></i>
            <p>No overages - Great job!</p>
          </div>
        </div>

        <div class="section">
          <h2><i class="fas fa-arrow-down text-success"></i> Top Savings</h2>
          <div v-if="analysis.topSavings.length > 0" class="insights-list">
            <div v-for="(item, index) in analysis.topSavings" :key="index" class="insight-item saving">
              <div class="insight-header">
                <span class="category-badge">{{ formatCategory(item.category) }}</span>
                <span class="amount positive">${{ formatNumber(item.budgetedAmount - item.actualAmount) }}</span>
              </div>
              <div class="insight-details">
                <span>Budgeted: ${{ formatNumber(item.budgetedAmount) }}</span>
                <span>Actual: ${{ formatNumber(item.actualAmount) }}</span>
              </div>
              <div class="progress-mini">
                <div class="progress-fill-mini healthy" :style="{ width: (item.actualAmount / item.budgetedAmount * 100) + '%' }"></div>
              </div>
            </div>
          </div>
          <div v-else class="no-data-small">
            <i class="fas fa-info-circle"></i>
            <p>No significant savings</p>
          </div>
        </div>
      </div>

      <!-- Active Alerts -->
      <div v-if="analysis.alerts && analysis.alerts.length > 0" class="section alerts-section">
        <h2><i class="fas fa-bell"></i> Active Alerts</h2>
        <div class="alerts-list">
          <div v-for="(alert, index) in analysis.alerts" :key="index" class="alert-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="alert-content">
              <p>{{ alert.message }}</p>
              <span class="alert-time">Triggered: {{ formatDate(alert.triggeredAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const API_URL = 'http://localhost:3000/api/finance/budgets';

const analysis = ref(null);
const budget = ref(null);
const loading = ref(true);

const varianceColor = computed(() => {
  if (!analysis.value) return '#666';
  return analysis.value.overview.totalVariance >= 0 ? '#4caf50' : '#f44336';
});

const varianceStyle = computed(() => ({
  background: analysis.value?.overview.totalVariance >= 0 ? '#e8f5e9' : '#ffebee'
}));

const utilizationColor = computed(() => {
  if (!analysis.value) return '#666';
  const util = analysis.value.overview.utilizationPercentage;
  if (util < 70) return '#4caf50';
  if (util < 90) return '#ff9800';
  return '#f44336';
});

const utilizationIconStyle = computed(() => {
  const util = analysis.value?.overview.utilizationPercentage || 0;
  if (util < 70) return { background: '#e8f5e9' };
  if (util < 90) return { background: '#fff3e0' };
  return { background: '#ffebee' };
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const loadAnalysis = async () => {
  try {
    loading.value = true;
    const [analysisRes, budgetRes] = await Promise.all([
      axios.get(`${API_URL}/${route.params.id}/analysis`, getAuthHeaders()),
      axios.get(`${API_URL}/${route.params.id}`, getAuthHeaders())
    ]);
    
    analysis.value = analysisRes.data.analysis;
    budget.value = budgetRes.data.budget;
  } catch (error) {
    console.error('Error loading analysis:', error);
    alert('Failed to load budget analysis');
  } finally {
    loading.value = false;
  }
};

const refreshAnalysis = async () => {
  try {
    await axios.post(`${API_URL}/${route.params.id}/update-actuals`, {}, getAuthHeaders());
    await loadAnalysis();
    alert('Analysis refreshed successfully');
  } catch (error) {
    console.error('Error refreshing analysis:', error);
    alert('Failed to refresh analysis');
  }
};

const getUtilizationClass = (utilization) => {
  if (utilization < 70) return 'healthy';
  if (utilization < 90) return 'warning';
  return 'critical';
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const formatCategory = (category) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadAnalysis();
});
</script>

<style scoped>
.budget-analysis-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin: 0.5rem 0 0.25rem 0;
  color: #1a1a1a;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.back-btn {
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  color: #1976d2;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-badge {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.stat-badge.positive {
  background: #e8f5e9;
  color: #4caf50;
}

.stat-badge.negative {
  background: #ffebee;
  color: #f44336;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.health-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.health-label {
  font-size: 0.85rem;
  color: #666;
}

.health-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.status-healthy { color: #4caf50; }
.status-warning { color: #ff9800; }
.status-critical { color: #f44336; }
.status-exceeded { color: #9c27b0; }

.category-table {
  overflow-x: auto;
}

.category-table table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th,
.category-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.category-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.category-name {
  font-weight: 600;
  color: #1a1a1a;
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}

.variance-badge {
  margin-left: 0.5rem;
  font-size: 0.75rem;
}

.utilization-bar {
  position: relative;
  height: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.utilization-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.utilization-fill.healthy { background: #4caf50; }
.utilization-fill.warning { background: #ff9800; }
.utilization-fill.critical { background: #f44336; }

.utilization-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.insight-item.overage {
  background: #fff5f5;
  border-color: #f44336;
}

.insight-item.saving {
  background: #f1f8f4;
  border-color: #4caf50;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category-badge {
  background: #e0e0e0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.insight-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-mini {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
}

.progress-fill-mini.healthy { background: #4caf50; }
.progress-fill-mini.critical { background: #f44336; }

.alerts-section {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.alert-item i {
  color: #ff9800;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content p {
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
}

.alert-time {
  font-size: 0.8rem;
  color: #666;
}

.no-data-small {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.no-data-small i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.text-danger { color: #f44336; }
.text-success { color: #4caf50; }

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: #1976d2;
}
</style>
