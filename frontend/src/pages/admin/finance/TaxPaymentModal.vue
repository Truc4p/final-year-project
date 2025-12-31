<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Add Tax Payment</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Liability Info -->
        <div class="info-box">
          <h3>{{ liability.taxRate?.name || 'Tax Liability' }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Period:</span>
              <span class="info-value">{{ liability.period }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Due:</span>
              <span class="info-value">${{ formatNumber(liability.totalDue) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Amount Paid:</span>
              <span class="info-value">${{ formatNumber(liability.amountPaid) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Balance:</span>
              <span class="info-value balance">${{ formatNumber(liability.balance) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <div class="form-grid">
          <div class="form-group">
            <label class="required">Payment Amount</label>
            <input 
              v-model.number="formData.amount" 
              type="number" 
              step="0.01"
              min="0.01"
              :max="liability.balance"
              required 
              class="form-control"
              placeholder="0.00"
            />
            <small class="form-hint">Max: ${{ formatNumber(liability.balance) }}</small>
          </div>

          <div class="form-group">
            <label class="required">Payment Date</label>
            <input 
              v-model="formData.paymentDate" 
              type="date" 
              required 
              class="form-control"
            />
          </div>

          <div class="form-group full-width">
            <label class="required">Payment Method</label>
            <select v-model="formData.paymentMethod" required class="form-control">
              <option value="">Select method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="online">Online Payment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>Reference Number</label>
            <input 
              v-model="formData.reference" 
              type="text" 
              placeholder="Transaction/check reference number"
              class="form-control"
            />
          </div>

          <div class="form-group full-width">
            <label>Notes</label>
            <textarea 
              v-model="formData.notes" 
              rows="3"
              placeholder="Payment notes..."
              class="form-control"
            ></textarea>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="summary-box">
          <h4>After Payment</h4>
          <div class="summary-row">
            <span>Current Balance:</span>
            <span class="amount">${{ formatNumber(liability.balance) }}</span>
          </div>
          <div class="summary-row">
            <span>Payment Amount:</span>
            <span class="amount">-${{ formatNumber(formData.amount) }}</span>
          </div>
          <div class="summary-row total">
            <span>New Balance:</span>
            <span class="amount">${{ formatNumber(newBalance) }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <i class="fas fa-spinner fa-spin" v-if="saving"></i>
            {{ saving ? 'Processing...' : 'Add Payment' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'TaxPaymentModal',
  props: {
    liability: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const saving = ref(false);

    const formData = ref({
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      notes: ''
    });

    const newBalance = computed(() => {
      return Math.max(0, props.liability.balance - (formData.value.amount || 0));
    });

    const handleSubmit = async () => {
      try {
        if (formData.value.amount > props.liability.balance) {
          alert('Payment amount cannot exceed the balance');
          return;
        }

        if (formData.value.amount <= 0) {
          alert('Payment amount must be greater than 0');
          return;
        }

        saving.value = true;

        await financeService.addTaxPayment(props.liability._id, formData.value);

        emit('saved');
      } catch (error) {
        console.error('Error adding payment:', error);
        alert(error.message || 'Error adding payment');
      } finally {
        saving.value = false;
      }
    };

    const formatNumber = (num) => {
      return num ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
    };

    return {
      formData,
      saving,
      newBalance,
      handleSubmit,
      formatNumber
    };
  }
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.info-box h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 1rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #475569;
  font-weight: 500;
}

.info-value {
  font-size: 0.938rem;
  font-weight: 600;
  color: #0c4a6e;
}

.info-value.balance {
  color: #dc2626;
  font-size: 1.125rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-control {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: -0.25rem;
}

.summary-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-box h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  font-size: 0.938rem;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: #1a202c;
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #d1d5db;
}

.summary-row .amount {
  font-weight: 600;
  color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.625rem 1.5rem;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
