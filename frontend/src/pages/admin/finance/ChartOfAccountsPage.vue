<template>
  <div class="chart-of-accounts-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
        <p class="text-gray-600 mt-2">View and manage your account structure</p>
      </div>
      <button @click="showCreateModal = true" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Add Account
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search accounts..." 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.accountType" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
          <option value="equity">Equity</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
        </select>
        <select 
          v-model="filters.status" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Account Name</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sub Type</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="account in filteredAccounts" :key="account._id || account.accountCode" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{{ account.accountCode }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ account.accountName }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="getTypeClass(account.accountType)" class="px-2 py-1 rounded text-xs font-semibold">
                {{ account.accountType }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ account.accountSubType }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${{ formatCurrency(account.currentBalance) }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ account.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="editAccount(account.id)" class="text-green-600 hover:text-green-800 font-medium">Edit</button>
              <button @click="deleteAccount(account.id)" class="text-red-600 hover:text-red-800 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Add Account</h2>
        <form @submit.prevent="submitAccount" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
              <input v-model="formData.accountCode" type="text" placeholder="e.g., 1000" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input v-model="formData.accountName" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select v-model="formData.accountType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sub Type</label>
              <select v-model="formData.accountSubType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="current_asset">Current Asset</option>
                <option value="fixed_asset">Fixed Asset</option>
                <option value="current_liability">Current Liability</option>
                <option value="long_term_liability">Long Term Liability</option>
                <option value="operating_revenue">Operating Revenue</option>
                <option value="operating_expense">Operating Expense</option>
              </select>
            </div>
          </div>
          <div class="flex items-end">
            <label class="flex items-center space-x-2">
              <input v-model="formData.isActive" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
              <span class="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="formData.description" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button @click="showCreateModal = false" type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Add Account</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted, watch } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const showCreateModal = ref(false);
const isLoading = ref(false);
const error = ref(null);

const filters = ref({
  search: '',
  accountType: '',
  status: ''
});

const formData = ref({
  accountCode: '',
  accountName: '',
  accountType: 'asset',
  accountSubType: 'current_asset',
  isActive: true,
  description: ''
});

const accounts = ref([]);
const pagination = ref({ currentPage: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });

const fetchAccounts = async (page = 1) => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = { page, limit: 200 };
    if (filters.value.accountType) params.accountType = filters.value.accountType;
    if (filters.value.status) params.isActive = filters.value.status === 'active' ? true : (filters.value.status === 'inactive' ? false : undefined);
    if (filters.value.search) params.search = filters.value.search;

    const data = await financeService.getChartOfAccounts(params);
    accounts.value = data.accounts || data || [];
    pagination.value = data.pagination || pagination.value;
  } catch (err) {
    error.value = err?.message || 'Failed to load accounts';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAccounts);
watch(() => [filters.value.accountType, filters.value.status, filters.value.search], () => fetchAccounts(1));

const filteredAccounts = computed(() => {
  // Server-side filtering already applied; perform light search client-side for UX
  const q = (filters.value.search || '').toLowerCase();
  return accounts.value.filter(acc => {
    const code = (acc.accountCode || '').toLowerCase();
    const name = (acc.accountName || '').toLowerCase();
    return !q || code.includes(q) || name.includes(q);
  });
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0.00';
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const getTypeClass = (type) => {
  const classes = {
    'asset': 'bg-blue-100 text-blue-800',
    'liability': 'bg-red-100 text-red-800',
    'equity': 'bg-purple-100 text-purple-800',
    'revenue': 'bg-green-100 text-green-800',
    'expense': 'bg-orange-100 text-orange-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
};

const editAccount = (id) => {
  console.log('Edit account:', id);
};

const deleteAccount = async (id) => {
  if (!confirm('Delete this account?')) return;
  try {
    await financeService.deleteAccount(id);
    accounts.value = accounts.value.filter(acc => acc._id !== id);
  } catch (err) {
    alert(err?.message || 'Failed to delete account');
  }
};

const submitAccount = async () => {
  try {
    const payload = {
      accountCode: formData.value.accountCode,
      accountName: formData.value.accountName,
      accountType: formData.value.accountType,
      accountSubType: formData.value.accountSubType,
      description: formData.value.description,
      isActive: formData.value.isActive
    };

    const res = await financeService.createAccount(payload);
    if (res?.account) {
      accounts.value.unshift(res.account);
    } else {
      // Fallback: refetch
      await fetchAccounts(1);
    }

    showCreateModal.value = false;
    formData.value = {
      accountCode: '',
      accountName: '',
      accountType: 'asset',
      accountSubType: 'current_asset',
      isActive: true,
      description: ''
    };
  } catch (err) {
    alert(err?.message || 'Failed to create account');
  }
};
</script>

<style scoped>
.chart-of-accounts-page {
  padding: 2rem;
}
</style>

