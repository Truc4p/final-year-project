<!-- src/pages/admin/CashFlow.vue -->
<script setup>
import axios from "axios";
import { onMounted, ref, computed, watch } from "vue";
import { Line, Bar, Doughnut } from 'vue-chartjs';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import { isAdmin, isAuthenticated } from '../../../utils/auth';
import AdminChatWidget from '../../../components/AdminChatWidget.vue';

const { t } = useI18n();
const router = useRouter();

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

// Data refs
const cashFlowData = ref({
  currentBalance: 0,
  netCashFlow: 0,
  totalInflows: 0,
  totalOutflows: 0,
  cashBurnRate: 0,
  runway: 0
});

const cashFlowHistory = ref([]);
const inflowsData = ref([]);
const outflowsData = ref([]);
const categoryBreakdown = ref({
  inflows: [],
  outflows: []
});
const forecast = ref([]);
const loading = ref(true);
const error = ref(null);

// Balance details data for display on page  
const balanceDetails = ref(null);
// Toggle for collapsing Cash Balance Details table
const showCashBalanceDetails = ref(true);

// Debug data for display on page
const debugData = ref(null);

// 🚀 PHASE 2: Manual Transaction Entry Data
const newTransaction = ref({
  type: 'inflow',
  category: 'product_sales',
  amount: '',
  description: ''
});

const isSubmitting = ref(false);
const successMessage = ref('');

// Available categories for transaction types
const availableCategories = computed(() => {
  const allCategories = [
    // Income categories
    { value: 'product_sales', label: 'Product Sales', shortLabel: 'Product Sales', icon: '🛍️', type: 'inflow' },
    { value: 'service_revenue', label: 'Service Revenue', shortLabel: 'Services', icon: '⚙️', type: 'inflow' },
    { value: 'investment_income', label: 'Investment Income', shortLabel: 'Investment', icon: '📈', type: 'inflow' },
    { value: 'other_income', label: 'Other Income', shortLabel: 'Other Income', icon: '💎', type: 'inflow' },
    
    // Expense categories
    { value: 'operating_expenses', label: 'Operating Expenses', shortLabel: 'Operations', icon: '🏢', type: 'outflow' },
    { value: 'cost_of_goods_sold', label: 'Cost of Goods Sold', shortLabel: 'COGS', icon: '📦', type: 'outflow' },
    { value: 'payroll', label: 'Payroll', shortLabel: 'Payroll', icon: '👥', type: 'outflow' },
    { value: 'marketing', label: 'Marketing', shortLabel: 'Marketing', icon: '📢', type: 'outflow' },
    { value: 'taxes', label: 'Taxes', shortLabel: 'Taxes', icon: '🏛️', type: 'outflow' },
    { value: 'rent', label: 'Rent', shortLabel: 'Rent', icon: '🏠', type: 'outflow' },
    { value: 'utilities', label: 'Utilities', shortLabel: 'Utilities', icon: '⚡', type: 'outflow' },
    { value: 'shipping_costs', label: 'Shipping Costs', shortLabel: 'Shipping', icon: '🚚', type: 'outflow' },
    { value: 'refunds', label: 'Refunds', shortLabel: 'Refunds', icon: '↩️', type: 'outflow' },
    { value: 'other_expenses', label: 'Other Expenses', shortLabel: 'Other', icon: '📝', type: 'outflow' }
  ];
  
  if (newTransaction.value.type === 'inflow') {
    return allCategories.filter(cat => cat.type === 'inflow');
  } else {
    return allCategories.filter(cat => cat.type === 'outflow');
  }
});

// Get common descriptions based on transaction type and category
const getCommonDescriptions = () => {
  const type = newTransaction.value.type;
  const category = newTransaction.value.category;
  
  if (type === 'inflow') {
    if (category === 'product_sales') return ['Online sale', 'In-store purchase', 'Bulk order'];
    if (category === 'service_revenue') return ['Consulting fee', 'Service delivery', 'Monthly retainer'];
    if (category === 'investment_income') return ['Dividend payment', 'Interest earned', 'Investment return'];
    return ['Cash deposit', 'Transfer in', 'Other income'];
  } else {
    if (category === 'operating_expenses') return ['Office supplies', 'Software subscription', 'Equipment'];
    if (category === 'marketing') return ['Google Ads', 'Social media', 'Print materials'];
    if (category === 'payroll') return ['Salary payment', 'Contractor fee', 'Benefits'];
    if (category === 'rent') return ['Office rent', 'Storage rent', 'Equipment lease'];
    if (category === 'utilities') return ['Electricity', 'Internet', 'Phone bill'];
    return ['Business expense', 'Payment', 'Purchase'];
  }
};

// Period selection
const selectedPeriod = ref(7);
const periods = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '1 Month' },
  { value: 90, label: '3 Months' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' }
];

// Computed properties for formatting
const formattedCurrentBalance = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cashFlowData.value.currentBalance || 0);
});

const formattedNetCashFlow = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cashFlowData.value.netCashFlow || 0);
});

const formattedTotalInflows = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cashFlowData.value.totalInflows || 0);
});

const formattedTotalOutflows = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cashFlowData.value.totalOutflows || 0);
});

const formattedCashBurnRate = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cashFlowData.value.cashBurnRate || 0);
});

// Approximate Cash Conversion Cycle (CCC)
// CCC = Total Outflows ÷ Average Daily Inflows over the selected period
const cccApproxDays = computed(() => {
  const inflows = cashFlowData.value?.totalInflows || 0;
  const outflows = cashFlowData.value?.totalOutflows || 0;
  const periodDays = selectedPeriod.value || 1;

  // Avoid division by zero; return null if not enough data
  if (inflows <= 0 || periodDays <= 0) return null;

  const avgDailyInflows = inflows / periodDays;
  const approx = Math.round(outflows / avgDailyInflows);
  return Math.max(0, approx);
});

