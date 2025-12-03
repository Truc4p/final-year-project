<template>
  <div class="bank-accounts-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Bank Accounts</h1>
        <p class="text-gray-600 mt-2">Manage your bank accounts and transactions</p>
      </div>
      <div class="flex gap-3">
        <button @click="showConnectEmailModal = true" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Connect Email
        </button>
      <button @click="showCreateModal = true" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Add Bank Account
      </button>
      </div>
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
          <p class="text-2xl font-bold text-gray-900">{{ formatVND(account.currentBalance) }}</p>
        </div>
        <div class="flex space-x-2">
          <button @click="viewAccount(account.id)" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded transition-colors">View</button>
          <button @click="syncAccountTransactions(account.id)" class="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium py-2 px-4 rounded transition-colors">Sync</button>
          <button v-if="isTimo(account)" @click="syncTimoHistory(account.id)" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-2 px-4 rounded transition-colors">Sync Timo history</button>
          <button @click="clearPlaceholders(account.id)" class="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2 px-4 rounded transition-colors">Clear placeholders</button>
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
              <td class="px-6 py-4 text-sm text-gray-900">{{ sanitizeDesc(txn.description) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ txn.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-semibold" :class="txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'">
                {{ txn.type === 'deposit' ? '+' : '-' }}{{ formatVND(txn.amount) }}
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

    <!-- Connect Email Modal -->
    <div v-if="showConnectEmailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Connect Email for Bank Notifications</h2>
        <p class="text-gray-600 mb-6">Connect your email account to automatically parse bank transaction notifications and sync them to your accounts.</p>
        
        <form @submit.prevent="submitEmailConnection" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Provider</label>
              <div class="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700">Gmail</div>
              <p class="text-xs text-gray-500 mt-1">Use a Gmail App Password (16 characters).</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input v-model="emailFormData.bankName" type="text" placeholder="e.g., Timo Digital Bank" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input v-model="emailFormData.email" type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password / App Password</label>
            <p class="text-xs text-gray-500 mb-2">For Gmail: Use a 16-character App Password (not your normal password). Ensure IMAP is enabled in Gmail settings.</p>
            <input v-model="emailFormData.password" type="password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
          </div>



          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Linked Bank Account</label>
            <select v-model="emailFormData.bankAccountId" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="">Select a bank account...</option>
              <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                {{ account.accountName }} ({{ account.bankName }})
              </option>
            </select>
          </div>

          <div class="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
            <input v-model="emailFormData.autoSync" type="checkbox" id="autoSync" class="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500">
            <label for="autoSync" class="text-sm font-medium text-gray-700">Auto-sync transactions daily</label>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button @click="showConnectEmailModal = false" type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" @click="testEmailConnection" class="px-6 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg transition-colors">Test Connection</button>
            <button type="submit" :disabled="isLoading" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ isLoading ? 'Connecting...' : 'Connect Email' }}
            </button>
          </div>
        </form>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Opening balance (optional)</label>
              <input v-model.number="formData.openingBalance" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Opening balance date</label>
              <input v-model="formData.openingBalanceDate" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
const showConnectEmailModal = ref(false);
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

