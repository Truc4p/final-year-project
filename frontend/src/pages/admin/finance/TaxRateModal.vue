<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Edit Tax Rate' : 'Create Tax Rate' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <!-- Basic Info -->
          <div class="form-group full-width">
            <label class="required">Name</label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              placeholder="e.g., State Sales Tax"
              class="form-control"
            />
          </div>

          <div class="form-group full-width">
            <label>Description</label>
            <textarea 
              v-model="formData.description" 
              rows="2"
              placeholder="Optional description"
              class="form-control"
            ></textarea>
          </div>

          <!-- Tax Type and Rate -->
          <div class="form-group">
            <label class="required">Tax Type</label>
            <select v-model="formData.type" required class="form-control">
              <option value="">Select type</option>
              <option value="sales">Sales Tax</option>
              <option value="purchase">Purchase Tax</option>
              <option value="income">Income Tax</option>
              <option value="payroll">Payroll Tax</option>
              <option value="property">Property Tax</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="required">Tax Rate (%)</label>
            <input 
              v-model.number="formData.rate" 
              type="number" 
              step="0.01"
              min="0"
              max="100"
              required 
              placeholder="e.g., 8.5"
              class="form-control"
            />
          </div>

          <!-- Location Details -->
          <div class="form-group">
            <label>Country</label>
            <input 
              v-model="formData.country" 
              type="text" 
              placeholder="e.g., US"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>State/Province</label>
            <input 
              v-model="formData.state" 
              type="text" 
              placeholder="e.g., California"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Region</label>
            <input 
              v-model="formData.region" 
              type="text" 
              placeholder="e.g., Bay Area"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>City</label>
            <input 
              v-model="formData.city" 
              type="text" 
              placeholder="e.g., San Francisco"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Zip Code</label>
            <input 
              v-model="formData.zipCode" 
              type="text" 
              placeholder="e.g., 94102"
              class="form-control"
            />
          </div>

          <!-- Tax Authority and Filing -->
          <div class="form-group">
            <label>Tax Authority</label>
            <input 
              v-model="formData.authority" 
              type="text" 
              placeholder="e.g., IRS, State DOR"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Filing Frequency</label>
            <select v-model="formData.filingFrequency" class="form-control">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <!-- Effective Dates -->
          <div class="form-group">
            <label class="required">Effective From</label>
            <input 
              v-model="formData.effectiveFrom" 
              type="date" 
              required 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Effective To</label>
            <input 
              v-model="formData.effectiveTo" 
              type="date" 
              class="form-control"
            />
          </div>

          <!-- Categories -->
          <div class="form-group full-width">
            <label>Applicable Categories</label>
            <input 
              v-model="applicableCategoriesInput" 
              type="text" 
              placeholder="Comma-separated list (e.g., Electronics, Clothing)"
              class="form-control"
            />
            <small class="form-hint">Leave empty to apply to all categories</small>
          </div>

          <div class="form-group full-width">
            <label>Exempt Categories</label>
            <input 
              v-model="exemptCategoriesInput" 
              type="text" 
              placeholder="Comma-separated list (e.g., Food, Medicine)"
              class="form-control"
            />
          </div>

          <!-- Options -->
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.isCompound" type="checkbox" />
              <span>Compound Tax (calculated on top of other taxes)</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.isActive" type="checkbox" />
              <span>Active</span>
            </label>
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
import { ref, computed, watch } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'TaxRateModal',
  props: {
    rate: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const saving = ref(false);
    const isEdit = computed(() => !!props.rate);

    const formData = ref({
      name: '',
      description: '',
      type: '',
      rate: 0,
      isCompound: false,
      country: 'US',
      state: '',
      region: '',
      city: '',
      zipCode: '',
      applicableCategories: [],
      exemptCategories: [],
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      isActive: true,
      authority: '',
      filingFrequency: 'quarterly'
    });

    const applicableCategoriesInput = ref('');
    const exemptCategoriesInput = ref('');

    // Load rate data if editing
    if (props.rate) {
      formData.value = {
        name: props.rate.name,
        description: props.rate.description || '',
        type: props.rate.type,
        rate: props.rate.rate,
        isCompound: props.rate.isCompound,
        country: props.rate.country || 'US',
        state: props.rate.state || '',
        region: props.rate.region || '',
        city: props.rate.city || '',
        zipCode: props.rate.zipCode || '',
        applicableCategories: props.rate.applicableCategories || [],
        exemptCategories: props.rate.exemptCategories || [],
        effectiveFrom: props.rate.effectiveFrom ? new Date(props.rate.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        effectiveTo: props.rate.effectiveTo ? new Date(props.rate.effectiveTo).toISOString().split('T')[0] : '',
        isActive: props.rate.isActive,
        authority: props.rate.authority || '',
        filingFrequency: props.rate.filingFrequency || 'quarterly'
      };

      applicableCategoriesInput.value = props.rate.applicableCategories?.join(', ') || '';
      exemptCategoriesInput.value = props.rate.exemptCategories?.join(', ') || '';
    }

    // Watch category inputs
    watch(applicableCategoriesInput, (val) => {
      formData.value.applicableCategories = val
        .split(',')
        .map(c => c.trim())
        .filter(c => c);
    });

    watch(exemptCategoriesInput, (val) => {
      formData.value.exemptCategories = val
        .split(',')
        .map(c => c.trim())
        .filter(c => c);
    });

    const handleSubmit = async () => {
      try {
        saving.value = true;

        const submitData = { ...formData.value };
        if (!submitData.effectiveTo) delete submitData.effectiveTo;

        if (isEdit.value) {
          await financeService.updateTaxRate(props.rate._id, submitData);
        } else {
          await financeService.createTaxRate(submitData);
        }

        emit('saved');
      } catch (error) {
        console.error('Error saving tax rate:', error);
        alert(error.message || 'Error saving tax rate');
      } finally {
        saving.value = false;
      }
    };

    return {
      formData,
      applicableCategoriesInput,
      exemptCategoriesInput,
      saving,
      isEdit,
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
  max-width: 900px;
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

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: -0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
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
