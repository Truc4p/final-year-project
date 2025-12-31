<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content large">
      <div class="modal-header">
        <h2>
          <i class="fas fa-chart-line"></i>
          {{ report ? 'Edit Report' : 'Create New Report' }}
        </h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="saveReport">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Basic Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="name">Report Name *</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="Monthly Sales Report"
                />
              </div>
              <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" v-model="formData.category" required>
                  <option value="financial">Financial</option>
                  <option value="sales">Sales</option>
                  <option value="expenses">Expenses</option>
                  <option value="cash_flow">Cash Flow</option>
                  <option value="budget">Budget</option>
                  <option value="tax">Tax</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="2"
                placeholder="Brief description of this report"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="dataSource">Data Source *</label>
              <select id="dataSource" v-model="formData.dataSource" required>
                <option value="invoices">Invoices</option>
                <option value="bills">Bills</option>
                <option value="expenses">Business Expenses</option>
                <option value="transactions">Cash Flow Transactions</option>
                <option value="budgets">Budgets</option>
                <option value="accounts">Chart of Accounts</option>
                <option value="general_ledger">General Ledger</option>
              </select>
            </div>
          </div>

          <!-- Filters -->
          <div class="form-section">
            <h3>Filters</h3>
            <div v-for="(filter, index) in formData.filters" :key="index" class="filter-row">
              <select v-model="filter.field" class="filter-field">
                <option value="status">Status</option>
                <option value="amount">Amount</option>
                <option value="date">Date</option>
                <option value="category">Category</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              
              <select v-model="filter.operator" class="filter-operator">
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="between">Between</option>
              </select>
              
              <input
                v-model="filter.value"
                type="text"
                class="filter-value"
                placeholder="Value"
              />
              
              <button type="button" @click="removeFilter(index)" class="btn-remove">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button type="button" @click="addFilter" class="btn-add">
              <i class="fas fa-plus"></i> Add Filter
            </button>
          </div>

          <!-- Columns -->
          <div class="form-section">
            <h3>Columns</h3>
            <div v-for="(column, index) in formData.columns" :key="index" class="column-row">
              <input
                v-model="column.field"
                type="text"
                placeholder="Field name"
                class="column-field"
              />
              <input
                v-model="column.label"
                type="text"
                placeholder="Display label"
                class="column-label"
              />
              <select v-model="column.format" class="column-format">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
                <option value="date">Date</option>
              </select>
              <select v-model="column.aggregation" class="column-agg">
                <option value="none">No Aggregation</option>
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="count">Count</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
              </select>
              <button type="button" @click="removeColumn(index)" class="btn-remove">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button type="button" @click="addColumn" class="btn-add">
              <i class="fas fa-plus"></i> Add Column
            </button>
          </div>

          <!-- Schedule -->
          <div class="form-section">
            <h3>Schedule (Optional)</h3>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.schedule.enabled" />
              Enable Scheduled Reports
            </label>

            <div v-if="formData.schedule.enabled" class="schedule-config">
              <div class="form-row">
                <div class="form-group">
                  <label>Frequency</label>
                  <select v-model="formData.schedule.frequency">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Time</label>
                  <input type="time" v-model="formData.schedule.time" />
                </div>
              </div>

              <div class="form-group">
                <label>Recipients (comma-separated emails)</label>
                <input
                  v-model="recipientsInput"
                  type="text"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div class="form-group">
                <label>Export Format</label>
                <select v-model="formData.schedule.format">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="form-section">
            <h3>Options</h3>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.isTemplate" />
              Save as Template (others can use this report structure)
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.isPublic" />
              Make Public (visible to all users)
            </label>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i class="fas fa-save"></i>
              {{ saving ? 'Saving...' : 'Save Report' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  report: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const API_URL = 'http://localhost:3000/api/finance/reports';
const saving = ref(false);
const recipientsInput = ref('');

const formData = reactive({
  name: '',
  description: '',
  category: 'custom',
  dataSource: 'invoices',
  filters: [],
  columns: [],
  schedule: {
    enabled: false,
    frequency: 'monthly',
    time: '09:00',
    recipients: [],
    format: 'pdf'
  },
  isTemplate: false,
  isPublic: false
});

// Initialize form data from existing report
if (props.report) {
  Object.assign(formData, {
    name: props.report.name,
    description: props.report.description,
    category: props.report.category,
    dataSource: props.report.dataSource,
    filters: props.report.filters || [],
    columns: props.report.columns || [],
    schedule: props.report.schedule || formData.schedule,
    isTemplate: props.report.isTemplate,
    isPublic: props.report.isPublic
  });
  
  if (props.report.schedule?.recipients) {
    recipientsInput.value = props.report.schedule.recipients.join(', ');
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const addFilter = () => {
  formData.filters.push({
    field: 'status',
    operator: 'equals',
    value: '',
    logicalOperator: 'AND'
  });
};

const removeFilter = (index) => {
  formData.filters.splice(index, 1);
};

const addColumn = () => {
  formData.columns.push({
    field: '',
    label: '',
    format: 'text',
    aggregation: 'none',
    order: formData.columns.length
  });
};

const removeColumn = (index) => {
  formData.columns.splice(index, 1);
};

const saveReport = async () => {
  try {
    saving.value = true;

    // Parse recipients
    if (formData.schedule.enabled && recipientsInput.value) {
      formData.schedule.recipients = recipientsInput.value
        .split(',')
        .map(email => email.trim())
        .filter(email => email);
    }

    const url = props.report 
      ? `${API_URL}/${props.report._id}`
      : API_URL;
    
    const method = props.report ? 'put' : 'post';

    await axios[method](url, formData, getAuthHeaders());

    alert(`Report ${props.report ? 'updated' : 'created'} successfully!`);
    emit('saved');
  } catch (error) {
    console.error('Error saving report:', error);
    alert(error.response?.data?.message || 'Failed to save report');
  } finally {
    saving.value = false;
  }
};

// Auto-populate label from field
watch(() => formData.columns, (columns) => {
  columns.forEach(col => {
    if (col.field && !col.label) {
      col.label = col.field.charAt(0).toUpperCase() + col.field.slice(1);
    }
  });
}, { deep: true });
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
  width: 100%;
  max-width: 900px;
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
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.modal-body {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
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

.filter-row,
.column-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 2fr auto;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.filter-row select,
.filter-row input,
.column-row select,
.column-row input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.column-row {
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr auto;
}

.btn-add,
.btn-remove {
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

.btn-add {
  background: #2196f3;
  color: white;
  margin-top: 0.5rem;
}

.btn-add:hover {
  background: #1976d2;
}

.btn-remove {
  background: #f44336;
  color: white;
  padding: 0.5rem 0.75rem;
}

.btn-remove:hover {
  background: #d32f2f;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  cursor: pointer;
  width: auto;
}

.schedule-config {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  background: white;
  margin: 0 -1.5rem -1.5rem;
  padding: 1.5rem;
}

.btn-primary,
.btn-secondary {
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
</style>
