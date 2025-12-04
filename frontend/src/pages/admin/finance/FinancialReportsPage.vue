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
          <select 
            v-model="reportFilters.period" 
            @change="onPeriodChange"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
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
          <input 
            v-model="reportFilters.fromDate" 
            type="date" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div v-if="reportFilters.period === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input 
            v-model="reportFilters.toDate" 
            type="date" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div v-if="reportFilters.period !== 'custom'" class="flex items-end">
          <button 
            @click="generateReport" 
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
        </div>
        <div v-else class="flex items-end gap-2">
          <button 
            @click="generateReport" 
            :disabled="loading || !reportFilters.fromDate || !reportFilters.toDate"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 text-center">
      <div class="inline-block">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <p class="text-gray-600 mt-4">Loading report data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800 font-medium">Error loading report</p>
      <p class="text-red-600 text-sm mt-1">{{ error }}</p>
      <button 
        @click="error = null"
        class="text-red-600 hover:text-red-800 text-sm mt-2 underline"
      >
        Dismiss
      </button>
    </div>

    <!-- Report Container for Export -->
    <div ref="reportRef">
    <!-- Income Statement -->
      <div v-if="selectedReport === 'income_statement' && !loading" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Income Statement</h2>
      <div class="space-y-4">
        <!-- Revenue Section -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Revenue</h3>
          <div class="space-y-2 ml-4 mb-4">
              <div 
                v-for="item in incomeStatement.revenue" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900">${{ formatCurrency(item.amount) }}</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Total Revenue</span>
              <span>${{ formatCurrency(incomeStatement.totalRevenue) }}</span>
          </div>
        </div>

        <!-- Expenses Section -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Expenses</h3>
          <div class="space-y-2 ml-4 mb-4">
              <div 
                v-for="item in incomeStatement.expenses" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900">${{ formatCurrency(item.amount) }}</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-orange-50 px-4 rounded font-semibold">
            <span>Total Expenses</span>
              <span>${{ formatCurrency(incomeStatement.totalExpenses) }}</span>
          </div>
        </div>

        <!-- Net Income -->
        <div class="mt-6">
          <div class="flex justify-between py-3 bg-green-50 px-4 rounded-lg font-bold text-lg">
            <span>Net Income</span>
              <span :class="incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ formatCurrency(incomeStatement.netIncome) }}
              </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Balance Sheet -->
      <div v-if="selectedReport === 'balance_sheet' && !loading" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Balance Sheet</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Assets -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Assets</h3>
          <div class="space-y-2 mb-4">
              <div 
                v-for="item in balanceSheet.assets" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900">${{ formatCurrency(item.amount) }}</span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Total Assets</span>
              <span>${{ formatCurrency(balanceSheet.totalAssets) }}</span>
          </div>
        </div>

        <!-- Liabilities & Equity -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Liabilities & Equity</h3>
          <div class="space-y-2 mb-4">
              <div 
                v-for="item in balanceSheet.liabilitiesAndEquity" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900">${{ formatCurrency(item.amount) }}</span>
            </div>
            </div>
            <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
              <span>Total Liabilities & Equity</span>
              <span>${{ formatCurrency(balanceSheet.totalLiabilitiesAndEquity) }}</span>
            </div>
          </div>
          </div>
        
        <!-- Balance Check -->
        <div class="mt-6 p-4 rounded-lg" :class="balanceSheet.isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <p :class="balanceSheet.isBalanced ? 'text-green-800' : 'text-red-800'" class="font-semibold">
            {{ balanceSheet.isBalanced ? '✓ Balance Sheet is Balanced' : '✗ Balance Sheet is NOT Balanced' }}
          </p>
          <p :class="balanceSheet.isBalanced ? 'text-green-600' : 'text-red-600'" class="text-sm mt-1">
            Assets: ${{ formatCurrency(balanceSheet.totalAssets) }} | Liabilities & Equity: ${{ formatCurrency(balanceSheet.totalLiabilitiesAndEquity) }}
          </p>
      </div>
    </div>

    <!-- Cash Flow Statement -->
      <div v-if="selectedReport === 'cash_flow' && !loading" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Cash Flow Statement</h2>
      <div class="space-y-4">
          <!-- Operating Activities -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Operating Activities</h3>
          <div class="space-y-2 ml-4 mb-4">
              <div 
                v-for="item in cashFlowStatement.operatingActivities" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900" :class="item.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  ${{ formatCurrency(item.amount) }}
                </span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
            <span>Net Cash from Operations</span>
              <span :class="cashFlowStatement.netCashFromOperations >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ formatCurrency(cashFlowStatement.netCashFromOperations) }}
              </span>
          </div>
        </div>

          <!-- Investing Activities -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Investing Activities</h3>
          <div class="space-y-2 ml-4 mb-4">
              <div 
                v-for="item in cashFlowStatement.investingActivities" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900" :class="item.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  ${{ formatCurrency(item.amount) }}
                </span>
              </div>
            </div>
            <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
              <span>Net Cash from Investing</span>
              <span :class="cashFlowStatement.netCashFromInvesting >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ formatCurrency(cashFlowStatement.netCashFromInvesting) }}
              </span>
            </div>
          </div>

          <!-- Financing Activities -->
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Financing Activities</h3>
            <div class="space-y-2 ml-4 mb-4">
              <div 
                v-for="item in cashFlowStatement.financingActivities" 
                :key="item.id"
                class="flex justify-between py-2 border-b border-gray-200"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <span class="font-semibold text-gray-900" :class="item.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  ${{ formatCurrency(item.amount) }}
                </span>
            </div>
          </div>
          <div class="flex justify-between py-2 bg-blue-50 px-4 rounded font-semibold">
              <span>Net Cash from Financing</span>
              <span :class="cashFlowStatement.netCashFromFinancing >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ formatCurrency(cashFlowStatement.netCashFromFinancing) }}
              </span>
          </div>
        </div>

          <!-- Net Change in Cash -->
        <div class="mt-6">
          <div class="flex justify-between py-3 bg-green-50 px-4 rounded-lg font-bold text-lg">
            <span>Net Change in Cash</span>
              <span :class="cashFlowStatement.netChangeInCash >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ formatCurrency(cashFlowStatement.netChangeInCash) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div v-if="!loading" class="flex justify-end space-x-3">
      <button 
        @click="exportPDF" 
        :disabled="loading || exportingPdf || exportingExcel"
        class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        <span v-if="exportingPdf">Exporting…</span>
        <span v-else>Export as PDF</span>
      </button>
      <button 
        @click="exportExcel" 
        :disabled="loading || exportingPdf || exportingExcel"
        class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        <span v-if="exportingExcel">Exporting…</span>
        <span v-else>Export as Excel</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted, nextTick } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

