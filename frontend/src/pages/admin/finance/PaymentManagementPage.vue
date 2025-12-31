<template>
  <div class="payment-management-page">
    <div class="page-header">
      <h1 class="page-title">Payment Management</h1>
      <div class="header-actions">
        <button @click="showBatchModal = true" class="btn btn-primary">
          <i class="fas fa-layer-group"></i> New Batch
        </button>
        <button @click="showScheduledModal = true" class="btn btn-success">
          <i class="fas fa-clock"></i> Schedule Payment
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon draft">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.draftBatchCount || 0 }}</div>
          <div class="stat-label">Draft Batches</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingBatchCount || 0 }}</div>
          <div class="stat-label">Pending Approval</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon scheduled">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.scheduledCount || 0 }}</div>
          <div class="stat-label">Active Schedules</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon upcoming">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.upcomingCount || 0 }}</div>
          <div class="stat-label">Upcoming (30 days)</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon overdue">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.overdueCount || 0 }}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        @click="activeTab = 'batches'" 
        :class="{ active: activeTab === 'batches' }"
        class="tab-btn"
      >
        <i class="fas fa-layer-group"></i> Payment Batches
      </button>
      <button 
        @click="activeTab = 'scheduled'" 
        :class="{ active: activeTab === 'scheduled' }"
        class="tab-btn"
      >
        <i class="fas fa-clock"></i> Scheduled Payments
      </button>
    </div>

    <!-- Payment Batches Tab -->
    <div v-if="activeTab === 'batches'" class="tab-content">
      <div class="filters">
        <input 
          v-model="batchFilters.search" 
          type="text" 
          placeholder="Search batches..."
          class="search-input"
        />
        <select v-model="batchFilters.status" class="filter-select">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button @click="loadBatches" class="btn btn-secondary">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div v-if="loading" class="loading">Loading payment batches...</div>
      <div v-else-if="batches.length === 0" class="empty-state">
        <i class="fas fa-layer-group"></i>
        <p>No payment batches found</p>
      </div>
      <div v-else class="batches-list">
        <div v-for="batch in batches" :key="batch._id" class="batch-card">
          <div class="batch-header">
            <div class="batch-info">
              <h3>{{ batch.name }}</h3>
              <span class="batch-number">{{ batch.batchNumber }}</span>
            </div>
            <span :class="['status-badge', getStatusClass(batch.status)]">
              {{ formatStatus(batch.status) }}
            </span>
          </div>

          <div class="batch-body">
            <div class="batch-stats">
              <div class="stat-item">
                <span class="label">Total Amount:</span>
                <span class="value">${{ formatNumber(batch.totalAmount) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Items:</span>
                <span class="value">{{ batch.items?.length || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Method:</span>
                <span class="value">{{ formatPaymentMethod(batch.paymentMethod) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Created:</span>
                <span class="value">{{ formatDate(batch.createdAt) }}</span>
              </div>
            </div>

            <div v-if="batch.scheduledDate" class="scheduled-info">
              <i class="fas fa-calendar"></i>
              Scheduled for: {{ formatDate(batch.scheduledDate) }}
            </div>

            <div v-if="batch.status === 'processing' || batch.status === 'completed'" class="progress-bar">
              <div class="progress-fill" :style="{ width: batch.completionPercentage + '%' }"></div>
              <span class="progress-text">{{ batch.completionPercentage }}%</span>
            </div>
          </div>

          <div class="batch-actions">
            <button @click="viewBatch(batch)" class="btn btn-sm btn-secondary">
              <i class="fas fa-eye"></i> View
            </button>
            <button 
              v-if="batch.status === 'draft' || batch.status === 'pending_approval'"
              @click="editBatch(batch)" 
              class="btn btn-sm btn-info"
            >
              <i class="fas fa-edit"></i> Edit
            </button>
            <button 
              v-if="batch.status === 'pending_approval' || batch.status === 'draft'"
              @click="approveBatch(batch._id)" 
              class="btn btn-sm btn-success"
            >
              <i class="fas fa-check"></i> Approve
            </button>
            <button 
              v-if="batch.status === 'approved'"
              @click="processBatch(batch._id)" 
              class="btn btn-sm btn-primary"
            >
              <i class="fas fa-play"></i> Process
            </button>
            <button 
              v-if="batch.status !== 'processing' && batch.status !== 'completed'"
              @click="cancelBatch(batch._id)" 
              class="btn btn-sm btn-danger"
            >
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scheduled Payments Tab -->
    <div v-if="activeTab === 'scheduled'" class="tab-content">
      <div class="filters">
        <select v-model="scheduledFilters.status" class="filter-select">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="scheduledFilters.frequency" class="filter-select">
          <option value="">All Frequencies</option>
          <option value="once">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Annually</option>
        </select>
        <label class="checkbox-label">
          <input v-model="scheduledFilters.overdue" type="checkbox" />
          Overdue Only
        </label>
        <button @click="loadScheduledPayments" class="btn btn-secondary">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div v-if="loading" class="loading">Loading scheduled payments...</div>
      <div v-else-if="scheduledPayments.length === 0" class="empty-state">
        <i class="fas fa-clock"></i>
        <p>No scheduled payments found</p>
      </div>
      <div v-else class="scheduled-list">
        <div v-for="payment in scheduledPayments" :key="payment._id" class="scheduled-card">
          <div class="scheduled-header">
            <div class="scheduled-info">
              <h3>{{ payment.name }}</h3>
              <span class="frequency-badge">{{ formatFrequency(payment.frequency) }}</span>
            </div>
            <span :class="['status-badge', getStatusClass(payment.status)]">
              {{ formatStatus(payment.status) }}
            </span>
          </div>

          <div class="scheduled-body">
            <div class="scheduled-details">
              <div class="detail-item">
                <span class="label">Amount:</span>
                <span class="value amount">${{ formatNumber(payment.amount) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Next Payment:</span>
                <span class="value">{{ formatDate(payment.nextPaymentDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Executions:</span>
                <span class="value">{{ payment.executionCount }}{{ payment.maxExecutions ? `/${payment.maxExecutions}` : '' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Method:</span>
                <span class="value">{{ formatPaymentMethod(payment.paymentMethod) }}</span>
              </div>
            </div>

            <div v-if="payment.isOverdue" class="overdue-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Payment is overdue!</span>
            </div>
          </div>

          <div class="scheduled-actions">
            <button @click="viewScheduled(payment)" class="btn btn-sm btn-secondary">
              <i class="fas fa-eye"></i> View
            </button>
            <button 
              v-if="payment.status === 'active'"
              @click="pauseScheduled(payment._id)" 
              class="btn btn-sm btn-warning"
            >
              <i class="fas fa-pause"></i> Pause
            </button>
            <button 
              v-if="payment.status === 'paused'"
              @click="resumeScheduled(payment._id)" 
              class="btn btn-sm btn-success"
            >
              <i class="fas fa-play"></i> Resume
            </button>
            <button 
              v-if="payment.status === 'active'"
              @click="executeScheduled(payment._id)" 
              class="btn btn-sm btn-primary"
            >
              <i class="fas fa-bolt"></i> Execute Now
            </button>
            <button 
              v-if="payment.status !== 'completed' && payment.status !== 'cancelled'"
              @click="cancelScheduled(payment._id)" 
              class="btn btn-sm btn-danger"
            >
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PaymentBatchModal 
      v-if="showBatchModal"
      :batch="selectedBatch"
      @close="closeBatchModal"
      @saved="handleBatchSaved"
    />

    <ScheduledPaymentModal 
      v-if="showScheduledModal"
      :payment="selectedScheduledPayment"
      @close="closeScheduledModal"
      @saved="handleScheduledSaved"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import financeService from '@/services/financeService';
import PaymentBatchModal from './PaymentBatchModal.vue';
import ScheduledPaymentModal from './ScheduledPaymentModal.vue';

export default {
  name: 'PaymentManagementPage',
  components: {
    PaymentBatchModal,
    ScheduledPaymentModal
  },
  setup() {
    const activeTab = ref('batches');
    const loading = ref(false);
    const batches = ref([]);
    const scheduledPayments = ref([]);
    const stats = ref({});
    
    const showBatchModal = ref(false);
    const showScheduledModal = ref(false);
    const selectedBatch = ref(null);
    const selectedScheduledPayment = ref(null);

    const batchFilters = reactive({
      search: '',
      status: ''
    });

    const scheduledFilters = reactive({
      status: '',
      frequency: '',
      overdue: false
    });

    const loadBatches = async () => {
      try {
        loading.value = true;
        const response = await financeService.getPaymentBatches(batchFilters);
        batches.value = response.data.data;
      } catch (error) {
        console.error('Error loading batches:', error);
        alert('Error loading payment batches');
      } finally {
        loading.value = false;
      }
    };

    const loadScheduledPayments = async () => {
      try {
        loading.value = true;
        const response = await financeService.getScheduledPayments(scheduledFilters);
        scheduledPayments.value = response.data.data;
      } catch (error) {
        console.error('Error loading scheduled payments:', error);
        alert('Error loading scheduled payments');
      } finally {
        loading.value = false;
      }
    };

    const loadStats = async () => {
      try {
        const response = await financeService.getPaymentStats();
        const data = response.data.data;
        
        const batchMap = {};
        data.batches?.forEach(item => {
          batchMap[item._id] = item.count;
        });
        
        const scheduledMap = {};
        data.scheduled?.forEach(item => {
          scheduledMap[item._id] = item.count;
        });
        
        stats.value = {
          draftBatchCount: batchMap.draft || 0,
          pendingBatchCount: batchMap.pending_approval || 0,
          scheduledCount: scheduledMap.active || 0,
          upcomingCount: data.upcomingCount || 0,
          overdueCount: data.overdueCount || 0
        };
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const viewBatch = (batch) => {
      selectedBatch.value = batch;
      showBatchModal.value = true;
    };

    const editBatch = (batch) => {
      selectedBatch.value = batch;
      showBatchModal.value = true;
    };

    const approveBatch = async (id) => {
      if (!confirm('Approve this payment batch?')) return;
      
      try {
        await financeService.approveBatch(id);
        alert('Batch approved successfully');
        loadBatches();
        loadStats();
      } catch (error) {
        console.error('Error approving batch:', error);
        alert('Error approving batch');
      }
    };

    const processBatch = async (id) => {
      if (!confirm('Process this payment batch? This will execute all payments in the batch.')) return;
      
      try {
        await financeService.processBatch(id);
        alert('Batch processed successfully');
        loadBatches();
        loadStats();
      } catch (error) {
        console.error('Error processing batch:', error);
        alert('Error processing batch');
      }
    };

    const cancelBatch = async (id) => {
      if (!confirm('Cancel this payment batch?')) return;
      
      try {
        await financeService.cancelBatch(id);
        alert('Batch cancelled successfully');
        loadBatches();
        loadStats();
      } catch (error) {
        console.error('Error cancelling batch:', error);
        alert(error.response?.data?.message || 'Error cancelling batch');
      }
    };

    const viewScheduled = (payment) => {
      selectedScheduledPayment.value = payment;
      showScheduledModal.value = true;
    };

    const pauseScheduled = async (id) => {
      try {
        await financeService.pauseScheduledPayment(id);
        alert('Scheduled payment paused');
        loadScheduledPayments();
        loadStats();
      } catch (error) {
        console.error('Error pausing scheduled payment:', error);
        alert('Error pausing scheduled payment');
      }
    };

    const resumeScheduled = async (id) => {
      try {
        await financeService.resumeScheduledPayment(id);
        alert('Scheduled payment resumed');
        loadScheduledPayments();
        loadStats();
      } catch (error) {
        console.error('Error resuming scheduled payment:', error);
        alert('Error resuming scheduled payment');
      }
    };

    const executeScheduled = async (id) => {
      if (!confirm('Execute this scheduled payment now?')) return;
      
      try {
        await financeService.executeScheduledPayment(id);
        alert('Payment executed successfully');
        loadScheduledPayments();
        loadStats();
      } catch (error) {
        console.error('Error executing scheduled payment:', error);
        alert('Error executing scheduled payment');
      }
    };

    const cancelScheduled = async (id) => {
      if (!confirm('Cancel this scheduled payment?')) return;
      
      try {
        await financeService.cancelScheduledPayment(id);
        alert('Scheduled payment cancelled');
        loadScheduledPayments();
        loadStats();
      } catch (error) {
        console.error('Error cancelling scheduled payment:', error);
        alert(error.response?.data?.message || 'Error cancelling scheduled payment');
      }
    };

    const closeBatchModal = () => {
      showBatchModal.value = false;
      selectedBatch.value = null;
    };

    const closeScheduledModal = () => {
      showScheduledModal.value = false;
      selectedScheduledPayment.value = null;
    };

    const handleBatchSaved = () => {
      closeBatchModal();
      loadBatches();
      loadStats();
    };

    const handleScheduledSaved = () => {
      closeScheduledModal();
      loadScheduledPayments();
      loadStats();
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

    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const formatPaymentMethod = (method) => {
      const methods = {
        bank_transfer: 'Bank Transfer',
        ach: 'ACH',
        wire: 'Wire',
        check: 'Check',
        online: 'Online',
        auto: 'Auto'
      };
      return methods[method] || method;
    };

    const formatFrequency = (freq) => {
      return freq.charAt(0).toUpperCase() + freq.slice(1);
    };

    const getStatusClass = (status) => {
      const classes = {
        draft: 'draft',
        pending_approval: 'pending',
        approved: 'success',
        processing: 'info',
        completed: 'completed',
        cancelled: 'cancelled',
        active: 'active',
        paused: 'warning',
        overdue: 'overdue'
      };
      return classes[status] || '';
    };

    onMounted(() => {
      loadBatches();
      loadScheduledPayments();
      loadStats();
    });

    return {
      activeTab,
      loading,
      batches,
      scheduledPayments,
      stats,
      showBatchModal,
      showScheduledModal,
      selectedBatch,
      selectedScheduledPayment,
      batchFilters,
      scheduledFilters,
      loadBatches,
      loadScheduledPayments,
      loadStats,
      viewBatch,
      editBatch,
      approveBatch,
      processBatch,
      cancelBatch,
      viewScheduled,
      pauseScheduled,
      resumeScheduled,
      executeScheduled,
      cancelScheduled,
      closeBatchModal,
      closeScheduledModal,
      handleBatchSaved,
      handleScheduledSaved,
      formatNumber,
      formatDate,
      formatStatus,
      formatPaymentMethod,
      formatFrequency,
      getStatusClass
    };
  }
};
</script>

<style scoped>
.payment-management-page {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.draft { background: #9ca3af; }
.stat-icon.pending { background: #fbbf24; }
.stat-icon.scheduled { background: #3b82f6; }
.stat-icon.upcoming { background: #10b981; }
.stat-icon.overdue { background: #ef4444; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
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

.search-input {
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

.batches-list, .scheduled-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.batch-card, .scheduled-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.batch-header, .scheduled-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.batch-info h3, .scheduled-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.batch-number {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
}

.frequency-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.draft { background: #f3f4f6; color: #4b5563; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.success, .status-badge.completed, .status-badge.active { background: #d1fae5; color: #065f46; }
.status-badge.info { background: #dbeafe; color: #1e40af; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }
.status-badge.warning { background: #fef3c7; color: #92400e; }
.status-badge.overdue { background: #fee2e2; color: #991b1b; }

.batch-stats, .scheduled-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item, .detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item .label, .detail-item .label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-item .value, .detail-item .value {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
}

.detail-item .value.amount {
  color: #3b82f6;
  font-size: 1.125rem;
}

.scheduled-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 0.75rem;
  color: #1e40af;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.progress-bar {
  background: #e5e7eb;
  border-radius: 8px;
  height: 24px;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  height: 100%;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
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
  margin-top: 1rem;
}

.batch-actions, .scheduled-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
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

.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }
.btn-secondary { background: #6b7280; color: white; }
.btn-secondary:hover { background: #4b5563; }
.btn-info { background: #3b82f6; color: white; }
.btn-info:hover { background: #2563eb; }
.btn-warning { background: #f59e0b; color: white; }
.btn-warning:hover { background: #d97706; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
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