// Cash position chart data
const cashPositionChartData = computed(() => {
  console.log('🔍 Chart Debug - cashFlowHistory:', cashFlowHistory.value);

  if (!cashFlowHistory.value || cashFlowHistory.value.length === 0) {
    console.log('⚠️ No cash flow history data available for chart');
    return { labels: [], datasets: [] };
  }

  const sortedHistory = [...cashFlowHistory.value].sort((a, b) => new Date(a.date) - new Date(b.date));
  console.log('🔍 Sorted history for chart:', sortedHistory.slice(0, 3)); // Log first 3 items
  console.log('🔍 Full sorted history length:', sortedHistory.length);

  // Calculate running balance from netFlow data
  const labels = sortedHistory.map(d => new Date(d.date).toLocaleDateString());
  const balances = [];

  // Use backend-provided starting balance instead of calculating incorrectly
  const currentBalance = cashFlowData.value?.currentBalance || 0;
  const startingBalance = cashFlowData.value?.startingBalance || 0;

  console.log('🔍 Balance calculation debug:', {
    currentBalance,
    startingBalance: startingBalance,
    historyLength: sortedHistory.length
  });

  // Calculate daily balances progressively
  let runningBalance = startingBalance;
  for (let i = 0; i < sortedHistory.length; i++) {
    const entry = sortedHistory[i];
    runningBalance += (entry.netFlow || 0);
    balances.push(Math.max(0, runningBalance)); // Ensure non-negative balance
  }

  console.log('🔍 Chart labels:', labels.slice(0, 5));
  console.log('🔍 Chart balances (calculated):', balances.slice(0, 5));
  console.log('🔍 Final balances:', balances.slice(-5));

  return {
    labels,
    datasets: [
      {
        label: 'Cash Balance ($)',
        data: balances,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };
});

// Cash balance table data
const cashBalanceTableData = computed(() => {
  if (!cashFlowHistory.value || cashFlowHistory.value.length === 0) {
    return [];
  }

  const sortedHistory = [...cashFlowHistory.value].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startingBalance = cashFlowData.value?.startingBalance || 0;
  
  let runningBalance = startingBalance;
  
  const tableData = sortedHistory.map((entry, index) => {
    runningBalance += (entry.netFlow || 0);
    const balance = Math.max(0, runningBalance);
    
    return {
      date: new Date(entry.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      inflows: entry.inflows || 0,
      outflows: entry.outflows || 0,
      netFlow: entry.netFlow || 0,
      balance: balance,
      dayOfWeek: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' }),
      isWeekend: [0, 6].includes(new Date(entry.date).getDay()),
      balanceChange: index === 0 ? 0 : balance - (sortedHistory[index - 1]?.balance || startingBalance)
    };
  }).reverse(); // Show most recent first
  
  // Remove the oldest entry (last item in the array after reverse)
  if (tableData.length > 0) {
    return tableData.slice(0, -1); // Remove the last (oldest) entry
  }
  return tableData;
});

// Inflows vs Outflows chart data
const inflowOutflowChartData = computed(() => {
  const sortedHistory = [...cashFlowHistory.value].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedHistory.map(d => new Date(d.date).toLocaleDateString());
  const inflows = sortedHistory.map(d => d.inflows);
  const outflows = sortedHistory.map(d => d.outflows);

  return {
    labels,
    datasets: [
      {
        label: 'Inflows ($)',
        data: inflows,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 1
      },
      {
        label: 'Outflows ($)',
        data: outflows,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    ]
  };
});

// Inflow category breakdown chart
const inflowCategoryChartData = computed(() => {
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return {
    labels: categoryBreakdown.value.inflows.map(cat => getCategoryDisplayName(cat.category || cat.name)),
    datasets: [
      {
        data: categoryBreakdown.value.inflows.map(cat => cat.amount),
        backgroundColor: colors.slice(0, categoryBreakdown.value.inflows.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };
});

// Outflow category breakdown chart
const outflowCategoryChartData = computed(() => {
  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4'];

  return {
    labels: categoryBreakdown.value.outflows.map(cat => getCategoryDisplayName(cat.category || cat.name)),
    datasets: [
      {
        data: categoryBreakdown.value.outflows.map(cat => cat.amount),
        backgroundColor: colors.slice(0, categoryBreakdown.value.outflows.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };
});

// Forecast chart data
const forecastChartData = computed(() => {
  if (!forecast.value || forecast.value.length === 0) return { labels: [], datasets: [] };

  const labels = forecast.value.map(f => new Date(f.date).toLocaleDateString());
  const projectedBalance = forecast.value.map(f => f.projectedBalance);

  return {
    labels,
    datasets: [
      {
        label: 'Projected Balance ($)',
        data: projectedBalance,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        fill: true
      }
    ]
  };
});

// Chart options
const cashPositionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: { usePointStyle: true }
    },
    title: { display: false }
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    }
  }
};

const inflowOutflowChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: { usePointStyle: true }
    },
    title: { display: false }
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    }
  }
};

const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { usePointStyle: true }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.label}: $${context.parsed.toLocaleString()}`
      }
    }
  }
};

const forecastChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: { usePointStyle: true }
    },
    title: { display: false }
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    }
  }
};

// 🚀 PHASE 1: Real Data Integration - Replace Mock Functions

// Helper function to convert category codes to display names
const getCategoryDisplayName = (category) => {
  const categoryLabels = {
    'product_sales': 'Product Sales',
    'service_revenue': 'Service Revenue',
    'investment_income': 'Investment Income',
    'other_income': 'Other Income',
    'operating_expenses': 'Operating Expenses',
    'cost_of_goods_sold': 'Cost of Goods Sold',
    'payroll': 'Payroll',
    'marketing': 'Marketing',
    'taxes': 'Taxes',
    'rent': 'Rent',
    'utilities': 'Utilities',
    'shipping_costs': 'Shipping Costs',
    'refunds': 'Refunds',
    'other_expenses': 'Other Expenses'
  };
  return categoryLabels[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Fetch main cash flow dashboard data
const fetchCashFlowData = async () => {
  try {
    const token = localStorage.getItem("token");

    console.log('🔍 Token check:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 50) + '...'
    });

    if (!token) {
      console.warn('🔐 No token found, redirecting to login');
      error.value = "Authentication required";
      router.push("/login");
      return;
    }

    // Check if token is expired
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('🕒 Token timing:', {
        expires: new Date(tokenPayload.exp * 1000).toISOString(),
        current: new Date(currentTime * 1000).toISOString(),
        isExpired: tokenPayload.exp < currentTime,
        timeLeft: (tokenPayload.exp - currentTime) / 3600 + ' hours'
      });

      if (tokenPayload.exp < currentTime) {
        console.warn('🔐 Token expired, redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
    } catch (e) {
      console.warn('🔐 Invalid token format, redirecting to login', e);
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();

    // Use proper Authorization header format
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };

    console.log('📡 Making API request:', {
      url: `${API_URL}/cashflow/dashboard?period=${selectedPeriod.value}&_t=${timestamp}`,
      headers: {
        ...headers,
        Authorization: 'Bearer ' + (token ? token.substring(0, 20) + '...' : 'missing')
      }
    });

    const response = await axios.get(`${API_URL}/cashflow/dashboard?period=${selectedPeriod.value}&_t=${timestamp}`, {
      headers
    });

    cashFlowData.value = response.data;

    // Fetch historical data with cache busting
    const historyResponse = await axios.get(`${API_URL}/cashflow/history?period=${selectedPeriod.value}&_t=${timestamp}`, {
      headers
    });

    console.log('🔍 History API Response:', historyResponse.data);

    cashFlowHistory.value = historyResponse.data.history;
    inflowsData.value = historyResponse.data.inflows || [];
    outflowsData.value = historyResponse.data.outflows || [];

    console.log('🔍 Assigned cashFlowHistory:', cashFlowHistory.value);
    console.log('🔍 History length:', cashFlowHistory.value?.length);

    console.log("✅ Real cash flow data loaded successfully", {
      currentBalance: cashFlowData.value.currentBalance,
      netCashFlow: cashFlowData.value.netCashFlow,
      historyEntries: cashFlowHistory.value.length,
      timestamp: new Date().toLocaleTimeString()
    });

  } catch (err) {
    console.error("❌ Error fetching cash flow data:", err);
    console.error("❌ Error details:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        headers: err.config?.headers
      }
    });

    error.value = err.response?.data?.message || err.message || 'Failed to load cash flow data';

    // Handle authentication errors
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('🔐 Authentication failed, redirecting to login');
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
  }
};

// Fetch category breakdown data
const fetchCategoryBreakdown = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/cashflow/categories?period=${selectedPeriod.value}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    categoryBreakdown.value = response.data;
    console.log("✅ Category breakdown data loaded successfully", {
      inflowCategories: response.data.inflows?.length || 0,
      outflowCategories: response.data.outflows?.length || 0
    });
  } catch (err) {
    console.error("Error fetching category breakdown:", err);
  }
};

// Fetch forecast data
const fetchForecast = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/cashflow/forecast`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    // Extract forecast array from API response
    forecast.value = response.data.forecast || [];
    console.log("✅ Forecast data loaded successfully", {
      forecastDays: forecast.value.length || 0,
      totalDays: response.data.forecast?.length || 0,
      summary: response.data.summary || null
    });
  } catch (err) {
    console.error("Error fetching forecast:", err);
  }
};