const emailFormData = ref({
  provider: 'gmail',
  bankName: '',
  email: '',
  password: '',
  imapServer: '',
  imapPort: 993,
  bankAccountId: '',
  autoSync: false
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

// Format numbers as Vietnamese Dong, e.g., 2.000.000 VND
const formatVND = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND`;
};

const sanitizeDesc = (input) => {
  if (!input) return '';
  let s = String(input);
  // Remove leading label
  s = s.replace(/^Mô tả:\s*/i, '');
  // Cut off common footer/signature phrases and everything after them
  const cutters = [
    /Cảm ơn Quý khách[\s\S]*$/i,
    /Trân trọng[\s\S]*$/i,
    /Timo\s+Digital\s+Bank\s+by\s+BVBank[\s\S]*$/i,
    /Timo\s+Support[\s\S]*$/i
  ];
  for (const c of cutters) s = s.replace(c, '');
  // Collapse spaces
  s = s.replace(/\s+/g, ' ').trim();
  return s.slice(0, 160);
};

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
  if (!confirm('Are you sure you want to delete this bank account?')) {
    return;
  }

  try {
    isLoading.value = true;
    await financeService.deleteBankAccount(id);
    
    // Remove from local state after successful deletion
    bankAccounts.value = bankAccounts.value.filter(acc => acc.id !== id);
    
    // If the deleted account was selected, select another one
    if (selectedAccountId.value === id) {
      selectedAccountId.value = bankAccounts.value[0]?.id || null;
      if (selectedAccountId.value) {
        await fetchTransactions(selectedAccountId.value);
      } else {
        recentTransactions.value = [];
      }
    }
  } catch (e) {
    alert(e?.message || 'Failed to delete bank account');
    // Refresh the list to ensure we have the latest data
    await fetchAccounts();
  } finally {
    isLoading.value = false;
  }
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

const testEmailConnection = async () => {
  try {
    isLoading.value = true;
    const testData = {
      provider: 'gmail',
      email: emailFormData.value.email,
      password: emailFormData.value.password
    };
    await financeService.testEmailConnection(testData);
    alert('✅ Email connection successful!');
  } catch (e) {
    alert('❌ Connection failed: ' + (e?.message || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

const submitEmailConnection = async () => {
  try {
    if (!emailFormData.value.bankAccountId) {
      alert('Please select a linked bank account');
      return;
    }

    isLoading.value = true;
    const payload = {
      provider: emailFormData.value.provider,
      bankName: emailFormData.value.bankName,
      email: emailFormData.value.email,
      password: emailFormData.value.password,
      imapServer: emailFormData.value.imapServer,
      imapPort: emailFormData.value.imapPort,
      bankAccountId: emailFormData.value.bankAccountId,
      autoSync: emailFormData.value.autoSync
    };

    // Keep selected account id before reset
    const linkedBankAccountId = emailFormData.value.bankAccountId;

    await financeService.connectEmailAccount(payload);
    
    alert('✅ Email account connected successfully!');
    showConnectEmailModal.value = false;
    emailFormData.value = {
      provider: 'gmail',
      bankName: '',
      email: '',
      password: '',
      imapServer: '',
      imapPort: 993,
      bankAccountId: '',
      autoSync: false
    };

    // Sync transactions immediately
    await syncAccountTransactions(linkedBankAccountId);
  } catch (e) {
    alert('❌ Failed to connect email: ' + (e?.message || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

const syncAccountTransactions = async (accountId) => {
  try {
    isLoading.value = true;
    const res = await financeService.syncEmailTransactions(accountId);

    // Refresh transactions
    await fetchTransactions(accountId);

    const synced = Number(res?.transactionsSynced || 0);
    const found = Number(res?.totalTransactionsFound || 0);

    if (synced === 0) {
      alert(`ℹ️ No new transactions found in email. Scanned ${found} message(s).`);
    } else {
      alert(`✅ Synced ${synced} new transaction(s) from ${found} email(s).`);
    }
  } catch (e) {
    console.error('Sync failed:', e);
    alert('⚠️ Sync completed with status: ' + (e?.message || 'Check console for details'));
  } finally {
    isLoading.value = false;
  }
};

const isTimo = (account) => /timo|bvbank/i.test(account?.bankName || '');

const syncTimoHistory = async (accountId) => {
  try {
    isLoading.value = true;
    const params = {
      fullHistory: 'true',
      from: 'support@timo.vn',
      subject: 'Thông báo thay đổi số dư tài khoản',
      limit: '1000'
    };
    const res = await financeService.syncEmailTransactions(accountId, params);

    await fetchTransactions(accountId);

    const synced = Number(res?.transactionsSynced || 0);
    const found = Number(res?.totalTransactionsFound || 0);

    if (synced === 0) {
      alert(`ℹ️ No new transactions found from Timo. Scanned ${found} message(s).`);
    } else {
      alert(`✅ Synced ${synced} Timo transaction(s) from ${found} email(s).`);
    }
  } catch (e) {
    console.error('Sync failed:', e);
    alert('⚠️ Sync completed with status: ' + (e?.message || 'Check console for details'));
  } finally {
    isLoading.value = false;
  }
};

const clearPlaceholders = async (accountId) => {
  if (!confirm('Remove placeholder transactions (e.g., default description or zero/tiny amounts)?')) return;
  try {
    isLoading.value = true;
    // Remove transactions that look like placeholders: default description contains 'Transaction' and tiny amounts
    const filters = {
      descriptionContains: 'Transaction',
      maxAmount: 10 // remove amounts <= 10 (e.g., $0.00, $2.00 placeholders)
    };
    const res = await financeService.cleanupBankTransactions(accountId, filters);
    await fetchTransactions(accountId);
    alert(`✅ ${res?.removed || 0} placeholder transaction(s) removed. New balance: ${res?.newBalance ?? 'n/a'}`);
  } catch (e) {
    console.error('Cleanup failed:', e);
    alert('❌ Cleanup failed: ' + (e?.message || 'Check console for details'));
  } finally {
    isLoading.value = false;
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

