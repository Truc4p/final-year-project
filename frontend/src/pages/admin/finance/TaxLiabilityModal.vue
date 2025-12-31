<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Edit Tax Liability' : 'Create Tax Liability' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <!-- Tax Rate Selection -->
          <div class="form-group full-width">
            <label class="required">Tax Rate</label>
            <select 
              v-model="formData.taxRate" 
              required 
              class="form-control"
              :disabled="isEdit"
            >
              <option value="">Select tax rate</option>
              <option 
                v-for="rate in taxRates" 
                :key="rate._id" 
                :value="rate._id"
              >
                {{ rate.name }} ({{ rate.rate }}%) - {{ formatLocation(rate) }}
              </option>
            </select>
          </div>

          <!-- Period -->
          <div class="form-group">
            <label class="required">Period</label>
            <input 
              v-model="formData.period" 
              type="text" 
              required 
              placeholder="e.g., 2026-Q1 or 2026-03"
              class="form-control"
            />
            <small class="form-hint">Format: YYYY-MM or YYYY-Q1/Q2/Q3/Q4</small>
          </div>

          <div class="form-group">
            <label class="required">Period Start</label>
            <input 
              v-model="formData.periodStart" 
              type="date" 
              required 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label class="required">Period End</label>
            <input 
              v-model="formData.periodEnd" 
              type="date" 
              required 
              class="form-control"
            />
          </div>

          <!-- Status -->
          <div class="form-group">
            <label class="required">Status</label>
            <select v-model="formData.status" required class="form-control">
              <option value="pending">Pending</option>
              <option value="calculated">Calculated</option>
              <option value="filed">Filed</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <!-- Financial Details -->
          <div class="form-group">
            <label class="required">Taxable Amount</label>
            <input 
              v-model.number="formData.taxableAmount" 
              type="number" 
              step="0.01"
              min="0"
              required 
              class="form-control"
              @input="calculateTaxAmount"
            />
          </div>

          <div class="form-group">
            <label class="required">Tax Amount</label>
            <input 
              v-model.number="formData.taxAmount" 
              type="number" 
              step="0.01"
              min="0"
              required 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Adjustments</label>
            <input 
              v-model.number="formData.adjustments" 
              type="number" 
              step="0.01"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Penalties</label>
            <input 
              v-model.number="formData.penalties" 
              type="number" 
              step="0.01"
              min="0"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Interest</label>
            <input 
              v-model.number="formData.interest" 
              type="number" 
              step="0.01"
              min="0"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input 
              v-model="formData.dueDate" 
              type="date" 
              class="form-control"
            />
          </div>

          <!-- Summary Section -->
          <div class="form-group full-width summary-box">
            <h3>Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Due:</span>
                <span class="summary-value">${{ formatNumber(totalDue) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Amount Paid:</span>
                <span class="summary-value">${{ formatNumber(formData.amountPaid) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Balance:</span>
                <span class="summary-value balance">${{ formatNumber(balance) }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group full-width">
            <label>Notes</label>
            <textarea 
              v-model="formData.notes" 
              rows="3"
              placeholder="Additional notes..."
              class="form-control"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <i class="fas fa-spinner fa-spin" v-if="saving"></i>
            {{ saving ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'TaxLiabilityModal',
  props: {
    liability: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const saving = ref(false);
    const taxRates = ref([]);
    const isEdit = computed(() => !!props.liability);

    const formData = ref({
      taxRate: '',
      period: '',
      periodStart: '',
      periodEnd: '',
      status: 'pending',
      taxableAmount: 0,
      taxAmount: 0,
      adjustments: 0,
      penalties: 0,
      interest: 0,
      amountPaid: 0,
      dueDate: '',
      notes: ''
    });

    const totalDue = computed(() => {
      return formData.value.taxAmount + 
             formData.value.adjustments + 
             formData.value.penalties + 
             formData.value.interest;
    });

    const balance = computed(() => {
      return totalDue.value - formData.value.amountPaid;
    });

    const loadTaxRates = async () => {
      try {
        const response = await financeService.getTaxRates({ isActive: 'true' });
        taxRates.value = response.data.data;
      } catch (error) {
        console.error('Error loading tax rates:', error);
      }
    };

    const calculateTaxAmount = () => {
      const selectedRate = taxRates.value.find(r => r._id === formData.value.taxRate);
      if (selectedRate && formData.value.taxableAmount) {
        formData.value.taxAmount = (formData.value.taxableAmount * selectedRate.rate) / 100;
      }
    };

    // Load liability data if editing
    if (props.liability) {
      formData.value = {
        taxRate: props.liability.taxRate?._id || props.liability.taxRate,
        period: props.liability.period,
        periodStart: new Date(props.liability.periodStart).toISOString().split('T')[0],
        periodEnd: new Date(props.liability.periodEnd).toISOString().split('T')[0],
        status: props.liability.status,
        taxableAmount: props.liability.taxableAmount,
        taxAmount: props.liability.taxAmount,
        adjustments: props.liability.adjustments || 0,
        penalties: props.liability.penalties || 0,
        interest: props.liability.interest || 0,
        amountPaid: props.liability.amountPaid || 0,
        dueDate: props.liability.dueDate ? new Date(props.liability.dueDate).toISOString().split('T')[0] : '',
        notes: props.liability.notes || ''
      };
    }

    const handleSubmit = async () => {
      try {
        saving.value = true;

        const submitData = { ...formData.value };
        if (!submitData.dueDate) delete submitData.dueDate;

        if (isEdit.value) {
          await financeService.updateTaxLiability(props.liability._id, submitData);
        } else {
          await financeService.createTaxLiability(submitData);
        }

        emit('saved');
      } catch (error) {
        console.error('Error saving tax liability:', error);
        alert(error.message || 'Error saving tax liability');
      } finally {
        saving.value = false;
      }
    };

    const formatNumber = (num) => {
      return num ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
    };

    const formatLocation = (rate) => {
      const parts = [];
      if (rate.city) parts.push(rate.city);
      if (rate.state) parts.push(rate.state);
      if (rate.country) parts.push(rate.country);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    onMounted(() => {
      loadTaxRates();
    });

    return {
      formData,
      taxRates,
      saving,
      isEdit,
      totalDue,
      balance,
      handleSubmit,
      calculateTaxAmount,
      formatNumber,
      formatLocation
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
  max-width: 800px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
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

.form-control:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
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
}

.summary-box h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.summary-value.balance {
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
