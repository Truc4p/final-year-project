<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="close"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold">Create Bill</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- Missing data hint -->
      <div v-if="vendors.length === 0 || expenseAccounts.length === 0" class="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-4">
        <p class="font-semibold">Bill creation requires Vendors and Expense accounts.</p>
        <p class="text-sm mt-1">Please seed vendors and chart of accounts first. Once available, this form will be enabled.</p>
      </div>

      <!-- Form -->
      <div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': vendors.length === 0 || expenseAccounts.length === 0 }">
        <!-- Vendor & Dates -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Vendor</label>
            <select v-model="form.vendor" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select vendor...</option>
              <option v-for="v in vendors" :key="v._id" :value="v._id">
                {{ v.companyName }} ({{ v.vendorNumber }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Bill Date</label>
            <input type="date" v-model="form.billDate" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Due Date</label>
            <input type="date" v-model="form.dueDate" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <!-- Line items -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm text-gray-700">Line Items</label>
            <button @click="addLine" class="text-sm text-blue-600 hover:text-blue-800">+ Add line</button>
          </div>
          <div class="space-y-3">
            <div v-for="(li, idx) in form.lineItems" :key="idx" class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div class="md:col-span-5">
                <label class="block text-xs text-gray-600 mb-1">Description</label>
                <input v-model="li.description" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Office supplies" />
              </div>
              <div class="md:col-span-3">
                <label class="block text-xs text-gray-600 mb-1">Expense Account</label>
                <select v-model="li.expenseAccount" class="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select account...</option>
                  <option v-for="acc in expenseAccounts" :key="acc._id" :value="acc._id">
                    {{ acc.accountCode }} - {{ acc.accountName }}
                  </option>
                </select>
              </div>
              <div class="md:col-span-1">
                <label class="block text-xs text-gray-600 mb-1">Qty</label>
                <input v-model.number="li.quantity" type="number" min="0" step="1" class="w-full px-2 py-2 border rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs text-gray-600 mb-1">Unit Cost</label>
                <input v-model.number="li.unitCost" type="number" min="0" step="0.01" class="w-full px-2 py-2 border rounded-lg" />
              </div>
              <div class="md:col-span-1">
                <label class="block text-xs text-gray-600 mb-1">Tax %</label>
                <input v-model.number="li.taxRate" type="number" min="0" max="100" step="0.01" class="w-full px-2 py-2 border rounded-lg" />
              </div>
              <div class="md:col-span-0 md:ml-2">
                <button v-if="form.lineItems.length > 1" @click="removeLine(idx)" class="text-red-600 hover:text-red-800 text-sm">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">Notes</label>
          <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex items-center justify-end gap-3">
        <button @click="close" class="px-4 py-2 border rounded-lg">Cancel</button>
        <button @click="submit" :disabled="isSubmitting || vendors.length === 0 || expenseAccounts.length === 0" class="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
          {{ isSubmitting ? 'Creating...' : 'Create Bill' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import financeService from '@/services/financeService';

const props = defineProps({
  open: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
  billId: { type: String, default: '' },
  initialBill: { type: Object, default: null }
});
const emit = defineEmits(['close', 'created']);

const vendors = ref([]);
const expenseAccounts = ref([]);
const isSubmitting = ref(false);

const todayISO = () => new Date().toISOString().slice(0,10);

const form = reactive({
  vendor: '',
  billDate: todayISO(),
  dueDate: '',
  lineItems: [
    { description: '', expenseAccount: '', quantity: 1, unitCost: 0, taxRate: 0 }
  ],
  notes: ''
});

const loadFormData = async () => {
  try {
    const [v, acc] = await Promise.all([
      financeService.getBillVendors({ status: 'active' }),
      financeService.getBillExpenseAccounts()
    ]);
    vendors.value = v || [];
    expenseAccounts.value = acc || [];
  } catch (e) {
    console.error('Failed to load bill form data', e);
  }
};

const hydrateFromInitial = () => {
  if (!props.initialBill) return;
  const b = props.initialBill;
  form.vendor = typeof b.vendor === 'string' ? b.vendor : (b.vendor?._id || b.vendor?.id || '');
  form.billDate = (b.billDate || '').slice(0,10) || todayISO();
  form.dueDate = (b.dueDate || '').slice(0,10) || '';
  form.lineItems = (b.lineItems || []).map(li => ({
    description: li.description || '',
    expenseAccount: (typeof li.expenseAccount === 'string') ? li.expenseAccount : (li.expenseAccount?._id || li.expenseAccount?.id || ''),
    quantity: Number(li.quantity) || 1,
    unitCost: Number(li.unitCost) || 0,
    taxRate: Number(li.taxRate) || 0
  }));
  form.notes = b.notes || '';
};

watch(() => props.open, async (o) => {
  if (o) {
    await loadFormData();
    if (props.isEditing && props.initialBill) {
      hydrateFromInitial();
    } else {
      // reset form for create
      form.vendor = '';
      form.billDate = todayISO();
      form.dueDate = '';
      form.lineItems = [{ description: '', expenseAccount: '', quantity: 1, unitCost: 0, taxRate: 0 }];
      form.notes = '';
    }
  }
});

const addLine = () => { form.lineItems.push({ description: '', expenseAccount: '', quantity: 1, unitCost: 0, taxRate: 0 }); };
const removeLine = (idx) => { form.lineItems.splice(idx, 1); };
const close = () => emit('close');

const submit = async () => {
  if (!form.vendor) { alert('Please select a vendor'); return; }
  if (form.lineItems.length === 0) { alert('Please add at least one line item'); return; }
  for (let i = 0; i < form.lineItems.length; i++) {
    const li = form.lineItems[i];
    if (!li.expenseAccount) { alert(`Please select an expense account for line ${i + 1}`); return; }
  }

  const items = form.lineItems.map((li, i) => ({
    lineNumber: i + 1,
    description: (li.description || '').trim() || 'Expense',
    expenseAccount: li.expenseAccount,
    quantity: Number(li.quantity) || 1,
    unitCost: Number(li.unitCost) || 0,
    taxRate: Number(li.taxRate) || 0
  }));

  try {
    isSubmitting.value = true;
    if (props.isEditing && props.billId) {
      // Only fields allowed by backend updateBill
      const updatePayload = {
        lineItems: items,
        notes: (form.notes || '').trim() || undefined,
        dueDate: form.dueDate || undefined
      };
      const res = await financeService.updateBill(props.billId, updatePayload);
      emit('created', res?.bill || null);
    } else {
      const payload = {
        vendor: form.vendor,
        billDate: form.billDate || undefined,
        dueDate: form.dueDate || undefined,
        lineItems: items,
        notes: (form.notes || '').trim() || undefined
      };
      const res = await financeService.createBill(payload);
      emit('created', res?.bill || null);
    }
    close();
  } catch (e) {
    alert(e?.message || (props.isEditing ? 'Failed to save bill' : 'Failed to create bill'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

