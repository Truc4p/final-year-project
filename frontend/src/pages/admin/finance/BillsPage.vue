<template>
  <div class="bills-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Bills (Accounts Payable)</h1>
        <p class="text-gray-600 mt-2">Manage vendor bills and payments</p>
      </div>
      <button @click="openCreateInfo()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Create Bill
      </button>
    </div>

    <!-- Info alert for creation wiring -->
    <div v-if="showCreateHint" class="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6">
      <div class="flex items-start">
        <svg class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
        </svg>
        <div>
          <p class="font-semibold">Bill creation requires Vendors and Chart of Accounts.</p>
          <p class="text-sm mt-1">Your list is now connected to MongoDB. To enable creating bills from the UI, we need a vendor and expense accounts to select. I can wire this next, or you can seed a Vendor and COA, then we’ll enable the form.</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search bills..." 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.status" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
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
    <div v-if="isLoading" class="bg-white rounded-lg shadow p-6 mb-6 text-gray-600">Loading bills...</div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">{{ error }}</div>

    <!-- Bills Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bill #</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vendor</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="bill in filteredBills" :key="bill._id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ bill.billNumber }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatVendor(bill.vendor) }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${{ (bill.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(bill.dueDate) }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="getStatusClass(bill.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ bill.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="viewBill(bill._id)" class="text-blue-600 hover:text-blue-800 font-medium">View</button>
              <button v-if="bill.status==='draft'" @click="editBill(bill._id)" class="text-green-600 hover:text-green-800 font-medium">Edit</button>
              <button v-if="bill.status==='draft'" @click="deleteBillHandler(bill._id)" class="text-red-600 hover:text-red-800 font-medium">Delete</button>
            </td>
          </tr>
          <tr v-if="!isLoading && bills.length===0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">No bills found.</td>
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

const bills = ref([]);
const pagination = ref({ currentPage: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });

const fetchBills = async (page = 1) => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = { page, limit: 20 };
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.dateFrom) params.startDate = filters.value.dateFrom;
    if (filters.value.dateTo) params.endDate = filters.value.dateTo;

    const data = await financeService.getBills(params);
    bills.value = data.bills || [];
    pagination.value = data.pagination || pagination.value;
  } catch (err) {
    error.value = err?.message || 'Failed to fetch bills';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchBills(1);
});

watch(() => [filters.value.status, filters.value.dateFrom, filters.value.dateTo], () => fetchBills(1));

const filteredBills = computed(() => {
  const q = (filters.value.search || '').toLowerCase();
  return bills.value.filter(bill => {
    const vendorName = formatVendor(bill.vendor).toLowerCase();
    const matchesSearch = bill.billNumber?.toLowerCase().includes(q) || vendorName.includes(q);
    return matchesSearch;
  });
});

const formatVendor = (vendor) => {
  if (!vendor) return '';
  if (typeof vendor === 'string') return vendor;
  return vendor.companyName || vendor.contactPerson || vendor.vendorNumber || '';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending_approval': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-blue-100 text-blue-800',
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

const viewBill = (id) => {
  // navigate to bill detail if you add route later
  console.log('View bill', id);
};

const editBill = (id) => {
  console.log('Edit bill', id);
};

const deleteBillHandler = async (id) => {
  if (!confirm('Delete this draft bill?')) return;
  try {
    await financeService.deleteBill(id);
    bills.value = bills.value.filter(b => b._id !== id);
    // adjust pagination totals locally
    if (pagination.value.total > 0) pagination.value.total -= 1;
  } catch (err) {
    alert(err?.message || 'Failed to delete bill');
  }
};

const goPage = async (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  await fetchBills(page);
};
</script>

<style scoped>
.bills-page {
  padding: 2rem;
}
</style>
