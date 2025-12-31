<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header" :class="`action-${action}`">
        <h2>
          <i :class="action === 'approve' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          {{ action === 'approve' ? 'Approve' : 'Reject' }} Approval
        </h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="approval-summary">
          <h3>{{ approval.workflowName }}</h3>
          <div class="summary-details">
            <div class="detail-item">
              <span class="label">Document Type:</span>
              <span class="value">{{ formatDocumentType(approval.documentType) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Amount:</span>
              <span class="value amount">${{ formatNumber(approval.amount) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Requested By:</span>
              <span class="value">{{ approval.requestedBy?.username }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Current Step:</span>
              <span class="value">{{ approval.currentStep + 1 }} of {{ approval.steps.length }}</span>
            </div>
          </div>
        </div>

        <div class="current-step-info">
          <h4>Your Approval Step</h4>
          <div class="step-details">
            <i class="fas fa-user-circle"></i>
            <div>
              <p class="role">{{ formatRole(currentStep.approverRole) }}</p>
              <p class="info">You are {{ action === 'approve' ? 'approving' : 'rejecting' }} this request</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitAction">
          <div class="form-group">
            <label for="comments">
              Comments {{ action === 'reject' ? '(Required)' : '(Optional)' }}
            </label>
            <textarea
              id="comments"
              v-model="comments"
              rows="4"
              :placeholder="`Add your ${action === 'reject' ? 'rejection reason' : 'comments'}...`"
              :required="action === 'reject'"
            ></textarea>
          </div>

          <div v-if="action === 'reject'" class="warning-box">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Warning:</strong> Rejecting this approval will stop the entire workflow. 
              The document will be returned to the requestor.
            </div>
          </div>

          <div v-if="action === 'approve' && !isFinalStep" class="info-box">
            <i class="fas fa-info-circle"></i>
            <div>
              This approval will move to the next step: 
              <strong>{{ formatRole(nextStep.approverRole) }}</strong>
            </div>
          </div>

          <div v-if="action === 'approve' && isFinalStep" class="success-box">
            <i class="fas fa-check-circle"></i>
            <div>
              <strong>Final Approval:</strong> This is the last step. The document will be fully approved.
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              :class="action === 'approve' ? 'btn-success' : 'btn-danger'"
              :disabled="submitting"
            >
              <i :class="action === 'approve' ? 'fas fa-check' : 'fas fa-times'"></i>
              {{ submitting ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  approval: {
    type: Object,
    required: true
  },
  action: {
    type: String,
    required: true,
    validator: (value) => ['approve', 'reject'].includes(value)
  }
});

const emit = defineEmits(['close', 'completed']);

const API_URL = 'http://localhost:3000/api/finance/approvals';
const comments = ref('');
const submitting = ref(false);

const currentStep = computed(() => {
  return props.approval.steps[props.approval.currentStep];
});

const nextStep = computed(() => {
  return props.approval.steps[props.approval.currentStep + 1];
});

const isFinalStep = computed(() => {
  return props.approval.currentStep === props.approval.steps.length - 1;
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const submitAction = async () => {
  try {
    submitting.value = true;

    const endpoint = props.action === 'approve' 
      ? `${API_URL}/${props.approval._id}/approve`
      : `${API_URL}/${props.approval._id}/reject`;

    await axios.post(endpoint, { comments: comments.value }, getAuthHeaders());

    alert(`Successfully ${props.action}ed!`);
    emit('completed');
  } catch (error) {
    console.error(`Error ${props.action}ing:`, error);
    alert(error.response?.data?.message || `Failed to ${props.action}`);
  } finally {
    submitting.value = false;
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num);
};

const formatDocumentType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatRole = (role) => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.modal-header.action-approve {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.modal-header.action-reject {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header.action-approve h2 i {
  color: #4caf50;
}

.modal-header.action-reject h2 i {
  color: #f44336;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.approval-summary {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.approval-summary h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.summary-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.detail-item .value {
  font-size: 1rem;
  color: #1a1a1a;
}

.detail-item .value.amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4caf50;
}

.current-step-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.current-step-info h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #1976d2;
  text-transform: uppercase;
}

.step-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.step-details i {
  font-size: 2rem;
  color: #2196f3;
}

.step-details .role {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1a1a1a;
}

.step-details .info {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.warning-box,
.info-box,
.success-box {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: start;
}

.warning-box {
  background: #fff3e0;
  border: 1px solid #ff9800;
}

.warning-box i {
  color: #ff9800;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-box {
  background: #e3f2fd;
  border: 1px solid #2196f3;
}

.info-box i {
  color: #2196f3;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.success-box {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

.success-box i {
  color: #4caf50;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-box div,
.info-box div,
.success-box div {
  font-size: 0.9rem;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary,
.btn-success,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
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

.btn-success:hover:not(:disabled) {
  background: #45a049;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-success:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
