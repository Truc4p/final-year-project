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
          <tr v-for="account in filteredAccounts" :key="account.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{{ account.code }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ account.name }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="getTypeClass(account.type)" class="px-2 py-1 rounded text-xs font-semibold">
                {{ account.type }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ account.subType }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${{ account.balance.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
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
              <input v-model="formData.code" type="text" placeholder="e.g., 1000" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input v-model="formData.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select v-model="formData.type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sub Type</label>
              <select v-model="formData.subType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="current_asset">Current Asset</option>
                <option value="fixed_asset">Fixed Asset</option>
                <option value="current_liability">Current Liability</option>
                <option value="long_term_liability">Long Term Liability</option>
                <option value="operating_revenue">Operating Revenue</option>
                <option value="operating_expense">Operating Expense</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
              <input v-model.number="formData.balance" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="flex items-end">
              <label class="flex items-center space-x-2">
                <input v-model="formData.isActive" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                <span class="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
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
import { ref, computed } from 'vue';

const { t } = useI18n();

const showCreateModal = ref(false);
const filters = ref({
  search: '',
  accountType: '',
  status: ''
});

const formData = ref({
  code: '',
  name: '',
  type: 'asset',
  subType: 'current_asset',
  balance: 0,
  isActive: true,
  description: ''
});

// Sample data
const accounts = ref([
  { id: 1, code: '1000', name: 'Cash', type: 'asset', subType: 'current_asset', balance: 55000, isActive: true },
  { id: 2, code: '1100', name: 'Accounts Receivable', type: 'asset', subType: 'current_asset', balance: 25000, isActive: true },
  { id: 3, code: '1200', name: 'Inventory', type: 'asset', subType: 'current_asset', balance: 45000, isActive: true },
  { id: 4, code: '2000', name: 'Accounts Payable', type: 'liability', subType: 'current_liability', balance: 15000, isActive: true },
  { id: 5, code: '3000', name: 'Owner Capital', type: 'equity', subType: 'owner_equity', balance: 100000, isActive: true },
  { id: 6, code: '4000', name: 'Sales Revenue', type: 'revenue', subType: 'operating_revenue', balance: 125000, isActive: true },
  { id: 7, code: '5000', name: 'Cost of Goods Sold', type: 'expense', subType: 'cost_of_goods_sold', balance: 45000, isActive: true },
  { id: 8, code: '5100', name: 'Salaries Expense', type: 'expense', subType: 'operating_expense', balance: 35000, isActive: true },
]);

const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    const matchesSearch = account.code.includes(filters.value.search) ||
                         account.name.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesType = !filters.value.accountType || account.type === filters.value.accountType;
    const matchesStatus = !filters.value.status || (filters.value.status === 'active' ? account.isActive : !account.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });
});

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

const deleteAccount = (id) => {
  accounts.value = accounts.value.filter(acc => acc.id !== id);
};

const submitAccount = () => {
  const newAccount = {
    id: accounts.value.length + 1,
    code: formData.value.code,
    name: formData.value.name,
    type: formData.value.type,
    subType: formData.value.subType,
    balance: formData.value.balance,
    isActive: formData.value.isActive
  };
  accounts.value.push(newAccount);
  showCreateModal.value = false;
  formData.value = {
    code: '',
    name: '',
    type: 'asset',
    subType: 'current_asset',
    balance: 0,
    isActive: true,
    description: ''
  };
};
</script>

<style scoped>
.chart-of-accounts-page {
  padding: 2rem;
}
</style>

