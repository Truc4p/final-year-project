<template>
  <div class="invoices-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Invoices (Accounts Receivable)</h1>
        <p class="text-gray-600 mt-2">Manage customer invoices and payments</p>
      </div>
      <button @click="openCreateInfo()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Create Invoice
      </button>
    </div>

    <!-- Info alert for creation wiring -->
    <div v-if="showCreateHint" class="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6">
      <div class="flex items-start">
        <svg class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
        </svg>
        <div>
          <p class="font-semibold">Invoice creation requires Customers and Revenue accounts.</p>
          <p class="text-sm mt-1">Your list is now connected to MongoDB. To enable creating invoices from the UI, we need a customer to select and revenue accounts from your Chart of Accounts. I can wire this next, or you can seed a Customer and revenue COA, then we’ll enable the form.</p>
        </div>
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
              <button v-if="inv.status==='draft'" @click="editInvoice(inv._id)" class="text-green-600 hover:text-green-800 font-medium">Edit</button>
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
import financeService from '@/services/financeService';

const { t } = useI18n();

const isLoading = ref(false);
const error = ref(null);
const showCreateHint = ref(false);

const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: ''
});

const invoices = ref([]);
const pagination = ref({ currentPage: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });

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

const openCreateInfo = () => {
  showCreateHint.value = true;
};

const viewInvoice = (id) => {
  console.log('View invoice', id);
};

const editInvoice = (id) => {
  console.log('Edit invoice', id);
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