// DOM ref for report capture/export
const reportRef = ref(null);

const selectedReport = ref('income_statement');
const loading = ref(false);
const error = ref(null);

const reportFilters = ref({
  period: 'current_month',
  fromDate: '',
  toDate: ''
});

// Income Statement Data
const incomeStatement = ref({
  revenue: [],
  totalRevenue: 0,
  expenses: [],
  totalExpenses: 0,
  netIncome: 0
});

// Balance Sheet Data
const balanceSheet = ref({
  assets: [],
  totalAssets: 0,
  liabilitiesAndEquity: [],
  totalLiabilitiesAndEquity: 0,
  isBalanced: false
});

// Cash Flow Statement Data
const cashFlowStatement = ref({
  operatingActivities: [],
  netCashFromOperations: 0,
  investingActivities: [],
  netCashFromInvesting: 0,
  financingActivities: [],
  netCashFromFinancing: 0,
  netChangeInCash: 0
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
  generateReport();
};

const onPeriodChange = () => {
  // Auto-generate report when period changes
  if (reportFilters.value.period !== 'custom') {
    generateReport();
  }
};

// Normalize helpers to prevent NaN values from backend variations
function normalizeLineItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((it, idx) => {
    const id = it?.id ?? it?.accountCode ?? `${it?.name ?? it?.accountName ?? 'item'}-${idx}`;

    // Prefer explicit name, else derive from account fields or description
    const derivedName = it?.name
      ?? (it?.accountCode && it?.accountName ? `${it.accountCode} - ${it.accountName}` : undefined)
      ?? it?.accountName
      ?? it?.description
      ?? it?.category
      ?? 'Unnamed';

    // Prefer amount, else use balance/value/total, else cents field
    let amountRaw = it?.amount;
    if (amountRaw === undefined) amountRaw = it?.balance;
    if (amountRaw === undefined) amountRaw = it?.value;
    if (amountRaw === undefined) amountRaw = it?.total;
    if (amountRaw === undefined && typeof it?.amountCents === 'number') amountRaw = it.amountCents / 100;

    return {
      id,
      name: derivedName,
      amount: toNumber(amountRaw)
    };
  });
}

