<template>
  <div class="finance-dashboard">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ t('finance') || 'Finance' }} Dashboard</h1>
      <p class="text-gray-600 mt-2">Manage your company's financial operations</p>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Revenue -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${{ totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Expenses -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Expenses</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${{ totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
          <div class="bg-red-100 rounded-full p-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4m0 0L3 5m0 0v8m0-8l8 8"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Net Income -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Net Income</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${{ netIncome.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Cash Balance -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Cash Balance</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${{ cashBalance.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Create Invoice -->
      <router-link to="/admin/finance/invoices" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="bg-blue-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Invoices</h3>
            <p class="text-sm text-gray-600">Manage customer invoices</p>
          </div>
        </div>
      </router-link>

      <!-- Create Bill -->
      <router-link to="/admin/finance/bills" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="bg-orange-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Bills</h3>
            <p class="text-sm text-gray-600">Manage vendor bills</p>
          </div>
        </div>
      </router-link>

      <!-- Bank Accounts -->
      <router-link to="/admin/finance/bank-accounts" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="bg-green-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Bank Accounts</h3>
            <p class="text-sm text-gray-600">Manage bank accounts</p>
          </div>
        </div>
      </router-link>

      <!-- Chart of Accounts -->
      <router-link to="/admin/finance/chart-of-accounts" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="bg-indigo-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Chart of Accounts</h3>
            <p class="text-sm text-gray-600">View account structure</p>
          </div>
        </div>
      </router-link>

      <!-- Financial Reports -->
      <router-link to="/admin/finance/reports" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="bg-pink-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Reports</h3>
            <p class="text-sm text-gray-600">View financial reports</p>
          </div>
        </div>
      </router-link>

      <!-- General Ledger -->
      <router-link to="/admin/finance/general-ledger" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-4">
          <div class="bg-cyan-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">General Ledger</h3>
            <p class="text-sm text-gray-600">View all transactions</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Recent Transactions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Invoices -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
            <div>
              <p class="font-medium text-gray-900">Invoice #{{ 1000 + i }}</p>
              <p class="text-sm text-gray-600">Customer Name</p>
            </div>
            <p class="font-semibold text-green-600">${{ (1000 * i).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
        </div>
        <router-link to="/admin/finance/invoices" class="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 inline-block">
          View All →
        </router-link>
      </div>

      <!-- Recent Bills -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Bills</h2>
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
            <div>
              <p class="font-medium text-gray-900">Bill #{{ 2000 + i }}</p>
              <p class="text-sm text-gray-600">Vendor Name</p>
            </div>
            <p class="font-semibold text-red-600">${{ (500 * i).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
        </div>
        <router-link to="/admin/finance/bills" class="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 inline-block">
          View All →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';

const { t } = useI18n();

// Sample data - replace with API calls
const totalRevenue = ref(125000);
const totalExpenses = ref(45000);
const netIncome = ref(80000);
const cashBalance = ref(55000);

onMounted(() => {
  // Fetch financial data from API
  // Example: fetchFinancialData();
});
</script>

<style scoped>
.finance-dashboard {
  padding: 2rem;
}
</style>