// 🚀 PHASE 2: Manual Transaction Entry Functions

// Watch transaction type changes to update category
watch(() => newTransaction.value.type, (newType) => {
  // Set default category when type changes
  if (newType === 'inflow') {
    newTransaction.value.category = 'product_sales';
  } else {
    newTransaction.value.category = 'operating_expenses';
  }
});

// Add manual transaction
const addTransaction = async () => {
  try {
    // Clear previous messages
    error.value = '';
    successMessage.value = '';

    // Validate form
    if (!newTransaction.value.amount || newTransaction.value.amount <= 0) {
      error.value = "Please enter a valid amount greater than 0";
      return;
    }

    // Description is now optional - no validation required

    isSubmitting.value = true;

    const token = localStorage.getItem("token");

    if (!token) {
      error.value = "Authentication required. Please log in again.";
      router.push("/login");
      return;
    }

    const transactionData = {
      type: newTransaction.value.type,
      category: newTransaction.value.category,
      amount: parseFloat(newTransaction.value.amount),
      description: newTransaction.value.description?.trim() || '',
      date: new Date(),
      automated: false
    };

    console.log("📝 Submitting transaction:", transactionData);

    const response = await axios.post(`${API_URL}/cashflow/transactions`, transactionData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Transaction added successfully:", response.data);

    const transactionType = newTransaction.value.type === 'inflow' ? 'Income' : 'Expense';
    const categoryLabel = availableCategories.value.find(cat => cat.value === newTransaction.value.category)?.label || newTransaction.value.category;

    successMessage.value = `${transactionType} of $${transactionData.amount.toFixed(2)} (${categoryLabel}) added successfully!`;

    // Reset form
    newTransaction.value = {
      type: 'inflow',
      category: 'product_sales',
      amount: '',
      description: ''
    };

    // Refresh all data to show the new transaction
    await fetchAllData();

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);

  } catch (err) {
    console.error("❌ Error adding transaction:", err);

    if (err.response?.status === 401) {
      error.value = "Authentication failed. Please log in again.";
      router.push("/login");
    } else if (err.response?.status === 403) {
      error.value = "Admin access required to add transactions.";
    } else {
      error.value = err.response?.data?.message || "Failed to add transaction. Please try again.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Handle period change
const handlePeriodChange = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchCashFlowData(),
      fetchCategoryBreakdown(),
      fetchForecast(),
      fetchTransactionDebugData(),
      fetchBalanceDetails()
    ]);
  } catch (err) {
    console.error("Error updating data for new period:", err);
  } finally {
    loading.value = false;
  }
};

// Manual sync function for testing automation
const syncOrdersToTransactions = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("token");

    const response = await axios.post(`${API_URL}/cashflow/sync-orders`, {}, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    console.log("Orders synced to transactions:", response.data);

    // Refresh all data after sync
    await fetchAllData();

  } catch (err) {
    console.error("Error syncing orders:", err);
    error.value = "Failed to sync order data";
  } finally {
    loading.value = false;
  }
};

// Fetch transaction debug data
const fetchTransactionDebugData = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/cashflow/debug/recent?period=${selectedPeriod.value}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    console.log("🐛 DEBUG: Transaction data:", response.data);
    console.table(response.data.recentTransactions);

    // Store debug data for display on page
    debugData.value = response.data;

  } catch (err) {
    console.error("Debug error:", err);
    error.value = "Debug failed - check console for details";
  }
};

// Fetch detailed balance breakdown
const fetchBalanceDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/cashflow/debug/balance?period=${selectedPeriod.value}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    balanceDetails.value = response.data;
    
    console.log("🔍 Balance Details:", response.data);
  } catch (err) {
    console.error("Error fetching balance details:", err);
    error.value = "Failed to load balance details";
  }
};

// Copy text to clipboard
const copyToClipboard = async (text, event) => {
  try {
    await navigator.clipboard.writeText(text);
    // Show a brief success indication
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✅';
    setTimeout(() => {
      button.textContent = originalText;
    }, 1000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = '✅';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1000);
    } catch (fallbackErr) {
      console.error('Fallback copy failed: ', fallbackErr);
    }
    document.body.removeChild(textArea);
  }
};

