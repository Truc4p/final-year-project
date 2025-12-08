<template>
  <div class="invoices-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Invoices (Accounts Receivable)</h1>
        <p class="text-gray-600 mt-2">Manage customer invoices and payments</p>
      </div>
      <button @click="openCreateModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Create Invoice
      </button>
    </div>

    <!-- Create Invoice Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Edit Invoice' : 'Create Invoice' }}</h2>
          <button @click="closeCreateModal" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form @submit.prevent="submitInvoice" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select v-model="createForm.customer" :disabled="isEditing" required class="w-full px-3 py-2 border rounded-lg">
                <option value="" disabled>Select customer...</option>
                <option v-for="c in customers" :key="c._id" :value="c._id">
                  {{ c.displayName || c.companyName || c.customerNumber }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input v-model="createForm.invoiceDate" :disabled="isEditing" type="date" class="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
            <div class="space-y-3">
              <div v-for="(li, idx) in createForm.lineItems" :key="idx" class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div class="md:col-span-4">
                  <label class="block text-xs text-gray-600 mb-1">Description <span class="text-gray-500">(What you're selling)</span></label>
                  <input v-model="li.description" placeholder="e.g., Web Development Services, Product A, Consulting Hours" required class="w-full px-3 py-2 border rounded-lg text-sm" title="Enter what product or service you're selling" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">Quantity <span class="text-gray-500">(Units)</span></label>
                  <input v-model.number="li.quantity" type="number" min="1" placeholder="e.g., 5, 10, 1" required class="w-full px-3 py-2 border rounded-lg text-sm" title="How many units of this item (e.g., 5 hours, 10 units)" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">Unit Price <span class="text-gray-500">(Price per unit)</span></label>
                  <input v-model.number="li.unitPrice" type="number" min="0" step="0.01" placeholder="e.g., 100, 50.50" required class="w-full px-3 py-2 border rounded-lg text-sm" title="Price per unit (e.g., $100 per hour, $50 per item). Calculation: Quantity × Unit Price = Line Subtotal" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">Tax Rate <span class="text-gray-500">(%)</span></label>
                  <input v-model.number="li.taxRate" type="number" min="0" max="100" step="0.01" placeholder="e.g., 10, 5.5" class="w-full px-3 py-2 border rounded-lg text-sm" title="Tax percentage to apply to this line item (e.g., 10% sales tax). Calculation: Line Subtotal × Tax Rate % = Tax Amount" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">Revenue Account</label>
                  <select v-model="li.revenueAccount" required class="w-full px-3 py-2 border rounded-lg text-sm" title="Select the accounting category for this sale">
                    <option value="" disabled>Select account</option>
                    <option v-for="a in revenueAccounts" :key="a._id" :value="a._id">
                      {{ a.accountCode }} - {{ a.accountName }}
                    </option>
                  </select>
                </div>
                <div class="md:col-span-12 flex justify-between">
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Line total:</span> ${{ lineTotal(li).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                    <span class="text-xs text-gray-500 ml-2">(Qty × Unit Price + Tax)</span>
                  </div>
                  <button type="button" @click="removeLineItem(idx)" class="text-red-600 hover:text-red-800 text-sm" v-if="createForm.lineItems.length > 1">Remove</button>
                </div>
              </div>
              <button type="button" @click="addLineItem" class="text-blue-600 hover:text-blue-800 text-sm">+ Add line</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Shipping Cost
              </label>
              <input v-model.number="createForm.shippingCost" type="number" min="0" step="0.01" placeholder="e.g., 15.00" title="Enter the shipping or delivery cost for this invoice. This amount is added to the total (no tax applied here)." class="w-full px-3 py-2 border rounded-lg" />
              <p class="text-xs text-gray-500 mt-1">If you charge for delivery, enter it here. This is added after Subtotal and Tax.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Discounts or Extra Charges
              </label>
              <input v-model.number="createForm.adjustments" type="number" step="0.01" placeholder="e.g., -10 for discount, 25 for surcharge" title="Use a negative amount for discounts/credits and a positive amount for additional charges. Added directly to the total." class="w-full px-3 py-2 border rounded-lg" />
              <p class="text-xs text-gray-500 mt-1">Use negative for discounts/credits, positive for extra charges.</p>
            </div>
            <div class="self-end text-right">
              <div class="text-sm text-gray-600">Subtotal: ${{ subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
              <div class="text-sm text-gray-600">Tax: ${{ totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
              <div class="text-base font-semibold text-gray-900">Total: ${{ grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-2">
            <button type="button" @click="closeCreateModal" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{{ isEditing ? 'Save' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search invoices..." 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.status" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="void">Void</option>
        </select>
        <input 
          v-model="filters.dateFrom" 
          type="date" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <input 
          v-model="filters.dateTo" 
          type="date" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="isLoading" class="bg-white rounded-lg shadow p-6 mb-6 text-gray-600">Loading invoices...</div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">{{ error }}</div>

    <!-- Invoices Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in filteredInvoices" :key="inv._id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ inv.invoiceNumber }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatCustomer(inv.customer) }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${{ (inv.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(inv.dueDate) }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="getStatusClass(inv.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ inv.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="viewInvoice(inv._id)" class="text-blue-600 hover:text-blue-800 font-medium">View</button>
              <button v-if="inv.status==='draft' && !inv.isPosted" @click="editInvoice(inv._id)" class="text-green-600 hover:text-green-800 font-medium">Edit</button>
              <button v-if="inv.status==='draft' && !inv.isPosted" @click="postInvoice(inv._id)" class="text-purple-600 hover:text-purple-800 font-medium">Post</button>
              <button v-if="inv.status==='draft'" @click="deleteInvoiceHandler(inv._id)" class="text-red-600 hover:text-red-800 font-medium">Delete</button>
            </td>
          </tr>
          <tr v-if="!isLoading && invoices.length===0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">No invoices found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination summary -->
    <div v-if="pagination.total" class="mt-4 flex items-center justify-between text-sm text-gray-600">
      <div>
        Total: <span class="font-semibold">{{ pagination.total }}</span> | Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
      </div>
      <div class="space-x-2">
        <button :disabled="!pagination.hasPrev" @click="goPage(pagination.currentPage-1)" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <button :disabled="!pagination.hasNext" @click="goPage(pagination.currentPage+1)" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import financeService from '@/services/financeService';

const { t } = useI18n();
const router = useRouter();

const isLoading = ref(false);
const error = ref(null);

const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: ''
});

const invoices = ref([]);
const pagination = ref({ currentPage: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });

// Create Invoice modal state
const showCreateModal = ref(false);
const isEditing = ref(false);
const editingInvoiceId = ref(null);
const customers = ref([]);
const revenueAccounts = ref([]);
const createForm = ref({
  customer: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  lineItems: [
    { description: '', quantity: 1, unitPrice: 0, taxRate: 0, revenueAccount: '' }
  ],
  shippingCost: 0,
  adjustments: 0
});

const fetchInvoices = async (page = 1) => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = { page, limit: 20 };
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.dateFrom) params.startDate = filters.value.dateFrom;
    if (filters.value.dateTo) params.endDate = filters.value.dateTo;

    const data = await financeService.getInvoices(params);
    invoices.value = data.invoices || [];
    pagination.value = data.pagination || pagination.value;
  } catch (err) {
    error.value = err?.message || 'Failed to fetch invoices';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchInvoices(1);
});

watch(() => [filters.value.status, filters.value.dateFrom, filters.value.dateTo], () => fetchInvoices(1));

const filteredInvoices = computed(() => {
  const q = (filters.value.search || '').toLowerCase();
  return invoices.value.filter(inv => {
    const cust = formatCustomer(inv.customer).toLowerCase();
    const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(q) || cust.includes(q);
    return matchesSearch;
  });
});

const formatCustomer = (customer) => {
  if (!customer) return '';
  if (typeof customer === 'string') return customer;
  return customer.displayName || customer.companyName || customer.contactPerson || customer.customerNumber || '';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'partial': 'bg-purple-100 text-purple-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'void': 'bg-gray-200 text-gray-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Modal helpers
const todayStr = () => new Date().toISOString().slice(0, 10);

const openCreateModal = async () => {
  isEditing.value = false;
  editingInvoiceId.value = null;
  showCreateModal.value = true;
  createForm.value = {
    customer: '',
    invoiceDate: todayStr(),
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, revenueAccount: '' }],
    shippingCost: 0,
    adjustments: 0
  };
  await Promise.all([loadCustomers(), loadRevenueAccounts()]);
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const loadCustomers = async () => {
  try {
    const data = await financeService.getCustomers({ status: 'active', limit: 100 });
    customers.value = data.customers || [];
  } catch (e) {
    console.error('Failed to load customers', e);
  }
};

const loadRevenueAccounts = async () => {
  try {
    const data = await financeService.getChartOfAccounts({ accountType: 'revenue', isActive: true, limit: 200 });
    revenueAccounts.value = data.accounts || data || [];
  } catch (e) {
    console.error('Failed to load revenue accounts', e);
  }
};

// Line items and totals
const lineTotal = (li) => {
  const qty = Number(li.quantity) || 0;
  const price = Number(li.unitPrice) || 0;
  const rate = Number(li.taxRate) || 0;
  const subtotal = qty * price;
  const tax = subtotal * rate / 100;
  return subtotal + tax;
};

const subtotal = computed(() => createForm.value.lineItems.reduce((s, li) => s + ((Number(li.quantity)||0) * (Number(li.unitPrice)||0)), 0));
const totalTax = computed(() => createForm.value.lineItems.reduce((s, li) => {
  const sub = (Number(li.quantity)||0) * (Number(li.unitPrice)||0);
  const rate = Number(li.taxRate)||0;
  return s + sub * rate / 100;
}, 0));
const grandTotal = computed(() => subtotal.value + totalTax.value + (Number(createForm.value.shippingCost)||0) + (Number(createForm.value.adjustments)||0));

const addLineItem = () => {
  createForm.value.lineItems.push({ description: '', quantity: 1, unitPrice: 0, taxRate: 0, revenueAccount: '' });
};
const removeLineItem = (idx) => {
  createForm.value.lineItems.splice(idx, 1);
};

const submitInvoice = async () => {
  try {
    if (!createForm.value.customer) {
      alert('Please select a customer');
      return;
    }
    if (createForm.value.lineItems.some(li => !li.description || !li.revenueAccount || (Number(li.quantity)||0) <= 0)) {
      alert('Please complete all line items');
      return;
    }

    const common = {
      lineItems: createForm.value.lineItems.map((li, idx) => ({
        lineNumber: idx + 1,
        description: li.description,
        quantity: Number(li.quantity) || 0,
        unitPrice: Number(li.unitPrice) || 0,
        taxRate: Number(li.taxRate) || 0,
        revenueAccount: li.revenueAccount
      })),
      shippingCost: Number(createForm.value.shippingCost) || 0,
      adjustments: Number(createForm.value.adjustments) || 0
    };

    if (isEditing.value && editingInvoiceId.value) {
      // Update (only allowed fields on backend)
      await financeService.updateInvoice(editingInvoiceId.value, common);
    } else {
      // Create
      const payload = {
        customer: createForm.value.customer,
        invoiceDate: createForm.value.invoiceDate,
        ...common
      };
      await financeService.createInvoice(payload);
    }

    await fetchInvoices(1);
    closeCreateModal();
  } catch (err) {
    console.error(err);
    alert(err?.message || (isEditing.value ? 'Failed to save invoice' : 'Failed to create invoice'));
  }
};

const viewInvoice = (id) => {
  router.push(`/admin/finance/invoices/${id}`);
};

const editInvoice = async (id) => {
  try {
    isEditing.value = true;
    editingInvoiceId.value = id;
    // Load reference data
    await Promise.all([loadCustomers(), loadRevenueAccounts()]);
    // Fetch invoice details
    const data = await financeService.getInvoice(id);
    // Prefill form
    createForm.value = {
      customer: (typeof data.customer === 'string') ? data.customer : (data.customer?._id || data.customer?.id || ''),
      invoiceDate: (data.invoiceDate || '').slice(0, 10),
      lineItems: (data.lineItems || []).map((li) => ({
        description: li.description || '',
        quantity: Number(li.quantity) || 0,
        unitPrice: Number(li.unitPrice) || 0,
        taxRate: Number(li.taxRate) || 0,
        revenueAccount: (typeof li.revenueAccount === 'string') ? li.revenueAccount : (li.revenueAccount?._id || li.revenueAccount?.id || '')
      })),
      shippingCost: Number(data.shippingCost) || 0,
      adjustments: Number(data.adjustments) || 0
    };
    showCreateModal.value = true;
  } catch (e) {
    console.error(e);
    alert(e?.message || 'Failed to load invoice');
  }
};

const postInvoice = async (id) => {
  try {
    await financeService.postInvoice(id);
    await fetchInvoices(pagination.value.currentPage || 1);
  } catch (err) {
    console.error(err);
    const msg = err?.message || 'Failed to post invoice';
    // If it's already posted, refresh list so the UI hides the button
    if (/already posted/i.test(msg)) {
      await fetchInvoices(pagination.value.currentPage || 1);
    }
    alert(msg);
  }
};

const deleteInvoiceHandler = async (id) => {
  if (!confirm('Delete this draft invoice?')) return;
  try {
    await financeService.deleteInvoice(id);
    invoices.value = invoices.value.filter(i => i._id !== id);
    if (pagination.value.total > 0) pagination.value.total -= 1;
  } catch (err) {
    alert(err?.message || 'Failed to delete invoice');
  }
};

const goPage = async (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  await fetchInvoices(page);
};
</script>

<style scoped>
.invoices-page {
  padding: 2rem;
}
</style>
