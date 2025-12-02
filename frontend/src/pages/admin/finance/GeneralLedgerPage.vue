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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import financeService from '@/services/financeService';

const { t } = useI18n();
const route = useRoute();

const filters = ref({
  search: '',
  account: '',
  dateFrom: '',
  dateTo: ''
});

const loading = ref(false);
const error = ref(null);
const journalEntries = ref([]);
const trialBalance = ref([]);

const fetchGL = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {};
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.account) params.account = filters.value.account;
    if (filters.value.dateFrom) params.dateFrom = filters.value.dateFrom;
    if (filters.value.dateTo) params.dateTo = filters.value.dateTo;

    const data = await financeService.getJournalEntries(params);
    const entries = data?.entries || [];
    journalEntries.value = entries.map(e => ({
      id: e.id,
      entryNumber: e.entryNumber,
      date: e.date,
      account: e.account,
      description: e.description,
      debit: e.debit,
      credit: e.credit,
      status: e.status
    }));

    const tb = await financeService.getTrialBalance({ asOfDate: filters.value.dateTo || undefined });
    trialBalance.value = (tb?.accounts || []).map(a => ({ id: a.id, name: a.name, debit: a.debit, credit: a.credit }));
  } catch (e) {
    error.value = e?.message || 'Failed to load general ledger';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // If entryNumber passed from Bill/Invoice detail, prefill search
  const jeNum = route.query.entryNumber;
  if (jeNum) filters.value.search = String(jeNum);
  await fetchGL();
});

watch(() => [filters.value.search, filters.value.account, filters.value.dateFrom, filters.value.dateTo], fetchGL);

const filteredEntries = computed(() => {
  // Additional client-side filter if needed (server already filters by params)
  return journalEntries.value;
});

const totalDebits = computed(() => filteredEntries.value.reduce((s, e) => s + (e.debit || 0), 0));
const totalCredits = computed(() => filteredEntries.value.reduce((s, e) => s + (e.credit || 0), 0));
const difference = computed(() => totalDebits.value - totalCredits.value);

const trialBalanceTotalDebit = computed(() => trialBalance.value.reduce((s, a) => s + (a.debit || 0), 0));
const trialBalanceTotalCredit = computed(() => trialBalance.value.reduce((s, a) => s + (a.credit || 0), 0));

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const getStatusClass = (status) => ({ 'draft': 'bg-gray-100 text-gray-800', 'posted': 'bg-green-100 text-green-800', 'reversed': 'bg-red-100 text-red-800' }[status] || 'bg-gray-100 text-gray-800');

const viewEntry = (id) => { console.log('View entry:', id); };
const editEntry = (id) => { console.log('Edit entry:', id); };
const deleteEntry = (id) => { /* future */ };
</script>

<style scoped>
.general-ledger-page {
  padding: 2rem;
}
</style>