function normalizeIncomeStatement(data = {}) {
  // Backend may return revenue/expenses as objects { items, total }
  const revenueItemsRaw = Array.isArray(data.revenue)
    ? data.revenue
    : (Array.isArray(data.revenue?.items) ? data.revenue.items : []);
  const expenseItemsRaw = Array.isArray(data.expenses)
    ? data.expenses
    : (Array.isArray(data.expenses?.items) ? data.expenses.items : []);

  const revenue = normalizeLineItems(revenueItemsRaw);
  const expenses = normalizeLineItems(expenseItemsRaw);

  const totalRevenue = (() => {
    const direct = toNumber(data.totalRevenue ?? data.revenue?.total);
    if (!isNaN(direct) && direct !== 0) return direct;
    return revenue.reduce((s, r) => s + toNumber(r.amount), 0);
  })();

  const totalExpenses = (() => {
    const direct = toNumber(data.totalExpenses ?? data.expenses?.total);
    if (!isNaN(direct) && direct !== 0) return direct;
    return expenses.reduce((s, e) => s + toNumber(e.amount), 0);
  })();

  const netIncomeProvided = toNumber(data.netIncome);
  const netIncome = (data.netIncome !== undefined && !isNaN(netIncomeProvided))
    ? netIncomeProvided
    : totalRevenue - totalExpenses;

  return {
    revenue,
    totalRevenue,
    expenses,
    totalExpenses,
    netIncome
  };
}

function normalizeBalanceSheet(data = {}) {
  // Backend returns objects: assets { items, total }, liabilities { items, total }, equity { items, total }
  const assetItemsRaw = Array.isArray(data.assets)
    ? data.assets
    : (Array.isArray(data.assets?.items) ? data.assets.items : []);
  const liabilityItemsRaw = Array.isArray(data.liabilities)
    ? data.liabilities
    : (Array.isArray(data.liabilities?.items) ? data.liabilities.items : []);
  const equityItemsRaw = Array.isArray(data.equity)
    ? data.equity
    : (Array.isArray(data.equity?.items) ? data.equity.items : []);

  const assets = normalizeLineItems(assetItemsRaw);
  const liabilities = normalizeLineItems(liabilityItemsRaw);
  const equity = normalizeLineItems(equityItemsRaw);

  let liabilitiesAndEquity = normalizeLineItems(data.liabilitiesAndEquity);
  if (liabilitiesAndEquity.length === 0) {
    liabilitiesAndEquity = [...liabilities, ...equity];
  }

  const totalAssets = (() => {
    const direct = toNumber(data.totalAssets ?? data.assets?.total);
    if (!isNaN(direct) && direct !== 0) return direct;
    return assets.reduce((s, a) => s + toNumber(a.amount), 0);
  })();

  const totalLiabilitiesAndEquity = (() => {
    const fromCombined = toNumber(data.totalLiabilitiesAndEquity);
    const fromParts = toNumber(data.totalLiabilities ?? data.liabilities?.total) + toNumber(data.totalEquity ?? data.equity?.total);
    const direct = !isNaN(fromCombined) && fromCombined !== 0 ? fromCombined : fromParts;
    if (!isNaN(direct) && direct !== 0) return direct;
    return liabilitiesAndEquity.reduce((s, le) => s + toNumber(le.amount), 0);
  })();

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return {
    assets,
    totalAssets,
    liabilitiesAndEquity,
    totalLiabilitiesAndEquity,
    isBalanced
  };
}

