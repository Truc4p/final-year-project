<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEditMode ? 'View/Edit Scheduled Payment' : 'Create Scheduled Payment' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Basic Info -->
          <div class="form-section">
            <h3 class="section-title">Payment Information</h3>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label>Payment Name <span class="required">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text"
                  required
                  :disabled="isViewOnly"
                  placeholder="e.g., Monthly Office Rent Payment"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Document Type <span class="required">*</span></label>
                <select 
                  v-model="form.documentType" 
                  required
                  :disabled="isViewOnly"
                  @change="loadDocuments"
                  class="form-control"
                >
                  <option value="">Select type</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Bill">Bill</option>
                  <option value="BusinessExpense">Business Expense</option>
                  <option value="TaxLiability">Tax Liability</option>
                </select>
              </div>

              <div class="form-group">
                <label>Document <span class="required">*</span></label>
                <select 
                  v-model="form.document" 
                  required
                  :disabled="isViewOnly || !form.documentType"
                  @change="updateAmount"
                  class="form-control"
                >
                  <option value="">Select document</option>
                  <option 
                    v-for="doc in availableDocuments" 
                    :key="doc._id" 
                    :value="doc._id"
                  >
                    {{ formatDocumentLabel(doc) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Amount <span class="required">*</span></label>
                <input 
                  v-model.number="form.amount" 
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  :disabled="isViewOnly"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Payment Method <span class="required">*</span></label>
                <select v-model="form.paymentMethod" required :disabled="isViewOnly" class="form-control">
                  <option value="">Select method</option>
                  <option value="auto">Auto</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="ach">ACH</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Bank Account <span class="required">*</span></label>
                <select v-model="form.bankAccount" required :disabled="isViewOnly" class="form-control">
                  <option value="">Select account</option>
                  <option v-for="account in bankAccounts" :key="account._id" :value="account._id">
                    {{ account.accountName }} ({{ account.accountNumber }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Status</label>
                <input 
                  :value="formatStatus(form.status || 'active')" 
                  type="text"
                  disabled
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <!-- Schedule Settings -->
          <div class="form-section">
            <h3 class="section-title">Schedule Settings</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Frequency <span class="required">*</span></label>
                <select v-model="form.frequency" required :disabled="isViewOnly" class="form-control">
                  <option value="">Select frequency</option>
                  <option value="once">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              <div class="form-group">
                <label>Start Date <span class="required">*</span></label>
                <input 
                  v-model="form.startDate" 
                  type="date"
                  required
                  :disabled="isViewOnly"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>End Date</label>
                <input 
                  v-model="form.endDate" 
                  type="date"
                  :disabled="isViewOnly"
                  :min="form.startDate"
                  class="form-control"
                />
                <small>Leave empty for no end date</small>
              </div>

              <div class="form-group">
                <label>Max Executions</label>
                <input 
                  v-model.number="form.maxExecutions" 
                  type="number"
                  min="1"
                  :disabled="isViewOnly"
                  placeholder="Unlimited"
                  class="form-control"
                />
                <small>Leave empty for unlimited</small>
              </div>
            </div>

            <div v-if="form.frequency === 'weekly' || form.frequency === 'biweekly'" class="form-row">
              <div class="form-group">
                <label>Day of Week <span class="required">*</span></label>
                <select v-model.number="form.dayOfWeek" required :disabled="isViewOnly" class="form-control">
                  <option :value="0">Sunday</option>
                  <option :value="1">Monday</option>
                  <option :value="2">Tuesday</option>
                  <option :value="3">Wednesday</option>
                  <option :value="4">Thursday</option>
                  <option :value="5">Friday</option>
                  <option :value="6">Saturday</option>
                </select>
              </div>
            </div>

            <div v-if="form.frequency === 'monthly' || form.frequency === 'quarterly' || form.frequency === 'annually'" class="form-row">
              <div class="form-group">
                <label>Day of Month <span class="required">*</span></label>
                <input 
                  v-model.number="form.dayOfMonth" 
                  type="number"
                  min="1"
                  max="31"
                  required
                  :disabled="isViewOnly"
                  class="form-control"
                />
                <small>Use 31 for last day of month</small>
              </div>
            </div>

            <div v-if="isEditMode" class="form-row">
              <div class="form-group">
                <label>Next Payment Date</label>
                <input 
                  :value="formatDate(form.nextPaymentDate)" 
                  type="text"
                  disabled
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Executions</label>
                <input 
                  :value="`${form.executionCount || 0}${form.maxExecutions ? ` / ${form.maxExecutions}` : ''}`" 
                  type="text"
                  disabled
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="form-section">
            <h3 class="section-title">Additional Information</h3>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label>Description</label>
                <textarea 
                  v-model="form.description" 
                  :disabled="isViewOnly"
                  rows="3"
                  placeholder="Add a description for this scheduled payment..."
                  class="form-control"
                ></textarea>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea 
                  v-model="form.notes" 
                  :disabled="isViewOnly"
                  rows="3"
                  placeholder="Add any notes..."
                  class="form-control"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div v-if="form.amount > 0" class="form-section summary-section">
            <h3 class="section-title">Payment Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Amount:</span>
                <span class="value amount">${{ formatNumber(form.amount) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Frequency:</span>
                <span class="value">{{ formatFrequency(form.frequency) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Start Date:</span>
                <span class="value">{{ formatDate(form.startDate) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Method:</span>
                <span class="value">{{ formatPaymentMethod(form.paymentMethod) }}</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn btn-secondary">
          Cancel
        </button>
        <button 
          v-if="!isViewOnly"
          @click="handleSubmit" 
          type="button"
          :disabled="saving"
          class="btn btn-primary"
        >
          <i class="fas fa-save"></i>
          {{ saving ? 'Saving...' : (isEditMode ? 'Update Schedule' : 'Create Schedule') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'ScheduledPaymentModal',
  props: {
    payment: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const saving = ref(false);
    const bankAccounts = ref([]);
    const availableDocuments = ref([]);
    
    const form = ref({
      name: '',
      documentType: '',
      document: '',
      amount: 0,
      paymentMethod: '',
      bankAccount: '',
      frequency: '',
      startDate: '',
      endDate: '',
      maxExecutions: null,
      dayOfWeek: null,
      dayOfMonth: null,
      description: '',
      notes: '',
      status: 'active'
    });

    const isEditMode = computed(() => !!props.payment);
    const isViewOnly = computed(() => {
      if (!props.payment) return false;
      return ['completed', 'cancelled'].includes(props.payment.status);
    });

    const loadBankAccounts = async () => {
      try {
        const response = await financeService.getBankAccounts({ limit: 100 });
        bankAccounts.value = response.data.data || response.data;
      } catch (error) {
        console.error('Error loading bank accounts:', error);
      }
    };

    const loadDocuments = async () => {
      if (!form.value.documentType) {
        availableDocuments.value = [];
        return;
      }

      try {
        let response;
        const filters = { status: 'unpaid', limit: 100 };

        switch (form.value.documentType) {
          case 'Invoice':
            response = await financeService.getInvoices(filters);
            break;
          case 'Bill':
            response = await financeService.getBills(filters);
            break;
          case 'BusinessExpense':
            response = await financeService.getBusinessExpenses(filters);
            break;
          case 'TaxLiability':
            response = await financeService.getTaxLiabilities({ status: 'unpaid', limit: 100 });
            break;
          default:
            availableDocuments.value = [];
            return;
        }

        availableDocuments.value = response.data.data || response.data || [];
      } catch (error) {
        console.error('Error loading documents:', error);
        availableDocuments.value = [];
      }
    };

    const updateAmount = () => {
      const doc = availableDocuments.value.find(d => d._id === form.value.document);
      if (doc) {
        form.value.amount = doc.totalAmount || doc.amount || 0;
      }
    };

    const formatDocumentLabel = (doc) => {
      switch (form.value.documentType) {
        case 'Invoice':
          return `${doc.invoiceNumber || 'N/A'} - ${doc.customer?.name || 'N/A'} - $${doc.totalAmount?.toFixed(2) || '0.00'}`;
        case 'Bill':
          return `${doc.billNumber || 'N/A'} - ${doc.vendor?.name || 'N/A'} - $${doc.totalAmount?.toFixed(2) || '0.00'}`;
        case 'BusinessExpense':
          return `${doc.description || 'N/A'} - $${doc.amount?.toFixed(2) || '0.00'}`;
        case 'TaxLiability':
          return `${doc.taxType || 'N/A'} - ${doc.filingPeriod || 'N/A'} - $${doc.amount?.toFixed(2) || '0.00'}`;
        default:
          return 'Unknown';
      }
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
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatPaymentMethod = (method) => {
      const methods = {
        bank_transfer: 'Bank Transfer',
        ach: 'ACH',
        online: 'Online Payment',
        auto: 'Auto'
      };
      return methods[method] || method || 'Not selected';
    };

    const formatFrequency = (freq) => {
      const frequencies = {
        once: 'One-time',
        daily: 'Daily',
        weekly: 'Weekly',
        biweekly: 'Bi-weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        annually: 'Annually'
      };
      return frequencies[freq] || freq || 'Not selected';
    };

    const handleSubmit = async () => {
      saving.value = true;

      try {
        const payload = {
          name: form.value.name,
          documentType: form.value.documentType,
          document: form.value.document,
          amount: form.value.amount,
          paymentMethod: form.value.paymentMethod,
          bankAccount: form.value.bankAccount,
          frequency: form.value.frequency,
          startDate: form.value.startDate,
          endDate: form.value.endDate || undefined,
          maxExecutions: form.value.maxExecutions || undefined,
          dayOfWeek: form.value.dayOfWeek,
          dayOfMonth: form.value.dayOfMonth,
          description: form.value.description,
          notes: form.value.notes
        };

        if (isEditMode.value) {
          await financeService.updateScheduledPayment(props.payment._id, payload);
        } else {
          await financeService.createScheduledPayment(payload);
        }

        emit('saved');
      } catch (error) {
        console.error('Error saving scheduled payment:', error);
        alert(error.response?.data?.message || 'Error saving scheduled payment');
      } finally {
        saving.value = false;
      }
    };

    onMounted(async () => {
      await loadBankAccounts();

      if (props.payment) {
        form.value = {
          name: props.payment.name,
          documentType: props.payment.documentType,
          document: props.payment.document?._id || props.payment.document,
          amount: props.payment.amount,
          paymentMethod: props.payment.paymentMethod,
          bankAccount: props.payment.bankAccount?._id || props.payment.bankAccount,
          frequency: props.payment.frequency,
          startDate: props.payment.startDate ? new Date(props.payment.startDate).toISOString().split('T')[0] : '',
          endDate: props.payment.endDate ? new Date(props.payment.endDate).toISOString().split('T')[0] : '',
          maxExecutions: props.payment.maxExecutions,
          dayOfWeek: props.payment.dayOfWeek,
          dayOfMonth: props.payment.dayOfMonth,
          description: props.payment.description || '',
          notes: props.payment.notes || '',
          status: props.payment.status,
          nextPaymentDate: props.payment.nextPaymentDate,
          executionCount: props.payment.executionCount
        };

        await loadDocuments();
      }
    });

    return {
      saving,
      form,
      bankAccounts,
      availableDocuments,
      isEditMode,
      isViewOnly,
      loadDocuments,
      updateAmount,
      formatDocumentLabel,
      formatNumber,
      formatDate,
      formatStatus,
      formatPaymentMethod,
      formatFrequency,
      handleSubmit
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
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  padding: 0;
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
  color: #1a202c;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-section {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group small {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.required {
  color: #ef4444;
}

.form-control {
  padding: 0.625rem;
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
  color: #6b7280;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.summary-section {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.summary-section .section-title {
  color: white;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item .label {
  font-size: 0.813rem;
  opacity: 0.9;
}

.summary-item .value {
  font-size: 1.125rem;
  font-weight: 600;
}

.summary-item .value.amount {
  font-size: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
