<template>
  <div class="approvals-page">
    <div class="page-header">
      <h1>Approval Workflows</h1>
      <div class="header-actions">
        <button @click="showStats = !showStats" class="btn-secondary">
          <i class="fas fa-chart-bar"></i> {{ showStats ? 'Hide' : 'Show' }} Stats
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="showStats" class="stats-grid">
      <div class="stat-card pending">
        <i class="fas fa-clock"></i>
        <div class="stat-content">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">Pending My Action</span>
        </div>
      </div>
      <div class="stat-card approved">
        <i class="fas fa-check-circle"></i>
        <div class="stat-content">
          <span class="stat-value">{{ stats.approved }}</span>
          <span class="stat-label">Approved by Me</span>
        </div>
      </div>
      <div class="stat-card rejected">
        <i class="fas fa-times-circle"></i>
        <div class="stat-content">
          <span class="stat-value">{{ stats.rejected }}</span>
          <span class="stat-label">Rejected by Me</span>
        </div>
      </div>
      <div class="stat-card overdue">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="stat-content">
          <span class="stat-value">{{ stats.overdue }}</span>
          <span class="stat-label">Overdue</span>
        </div>
      </div>
      <div class="stat-card time">
        <i class="fas fa-hourglass-half"></i>
        <div class="stat-content">
          <span class="stat-value">{{ stats.avgApprovalTimeHours }}h</span>
          <span class="stat-label">Avg Approval Time</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.status" @change="loadApprovals">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select v-model="filters.documentType" @change="loadApprovals">
        <option value="">All Types</option>
        <option value="invoice">Invoices</option>
        <option value="bill">Bills</option>
        <option value="expense">Expenses</option>
      </select>

      <select v-model="filters.priority" @change="loadApprovals">
        <option value="">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
        <option value="low">Low</option>
      </select>

      <label class="checkbox-filter">
        <input type="checkbox" v-model="filters.assignedToMe" @change="loadApprovals" />
        Assigned to Me
      </label>
    </div>

    <!-- Approvals List -->
    <div class="approvals-list" v-if="approvals.length > 0">
      <div 
        v-for="approval in approvals" 
        :key="approval._id" 
        class="approval-card"
        :class="`status-${approval.status} priority-${approval.priority}`"
        @click="viewApproval(approval._id)"
      >
        <div class="approval-header">
          <div class="approval-title">
            <h3>{{ approval.workflowName }}</h3>
            <span class="document-type">{{ formatDocumentType(approval.documentType) }}</span>
          </div>
          <div class="approval-badges">
            <span :class="`badge badge-${approval.status}`">{{ approval.status }}</span>
            <span :class="`badge priority-${approval.priority}`">{{ approval.priority }}</span>
          </div>
        </div>

        <div class="approval-amount">
          <i class="fas fa-dollar-sign"></i>
          <span class="amount">${{ formatNumber(approval.amount) }}</span>
          <span class="currency">{{ approval.currency }}</span>
        </div>

        <div class="approval-progress">
          <div class="progress-header">
            <span>Progress: Step {{ approval.currentStep + 1 }} of {{ approval.steps.length }}</span>
            <span class="progress-percentage">{{ Math.round((approval.currentStep / approval.steps.length) * 100) }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: ((approval.currentStep / approval.steps.length) * 100) + '%' }"
            ></div>
          </div>
        </div>

        <div class="approval-steps">
          <div 
            v-for="(step, index) in approval.steps" 
            :key="index"
            class="step-item"
            :class="`step-${step.status}`"
          >
            <div class="step-icon">
              <i v-if="step.status === 'approved'" class="fas fa-check-circle"></i>
              <i v-else-if="step.status === 'rejected'" class="fas fa-times-circle"></i>
              <i v-else-if="step.status === 'pending' && index === approval.currentStep" class="fas fa-clock"></i>
              <i v-else class="fas fa-circle"></i>
            </div>
            <div class="step-info">
              <span class="step-role">{{ formatRole(step.approverRole) }}</span>
              <span class="step-approver" v-if="step.approver">
                {{ step.approver.username || 'Unassigned' }}
              </span>
            </div>
          </div>
        </div>

        <div class="approval-meta">
          <div class="meta-item">
            <i class="fas fa-user"></i>
            <span>Requested by {{ approval.requestedBy?.username }}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span>{{ formatDate(approval.requestedAt) }}</span>
          </div>
          <div class="meta-item" v-if="approval.dueDate">
            <i class="fas fa-clock" :class="{ 'text-danger': isOverdue(approval.dueDate) }"></i>
            <span :class="{ 'text-danger': isOverdue(approval.dueDate) }">
              Due: {{ formatDate(approval.dueDate) }}
            </span>
          </div>
        </div>

        <div class="approval-actions" @click.stop>
          <button 
            v-if="canApprove(approval)" 
            @click="showApproveModal(approval)"
            class="btn-success btn-sm"
          >
            <i class="fas fa-check"></i> Approve
          </button>
          <button 
            v-if="canApprove(approval)" 
            @click="showRejectModal(approval)"
            class="btn-danger btn-sm"
          >
            <i class="fas fa-times"></i> Reject
          </button>
          <button @click="viewApproval(approval._id)" class="btn-secondary btn-sm">
            <i class="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <i class="fas fa-inbox"></i>
      <p>No approval workflows found</p>
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

    <!-- Approve Modal -->
    <ApprovalActionModal
      v-if="showApprovalModal"
      :approval="selectedApproval"
      action="approve"
      @close="showApprovalModal = false"
      @completed="handleActionCompleted"
    />

    <!-- Reject Modal -->
    <ApprovalActionModal
      v-if="showRejectModal"
      :approval="selectedApproval"
      action="reject"
      @close="showRejectModal = false"
      @completed="handleActionCompleted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ApprovalActionModal from './ApprovalActionModal.vue';

