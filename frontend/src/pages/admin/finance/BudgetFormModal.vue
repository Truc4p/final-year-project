<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Edit Budget' : 'Create Budget' }}</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="saveBudget" class="budget-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label>Budget Name *</label>
            <input v-model="budget.name" type="text" required placeholder="e.g., Q1 2026 Operating Budget" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="budget.description" rows="3" placeholder="Budget description..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Budget Type *</label>
              <select v-model="budget.budgetType" required>
                <option value="operating">Operating</option>
                <option value="capital">Capital</option>
                <option value="project">Project</option>
                <option value="department">Department</option>
                <option value="master">Master</option>
              </select>
            </div>

            <div class="form-group">
              <label>Period *</label>
              <select v-model="budget.period" required>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fiscal Year *</label>
              <input v-model.number="budget.fiscalYear" type="number" required :min="currentYear - 1" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Date *</label>
              <input v-model="budget.startDate" type="date" required />
            </div>

            <div class="form-group">
              <label>End Date *</label>
              <input v-model="budget.endDate" type="date" required />
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div class="form-section">
          <div class="section-header">
            <h3>Budget Line Items</h3>
            <button type="button" @click="addLineItem" class="btn-secondary btn-sm">
              <i class="fas fa-plus"></i> Add Line Item
            </button>
          </div>

          <div class="line-items">
            <div v-for="(item, index) in budget.lineItems" :key="index" class="line-item">
              <div class="line-item-header">
                <span class="line-number">#{{ index + 1 }}</span>
                <button type="button" @click="removeLineItem(index)" class="btn-danger btn-xs">
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <div class="line-item-body">
                <div class="form-group">
                  <label>Category *</label>
                  <select v-model="item.category" required>
                    <option value="revenue">Revenue</option>
                    <option value="expense">General Expense</option>
                    <option value="payroll">Payroll</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="equipment">Equipment</option>
                    <option value="software">Software</option>
                    <option value="shipping">Shipping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Department</label>
                  <input v-model="item.department" type="text" placeholder="Optional" />
                </div>

                <div class="form-group">
                  <label>Budgeted Amount *</label>
                  <input v-model.number="item.budgetedAmount" type="number" step="0.01" min="0" required />
                </div>

                <div class="form-group full-width">
                  <label>Notes</label>
                  <input v-model="item.notes" type="text" placeholder="Optional notes" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="budget.lineItems.length === 0" class="no-items">
            <p>No line items added. Click "Add Line Item" to start.</p>
          </div>
        </div>

        <!-- Alerts Configuration -->
        <div class="form-section">
          <h3>Budget Alerts</h3>
          
          <div class="alerts-config">
            <div v-for="(alert, index) in budget.alerts" :key="index" class="alert-item">
              <label>Alert at {{ alert.threshold }}% utilization</label>
              <input v-model.number="alert.threshold" type="number" min="0" max="100" step="5" />
              <button type="button" @click="removeAlert(index)" class="btn-danger btn-xs">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button type="button" @click="addAlert" class="btn-secondary btn-sm">
              <i class="fas fa-plus"></i> Add Alert
            </button>
          </div>
        </div>

        <!-- Recurring Settings -->
        <div class="form-section">
          <h3>Recurring Settings</h3>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="budget.isRecurring" type="checkbox" />
              This is a recurring budget
            </label>
          </div>

          <div v-if="budget.isRecurring" class="recurring-config">
            <div class="form-group">
              <label>Frequency</label>
              <select v-model="budget.recurringConfig.frequency">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="budget.recurringConfig.autoRenew" type="checkbox" />
                Auto-renew when period ends
              </label>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="form-section summary">
          <h3>Budget Summary</h3>
          <div class="summary-stats">
            <div class="summary-item">
              <span class="label">Total Budgeted:</span>
              <span class="value">${{ formatNumber(totalBudgeted) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Line Items:</span>
              <span class="value">{{ budget.lineItems.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Alert Thresholds:</span>
              <span class="value">{{ budget.alerts.length }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : (isEdit ? 'Update Budget' : 'Create Budget') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  budgetId: String
});

const emit = defineEmits(['close', 'saved']);

const API_URL = 'http://localhost:3000/api/finance/budgets';
const currentYear = new Date().getFullYear();
const isEdit = ref(false);
const saving = ref(false);

const budget = ref({
  name: '',
  description: '',
  budgetType: 'operating',
  fiscalYear: currentYear,
  period: 'monthly',
  startDate: '',
  endDate: '',
  status: 'draft',
  lineItems: [],
  alerts: [
    { threshold: 80 },
    { threshold: 90 },
    { threshold: 100 }
  ],
  isRecurring: false,
  recurringConfig: {
    frequency: 'monthly',
    autoRenew: false
  }
});

const totalBudgeted = computed(() => {
  return budget.value.lineItems.reduce((sum, item) => sum + (parseFloat(item.budgetedAmount) || 0), 0);
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const addLineItem = () => {
  budget.value.lineItems.push({
    category: 'expense',
    department: '',
    budgetedAmount: 0,
    notes: ''
  });
};

const removeLineItem = (index) => {
  budget.value.lineItems.splice(index, 1);
};

const addAlert = () => {
  budget.value.alerts.push({ threshold: 85 });
};

const removeAlert = (index) => {
  budget.value.alerts.splice(index, 1);
};

const saveBudget = async () => {
  try {
    saving.value = true;

    // Validate dates
    if (new Date(budget.value.startDate) >= new Date(budget.value.endDate)) {
      alert('End date must be after start date');
      return;
    }

    // Validate line items
    if (budget.value.lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const method = isEdit.value ? 'put' : 'post';
    const url = isEdit.value ? `${API_URL}/${props.budgetId}` : API_URL;

    await axios[method](url, budget.value, getAuthHeaders());

    alert(`Budget ${isEdit.value ? 'updated' : 'created'} successfully!`);
    emit('saved');
  } catch (error) {
    console.error('Error saving budget:', error);
    alert(error.response?.data?.message || 'Failed to save budget');
  } finally {
    saving.value = false;
  }
};

const loadBudget = async () => {
  if (!props.budgetId) return;

  try {
    const response = await axios.get(`${API_URL}/${props.budgetId}`, getAuthHeaders());
    budget.value = response.data.budget;
    isEdit.value = true;
  } catch (error) {
    console.error('Error loading budget:', error);
    alert('Failed to load budget');
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num);
};

onMounted(() => {
  if (props.budgetId) {
    loadBudget();
  }
});
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
  max-width: 900px;
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
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #333;
}

.budget-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.line-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.line-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.line-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.line-number {
  font-weight: 600;
  color: #666;
}

.line-item-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.line-item-body .full-width {
  grid-column: 1 / -1;
}

.no-items {
  text-align: center;
  padding: 2rem;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
}

.alerts-config {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
}

.alert-item label {
  margin: 0;
}

.alert-item input {
  width: 100px;
}

.recurring-config {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.summary {
  background: #f0f7ff;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 1.5rem !important;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item .label {
  font-size: 0.85rem;
  color: #666;
}

.summary-item .value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  margin: 0 -1.5rem -1.5rem;
  padding: 1.5rem;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
