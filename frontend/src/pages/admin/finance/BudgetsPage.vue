<template>
  <div class="budgets-page">
    <div class="page-header">
      <h1>Budget Management</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        <i class="fas fa-plus"></i> Create Budget
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.status" @change="loadBudgets">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
        <option value="archived">Archived</option>
      </select>

      <select v-model="filters.budgetType" @change="loadBudgets">
        <option value="">All Types</option>
        <option value="operating">Operating</option>
        <option value="capital">Capital</option>
        <option value="project">Project</option>
        <option value="department">Department</option>
        <option value="master">Master</option>
      </select>

      <select v-model="filters.fiscalYear" @change="loadBudgets">
        <option value="">All Years</option>
        <option v-for="year in fiscalYears" :key="year" :value="year">{{ year }}</option>
      </select>

      <select v-model="filters.period" @change="loadBudgets">
        <option value="">All Periods</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="annual">Annual</option>
      </select>
    </div>

    <!-- Budgets Grid -->
    <div class="budgets-grid" v-if="budgets.length > 0">
      <div v-for="budget in budgets" :key="budget._id" class="budget-card" :class="`status-${budget.status}`">
        <div class="budget-header">
          <div>
            <h3>{{ budget.name }}</h3>
            <p class="budget-meta">
              {{ budget.budgetType }} • {{ budget.period }} • FY {{ budget.fiscalYear }}
            </p>
          </div>
          <span :class="`badge badge-${budget.status}`">{{ budget.status }}</span>
        </div>

        <div class="budget-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :class="getHealthClass(budget.utilizationPercentage)"
              :style="{ width: Math.min(budget.utilizationPercentage, 100) + '%' }"
            ></div>
          </div>
          <p class="progress-text">
            {{ budget.utilizationPercentage.toFixed(1) }}% utilized
          </p>
        </div>

        <div class="budget-stats">
          <div class="stat">
            <span class="label">Budgeted</span>
            <span class="value">${{ formatNumber(budget.totalBudgeted) }}</span>
          </div>
          <div class="stat">
            <span class="label">Actual</span>
            <span class="value">${{ formatNumber(budget.totalActual) }}</span>
          </div>
          <div class="stat">
            <span class="label">Variance</span>
            <span class="value" :class="budget.totalVariance >= 0 ? 'positive' : 'negative'">
              ${{ formatNumber(Math.abs(budget.totalVariance)) }}
            </span>
          </div>
        </div>

        <div class="budget-dates">
          <i class="fas fa-calendar"></i>
          {{ formatDate(budget.startDate) }} - {{ formatDate(budget.endDate) }}
        </div>

        <div class="budget-actions">
          <button @click="viewBudget(budget._id)" class="btn-secondary btn-sm">
            <i class="fas fa-eye"></i> View
          </button>
          <button @click="viewAnalysis(budget._id)" class="btn-secondary btn-sm">
            <i class="fas fa-chart-line"></i> Analysis
          </button>
          <button v-if="budget.status === 'draft'" @click="approveBudget(budget._id)" class="btn-success btn-sm">
            <i class="fas fa-check"></i> Approve
          </button>
          <button @click="updateActuals(budget._id)" class="btn-secondary btn-sm">
            <i class="fas fa-sync"></i> Sync
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <i class="fas fa-folder-open"></i>
      <p>No budgets found</p>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1">
        Previous
      </button>
      <span>Page {{ pagination.currentPage }} of {{ pagination.totalPages }}</span>
      <button @click="changePage(pagination.currentPage + 1)" :disabled="pagination.currentPage === pagination.totalPages">
        Next
      </button>
    </div>

    <!-- Create/Edit Budget Modal -->
    <BudgetFormModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @saved="handleBudgetSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BudgetFormModal from './BudgetFormModal.vue';

const router = useRouter();
const API_URL = 'http://localhost:3000/api/finance/budgets';

const budgets = ref([]);
const showCreateModal = ref(false);
const filters = ref({
  status: '',
  budgetType: '',
  fiscalYear: '',
  period: ''
});
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalBudgets: 0
});

const fiscalYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const loadBudgets = async () => {
  try {
    const params = {
      page: pagination.value.currentPage,
      ...filters.value
    };

    const response = await axios.get(API_URL, {
      params,
      ...getAuthHeaders()
    });

    budgets.value = response.data.budgets;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error loading budgets:', error);
    alert('Failed to load budgets');
  }
};

const viewBudget = (id) => {
  router.push(`/admin/finance/budgets/${id}`);
};

const viewAnalysis = (id) => {
  router.push(`/admin/finance/budgets/${id}/analysis`);
};

const approveBudget = async (id) => {
  if (!confirm('Are you sure you want to approve this budget?')) return;

  try {
    await axios.post(`${API_URL}/${id}/approve`, {}, getAuthHeaders());
    alert('Budget approved successfully');
    loadBudgets();
  } catch (error) {
    console.error('Error approving budget:', error);
    alert(error.response?.data?.message || 'Failed to approve budget');
  }
};

const updateActuals = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/update-actuals`, {}, getAuthHeaders());
    
    if (response.data.triggeredAlerts && response.data.triggeredAlerts.length > 0) {
      alert(`Actuals updated! ${response.data.triggeredAlerts.length} alert(s) triggered.`);
    } else {
      alert('Actuals updated successfully');
    }
    
    loadBudgets();
  } catch (error) {
    console.error('Error updating actuals:', error);
    alert('Failed to update actuals');
  }
};

const changePage = (page) => {
  pagination.value.currentPage = page;
  loadBudgets();
};

const handleBudgetSaved = () => {
  showCreateModal.value = false;
  loadBudgets();
};

const getHealthClass = (utilization) => {
  if (utilization < 70) return 'healthy';
  if (utilization < 90) return 'warning';
  return 'critical';
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

onMounted(() => {
  loadBudgets();
});
</script>

<style scoped>
.budgets-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1a1a1a;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.budget-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.budget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.budget-header h3 {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  color: #1a1a1a;
}

.budget-meta {
  font-size: 0.85rem;
  color: #666;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-draft { background: #e0e0e0; color: #666; }
.badge-active { background: #4caf50; color: white; }
.badge-closed { background: #ff9800; color: white; }
.badge-archived { background: #9e9e9e; color: white; }

.budget-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.healthy { background: #4caf50; }
.progress-fill.warning { background: #ff9800; }
.progress-fill.critical { background: #f44336; }

.progress-text {
  font-size: 0.9rem;
  color: #666;
  text-align: right;
}

.budget-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat .label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.stat .value.positive { color: #4caf50; }
.stat .value.negative { color: #f44336; }

.budget-dates {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.budget-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-success {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover {
  background: #45a049;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.no-data {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.no-data i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
