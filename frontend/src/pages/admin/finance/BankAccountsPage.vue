<template>
  <div class="bank-accounts-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Bank Accounts</h1>
        <p class="text-gray-600 mt-2">Manage your bank accounts and transactions</p>
      </div>
      <button @click="showCreateModal = true" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Add Bank Account
      </button>
    </div>

    <!-- Bank Accounts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div v-for="account in bankAccounts" :key="account.id" class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ account.accountName }}</h3>
            <p class="text-sm text-gray-600">{{ account.bankName }}</p>
          </div>
          <span v-if="account.isPrimary" class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Primary</span>
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-600">Account Number</p>
          <p class="text-lg font-mono text-gray-900">{{ account.accountNumberMasked }}</p>
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-600">Current Balance</p>
          <p class="text-2xl font-bold text-gray-900">${{ account.currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
        </div>
        <div class="flex space-x-2">
          <button @click="viewAccount(account.id)" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded transition-colors">View</button>
          <button @click="editAccount(account.id)" class="flex-1 bg-green-50 hover:bg-green-100 text-green-600 font-medium py-2 px-4 rounded transition-colors">Edit</button>
          <button @click="deleteAccount(account.id)" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="txn in recentTransactions" :key="txn.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(txn.date) }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ txn.description }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ txn.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-semibold" :class="txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'">
                {{ txn.type === 'deposit' ? '+' : '-' }}${{ txn.amount.toLocaleString('en-US', {minimumFractionDigits: 2}) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatusClass(txn.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ txn.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Add Bank Account</h2>
        <form @submit.prevent="submitAccount" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input v-model="formData.accountName" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input v-model="formData.bankName" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input v-model="formData.accountNumber" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select v-model="formData.accountType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="money_market">Money Market</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Linked GL account</label>
              <select v-model="formData.chartOfAccountsEntry" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="" disabled>Select cash/asset account...</option>
                <option v-for="a in coaAccounts" :key="a._id || a.id" :value="a._id || a.id">
                  {{ a.accountCode }} - {{ a.accountName }}
                </option>
              </select>
              <p v-if="!coaAccounts.length" class="text-xs text-gray-500 mt-1">No asset accounts found. Seed Chart of Accounts first.</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
              <input v-model.number="formData.currentBalance" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="flex items-end">
              <label class="flex items-center space-x-2">
                <input v-model="formData.isPrimary" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                <span class="text-sm font-medium text-gray-700">Set as Primary</span>
              </label>
            </div>
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
import { ref, onMounted } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const showCreateModal = ref(false);
const isLoading = ref(false);
const error = ref(null);

const formData = ref({
  accountName: '',
  bankName: '',
  accountNumber: '',
  accountType: 'checking',
  currentBalance: 0,
  isPrimary: false,
  chartOfAccountsEntry: ''
});

const bankAccounts = ref([]);
const selectedAccountId = ref(null);
const recentTransactions = ref([]);
const coaAccounts = ref([]);

const maskAccount = (num) => (num ? `****${String(num).slice(-4)}` : '****');

const fetchAccounts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await financeService.getBankAccounts({ limit: 100 });
    const accounts = data?.data || [];
    bankAccounts.value = accounts.map(a => ({
      id: a._id || a.id,
      accountName: a.accountName || a.name || 'Bank Account',
      bankName: a.bankName || a.institution || '',
      accountNumberMasked: maskAccount(a.accountNumber || a.number),
      accountType: a.accountType || a.type,
      currentBalance: Number(a.currentBalance || 0),
      isPrimary: !!a.isPrimary
    }));
    // select primary or first
    const primary = bankAccounts.value.find(a => a.isPrimary) || bankAccounts.value[0];
    selectedAccountId.value = primary ? primary.id : null;
    if (selectedAccountId.value) await fetchTransactions(selectedAccountId.value);
  } catch (e) {
    error.value = e?.message || 'Failed to load bank accounts';
  } finally {
    isLoading.value = false;
  }
};

const fetchTransactions = async (accountId) => {
  try {
    const data = await financeService.getBankAccountTransactions(accountId, { limit: 10 });
    const txns = Array.isArray(data?.data) ? data.data : [];
    recentTransactions.value = txns.map((t, idx) => ({
      id: t._id || idx,
      date: t.transactionDate || t.entryDate || t.date || t.createdAt || new Date().toISOString(),
      description: t.description || t.memo || 'Transaction',
      // Prefer explicit amount; else derive from debit/credit when present
      amount: Number(
        t.amount !== undefined ? t.amount : ((t.debit !== undefined || t.credit !== undefined) ? ((t.debit || 0) - (t.credit || 0)) : 0)
      ),
      type: t.transactionType || t.type || ((t.debit || 0) > 0 ? 'withdrawal' : 'deposit'),
      status: t.status || (t.isReconciled ? 'reconciled' : 'pending')
    }));
  } catch (e) {
    console.error('Failed to load transactions', e);
    recentTransactions.value = [];
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const getStatusClass = (status) => ({
  reconciled: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
}[status] || 'bg-gray-100 text-gray-800');

const viewAccount = async (id) => {
  selectedAccountId.value = id;
  await fetchTransactions(id);
};

const editAccount = (id) => {
  // Future: open edit modal prefilled
  console.log('Edit account:', id);
};

const deleteAccount = async (id) => {
  // Future: call delete API; for now, optimistic remove
  bankAccounts.value = bankAccounts.value.filter(acc => acc.id !== id);
};

const submitAccount = async () => {
  try {
    if (!formData.value.chartOfAccountsEntry) {
      alert('Please select a linked GL account');
      return;
    }
    const payload = {
      accountName: formData.value.accountName,
      bankName: formData.value.bankName,
      accountNumber: formData.value.accountNumber,
      accountType: formData.value.accountType,
      currentBalance: Number(formData.value.currentBalance) || 0,
      isPrimary: !!formData.value.isPrimary,
      chartOfAccountsEntry: formData.value.chartOfAccountsEntry
    };
    await financeService.createBankAccount(payload);
    showCreateModal.value = false;
    formData.value = { accountName: '', bankName: '', accountNumber: '', accountType: 'checking', currentBalance: 0, isPrimary: false, chartOfAccountsEntry: '' };
    await fetchAccounts();
  } catch (e) {
    alert(e?.message || 'Failed to add bank account');
  }
};

const fetchCoaAccounts = async () => {
  try {
    const data = await financeService.getChartOfAccounts({ accountType: 'asset', isActive: true, limit: 200 });
    const accounts = data?.accounts || data || [];
    // Prefer accounts flagged as bankAccount; fallback to cash_and_equivalents or current_asset
    const bankFlagged = accounts.filter(a => a.bankAccount === true);
    coaAccounts.value = (bankFlagged.length ? bankFlagged : accounts).sort((a,b) => (a.accountCode||'').localeCompare(b.accountCode||''));
  } catch (e) {
    console.error('Failed to load chart of accounts', e);
    coaAccounts.value = [];
  }
};

onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchCoaAccounts()]);
});
</script>

<style scoped>
.bank-accounts-page {
  padding: 2rem;
}
</style>