// Fetch all data
const fetchAllData = async () => {
  loading.value = true;
  try {
    // Fetch all cash flow data in parallel for better performance
    await Promise.all([
      fetchCashFlowData(),
      fetchCategoryBreakdown(),
      fetchForecast(),
      fetchTransactionDebugData(),
      fetchBalanceDetails()
    ]);
  } catch (err) {
    error.value = "Failed to load cash flow data";
    console.error("Error loading all cash flow data:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  console.log('🚀 CashFlow component mounted');

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn('🔐 No token found on mount, redirecting to login');
    alert("You need to login first");
    router.push("/login");
    return;
  }

  // Validate token expiry
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    if (tokenPayload.exp < currentTime) {
      console.warn('🔐 Token expired on mount, redirecting to login');
      localStorage.removeItem('token');
      alert("Your session has expired. Please login again.");
      router.push("/login");
      return;
    }
    console.log('✅ Valid token found, proceeding with data fetch');
  } catch (e) {
    console.warn('🔐 Invalid token format on mount, redirecting to login');
    localStorage.removeItem('token');
    alert("Invalid session. Please login again.");
    router.push("/login");
    return;
  }

  await fetchAllData();
});
</script>

<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-primary-600 mb-2">Cash Flow Dashboard</h1>
            <p class="text-secondary-600 text-lg">Monitor your business cash position and financial health</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-8 text-center">
        <div class="text-error text-lg font-medium mb-2">{{ error }}</div>
        <p class="text-secondary-500">Please try refreshing the page</p>
      </div>

      <!-- Cash Flow Content -->
      <div v-else class="space-y-8">

        <!-- Period Selector & Controls -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-secondary-900">Analysis Period</h3>
            <div class="flex items-center gap-3">
              <select v-model="selectedPeriod" @change="handlePeriodChange" class="form-select w-40">
                <option v-for="period in periods" :key="period.value" :value="period.value">
                  {{ period.label }}
                </option>
              </select>
              <button @click="syncOrdersToTransactions" :disabled="loading"
                class="px-4 py-2 bg-pink-100 text-primary-700 rounded-lg hover:bg-pink-200 disabled:opacity-50 flex items-center gap-2">
                <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <span v-else>🔄</span>
                Sync Orders
              </button>
            </div>
          </div>
        </div>

        <!-- Current Cash Position (Top Section) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Current Balance -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z">
                  </path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Current Balance</p>
                <p class="text-2xl font-bold"
                  :class="cashFlowData.currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'">
                  ${{ (cashFlowData.currentBalance || 0) % 1 === 0 ? (cashFlowData.currentBalance || 0).toLocaleString() : (cashFlowData.currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </p>
              </div>
            </div>
            <!-- Debug formula -->
            <div class="text-xs text-primary-600 mt-3 p-2 bg-primary-50 rounded">
              = All-time Total Inflows - All-time Total Outflows<br>
              <div v-if="cashFlowData.balanceBreakdown">
                = ${{ (cashFlowData.balanceBreakdown.totalInflows || 0) % 1 === 0 ? (cashFlowData.balanceBreakdown.totalInflows || 0).toLocaleString() : (cashFlowData.balanceBreakdown.totalInflows || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} - ${{ (cashFlowData.balanceBreakdown.totalOutflows || 0) % 1 === 0 ? (cashFlowData.balanceBreakdown.totalOutflows || 0).toLocaleString() : (cashFlowData.balanceBreakdown.totalOutflows || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} 
              </div>
              <div v-else>
                <em>Calculated by backend from all CashFlowTransaction records</em>
              </div>
            </div>
          </div>

          <!-- Net Cash Flow -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full"
                :class="cashFlowData.netCashFlow >= 0 ? 'bg-green-100 text-success' : 'bg-red-100 text-red-600'">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    :d="cashFlowData.netCashFlow >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'">
                  </path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Net Cash Flow ({{ selectedPeriod }} days)</p>
                <p class="text-2xl font-bold" :class="cashFlowData.netCashFlow >= 0 ? 'text-success' : 'text-red-600'">
                  ${{ (cashFlowData.netCashFlow || 0) % 1 === 0 ? (cashFlowData.netCashFlow || 0).toLocaleString() : (cashFlowData.netCashFlow || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </p>
              </div>
            </div>
            <!-- Debug formula -->
            <div class="text-xs text-primary-600 mt-3 p-2 bg-primary-50 rounded">
              = Total Inflows - Total Outflows ({{ selectedPeriod }} days)<br>
              = ${{ (cashFlowData.totalInflows || 0) % 1 === 0 ? (cashFlowData.totalInflows || 0).toLocaleString() : (cashFlowData.totalInflows || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} - ${{ (cashFlowData.totalOutflows || 0) % 1 === 0 ? (cashFlowData.totalOutflows || 0).toLocaleString() : (cashFlowData.totalOutflows || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}<br>
            </div>
          </div>

          <!-- Cash Burn Rate -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-orange-100 text-orange-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z">
                  </path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Daily Burn Rate</p>
                <p class="text-2xl font-bold text-orange-600">${{ (cashFlowData.cashBurnRate || 0) % 1 === 0 ? (cashFlowData.cashBurnRate || 0).toLocaleString() : (cashFlowData.cashBurnRate || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/day</p>
              </div>
            </div>
            <!-- Debug formula -->
            <div class="text-xs text-primary-600 mt-3 p-2 bg-primary-50 rounded">
              = Total Outflows ÷ Period Days<br>
              = ${{ (cashFlowData.totalOutflows || 0) % 1 === 0 ? (cashFlowData.totalOutflows || 0).toLocaleString() : (cashFlowData.totalOutflows || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ÷ {{ selectedPeriod }} days<br>
            </div>
          </div>

          <!-- Runway -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full"
                :class="cashFlowData.runway > 90 ? 'bg-green-100 text-green-600' : cashFlowData.runway > 30 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                  </path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Runway</p>
                <p class="text-2xl font-bold"
                  :class="cashFlowData.runway > 90 ? 'text-green-600' : cashFlowData.runway > 30 ? 'text-yellow-600' : 'text-red-600'">
                  {{ Math.round(cashFlowData.runway) }} days
                </p>
              </div>
            </div>
            <!-- Debug formula -->
            <div class="text-xs text-primary-600 mt-3 p-2 bg-primary-50 rounded">
              = Current Balance ÷ Daily Burn Rate<br>
              = ${{ cashFlowData.currentBalance?.toLocaleString() || 0 }} ÷ ${{ (cashFlowData.cashBurnRate || 0).toLocaleString() }}/day<br>
            </div>
          </div>
        </div>

        <!-- Cash Position Trend (Middle Section) -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">💹 Cash Position Over Time</h3>
          <div class="h-72 mb-6">
            <Line :data="cashPositionChartData" :options="cashPositionChartOptions" />
          </div>
          
          <!-- Cash Balance Details Table -->
          <div class="mt-8">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-md font-semibold text-secondary-900">📋 Cash Balance Details ({{ selectedPeriod }} days)</h4>
              <button
                @click="showCashBalanceDetails = !showCashBalanceDetails"
                class="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 text-secondary-700"
                :aria-expanded="showCashBalanceDetails.toString()"
              >
                {{ showCashBalanceDetails ? 'Hide' : 'Show' }}
              </button>
            </div>

            <!-- Table Summary -->
            <div v-if="cashBalanceTableData.length > 0" class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div class="bg-green-50 p-3 rounded-lg">
                <div class="text-success font-medium">Total Inflows</div>
                <div class="text-green-800 font-bold text-lg">
                  ${{ cashBalanceTableData.reduce((sum, day) => sum + day.inflows, 0) % 1 === 0 ? 
                       cashBalanceTableData.reduce((sum, day) => sum + day.inflows, 0).toLocaleString('en-US') :
                       cashBalanceTableData.reduce((sum, day) => sum + day.inflows, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </div>
              <div class="bg-red-50 p-3 rounded-lg">
                <div class="text-red-700 font-medium">Total Outflows</div>
                <div class="text-red-800 font-bold text-lg">
                  ${{ cashBalanceTableData.reduce((sum, day) => sum + day.outflows, 0) % 1 === 0 ? 
                       cashBalanceTableData.reduce((sum, day) => sum + day.outflows, 0).toLocaleString('en-US') :
                       cashBalanceTableData.reduce((sum, day) => sum + day.outflows, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </div>
              <div class="bg-blue-50 p-3 rounded-lg">
                <div class="text-blue-700 font-medium">Net Flow</div>
                <div class="text-blue-800 font-bold text-lg">
                  ${{ cashBalanceTableData.reduce((sum, day) => sum + day.netFlow, 0) % 1 === 0 ? 
                       cashBalanceTableData.reduce((sum, day) => sum + day.netFlow, 0).toLocaleString('en-US') :
                       cashBalanceTableData.reduce((sum, day) => sum + day.netFlow, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
                <!-- Debug info -->
                <div class="text-xs text-blue-600 mt-1">
                  = Total Inflows ${{ cashBalanceTableData.reduce((sum, day) => sum + day.inflows, 0) % 1 === 0 ? 
                                      cashBalanceTableData.reduce((sum, day) => sum + day.inflows, 0).toLocaleString('en-US') :
                                      cashBalanceTableData.reduce((sum, day) => sum + day.inflows, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} - Total Outflows ${{ cashBalanceTableData.reduce((sum, day) => sum + day.outflows, 0) % 1 === 0 ? 
                                      cashBalanceTableData.reduce((sum, day) => sum + day.outflows, 0).toLocaleString('en-US') :
                                      cashBalanceTableData.reduce((sum, day) => sum + day.outflows, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </div>
              <div class="bg-purple-50 p-3 rounded-lg">
                <div class="text-purple-700 font-medium">Avg Daily Balance</div>
                <div class="text-purple-800 font-bold text-lg">
                  ${{ (cashBalanceTableData.reduce((sum, day) => sum + day.balance, 0) / cashBalanceTableData.length) % 1 === 0 ? 
                       (cashBalanceTableData.reduce((sum, day) => sum + day.balance, 0) / cashBalanceTableData.length).toLocaleString('en-US') :
                       (cashBalanceTableData.reduce((sum, day) => sum + day.balance, 0) / cashBalanceTableData.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
                <!-- Debug info -->
                <div class="text-xs text-purple-600 mt-1">
                  = Total Balance Sum ${{ cashBalanceTableData.reduce((sum, day) => sum + day.balance, 0).toLocaleString() }} ÷ {{ cashBalanceTableData.length }} days
                </div>
              </div>
            </div>
            
            <div v-show="showCashBalanceDetails">
              <!-- Table Container with scroll for mobile -->
              <div class="overflow-x-auto mt-4">
              <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Date
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Inflows
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Outflows
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Net Flow
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Balance
                    </th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr 
                    v-for="(day, index) in cashBalanceTableData" 
                    :key="index"
                    :class="[
                      'hover:bg-gray-50 transition-colors duration-150',
                      day.isWeekend ? 'bg-blue-50' : '',
                      day.netFlow < 0 ? 'border-l-4' : day.netFlow > 0 ? 'border-l-4' : ''
                    ]"
                    :style="{
                      borderLeftColor: day.netFlow < 0 ? '#ef4444' : day.netFlow > 0 ? '#008000' : 'transparent',
                      borderLeftWidth: day.netFlow !== 0 ? '3px' : '0px',
                      borderLeftStyle: 'solid'
                    }"
                  >
                    <!-- Date Column -->
                    <td class="px-4 py-3 text-sm">
                      <div class="font-medium text-gray-900">{{ day.date }}</div>
                      <div class="text-xs text-gray-500">{{ day.dayOfWeek }}</div>
                    </td>
                    
                    <!-- Inflows Column -->
                    <td class="px-4 py-3 text-sm text-right">
                      <span class="font-medium text-success">
                        ${{ day.inflows % 1 === 0 ? day.inflows.toLocaleString('en-US') : day.inflows.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                      </span>
                    </td>
                    
                    <!-- Outflows Column -->
                    <td class="px-4 py-3 text-sm text-right">
                      <span class="font-medium text-red-600">
                        ${{ day.outflows % 1 === 0 ? day.outflows.toLocaleString('en-US') : day.outflows.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                      </span>
                    </td>
                    
                    <!-- Net Flow Column -->
                    <td class="px-4 py-3 text-sm text-right">
                      <span 
                        :class="[
                          'font-semibold px-2 py-1 rounded-full text-xs',
                          day.netFlow > 0 ? 'bg-green-100 text-green-800' : 
                          day.netFlow < 0 ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        ]"
                      >
                        {{ day.netFlow >= 0 ? '+' : '' }}${{ day.netFlow % 1 === 0 ? day.netFlow.toLocaleString('en-US') : day.netFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                      </span>
                    </td>
                    
                    <!-- Balance Column -->
                    <td class="px-4 py-3 text-sm text-right">
                      <div class="font-bold text-lg" :class="day.balance >= 0 ? 'text-blue-600' : 'text-red-600'">
                        ${{ day.balance % 1 === 0 ? day.balance.toLocaleString('en-US') : day.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                      </div>
                    </td>
                    
                    <!-- Status Column -->
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center">
                        <span 
                          v-if="day.netFlow > 1000" 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success text-white"
                          title="Strong positive cash flow"
                        >
                          Strong
                        </span>
                        <span 
                          v-else-if="day.netFlow > 0" 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-success"
                          title="Positive cash flow"
                        >
                          Positive
                        </span>
                        <span 
                          v-else-if="day.netFlow === 0" 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          title="Neutral cash flow"
                        >
                          Neutral
                        </span>
                        <span 
                          v-else-if="day.netFlow > -1000" 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                          title="Moderate negative cash flow"
                        >
                          Caution
                        </span>
                        <span 
                          v-else 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          title="Strong negative cash flow"
                        >
                          Alert
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Empty state -->
                  <tr v-if="cashBalanceTableData.length === 0">
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                      <div class="flex flex-col items-center">
                        <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <p class="text-sm">No cash flow data available for the selected period</p>
                        <p class="text-xs text-gray-400 mt-1">Try selecting a different time period or add some transactions</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            
            </div>
          </div>
        </div>

        <!-- Manual Transaction Entry -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">➕ Add Manual Transaction</h3>

          <!-- Success Message -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-success rounded-lg">
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ error }}
          </div>

          <form @submit.prevent="addTransaction">
            <!-- Transaction Type Toggle -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Transaction Type</label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  @click="newTransaction.type = 'inflow'"
                  :class="[
                    'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2',
                    newTransaction.type === 'inflow' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                  ]"
                >
                  <span class="text-xl">💰</span>
                  Income
                </button>
                <button 
                  type="button"
                  @click="newTransaction.type = 'outflow'"
                  :class="[
                    'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2',
                    newTransaction.type === 'outflow' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                  ]"
                >
                  <span class="text-xl">💸</span>
                  Expense
                </button>
              </div>
            </div>

            <!-- Quick Category Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                {{ newTransaction.type === 'inflow' ? 'Income' : 'Expense' }} Category
              </label>
              
              <!-- Income Categories -->
              <div v-if="newTransaction.type === 'inflow'" class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  type="button"
                  v-for="cat in availableCategories.filter(c => c.type === 'inflow')" 
                  :key="cat.value"
                  @click="newTransaction.category = cat.value"
                  :class="[
                    'p-3 rounded-lg transition-all duration-200 text-sm font-medium flex flex-col items-center gap-1',
                    newTransaction.category === cat.value 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-50 hover:bg-green-50'
                  ]"
                >
                  <span class="text-lg">{{ cat.icon }}</span>
                  <span class="text-center leading-tight">{{ cat.shortLabel || cat.label }}</span>
                </button>
              </div>

              <!-- Expense Categories -->
              <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  type="button"
                  v-for="cat in availableCategories.filter(c => c.type === 'outflow')" 
                  :key="cat.value"
                  @click="newTransaction.category = cat.value"
                  :class="[
                    'p-3 rounded-lg transition-all duration-200 text-sm font-medium flex flex-col items-center gap-1',
                    newTransaction.category === cat.value 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-gray-50 hover:border-red-300 hover:bg-red-50'
                  ]"
                >
                  <span class="text-lg">{{ cat.icon }}</span>
                  <span class="text-center leading-tight">{{ cat.shortLabel || cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Amount and Description -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <!-- Amount -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input 
                    v-model="newTransaction.amount" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00"
                    class="form-input w-full pl-8 pr-3 py-3 text-lg font-medium rounded-lg border-1 focus:border-primary-500" 
                    required
                    @keyup.enter="addTransaction"
                  >
                </div>
                <!-- Quick Amount Buttons -->
                <div class="flex gap-1 mt-2">
                  <button 
                    v-for="amount in [10, 25, 50, 100, 500, 1000, 2000, 2500, 3000, 3500, 5000]" 
                    :key="amount"
                    type="button"
                    @click="newTransaction.amount = amount"
                    class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    ${{ amount }}
                  </button>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description 
                  <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input 
                  v-model="newTransaction.description" 
                  type="text" 
                  placeholder="What's this transaction for?"
                  class="form-input w-full px-3 py-3 rounded-lg border-1"
                  @keyup.enter="addTransaction"
                >
                <!-- Common Description Suggestions -->
                <div class="flex flex-wrap gap-1 mt-2">
                  <button 
                    v-for="desc in getCommonDescriptions()" 
                    :key="desc"
                    type="button"
                    @click="newTransaction.description = desc"
                    class="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    {{ desc }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex items-center gap-4">
              <button 
                type="submit" 
                :disabled="isSubmitting || !newTransaction.amount"
                :class="[
                  'px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-lg',
                  newTransaction.type === 'inflow' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700',
                  (isSubmitting || !newTransaction.amount) ? 'opacity-50 cursor-not-allowed' : '',
                ]"
              >
                <svg v-if="isSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <span class="text-xl">{{ newTransaction.type === 'inflow' ? '💰' : '💸' }}</span>
                {{ isSubmitting ? 'Adding...' : `Add ${newTransaction.type === 'inflow' ? 'Income' : 'Expense'}` }}
              </button>

              <div class="text-sm text-gray-500">
                <div class="font-medium">{{ (newTransaction.amount || 0) > 0 ? `$${newTransaction.amount}` : '$0' }}</div>
                <div>{{ availableCategories.find(c => c.value === newTransaction.category)?.label || 'Select category' }}</div>
              </div>
            </div>
          </form>
        </div>

        <!-- 🐛 Transaction Debug Data -->
        <div v-if="debugData" class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">🐛 Transaction Data ({{ selectedPeriod }} days)</h3>
          
          <!-- Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-blue-700 font-medium">Total Transactions</div>
              <div class="text-2xl font-bold text-blue-800">{{ debugData.totalTransactions }}</div>
              <div class="text-sm text-blue-600">in {{ selectedPeriod }} days</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-green-700 font-medium">Manual Transactions</div>
              <div class="text-2xl font-bold text-green-800">{{ debugData.manualTransactions }}</div>
              <div class="text-sm text-green-600">user-entered</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="text-purple-700 font-medium">Automated Transactions</div>
              <div class="text-2xl font-bold text-purple-800">{{ debugData.automatedTransactions }}</div>
              <div class="text-sm text-purple-600">system-generated</div>
            </div>
          </div>

          <!-- All Transactions Table -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-lg font-semibold text-gray-900">Transactions in Period ({{ debugData.recentTransactions?.length || 0 }})</h4>
              <div class="text-sm text-gray-500">Last {{ selectedPeriod }} days • Sorted by date (newest first)</div>
            </div>
            <div class="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table class="min-w-full bg-white">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(tx, index) in debugData.recentTransactions" :key="tx.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">
                      <div class="flex items-center">
                        <span 
                          class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono cursor-help"
                          :title="`Transaction ID: ${tx.id}`"
                        >
                          {{ index + 1 }}
                        </span>
                        <button 
                          @click="copyToClipboard(tx.id, $event)" 
                          class="ml-2 text-gray-400 hover:text-gray-600 text-xs transition-colors duration-150"
                          title="Copy full ID to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="tx.type === 'inflow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                            class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ tx.type === 'inflow' ? '💰 Inflow' : '💸 Outflow' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm font-semibold" :class="tx.type === 'inflow' ? 'text-green-600' : 'text-red-600'">
                      ${{ tx.amount.toLocaleString() }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ getCategoryDisplayName(tx.category) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ tx.description || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ new Date(tx.date).toLocaleDateString() }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="tx.automated ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'"
                            class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ tx.automated ? '🤖 Auto' : '✋ Manual' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 💰 Current Balance Breakdown -->
        <div v-if="balanceDetails" class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">💰 Current Balance Breakdown (${{ balanceDetails?.summary?.currentBalance?.toLocaleString() || 0 }})</h3>
          
          <!-- Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-green-700 font-medium">Total Inflows</div>
              <div class="text-2xl font-bold text-green-800">${{ balanceDetails.summary.totalInflows.toLocaleString() }}</div>
              <div class="text-sm text-green-600">{{ balanceDetails.summary.inflowCount }} transactions</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-red-700 font-medium">Total Outflows</div>
              <div class="text-2xl font-bold text-red-800">${{ balanceDetails.summary.totalOutflows.toLocaleString() }}</div>
              <div class="text-sm text-red-600">{{ balanceDetails.summary.outflowCount }} transactions</div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-blue-700 font-medium">Net Balance</div>
              <div class="text-2xl font-bold text-blue-800">${{ balanceDetails.summary.currentBalance.toLocaleString() }}</div>
              <!-- Debug info -->
              <div class="text-xs text-blue-600 mt-1">
                = Total Inflows ${{ balanceDetails.summary.totalInflows.toLocaleString() }} - Total Outflows ${{ balanceDetails.summary.totalOutflows.toLocaleString() }}
              </div>
              <div class="text-sm text-blue-600">{{ balanceDetails.summary.inflowCount + balanceDetails.summary.outflowCount }} total transactions</div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Inflows by Category -->
            <div>
              <h4 class="text-lg font-semibold text-green-700 mb-3">💰 Inflows by Category</h4>
              <div class="space-y-2">
                <div v-for="(data, category) in balanceDetails.inflowsByCategory" :key="category" 
                     class="bg-green-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-green-800">{{ getCategoryDisplayName(category) }}</span>
                    <span class="font-bold text-green-700">${{ data.total.toLocaleString() }}</span>
                  </div>
                  <div class="text-sm text-green-600">{{ data.count }} transactions</div>
                </div>
              </div>
            </div>

            <!-- Outflows by Category -->
            <div>
              <h4 class="text-lg font-semibold text-red-700 mb-3">💸 Outflows by Category</h4>
              <div class="space-y-2">
                <div v-for="(data, category) in balanceDetails.outflowsByCategory" :key="category" 
                     class="bg-red-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-red-800">{{ getCategoryDisplayName(category) }}</span>
                    <span class="font-bold text-red-700">${{ data.total.toLocaleString() }}</span>
                  </div>
                  <div class="text-sm text-red-600">{{ data.count }} transactions</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Transactions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- All Inflows -->
            <div>
              <h4 class="text-lg font-semibold text-green-700 mb-3">📈 All Inflows</h4>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div v-for="tx in (balanceDetails.allInflows || balanceDetails.recentInflows)" :key="tx._id" 
                     class="bg-green-50 p-3 rounded-lg text-sm">
                  <div class="flex justify-between">
                    <span class="font-medium text-green-800">${{ tx.amount.toLocaleString() }}</span>
                    <span class="text-green-600">{{ new Date(tx.date).toLocaleDateString() }}</span>
                  </div>
                  <div class="text-green-700">{{ getCategoryDisplayName(tx.category) }}</div>
                  <div v-if="tx.description" class="text-green-600">{{ tx.description }}</div>
                  <div class="text-xs text-green-600">{{ tx.automated ? 'Auto' : 'Manual' }}</div>
                </div>
              </div>
            </div>

            <!-- All Outflows -->
            <div>
              <h4 class="text-lg font-semibold text-red-700 mb-3">📉 All Outflows</h4>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div v-for="tx in (balanceDetails.allOutflows || balanceDetails.recentOutflows)" :key="tx._id" 
                     class="bg-red-50 p-3 rounded-lg text-sm">
                  <div class="flex justify-between">
                    <span class="font-medium text-red-800">${{ tx.amount.toLocaleString() }}</span>
                    <span class="text-red-600">{{ new Date(tx.date).toLocaleDateString() }}</span>
                  </div>
                  <div class="text-red-700">{{ getCategoryDisplayName(tx.category) }}</div>
                  <div v-if="tx.description" class="text-red-600">{{ tx.description }}</div>
                  <div class="text-xs text-red-600">{{ tx.automated ? 'Auto' : 'Manual' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inflows vs Outflows Chart -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">📊 Cash Inflows vs Outflows</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-success">{{ formattedTotalInflows }}</div>
              <div class="text-sm text-secondary-600">Total Inflows</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ formattedTotalOutflows }}</div>
              <div class="text-sm text-secondary-600">Total Outflows</div>
            </div>
          </div>
          <div class="h-72">
            <Bar :data="inflowOutflowChartData" :options="inflowOutflowChartOptions" />
          </div>
        </div>

        <!-- Category Breakdown (Bottom Section) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Inflow Categories -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">💰 Inflow Categories</h3>
            <div v-if="categoryBreakdown.inflows.length > 0" class="h-64">
              <Doughnut :data="inflowCategoryChartData" :options="categoryChartOptions" />
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No inflow data available</p>
            </div>
          </div>

          <!-- Outflow Categories -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">💸 Outflow Categories</h3>
            <div v-if="categoryBreakdown.outflows.length > 0" class="h-64">
              <Doughnut :data="outflowCategoryChartData" :options="categoryChartOptions" />
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No outflow data available</p>
            </div>
          </div>
        </div>

        <!-- Detailed Category Lists -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Inflow Details -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Cash Inflows Breakdown</h3>
            <div class="space-y-3">
              <div v-for="(category, index) in categoryBreakdown.inflows" :key="index"
                class="flex items-center justify-between">
                <span class="text-sm font-medium text-secondary-900">{{ getCategoryDisplayName(category.category ||
                  category.name) }}</span>
                <span class="text-sm font-semibold text-success">
                  ${{ category.amount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Outflow Details -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Cash Outflows Breakdown</h3>
            <div class="space-y-3">
              <div v-for="(category, index) in categoryBreakdown.outflows" :key="index"
                class="flex items-center justify-between">
                <span class="text-sm font-medium text-secondary-900">{{ getCategoryDisplayName(category.category ||
                  category.name) }}</span>
                <span class="text-sm font-semibold text-red-600">
                  ${{ category.amount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Metrics Summary -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">📈 Key Performance Indicators</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-lg font-semibold text-secondary-900">Cash Conversion Cycle</div>
              <div class="text-2xl font-bold text-blue-600">{{ cccApproxDays ?? 0 }} days</div>
              <div class="text-sm text-secondary-600">Approx. days to recover cash spent</div>
              <!-- Debug formula -->
              <div class="text-xs text-primary-500 mt-2 p-2 bg-primary-50 rounded">
                = Total Outflows ÷ Avg Daily Inflows ({{ selectedPeriod }} days)<br>
                = ${{ (cashFlowData.totalOutflows || 0).toLocaleString() }} ÷ ${{ ((cashFlowData.totalInflows || 0) / (selectedPeriod || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 }) }}<br>
              </div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-secondary-900">Net Cash Flow Ratio</div>
              <div class="text-2xl font-bold"
                :class="cashFlowData.netCashFlow / cashFlowData.totalInflows > 0.15 ? 'text-success' : 'text-yellow-600'">
                {{ ((cashFlowData.netCashFlow / cashFlowData.totalInflows) * 100).toFixed(1) }}%
              </div>
              <div class="text-sm text-secondary-600">Net cash flow / Total inflows</div>
              <!-- Debug formula -->
              <div class="text-xs text-primary-600 mt-2 p-2 bg-primary-50 rounded">
                = (Net Cash Flow ÷ Total Inflows) × 100<br>
                = ({{ cashFlowData.netCashFlow?.toLocaleString() || 0 }} ÷ {{ cashFlowData.totalInflows?.toLocaleString() || 0 }}) × 100<br>
              </div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-secondary-900">Cash Flow Coverage</div>
              <div class="text-2xl font-bold"
                :class="cashFlowData.totalInflows / cashFlowData.totalOutflows > 1.2 ? 'text-success' : 'text-red-600'">
                {{ (cashFlowData.totalInflows / cashFlowData.totalOutflows).toFixed(2) }}x
              </div>
              <div class="text-sm text-secondary-600">Ability to cover expenses</div>
              <!-- Debug formula -->
              <div class="text-xs text-primary-600 mt-2 p-2 bg-primary-50 rounded">
                = Total Inflows ÷ Total Outflows<br>
                = {{ cashFlowData.totalInflows?.toLocaleString() || 0 }} ÷ {{ cashFlowData.totalOutflows?.toLocaleString() || 0 }}<br>
              </div>
            </div>
          </div>
        </div>

        <!-- Cash Flow Forecast -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">🔮 3-Month Cash Flow Forecast</h3>
          <div v-if="forecast.length > 0" class="h-72 mb-6">
            <Line :data="forecastChartData" :options="forecastChartOptions" />
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>No forecast data available</p>
          </div>
          
          <!-- Debug: Forecast Calculation Details -->
          <div v-if="forecast.length > 0" class="mt-6 p-4 bg-primary-50 rounded-lg">
            <h4 class="text-sm font-semibold text-primary-800 mb-3">Forecast Calculation Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <!-- Left Column: Assumptions -->
              <div class="space-y-2">
                <div class="font-medium text-primary-700">Historical Analysis (30 days):</div>
                <div class="text-primary-600 text-xs space-y-1">
                  <div v-if="forecast[0]">• Avg Daily Inflow: ${{ forecast[0].projectedInflow?.toLocaleString() || 'N/A' }} (= Total Inflows ${{ cashFlowData.totalInflows?.toLocaleString() || 0 }} ÷ 30 days)</div> 
                  <div v-if="forecast[0]">• Avg Daily Outflow: ${{ forecast[0].projectedOutflow?.toLocaleString() || 'N/A' }} (= Total Outflows ${{ cashFlowData.totalOutflows?.toLocaleString() || 0 }} ÷ 30 days)</div>
                  <div v-if="forecast[0]">• Net Daily Flow: ${{ forecast[0].netProjectedFlow?.toLocaleString() || 'N/A' }} (= Avg Daily Inflow ${{ forecast[0].projectedInflow?.toLocaleString() || 'N/A' }} - Avg Daily Outflow ${{ forecast[0].projectedOutflow?.toLocaleString() || 'N/A' }})</div>
                  <div>• Based on: Last 30 days of transactions</div>
                </div>
              </div>
              
              <!-- Right Column: Projection -->
              <div class="space-y-2">
                <div class="font-medium text-primary-700">Projection Logic:</div>
                <div class="text-primary-600 text-xs space-y-1">
                  <div>• Starting Balance: ${{ cashFlowData.currentBalance?.toLocaleString() || 0 }}</div>
                  <div>• Daily Balance = Previous Balance + Net Daily Flow</div>
                  <div>• Forecast Period: {{ forecast.length }} days</div>
                  <div v-if="forecast[forecast.length - 1]">• Projected End Balance: ${{ forecast[forecast.length - 1].projectedBalance?.toLocaleString() || 'N/A' }}</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    
    <AdminChatWidget v-if="isAdmin() && isAuthenticated()" />
  </div>
</template>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
}

.form-select {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: white;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.page-background {
  background: linear-gradient(to bottom right, var(--primary-50), var(--secondary-50));
}

/* Alert styles for runway warnings */
.runway-warning {
  border-left: 4px solid #fbbf24;
  background-color: #fefce8;
  padding: 1rem;
  margin-bottom: 1rem;
}

.runway-critical {
  border-left: 4px solid #f87171;
  background-color: #fef2f2;
  padding: 1rem;
  margin-bottom: 1rem;
}

.runway-healthy {
  border-left: 4px solid #34d399;
  background-color: #f0fdf4;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>
