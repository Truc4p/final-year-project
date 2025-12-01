<template>
  <div class="financial-reports-page">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Financial Reports</h1>
      <p class="text-gray-600 mt-2">View comprehensive financial statements and reports</p>
    </div>

    <!-- Report Selection -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div 
        v-for="report in availableReports" 
        :key="report.id"
        @click="selectReport(report.id)"
        :class="selectedReport === report.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
        class="bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all"
      >
        <div class="flex items-center space-x-3 mb-3">
          <div :class="report.color" class="rounded-lg p-3">
            <component :is="report.icon" class="w-6 h-6 text-white"></component>
          </div>
          <h3 class="font-semibold text-gray-900">{{ report.name }}</h3>
        </div>
        <p class="text-sm text-gray-600">{{ report.description }}</p>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select v-model="reportFilters.period" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="current_month">Current Month</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="current_year">Current Year</option>
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="last_year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div v-if="reportFilters.period === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input v-model="reportFilters.fromDate" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div v-if="reportFilters.period === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input v-model="reportFilters.toDate" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div v-else class="flex items-end">
          <button @click="generateReport" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>

    <!-- Income Statement -->
    <div v-if="selectedReport === 'income_statement'" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Income Statement</h2>
      <div class="space-y-4">
        <!-- Revenue Section -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Revenue</h3>
          <div class="space-y-2 ml-4 mb-4">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Sales Revenue</span>
              <span class="font-semibold text-gray-900">$125,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Service Revenue</span>
              <span class="font-semibold text-gray-900">$45,000.00</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Total Revenue</span>
            <span>$170,000.00</span>
          </div>
        </div>

        <!-- Expenses Section -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Expenses</h3>
          <div class="space-y-2 ml-4 mb-4">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Cost of Goods Sold</span>
              <span class="font-semibold text-gray-900">$45,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Salaries Expense</span>
              <span class="font-semibold text-gray-900">$35,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Rent Expense</span>
              <span class="font-semibold text-gray-900">$12,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Utilities Expense</span>
              <span class="font-semibold text-gray-900">$3,000.00</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-orange-50 px-4 rounded font-semibold">
            <span>Total Expenses</span>
            <span>$95,000.00</span>
          </div>
        </div>

        <!-- Net Income -->
        <div class="mt-6">
          <div class="flex justify-between py-3 bg-green-50 px-4 rounded-lg font-bold text-lg">
            <span>Net Income</span>
            <span class="text-green-600">$75,000.00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Balance Sheet -->
    <div v-if="selectedReport === 'balance_sheet'" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Balance Sheet</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Assets -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Assets</h3>
          <div class="space-y-2 mb-4">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Cash</span>
              <span class="font-semibold text-gray-900">$55,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Accounts Receivable</span>
              <span class="font-semibold text-gray-900">$25,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Inventory</span>
              <span class="font-semibold text-gray-900">$45,000.00</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Total Assets</span>
            <span>$125,000.00</span>
          </div>
        </div>

        <!-- Liabilities & Equity -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Liabilities & Equity</h3>
          <div class="space-y-2 mb-4">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Accounts Payable</span>
              <span class="font-semibold text-gray-900">$15,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Owner Capital</span>
              <span class="font-semibold text-gray-900">$100,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Retained Earnings</span>
              <span class="font-semibold text-gray-900">$10,000.00</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Total Liabilities & Equity</span>
            <span>$125,000.00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Flow Statement -->
    <div v-if="selectedReport === 'cash_flow'" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Cash Flow Statement</h2>
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Operating Activities</h3>
          <div class="space-y-2 ml-4 mb-4">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Net Income</span>
              <span class="font-semibold text-gray-900">$75,000.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Depreciation</span>
              <span class="font-semibold text-gray-900">$5,000.00</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Net Cash from Operations</span>
            <span>$80,000.00</span>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Investing Activities</h3>
          <div class="space-y-2 ml-4 mb-4">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-700">Equipment Purchase</span>
              <span class="font-semibold text-gray-900">-$10,000.00</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Net Cash from Investing</span>
            <span>-$10,000.00</span>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex justify-between py-3 bg-green-50 px-4 rounded-lg font-bold text-lg">
            <span>Net Change in Cash</span>
            <span class="text-green-600">$70,000.00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div class="flex justify-end space-x-3">
      <button @click="exportPDF" class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        Export as PDF
      </button>
      <button @click="exportExcel" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        Export as Excel
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { t } = useI18n();

const selectedReport = ref('income_statement');
const reportFilters = ref({
  period: 'current_month',
  fromDate: '',
  toDate: ''
});

const availableReports = ref([
  {
    id: 'income_statement',
    name: 'Income Statement',
    description: 'Revenue, expenses, and net income',
    icon: 'svg',
    color: 'bg-blue-500'
  },
  {
    id: 'balance_sheet',
    name: 'Balance Sheet',
    description: 'Assets, liabilities, and equity',
    icon: 'svg',
    color: 'bg-green-500'
  },
  {
    id: 'cash_flow',
    name: 'Cash Flow Statement',
    description: 'Operating, investing, and financing activities',
    icon: 'svg',
    color: 'bg-purple-500'
  }
]);

const selectReport = (reportId) => {
  selectedReport.value = reportId;
};

const generateReport = () => {
  console.log('Generate report:', selectedReport.value, reportFilters.value);
};

const exportPDF = () => {
  console.log('Export as PDF');
};

const exportExcel = () => {
  console.log('Export as Excel');
};
</script>

<style scoped>
.financial-reports-page {
  padding: 2rem;
}
</style>