const router = useRouter();
const API_URL = 'http://localhost:3000/api/finance/approvals';

const approvals = ref([]);
const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  overdue: 0,
  avgApprovalTimeHours: 0
});
const showStats = ref(true);
const filters = ref({
  status: '',
  documentType: '',
  priority: '',
  assignedToMe: true
});
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalApprovals: 0
});
const showApprovalModal = ref(false);
const showRejectModal = ref(false);
const selectedApproval = ref(null);

const currentUserId = localStorage.getItem('userId');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const loadApprovals = async () => {
  try {
    const params = {
      page: pagination.value.currentPage,
      ...filters.value,
      assignedToMe: filters.value.assignedToMe ? 'true' : undefined
    };

    const response = await axios.get(API_URL, {
      params,
      ...getAuthHeaders()
    });

    approvals.value = response.data.approvals;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error loading approvals:', error);
    alert('Failed to load approvals');
  }
};

const loadStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
    stats.value = response.data.stats;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const canApprove = (approval) => {
  if (approval.status !== 'pending' && approval.status !== 'in_progress') return false;
  
  const currentStep = approval.steps[approval.currentStep];
  if (!currentStep) return false;
  
  return currentStep.status === 'pending' && 
         currentStep.approver && 
         currentStep.approver._id === currentUserId;
};

const showApproveModal = (approval) => {
  selectedApproval.value = approval;
  showApprovalModal.value = true;
};

const showRejectModal = (approval) => {
  selectedApproval.value = approval;
  showRejectModal.value = true;
};

const viewApproval = (id) => {
  router.push(`/admin/finance/approvals/${id}`);
};

const handleActionCompleted = () => {
  showApprovalModal.value = false;
  showRejectModal.value = false;
  loadApprovals();
  loadStats();
};

const changePage = (page) => {
  pagination.value.currentPage = page;
  loadApprovals();
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDocumentType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatRole = (role) => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};

onMounted(() => {
  loadApprovals();
  loadStats();
});
</script>

<style scoped>
.approvals-page {
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

.page-header h1 {
  font-size: 2rem;
  color: #1a1a1a;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
}

.stat-card.pending { border-color: #ff9800; }
.stat-card.approved { border-color: #4caf50; }
.stat-card.rejected { border-color: #f44336; }
.stat-card.overdue { border-color: #9c27b0; }
.stat-card.time { border-color: #2196f3; }

.stat-card i {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-card.pending i { color: #ff9800; }
.stat-card.approved i { color: #4caf50; }
.stat-card.rejected i { color: #f44336; }
.stat-card.overdue i { color: #9c27b0; }
.stat-card.time i { color: #2196f3; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.checkbox-filter input {
  cursor: pointer;
}

.approvals-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.approval-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #e0e0e0;
}

.approval-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.approval-card.priority-urgent {
  border-left-color: #f44336;
}

.approval-card.priority-high {
  border-left-color: #ff9800;
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.approval-title h3 {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  color: #1a1a1a;
}

.document-type {
  font-size: 0.85rem;
  color: #666;
}

.approval-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-pending { background: #fff3e0; color: #ff9800; }
.badge-in_progress { background: #e3f2fd; color: #2196f3; }
.badge-approved { background: #e8f5e9; color: #4caf50; }
.badge-rejected { background: #ffebee; color: #f44336; }
.badge-cancelled { background: #f5f5f5; color: #666; }

.priority-urgent { background: #ffebee; color: #f44336; }
.priority-high { background: #fff3e0; color: #ff9800; }
.priority-normal { background: #e3f2fd; color: #2196f3; }
.priority-low { background: #f5f5f5; color: #666; }

.approval-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.approval-amount i {
  color: #4caf50;
}

.approval-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #4caf50);
  transition: width 0.3s ease;
}

.approval-steps {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: #f0f0f0;
  color: #999;
}

.step-approved .step-icon {
  background: #e8f5e9;
  color: #4caf50;
}

.step-rejected .step-icon {
  background: #ffebee;
  color: #f44336;
}

.step-pending .step-icon {
  background: #fff3e0;
  color: #ff9800;
}

.step-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.step-approver {
  font-size: 0.7rem;
  color: #666;
}

.approval-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.meta-item i {
  color: #999;
}

.text-danger {
  color: #f44336 !important;
}

.approval-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary, .btn-secondary, .btn-success, .btn-danger {
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

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
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
