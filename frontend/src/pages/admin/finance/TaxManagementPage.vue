<template>
  <div class="tax-management-page">
    <div class="page-header">
      <h1 class="page-title">Tax Management</h1>
      <div class="header-actions">
        <button @click="showRateModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i> New Tax Rate
        </button>
        <button @click="showLiabilityModal = true" class="btn btn-success">
          <i class="fas fa-file-invoice"></i> New Liability
        </button>
      </div>
    </div>

    <!-- Tax Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="card-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ summary.pendingCount || 0 }}</div>
          <div class="card-label">Pending Liabilities</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon overdue">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ summary.overdueCount || 0 }}</div>
          <div class="card-label">Overdue Liabilities</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon upcoming">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ summary.upcomingCount || 0 }}</div>
          <div class="card-label">Due in 30 Days</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon paid">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">${{ formatNumber(summary.totalPaid) }}</div>
          <div class="card-label">Total Paid</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon balance">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="card-content">
          <div class="card-value">${{ formatNumber(summary.totalBalance) }}</div>
          <div class="card-label">Total Balance</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        @click="activeTab = 'rates'" 
        :class="{ active: activeTab === 'rates' }"
        class="tab-btn"
      >
        <i class="fas fa-percentage"></i> Tax Rates
      </button>
      <button 
        @click="activeTab = 'liabilities'" 
        :class="{ active: activeTab === 'liabilities' }"
        class="tab-btn"
      >
        <i class="fas fa-file-invoice-dollar"></i> Tax Liabilities
      </button>
    </div>

    <!-- Tax Rates Tab -->
    <div v-if="activeTab === 'rates'" class="tab-content">
      <div class="filters">
        <input 
          v-model="rateFilters.search" 
          type="text" 
          placeholder="Search tax rates..."
          class="search-input"
        />
        <select v-model="rateFilters.type" class="filter-select">
          <option value="">All Types</option>
          <option value="sales">Sales Tax</option>
          <option value="purchase">Purchase Tax</option>
          <option value="income">Income Tax</option>
          <option value="payroll">Payroll Tax</option>
          <option value="property">Property Tax</option>
          <option value="other">Other</option>
        </select>
        <select v-model="rateFilters.isActive" class="filter-select">
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button @click="loadTaxRates" class="btn btn-secondary">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div v-if="loading" class="loading">Loading tax rates...</div>
      <div v-else-if="taxRates.length === 0" class="empty-state">
        <i class="fas fa-percentage"></i>
        <p>No tax rates found</p>
      </div>
      <div v-else class="rates-grid">
        <div v-for="rate in taxRates" :key="rate._id" class="rate-card">
          <div class="rate-header">
            <h3 class="rate-name">{{ rate.name }}</h3>
            <span :class="['status-badge', rate.isActive ? 'active' : 'inactive']">
              {{ rate.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <div class="rate-body">
            <div class="rate-info">
              <span class="info-label">Type:</span>
              <span class="info-value">{{ formatType(rate.type) }}</span>
            </div>
            <div class="rate-info">
              <span class="info-label">Rate:</span>
              <span class="info-value rate-percentage">{{ rate.rate }}%</span>
            </div>
            <div class="rate-info">
              <span class="info-label">Location:</span>
              <span class="info-value">{{ formatLocation(rate) }}</span>
            </div>
            <div class="rate-info">
              <span class="info-label">Filing:</span>
              <span class="info-value">{{ formatFrequency(rate.filingFrequency) }}</span>
            </div>
            <div class="rate-info">
              <span class="info-label">Effective:</span>
              <span class="info-value">{{ formatDate(rate.effectiveFrom) }}</span>
            </div>
          </div>

          <div class="rate-footer">
            <button @click="editRate(rate)" class="btn-icon" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteRate(rate._id)" class="btn-icon danger" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tax Liabilities Tab -->
    <div v-if="activeTab === 'liabilities'" class="tab-content">
      <div class="filters">
        <select v-model="liabilityFilters.status" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="calculated">Calculated</option>
          <option value="filed">Filed</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <input 
          v-model="liabilityFilters.startDate" 
          type="date" 
          class="filter-input"
        />
        <input 
          v-model="liabilityFilters.endDate" 
          type="date" 
          class="filter-input"
        />
        <label class="checkbox-label">
          <input v-model="liabilityFilters.overdue" type="checkbox" />
          Overdue Only
        </label>
        <button @click="loadTaxLiabilities" class="btn btn-secondary">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div v-if="loading" class="loading">Loading tax liabilities...</div>
      <div v-else-if="taxLiabilities.length === 0" class="empty-state">
        <i class="fas fa-file-invoice-dollar"></i>
        <p>No tax liabilities found</p>
      </div>
      <div v-else class="liabilities-list">
        <div v-for="liability in taxLiabilities" :key="liability._id" class="liability-card">
          <div class="liability-header">
            <div class="liability-title">
              <h3>{{ liability.taxRate?.name || 'N/A' }}</h3>
              <span class="period-badge">{{ liability.period }}</span>
            </div>
            <span :class="['status-badge', getStatusClass(liability.status)]">
              {{ formatStatus(liability.status) }}
            </span>
          </div>

          <div class="liability-grid">
            <div class="liability-info">
              <span class="info-label">Taxable Amount:</span>
              <span class="info-value">${{ formatNumber(liability.taxableAmount) }}</span>
            </div>
            <div class="liability-info">
              <span class="info-label">Tax Amount:</span>
              <span class="info-value">${{ formatNumber(liability.taxAmount) }}</span>
            </div>
            <div class="liability-info">
              <span class="info-label">Total Due:</span>
              <span class="info-value">${{ formatNumber(liability.totalDue) }}</span>
            </div>
            <div class="liability-info">
              <span class="info-label">Amount Paid:</span>
              <span class="info-value">${{ formatNumber(liability.amountPaid) }}</span>
            </div>
            <div class="liability-info">
              <span class="info-label">Balance:</span>
              <span class="info-value">${{ formatNumber(liability.balance) }}</span>
            </div>
            <div class="liability-info">
              <span class="info-label">Due Date:</span>
              <span class="info-value">{{ formatDate(liability.dueDate) }}</span>
            </div>
          </div>

          <div v-if="liability.isOverdue" class="overdue-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Overdue by {{ liability.daysOverdue }} days</span>
          </div>

          <div class="liability-actions">
            <button @click="viewLiability(liability)" class="btn btn-sm btn-secondary">
              <i class="fas fa-eye"></i> View
            </button>
            <button 
              v-if="liability.status === 'calculated' || liability.status === 'pending'"
              @click="fileLiability(liability._id)" 
              class="btn btn-sm btn-info"
            >
              <i class="fas fa-file-upload"></i> File
            </button>
            <button 
              v-if="liability.balance > 0"
              @click="addPayment(liability)" 
              class="btn btn-sm btn-success"
            >
              <i class="fas fa-dollar-sign"></i> Add Payment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tax Rate Modal -->
    <TaxRateModal 
      v-if="showRateModal"
      :rate="selectedRate"
      @close="closeRateModal"
      @saved="handleRateSaved"
    />

    <!-- Tax Liability Modal -->
    <TaxLiabilityModal 
      v-if="showLiabilityModal"
      :liability="selectedLiability"
      @close="closeLiabilityModal"
      @saved="handleLiabilitySaved"
    />

    <!-- Payment Modal -->
    <PaymentModal 
      v-if="showPaymentModal"
      :liability="selectedLiability"
      @close="showPaymentModal = false"
      @saved="handlePaymentSaved"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import financeService from '@/services/financeService';
import TaxRateModal from './TaxRateModal.vue';
import TaxLiabilityModal from './TaxLiabilityModal.vue';
import PaymentModal from './TaxPaymentModal.vue';

export default {
  name: 'TaxManagementPage',
  components: {
    TaxRateModal,
    TaxLiabilityModal,
    PaymentModal
  },
  setup() {
    const activeTab = ref('rates');
    const loading = ref(false);
    const taxRates = ref([]);
    const taxLiabilities = ref([]);
    const summary = ref({});
    
    const showRateModal = ref(false);
    const showLiabilityModal = ref(false);
    const showPaymentModal = ref(false);
    const selectedRate = ref(null);
    const selectedLiability = ref(null);

    const rateFilters = reactive({
      search: '',
      type: '',
      isActive: ''
    });

    const liabilityFilters = reactive({
      status: '',
      startDate: '',
      endDate: '',
      overdue: false
    });

    const loadTaxRates = async () => {
      try {
        loading.value = true;
        const response = await financeService.getTaxRates(rateFilters);
        taxRates.value = response.data.data;
      } catch (error) {
        console.error('Error loading tax rates:', error);
        alert('Error loading tax rates');
      } finally {
        loading.value = false;
      }
    };

    const loadTaxLiabilities = async () => {
      try {
        loading.value = true;
        const response = await financeService.getTaxLiabilities(liabilityFilters);
        taxLiabilities.value = response.data.data;
      } catch (error) {
        console.error('Error loading tax liabilities:', error);
        alert('Error loading tax liabilities');
      } finally {
        loading.value = false;
      }
    };

    const loadSummary = async () => {
      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        
        const response = await financeService.getTaxSummary({ startDate, endDate });
        summary.value = response.data.data;
      } catch (error) {
        console.error('Error loading summary:', error);
      }
    };

    const editRate = (rate) => {
      selectedRate.value = rate;
      showRateModal.value = true;
    };

    const deleteRate = async (id) => {
      if (!confirm('Are you sure you want to delete this tax rate?')) return;
      
      try {
        await financeService.deleteTaxRate(id);
        alert('Tax rate deleted successfully');
        loadTaxRates();
      } catch (error) {
        console.error('Error deleting tax rate:', error);
        alert(error.response?.data?.message || 'Error deleting tax rate');
      }
    };

    const viewLiability = (liability) => {
      selectedLiability.value = liability;
      showLiabilityModal.value = true;
    };

    const fileLiability = async (id) => {
      if (!confirm('File this tax liability?')) return;
      
      try {
        await financeService.fileTaxLiability(id);
        alert('Tax liability filed successfully');
        loadTaxLiabilities();
        loadSummary();
      } catch (error) {
        console.error('Error filing liability:', error);
        alert('Error filing liability');
      }
    };

    const addPayment = (liability) => {
      selectedLiability.value = liability;
      showPaymentModal.value = true;
    };

    const closeRateModal = () => {
      showRateModal.value = false;
      selectedRate.value = null;
    };

    const closeLiabilityModal = () => {
      showLiabilityModal.value = false;
      selectedLiability.value = null;
    };

    const handleRateSaved = () => {
      closeRateModal();
      loadTaxRates();
    };

    const handleLiabilitySaved = () => {
      closeLiabilityModal();
      loadTaxLiabilities();
      loadSummary();
    };

    const handlePaymentSaved = () => {
      showPaymentModal.value = false;
      selectedLiability.value = null;
      loadTaxLiabilities();
      loadSummary();
    };

    const formatNumber = (num) => {
      return num ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    const formatType = (type) => {
      const types = {
        sales: 'Sales Tax',
        purchase: 'Purchase Tax',
        income: 'Income Tax',
        payroll: 'Payroll Tax',
        property: 'Property Tax',
        other: 'Other'
      };
      return types[type] || type;
    };

    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatFrequency = (freq) => {
      return freq ? freq.charAt(0).toUpperCase() + freq.slice(1) : 'N/A';
    };

    const formatLocation = (rate) => {
      const parts = [];
      if (rate.city) parts.push(rate.city);
      if (rate.state) parts.push(rate.state);
      if (rate.country) parts.push(rate.country);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const getStatusClass = (status) => {
      const classes = {
        pending: 'pending',
        calculated: 'info',
        filed: 'success',
        paid: 'paid',
        overdue: 'overdue'
      };
      return classes[status] || '';
    };

    onMounted(() => {
      loadTaxRates();
      loadTaxLiabilities();
      loadSummary();
    });

    return {
      activeTab,
      loading,
      taxRates,
      taxLiabilities,
      summary,
      showRateModal,
      showLiabilityModal,
      showPaymentModal,
      selectedRate,
      selectedLiability,
      rateFilters,
      liabilityFilters,
      loadTaxRates,
      loadTaxLiabilities,
      loadSummary,
      editRate,
      deleteRate,
      viewLiability,
      fileLiability,
      addPayment,
      closeRateModal,
      closeLiabilityModal,
      handleRateSaved,
      handleLiabilitySaved,
      handlePaymentSaved,
      formatNumber,
      formatDate,
      formatType,
      formatStatus,
      formatFrequency,
      formatLocation,
      getStatusClass
    };
  }
};
</script>

<style scoped>
.tax-management-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a202c;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.card-icon.pending { background: #fbbf24; }
.card-icon.overdue { background: #ef4444; }
.card-icon.upcoming { background: #3b82f6; }
.card-icon.paid { background: #10b981; }
.card-icon.balance { background: #8b5cf6; }

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
}

.card-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input, .filter-input {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  flex: 1;
  min-width: 200px;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.rate-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  transition: box-shadow 0.2s;
}

.rate-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.rate-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.overdue {
  background: #fee2e2;
  color: #991b1b;
}

.rate-body {
  margin-bottom: 1rem;
}

.rate-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #1a202c;
  font-weight: 600;
}

.rate-percentage {
  color: #3b82f6;
  font-size: 1.125rem;
}

.rate-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.liabilities-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.liability-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.liability-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.liability-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.period-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.liability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.liability-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.overdue-warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem;
  color: #991b1b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.liability-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-info {
  background: #3b82f6;
  color: white;
}

.btn-info:hover {
  background: #2563eb;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
}

.btn-icon {
  padding: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-icon.danger {
  color: #ef4444;
}

.btn-icon.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.5;
}
</style>