function normalizeCashFlow(data = {}) {
  const operatingActivities = normalizeLineItems(data.operatingActivities);
  const investingActivities = normalizeLineItems(data.investingActivities);
  const financingActivities = normalizeLineItems(data.financingActivities);

  const netCashFromOperations = (() => {
    const n = toNumber(data.netCashFromOperations);
    if (data.netCashFromOperations !== undefined && !isNaN(n)) return n;
    return operatingActivities.reduce((s, a) => s + toNumber(a.amount), 0);
  })();

  const netCashFromInvesting = (() => {
    const n = toNumber(data.netCashFromInvesting);
    if (data.netCashFromInvesting !== undefined && !isNaN(n)) return n;
    return investingActivities.reduce((s, a) => s + toNumber(a.amount), 0);
  })();

  const netCashFromFinancing = (() => {
    const n = toNumber(data.netCashFromFinancing);
    if (data.netCashFromFinancing !== undefined && !isNaN(n)) return n;
    return financingActivities.reduce((s, a) => s + toNumber(a.amount), 0);
  })();

  const netChangeInCash = (() => {
    const n = toNumber(data.netChangeInCash);
    if (data.netChangeInCash !== undefined && !isNaN(n)) return n;
    return netCashFromOperations + netCashFromInvesting + netCashFromFinancing;
  })();

  return {
    operatingActivities,
    netCashFromOperations,
    investingActivities,
    netCashFromInvesting,
    financingActivities,
    netCashFromFinancing,
    netChangeInCash
  };
}

const getDateRange = () => {
  const today = new Date();
  let startDate, endDate;

  switch (reportFilters.value.period) {
    case 'current_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
      break;
    case 'current_quarter':
      const quarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), quarter * 3, 1);
      endDate = today;
      break;
    case 'current_year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
      break;
    case 'last_month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'last_quarter':
      const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
      startDate = new Date(today.getFullYear(), lastQuarter * 3, 1);
      endDate = new Date(today.getFullYear(), lastQuarter * 3 + 3, 0);
      break;
    case 'last_year':
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      startDate = new Date(reportFilters.value.fromDate);
      endDate = new Date(reportFilters.value.toDate);
      break;
  }

  return { startDate, endDate };
};

