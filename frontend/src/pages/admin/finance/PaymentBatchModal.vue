<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEditMode ? 'View/Edit Payment Batch' : 'Create Payment Batch' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Basic Info -->
          <div class="form-section">
            <h3 class="section-title">Basic Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Batch Name <span class="required">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text"
                  required
                  :disabled="isViewOnly"
                  placeholder="e.g., November 2024 Vendor Payments"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Payment Method <span class="required">*</span></label>
                <select v-model="form.paymentMethod" required :disabled="isViewOnly" class="form-control">
                  <option value="">Select method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="ach">ACH</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div class="form-group">
                <label>Bank Account <span class="required">*</span></label>
                <select v-model="form.bankAccount" required :disabled="isViewOnly" class="form-control">
                  <option value="">Select account</option>
                  <option v-for="account in bankAccounts" :key="account._id" :value="account._id">
                    {{ account.accountName }} ({{ account.accountNumber }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Scheduled Date</label>
                <input 
                  v-model="form.scheduledDate" 
                  type="date"
                  :disabled="isViewOnly"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Status</label>
                <input 
                  :value="formatStatus(form.status || 'draft')" 
                  type="text"
                  disabled
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea 
                  v-model="form.notes" 
                  :disabled="isViewOnly"
                  rows="3"
                  placeholder="Add any notes about this batch..."
                  class="form-control"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Payment Items -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">Payment Items</h3>
              <button 
                v-if="!isViewOnly"
                type="button"
                @click="addItem"
                class="btn btn-sm btn-secondary"
              >
                <i class="fas fa-plus"></i> Add Item
              </button>
            </div>

            <div v-if="form.items.length === 0" class="empty-items">
              <i class="fas fa-file-invoice"></i>
              <p>No items in this batch. Click "Add Item" to start.</p>
            </div>

            <div v-else class="items-list">
              <div v-for="(item, index) in form.items" :key="index" class="item-card">
                <div class="item-header">
                  <span class="item-number">#{{ index + 1 }}</span>
                  <button 
                    v-if="!isViewOnly"
                    type="button"
                    @click="removeItem(index)"
                    class="btn-remove"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>

                <div class="item-body">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Document Type <span class="required">*</span></label>
                      <select 
                        v-model="item.documentType" 
                        required
                        :disabled="isViewOnly"
                        @change="loadDocuments(item)"
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
                        v-model="item.document" 
                        required
                        :disabled="isViewOnly || !item.documentType"
                        @change="updateItemAmount(item)"
                        class="form-control"
                      >
                        <option value="">Select document</option>
                        <option 
                          v-for="doc in item.availableDocuments" 
                          :key="doc._id" 
                          :value="doc._id"
                        >
                          {{ formatDocumentLabel(doc, item.documentType) }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Amount <span class="required">*</span></label>
                      <input 
                        v-model.number="item.amount" 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        :disabled="isViewOnly"
                        class="form-control"
                      />
                    </div>

                    <div class="form-group">
                      <label>Status</label>
                      <input 
                        :value="formatStatus(item.status || 'pending')" 
                        type="text"
                        disabled
                        class="form-control"
                      />
                    </div>
                  </div>

                  <div v-if="item.transactionReference" class="form-row">
                    <div class="form-group full-width">
                      <label>Transaction Reference</label>
                      <input 
                        :value="item.transactionReference" 
                        type="text"
                        disabled
                        class="form-control"
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group full-width">
                      <label>Notes</label>
                      <textarea 
                        v-model="item.notes" 
                        :disabled="isViewOnly"
                        rows="2"
                        placeholder="Item-specific notes..."
                        class="form-control"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="form-section summary-section">
            <h3 class="section-title">Batch Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Total Items:</span>
                <span class="value">{{ form.items.length }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Amount:</span>
                <span class="value amount">${{ formatNumber(totalAmount) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Payment Method:</span>
                <span class="value">{{ formatPaymentMethod(form.paymentMethod) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Status:</span>
                <span class="value">{{ formatStatus(form.status || 'draft') }}</span>
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
          :disabled="saving || form.items.length === 0"
          class="btn btn-primary"
        >
          <i class="fas fa-save"></i>
          {{ saving ? 'Saving...' : (isEditMode ? 'Update Batch' : 'Create Batch') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'PaymentBatchModal',
  props: {
    batch: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const saving = ref(false);
    const bankAccounts = ref([]);
    
    const form = ref({
      name: '',
      paymentMethod: '',
      bankAccount: '',
      scheduledDate: '',
      notes: '',
      status: 'draft',
      items: []
    });

    const isEditMode = computed(() => !!props.batch);
    const isViewOnly = computed(() => {
      if (!props.batch) return false;
      return ['processing', 'completed', 'cancelled'].includes(props.batch.status);
    });

    const totalAmount = computed(() => {
      return form.value.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    });

    const addItem = () => {
      form.value.items.push({
        documentType: '',
        document: '',
        amount: 0,
        notes: '',
        status: 'pending',
        availableDocuments: []
      });
    };

    const removeItem = (index) => {
      form.value.items.splice(index, 1);
    };

    const loadBankAccounts = async () => {
      try {
        const response = await financeService.getBankAccounts({ limit: 100 });
        bankAccounts.value = response.data.data || response.data;
      } catch (error) {
        console.error('Error loading bank accounts:', error);
      }
    };

    const loadDocuments = async (item) => {
      if (!item.documentType) {
        item.availableDocuments = [];
        return;
      }

      try {
        let response;
        const filters = { status: 'unpaid', limit: 100 };

        switch (item.documentType) {
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
            item.availableDocuments = [];
            return;
        }

        item.availableDocuments = response.data.data || response.data || [];
      } catch (error) {
        console.error('Error loading documents:', error);
        item.availableDocuments = [];
      }
    };

    const updateItemAmount = (item) => {
      const doc = item.availableDocuments.find(d => d._id === item.document);
      if (doc) {
        item.amount = doc.totalAmount || doc.amount || 0;
      }
    };

    const formatDocumentLabel = (doc, type) => {
      switch (type) {
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

    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const formatPaymentMethod = (method) => {
      const methods = {
        bank_transfer: 'Bank Transfer',
        ach: 'ACH',
        wire: 'Wire Transfer',
        check: 'Check'
      };
      return methods[method] || method || 'Not selected';
    };

    const handleSubmit = async () => {
      if (form.value.items.length === 0) {
        alert('Please add at least one item to the batch');
        return;
      }

      saving.value = true;

      try {
        const payload = {
          name: form.value.name,
          paymentMethod: form.value.paymentMethod,
          bankAccount: form.value.bankAccount,
          scheduledDate: form.value.scheduledDate || undefined,
          notes: form.value.notes,
          items: form.value.items.map(item => ({
            documentType: item.documentType,
            document: item.document,
            amount: item.amount,
            notes: item.notes
          }))
        };

        if (isEditMode.value) {
          await financeService.updatePaymentBatch(props.batch._id, payload);
        } else {
          await financeService.createPaymentBatch(payload);
        }

        emit('saved');
      } catch (error) {
        console.error('Error saving batch:', error);
        alert(error.response?.data?.message || 'Error saving batch');
      } finally {
        saving.value = false;
      }
    };

    onMounted(async () => {
      await loadBankAccounts();

      if (props.batch) {
        form.value = {
          name: props.batch.name,
          paymentMethod: props.batch.paymentMethod,
          bankAccount: props.batch.bankAccount?._id || props.batch.bankAccount,
          scheduledDate: props.batch.scheduledDate ? new Date(props.batch.scheduledDate).toISOString().split('T')[0] : '',
          notes: props.batch.notes || '',
          status: props.batch.status,
          items: await Promise.all((props.batch.items || []).map(async (item) => {
            const formItem = {
              documentType: item.documentType,
              document: item.document?._id || item.document,
              amount: item.amount,
              notes: item.notes || '',
              status: item.status,
              transactionReference: item.transactionReference,
              availableDocuments: []
            };
            
            await loadDocuments(formItem);
            return formItem;
          }))
        };
      }
    });

    return {
      saving,
      form,
      bankAccounts,
      isEditMode,
      isViewOnly,
      totalAmount,
      addItem,
      removeItem,
      loadDocuments,
      updateItemAmount,
      formatDocumentLabel,
      formatNumber,
      formatStatus,
      formatPaymentMethod,
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.empty-items {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-items i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  opacity: 0.5;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.item-number {
  font-weight: 600;
  color: #3b82f6;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fee2e2;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
}
</style>
