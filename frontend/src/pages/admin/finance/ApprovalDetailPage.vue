<template>
  <div class="approval-detail-page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="back-btn">
          <i class="fas fa-arrow-left"></i> Back to Approvals
        </button>
        <h1>Approval Workflow Details</h1>
      </div>
      <div class="header-actions">
        <button 
          v-if="canApprove" 
          @click="showApproveModal = true"
          class="btn-success"
        >
          <i class="fas fa-check"></i> Approve
        </button>
        <button 
          v-if="canApprove" 
          @click="showRejectModal = true"
          class="btn-danger"
        >
          <i class="fas fa-times"></i> Reject
        </button>
        <button 
          v-if="canCancel" 
          @click="cancelApproval"
          class="btn-secondary"
        >
          <i class="fas fa-ban"></i> Cancel
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-else-if="approval" class="approval-content">
      <!-- Status Banner -->
      <div class="status-banner" :class="`status-${approval.status}`">
        <div class="status-info">
          <i :class="getStatusIcon(approval.status)"></i>
          <div>
            <h2>{{ approval.workflowName }}</h2>
            <p>Status: <strong>{{ formatStatus(approval.status) }}</strong></p>
          </div>
        </div>
        <div class="status-badges">
          <span :class="`badge badge-${approval.status}`">{{ approval.status }}</span>
          <span :class="`badge priority-${approval.priority}`">{{ approval.priority }}</span>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-grid">
        <div class="info-card">
          <i class="fas fa-file-invoice"></i>
          <div>
            <span class="label">Document Type</span>
            <span class="value">{{ formatDocumentType(approval.documentType) }}</span>
          </div>
        </div>
        <div class="info-card">
          <i class="fas fa-dollar-sign"></i>
          <div>
            <span class="label">Amount</span>
            <span class="value">${{ formatNumber(approval.amount) }}</span>
          </div>
        </div>
        <div class="info-card">
          <i class="fas fa-user"></i>
          <div>
            <span class="label">Requested By</span>
            <span class="value">{{ approval.requestedBy?.username }}</span>
          </div>
        </div>
        <div class="info-card">
          <i class="fas fa-calendar"></i>
          <div>
            <span class="label">Requested Date</span>
            <span class="value">{{ formatDate(approval.requestedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="section">
        <h3><i class="fas fa-tasks"></i> Approval Progress</h3>
        <div class="progress-info">
          <span>Step {{ approval.currentStep + 1 }} of {{ approval.steps.length }}</span>
          <span class="progress-percentage">{{ Math.round((approval.currentStep / approval.steps.length) * 100) }}%</span>
        </div>
        <div class="progress-bar-large">
          <div 
            class="progress-fill" 
            :style="{ width: ((approval.currentStep / approval.steps.length) * 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Approval Steps -->
      <div class="section">
        <h3><i class="fas fa-stream"></i> Approval Steps</h3>
        <div class="steps-timeline">
          <div 
            v-for="(step, index) in approval.steps" 
            :key="index"
            class="timeline-item"
            :class="`status-${step.status}`"
          >
            <div class="timeline-marker">
              <i v-if="step.status === 'approved'" class="fas fa-check-circle"></i>
              <i v-else-if="step.status === 'rejected'" class="fas fa-times-circle"></i>
              <i v-else-if="step.status === 'pending' && index === approval.currentStep" class="fas fa-clock"></i>
              <i v-else class="fas fa-circle"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <div>
                  <h4>{{ formatRole(step.approverRole) }}</h4>
                  <p class="approver-name">{{ step.approver?.username || 'Unassigned' }}</p>
                </div>
                <span :class="`status-badge status-${step.status}`">
                  {{ formatStatus(step.status) }}
                </span>
              </div>
              <div v-if="step.actionBy" class="timeline-details">
                <p><i class="fas fa-user"></i> Action by: {{ step.actionBy.username }}</p>
                <p v-if="step.approvedAt">
                  <i class="fas fa-calendar-check"></i> 
                  Approved: {{ formatDateTime(step.approvedAt) }}
                </p>
                <p v-if="step.rejectedAt">
                  <i class="fas fa-calendar-times"></i> 
                  Rejected: {{ formatDateTime(step.rejectedAt) }}
                </p>
                <p v-if="step.comments" class="comments">
                  <i class="fas fa-comment"></i> {{ step.comments }}
                </p>
              </div>
              <div v-else-if="index === approval.currentStep" class="timeline-pending">
                <i class="fas fa-hourglass-half"></i> Awaiting approval
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Details -->
      <div v-if="document" class="section">
        <h3><i class="fas fa-file-alt"></i> Document Details</h3>
        <div class="document-details">
          <pre>{{ JSON.stringify(document, null, 2) }}</pre>
        </div>
      </div>

      <!-- History -->
      <div class="section" v-if="approval.history && approval.history.length > 0">
        <h3><i class="fas fa-history"></i> History</h3>
        <div class="history-list">
          <div v-for="(item, index) in approval.history" :key="index" class="history-item">
            <div class="history-icon" :class="`action-${item.action}`">
              <i :class="getActionIcon(item.action)"></i>
            </div>
            <div class="history-content">
              <p class="history-action">{{ formatAction(item.action) }}</p>
              <p class="history-details">
                <span v-if="item.performedBy">by {{ item.performedBy.username }}</span>
                <span class="history-time">{{ formatDateTime(item.performedAt) }}</span>
              </p>
              <p v-if="item.comments" class="history-comments">{{ item.comments }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="section" v-if="approval.metadata">
        <h3><i class="fas fa-info-circle"></i> Additional Information</h3>
        <div class="metadata-grid">
          <div v-if="approval.metadata.department" class="metadata-item">
            <span class="label">Department:</span>
            <span class="value">{{ approval.metadata.department }}</span>
          </div>
          <div v-if="approval.metadata.category" class="metadata-item">
            <span class="label">Category:</span>
            <span class="value">{{ approval.metadata.category }}</span>
          </div>
          <div v-if="approval.metadata.vendor" class="metadata-item">
            <span class="label">Vendor:</span>
            <span class="value">{{ approval.metadata.vendor }}</span>
          </div>
          <div v-if="approval.metadata.tags" class="metadata-item full-width">
            <span class="label">Tags:</span>
            <div class="tags">
              <span v-for="tag in approval.metadata.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ApprovalActionModal
      v-if="showApproveModal"
      :approval="approval"
      action="approve"
      @close="showApproveModal = false"
      @completed="handleActionCompleted"
    />

    <ApprovalActionModal
      v-if="showRejectModal"
      :approval="approval"
      action="reject"
      @close="showRejectModal = false"
      @completed="handleActionCompleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ApprovalActionModal from './ApprovalActionModal.vue';

const route = useRoute();
const router = useRouter();
const API_URL = 'http://localhost:3000/api/finance/approvals';

const approval = ref(null);
const document = ref(null);
const loading = ref(true);
const showApproveModal = ref(false);
const showRejectModal = ref(false);

const currentUserId = localStorage.getItem('userId');

const canApprove = computed(() => {
  if (!approval.value) return false;
  if (approval.value.status !== 'pending' && approval.value.status !== 'in_progress') return false;
  
  const currentStep = approval.value.steps[approval.value.currentStep];
  if (!currentStep) return false;
  
  return currentStep.status === 'pending' && 
         currentStep.approver && 
         currentStep.approver._id === currentUserId;
});

const canCancel = computed(() => {
  if (!approval.value) return false;
  return approval.value.requestedBy?._id === currentUserId || 
         localStorage.getItem('role') === 'admin';
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const loadApprovalDetails = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/${route.params.id}`, getAuthHeaders());
    approval.value = response.data.approval;
    document.value = response.data.document;
  } catch (error) {
    console.error('Error loading approval details:', error);
    alert('Failed to load approval details');
    router.back();
  } finally {
    loading.value = false;
  }
};

const cancelApproval = async () => {
  const reason = prompt('Please provide a reason for cancellation:');
  if (!reason) return;

  try {
    await axios.post(`${API_URL}/${route.params.id}/cancel`, { reason }, getAuthHeaders());
    alert('Approval cancelled successfully');
    loadApprovalDetails();
  } catch (error) {
    console.error('Error cancelling approval:', error);
    alert(error.response?.data?.message || 'Failed to cancel approval');
  }
};

const handleActionCompleted = () => {
  showApproveModal.value = false;
  showRejectModal.value = false;
  loadApprovalDetails();
};

const getStatusIcon = (status) => {
  const icons = {
    pending: 'fas fa-clock',
    in_progress: 'fas fa-spinner fa-pulse',
    approved: 'fas fa-check-circle',
    rejected: 'fas fa-times-circle',
    cancelled: 'fas fa-ban'
  };
  return icons[status] || 'fas fa-question-circle';
};

const getActionIcon = (action) => {
  const icons = {
    created: 'fas fa-plus-circle',
    approved: 'fas fa-check-circle',
    rejected: 'fas fa-times-circle',
    cancelled: 'fas fa-ban',
    reassigned: 'fas fa-exchange-alt',
    escalated: 'fas fa-arrow-up'
  };
  return icons[action] || 'fas fa-circle';
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDocumentType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatRole = (role) => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatAction = (action) => {
  return action.charAt(0).toUpperCase() + action.slice(1);
};

onMounted(() => {
  loadApprovalDetails();
});
</script>

<style scoped>
.approval-detail-page {
  padding: 2rem;
  max-width: 1200px;
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
  margin: 0.5rem 0 0 0;
  color: #1a1a1a;
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

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}

.status-banner {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 6px solid;
}

.status-banner.status-pending { border-color: #ff9800; }
.status-banner.status-in_progress { border-color: #2196f3; }
.status-banner.status-approved { border-color: #4caf50; }
.status-banner.status-rejected { border-color: #f44336; }
.status-banner.status-cancelled { border-color: #9e9e9e; }

.status-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-info i {
  font-size: 3rem;
}

.status-banner.status-pending i { color: #ff9800; }
.status-banner.status-in_progress i { color: #2196f3; }
.status-banner.status-approved i { color: #4caf50; }
.status-banner.status-rejected i { color: #f44336; }
.status-banner.status-cancelled i { color: #9e9e9e; }

.status-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.status-info p {
  margin: 0;
  color: #666;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.5rem 1rem;
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-card i {
  font-size: 2rem;
  color: #2196f3;
}

.info-card .label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.info-card .value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #666;
}

.progress-percentage {
  font-weight: 600;
  color: #2196f3;
}

.progress-bar-large {
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #4caf50);
  transition: width 0.3s ease;
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
}

.timeline-marker {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  background: #f0f0f0;
  color: #999;
}

.timeline-item.status-approved .timeline-marker {
  background: #e8f5e9;
  color: #4caf50;
}

.timeline-item.status-rejected .timeline-marker {
  background: #ffebee;
  color: #f44336;
}

.timeline-item.status-pending .timeline-marker {
  background: #fff3e0;
  color: #ff9800;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.timeline-item:last-child .timeline-content {
  border-bottom: none;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.timeline-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.approver-name {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-approved { background: #e8f5e9; color: #4caf50; }
.status-badge.status-rejected { background: #ffebee; color: #f44336; }
.status-badge.status-pending { background: #fff3e0; color: #ff9800; }

.timeline-details p,
.timeline-pending {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-details .comments {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
}

.document-details pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon.action-created { background: #e3f2fd; color: #2196f3; }
.history-icon.action-approved { background: #e8f5e9; color: #4caf50; }
.history-icon.action-rejected { background: #ffebee; color: #f44336; }
.history-icon.action-cancelled { background: #f5f5f5; color: #666; }
.history-icon.action-escalated { background: #fff3e0; color: #ff9800; }

.history-content {
  flex: 1;
}

.history-action {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1a1a1a;
}

.history-details {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #666;
}

.history-time {
  margin-left: 1rem;
}

.history-comments {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #333;
  font-style: italic;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item.full-width {
  grid-column: 1 / -1;
}

.metadata-item .label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.metadata-item .value {
  font-size: 1rem;
  color: #1a1a1a;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.btn-success, .btn-danger, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
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

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}
</style>