const generateReport = async () => {
  if (reportFilters.value.period === 'custom' && (!reportFilters.value.fromDate || !reportFilters.value.toDate)) {
    error.value = 'Please select both from and to dates for custom range';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const { startDate, endDate } = getDateRange();
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };

    if (selectedReport.value === 'income_statement') {
      const data = await financeService.getIncomeStatement(params);
      incomeStatement.value = normalizeIncomeStatement(data);
    } else if (selectedReport.value === 'balance_sheet') {
      // Balance sheet is an as-of date report; backend expects ?asOfDate
      const bsParams = { asOfDate: endDate.toISOString().split('T')[0] };
      const data = await financeService.getBalanceSheet(bsParams);
      balanceSheet.value = normalizeBalanceSheet(data);
    } else if (selectedReport.value === 'cash_flow') {
      const data = await financeService.getCashFlowStatement(params);
      cashFlowStatement.value = normalizeCashFlow(data);
    }
  } catch (err) {
    console.error('Error generating report:', err);
    error.value = err.message || 'Failed to generate report. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Safely convert various inputs to a number
const toNumber = (val) => {
  if (typeof val === 'number' && isFinite(val)) return val;
  if (typeof val === 'string') {
    let s = val.trim();
    // Handle parentheses negatives e.g. (1,234.56)
    if (/^\(.*\)$/.test(s)) s = '-' + s.slice(1, -1);
    // Remove currency symbols and commas/spaces
    const n = parseFloat(s.replace(/[$,\s]/g, '').replace(/,/g, ''));
    if (!isNaN(n) && isFinite(n)) return n;
  }
  if (val == null) return 0;
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

const formatCurrency = (value) => {
  const n = toNumber(value);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const exportingPdf = ref(false);
const exportingExcel = ref(false);

const buildFileName = (ext) => {
  const { startDate, endDate } = getDateRange();
  const s = startDate.toISOString().split('T')[0];
  const e = endDate.toISOString().split('T')[0];
  const map = {
    income_statement: 'income-statement',
    balance_sheet: 'balance-sheet',
    cash_flow: 'cash-flow'
  };
  return `${map[selectedReport.value] || 'report'}_${s}_to_${e}.${ext}`;
};

const exportPDF = async () => {
  try {
    exportingPdf.value = true;
    await nextTick();

    const el = reportRef.value;
    if (!el) {
      alert('Nothing to export. Generate a report first.');
      return;
    }

    const [{ jsPDF }, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
    const html2canvas = html2canvasModule.default || html2canvasModule;

    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(buildFileName('pdf'));
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Please ensure dependencies are installed: npm i jspdf html2canvas');
  } finally {
    exportingPdf.value = false;
  }
};

const exportExcel = async () => {
  try {
    exportingExcel.value = true;

    const xlsxMod = await import('xlsx');
    const XLSX = xlsxMod.default || xlsxMod;

    const wb = XLSX.utils.book_new();

    const addSheet = (name, rows) => {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    };

    const currency = (v) => `${formatCurrency(v)}`;

    if (selectedReport.value === 'income_statement') {
      const rows = [];
      rows.push(['Income Statement']);
      rows.push([]);
      rows.push(['Revenue']);
      rows.push(['Name', 'Amount']);
      for (const r of incomeStatement.value.revenue) rows.push([r.name, currency(r.amount)]);
      rows.push(['Total Revenue', currency(incomeStatement.value.totalRevenue)]);
      rows.push([]);
      rows.push(['Expenses']);
      rows.push(['Name', 'Amount']);
      for (const e of incomeStatement.value.expenses) rows.push([e.name, currency(e.amount)]);
      rows.push(['Total Expenses', currency(incomeStatement.value.totalExpenses)]);
      rows.push([]);
      rows.push(['Net Income', currency(incomeStatement.value.netIncome)]);
      addSheet('Income Statement', rows);
    } else if (selectedReport.value === 'balance_sheet') {
      const rows = [];
      rows.push(['Balance Sheet']);
      rows.push([]);
      rows.push(['Assets']);
      rows.push(['Name', 'Amount']);
      for (const a of balanceSheet.value.assets) rows.push([a.name, currency(a.amount)]);
      rows.push(['Total Assets', currency(balanceSheet.value.totalAssets)]);
      rows.push([]);
      rows.push(['Liabilities & Equity']);
      rows.push(['Name', 'Amount']);
      for (const le of balanceSheet.value.liabilitiesAndEquity) rows.push([le.name, currency(le.amount)]);
      rows.push(['Total Liabilities & Equity', currency(balanceSheet.value.totalLiabilitiesAndEquity)]);
      addSheet('Balance Sheet', rows);
    } else if (selectedReport.value === 'cash_flow') {
      const rows = [];
      rows.push(['Cash Flow Statement']);
      rows.push([]);
      rows.push(['Operating Activities']);
      rows.push(['Name', 'Amount']);
      for (const o of cashFlowStatement.value.operatingActivities) rows.push([o.name, currency(o.amount)]);
      rows.push(['Net Cash from Operations', currency(cashFlowStatement.value.netCashFromOperations)]);
      rows.push([]);
      rows.push(['Investing Activities']);
      rows.push(['Name', 'Amount']);
      for (const i of cashFlowStatement.value.investingActivities) rows.push([i.name, currency(i.amount)]);
      rows.push(['Net Cash from Investing', currency(cashFlowStatement.value.netCashFromInvesting)]);
      rows.push([]);
      rows.push(['Financing Activities']);
      rows.push(['Name', 'Amount']);
      for (const f of cashFlowStatement.value.financingActivities) rows.push([f.name, currency(f.amount)]);
      rows.push(['Net Cash from Financing', currency(cashFlowStatement.value.netCashFromFinancing)]);
      rows.push([]);
      rows.push(['Net Change in Cash', currency(cashFlowStatement.value.netChangeInCash)]);
      addSheet('Cash Flow', rows);
    }

    XLSX.writeFile(wb, buildFileName('xlsx'));
  } catch (err) {
    console.error('Excel export failed:', err);
    alert('Excel export failed. Please ensure dependency is installed: npm i xlsx');
  } finally {
    exportingExcel.value = false;
  }
};

// Load initial report on mount
onMounted(() => {
  generateReport();
});
</script>

<style scoped>
.financial-reports-page {
  padding: 2rem;
}
</style>
