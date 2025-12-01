<template>
  <div class="general-ledger-page">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">General Ledger</h1>
      <p class="text-gray-600 mt-2">View all journal entries and account transactions</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search entries..." 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.account" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Accounts</option>
          <option value="1000">1000 - Cash</option>
          <option value="1100">1100 - Accounts Receivable</option>
          <option value="2000">2000 - Accounts Payable</option>
          <option value="4000">4000 - Sales Revenue</option>
          <option value="5000">5000 - COGS</option>
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

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-600 text-sm font-medium">Total Debits</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">${{ totalDebits.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-600 text-sm font-medium">Total Credits</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">${{ totalCredits.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-600 text-sm font-medium">Difference</p>
        <p :class="difference === 0 ? 'text-green-600' : 'text-red-600'" class="text-2xl font-bold mt-2">
          ${{ Math.abs(difference).toLocaleString('en-US', {minimumFractionDigits: 2}) }}
        </p>
      </div>
    </div>

    <!-- Journal Entries Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Entry #</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Account</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
            <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Debit</th>
            <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Credit</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="entry in filteredEntries" :key="entry.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{{ entry.entryNumber }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(entry.date) }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ entry.account }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ entry.description }}</td>
            <td class="px-6 py-4 text-sm text-right font-semibold" :class="entry.debit > 0 ? 'text-blue-600' : 'text-gray-400'">
              {{ entry.debit > 0 ? '$' + entry.debit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-right font-semibold" :class="entry.credit > 0 ? 'text-green-600' : 'text-gray-400'">
              {{ entry.credit > 0 ? '$' + entry.credit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-' }}
            </td>
            <td class="px-6 py-4 text-sm">
              <span :class="getStatusClass(entry.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ entry.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="viewEntry(entry.id)" class="text-blue-600 hover:text-blue-800 font-medium">View</button>
              <button v-if="entry.status === 'draft'" @click="editEntry(entry.id)" class="text-green-600 hover:text-green-800 font-medium">Edit</button>
              <button v-if="entry.status === 'draft'" @click="deleteEntry(entry.id)" class="text-red-600 hover:text-red-800 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Trial Balance -->
    <div class="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Trial Balance</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Account</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Debit</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Credit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="account in trialBalance" :key="account.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ account.name }}</td>
              <td class="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                {{ account.debit > 0 ? '$' + account.debit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-right font-semibold text-green-600">
                {{ account.credit > 0 ? '$' + account.credit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-' }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 border-t-2 border-gray-300">
            <tr class="font-bold">
              <td class="px-6 py-4 text-sm text-gray-900">Totals</td>
              <td class="px-6 py-4 text-sm text-right text-blue-600">${{ trialBalanceTotalDebit.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
              <td class="px-6 py-4 text-sm text-right text-green-600">${{ trialBalanceTotalCredit.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';

const { t } = useI18n();

const filters = ref({
  search: '',
  account: '',
  dateFrom: '',
  dateTo: ''
});

// Sample data
const journalEntries = ref([
  { id: 1, entryNumber: 'JE-001', date: '2024-01-15', account: '1000 - Cash', description: 'Customer Payment - Invoice INV-001', debit: 5000, credit: 0, status: 'posted' },
  { id: 2, entryNumber: 'JE-001', date: '2024-01-15', account: '4000 - Sales Revenue', description: 'Customer Payment - Invoice INV-001', debit: 0, credit: 5000, status: 'posted' },
  { id: 3, entryNumber: 'JE-002', date: '2024-01-14', account: '5000 - COGS', description: 'Inventory Purchase', debit: 2000, credit: 0, status: 'posted' },
  { id: 4, entryNumber: 'JE-002', date: '2024-01-14', account: '2000 - Accounts Payable', description: 'Inventory Purchase', debit: 0, credit: 2000, status: 'posted' },
  { id: 5, entryNumber: 'JE-003', date: '2024-01-13', account: '5100 - Salaries', description: 'Monthly Payroll', debit: 3500, credit: 0, status: 'draft' },
]);

const trialBalance = ref([
  { id: 1, name: '1000 - Cash', debit: 55000, credit: 0 },
  { id: 2, name: '1100 - Accounts Receivable', debit: 25000, credit: 0 },
  { id: 3, name: '2000 - Accounts Payable', debit: 0, credit: 15000 },
  { id: 4, name: '3000 - Owner Capital', debit: 0, credit: 100000 },
  { id: 5, name: '4000 - Sales Revenue', debit: 0, credit: 125000 },
  { id: 6, name: '5000 - COGS', debit: 45000, credit: 0 },
  { id: 7, name: '5100 - Salaries', debit: 35000, credit: 0 },
]);

const filteredEntries = computed(() => {
  return journalEntries.value.filter(entry => {
    const matchesSearch = entry.entryNumber.includes(filters.value.search) ||
                         entry.description.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesAccount = !filters.value.account || entry.account.includes(filters.value.account);
    return matchesSearch && matchesAccount;
  });
});

const totalDebits = computed(() => {
  return filteredEntries.value.reduce((sum, entry) => sum + entry.debit, 0);
});

const totalCredits = computed(() => {
  return filteredEntries.value.reduce((sum, entry) => sum + entry.credit, 0);
});

const difference = computed(() => {
  return totalDebits.value - totalCredits.value;
});

const trialBalanceTotalDebit = computed(() => {
  return trialBalance.value.reduce((sum, account) => sum + account.debit, 0);
});

const trialBalanceTotalCredit = computed(() => {
  return trialBalance.value.reduce((sum, account) => sum + account.credit, 0);
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'posted': 'bg-green-100 text-green-800',
    'reversed': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const viewEntry = (id) => {
  console.log('View entry:', id);
};

const editEntry = (id) => {
  console.log('Edit entry:', id);
};

const deleteEntry = (id) => {
  journalEntries.value = journalEntries.value.filter(entry => entry.id !== id);
};
</script>

<style scoped>
.general-ledger-page {
  padding: 2rem;
}
</style>

