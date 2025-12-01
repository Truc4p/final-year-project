# Finance Module - API Integration Examples

This document provides practical examples of how to integrate the Finance frontend components with the backend API.

## Using the Finance Service

### Import the Service

```javascript
import financeService from '@/services/financeService';
```

## Dashboard Integration

### FinanceDashboard.vue - Complete Example

```javascript
<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const totalRevenue = ref(0);
const totalExpenses = ref(0);
const netIncome = ref(0);
const cashBalance = ref(0);
const isLoading = ref(false);
const error = ref(null);

onMounted(async () => {
  await fetchDashboardData();
});

const fetchDashboardData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const data = await financeService.getDashboard();
    totalRevenue.value = data.totalRevenue;
    totalExpenses.value = data.totalExpenses;
    netIncome.value = data.netIncome;
    cashBalance.value = data.cashBalance;
  } catch (err) {
    error.value = 'Failed to load dashboard data';
    console.error('Dashboard error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## Invoices Integration

### InvoicesPage.vue - Complete Example

```javascript
<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const invoices = ref([]);
const isLoading = ref(false);
const error = ref(null);
const showCreateModal = ref(false);

const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: ''
});

const formData = ref({
  customer: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  amount: 0,
  description: ''
});

// Fetch invoices on mount
onMounted(async () => {
  await fetchInvoices();
});

// Fetch invoices from API
const fetchInvoices = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const params = {
      status: filters.value.status,
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo
    };
    
    const data = await financeService.getInvoices(params);
    invoices.value = data;
  } catch (err) {
    error.value = 'Failed to load invoices';
    console.error('Invoices error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Filter invoices locally
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesStatus = !filters.value.status || invoice.status === filters.value.status;
    return matchesSearch && matchesStatus;
  });
});

// Create invoice
const submitInvoice = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const newInvoice = await financeService.createInvoice(formData.value);
    invoices.value.push(newInvoice);
    showCreateModal.value = false;
    
    // Reset form
    formData.value = {
      customer: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      amount: 0,
      description: ''
    };
    
    // Show success notification
    console.log('Invoice created successfully');
  } catch (err) {
    error.value = 'Failed to create invoice';
    console.error('Create invoice error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Delete invoice
const deleteInvoice = async (id) => {
  if (!confirm('Are you sure you want to delete this invoice?')) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await financeService.deleteInvoice(id);
    invoices.value = invoices.value.filter(inv => inv.id !== id);
    console.log('Invoice deleted successfully');
  } catch (err) {
    error.value = 'Failed to delete invoice';
    console.error('Delete invoice error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Edit invoice
const editInvoice = async (id) => {
  try {
    const invoice = await financeService.getInvoice(id);
    // Populate form with invoice data
    formData.value = {
      customer: invoice.customer,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      description: invoice.description
    };
    showCreateModal.value = true;
  } catch (err) {
    error.value = 'Failed to load invoice';
    console.error('Load invoice error:', err);
  }
};
</script>
```

## Bank Accounts Integration

### BankAccountsPage.vue - Complete Example

```javascript
<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const bankAccounts = ref([]);
const recentTransactions = ref([]);
const isLoading = ref(false);
const error = ref(null);
const showCreateModal = ref(false);

const formData = ref({
  accountName: '',
  bankName: '',
  accountNumber: '',
  accountType: 'checking',
  currentBalance: 0,
  isPrimary: false
});

// Fetch bank accounts and transactions on mount
onMounted(async () => {
  await fetchBankAccounts();
  await fetchRecentTransactions();
});

// Fetch bank accounts
const fetchBankAccounts = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const data = await financeService.getBankAccounts({ isActive: true });
    bankAccounts.value = data;
  } catch (err) {
    error.value = 'Failed to load bank accounts';
    console.error('Bank accounts error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Fetch recent transactions
const fetchRecentTransactions = async () => {
  try {
    if (bankAccounts.value.length > 0) {
      const primaryAccount = bankAccounts.value.find(acc => acc.isPrimary);
      if (primaryAccount) {
        const data = await financeService.getBankAccountTransactions(primaryAccount.id, {
          limit: 5
        });
        recentTransactions.value = data;
      }
    }
  } catch (err) {
    console.error('Transactions error:', err);
  }
};

// Create bank account
const submitAccount = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const newAccount = await financeService.createBankAccount(formData.value);
    bankAccounts.value.push(newAccount);
    showCreateModal.value = false;
    
    // Reset form
    formData.value = {
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      currentBalance: 0,
      isPrimary: false
    };
    
    console.log('Bank account created successfully');
  } catch (err) {
    error.value = 'Failed to create bank account';
    console.error('Create account error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Delete bank account
const deleteAccount = async (id) => {
  if (!confirm('Are you sure you want to delete this account?')) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await financeService.deleteBankAccount(id);
    bankAccounts.value = bankAccounts.value.filter(acc => acc.id !== id);
    console.log('Bank account deleted successfully');
  } catch (err) {
    error.value = 'Failed to delete bank account';
    console.error('Delete account error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## Chart of Accounts Integration

### ChartOfAccountsPage.vue - Complete Example

```javascript
<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const accounts = ref([]);
const isLoading = ref(false);
const error = ref(null);
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

// Fetch accounts on mount
onMounted(async () => {
  await fetchAccounts();
});

// Fetch chart of accounts
const fetchAccounts = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const params = {
      accountType: filters.value.accountType,
      isActive: filters.value.status === 'active' ? true : (filters.value.status === 'inactive' ? false : undefined)
    };
    
    const data = await financeService.getChartOfAccounts(params);
    accounts.value = data;
  } catch (err) {
    error.value = 'Failed to load accounts';
    console.error('Accounts error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Filter accounts locally
const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    const matchesSearch = account.code.includes(filters.value.search) ||
                         account.name.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesType = !filters.value.accountType || account.type === filters.value.accountType;
    const matchesStatus = !filters.value.status || (filters.value.status === 'active' ? account.isActive : !account.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });
});

// Create account
const submitAccount = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const newAccount = await financeService.createAccount(formData.value);
    accounts.value.push(newAccount);
    showCreateModal.value = false;
    
    // Reset form
    formData.value = {
      code: '',
      name: '',
      type: 'asset',
      subType: 'current_asset',
      balance: 0,
      isActive: true,
      description: ''
    };
    
    console.log('Account created successfully');
  } catch (err) {
    error.value = 'Failed to create account';
    console.error('Create account error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Delete account
const deleteAccount = async (id) => {
  if (!confirm('Are you sure you want to delete this account?')) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await financeService.deleteAccount(id);
    accounts.value = accounts.value.filter(acc => acc.id !== id);
    console.log('Account deleted successfully');
  } catch (err) {
    error.value = 'Failed to delete account';
    console.error('Delete account error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## Financial Reports Integration

### FinancialReportsPage.vue - Complete Example

```javascript
<script setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const selectedReport = ref('income_statement');
const isLoading = ref(false);
const error = ref(null);

const reportFilters = ref({
  period: 'current_month',
  fromDate: '',
  toDate: ''
});

const reportData = ref({
  incomeStatement: null,
  balanceSheet: null,
  cashFlow: null
});

// Generate report
const generateReport = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const params = {
      period: reportFilters.value.period,
      fromDate: reportFilters.value.fromDate,
      toDate: reportFilters.value.toDate
    };
    
    if (selectedReport.value === 'income_statement') {
      reportData.value.incomeStatement = await financeService.getIncomeStatement(params);
    } else if (selectedReport.value === 'balance_sheet') {
      reportData.value.balanceSheet = await financeService.getBalanceSheet(params);
    } else if (selectedReport.value === 'cash_flow') {
      reportData.value.cashFlow = await financeService.getCashFlowStatement(params);
    }
    
    console.log('Report generated successfully');
  } catch (err) {
    error.value = 'Failed to generate report';
    console.error('Report error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Export to PDF
const exportPDF = async () => {
  try {
    // Implement PDF export logic
    console.log('Exporting to PDF');
  } catch (err) {
    error.value = 'Failed to export PDF';
    console.error('Export error:', err);
  }
};

// Export to Excel
const exportExcel = async () => {
  try {
    // Implement Excel export logic
    console.log('Exporting to Excel');
  } catch (err) {
    error.value = 'Failed to export Excel';
    console.error('Export error:', err);
  }
};
</script>
```

## General Ledger Integration

### GeneralLedgerPage.vue - Complete Example

```javascript
<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import financeService from '@/services/financeService';

const { t } = useI18n();

const journalEntries = ref([]);
const trialBalance = ref([]);
const isLoading = ref(false);
const error = ref(null);

const filters = ref({
  search: '',
  account: '',
  dateFrom: '',
  dateTo: ''
});

// Fetch journal entries and trial balance on mount
onMounted(async () => {
  await fetchJournalEntries();
  await fetchTrialBalance();
});

// Fetch journal entries
const fetchJournalEntries = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const params = {
      account: filters.value.account,
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo
    };
    
    const data = await financeService.getJournalEntries(params);
    journalEntries.value = data;
  } catch (err) {
    error.value = 'Failed to load journal entries';
    console.error('Journal entries error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Fetch trial balance
const fetchTrialBalance = async () => {
  try {
    const data = await financeService.getTrialBalance();
    trialBalance.value = data;
  } catch (err) {
    console.error('Trial balance error:', err);
  }
};

// Filter entries locally
const filteredEntries = computed(() => {
  return journalEntries.value.filter(entry => {
    const matchesSearch = entry.entryNumber.includes(filters.value.search) ||
                         entry.description.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesAccount = !filters.value.account || entry.account.includes(filters.value.account);
    return matchesSearch && matchesAccount;
  });
});

// Calculate totals
const totalDebits = computed(() => {
  return filteredEntries.value.reduce((sum, entry) => sum + entry.debit, 0);
});

const totalCredits = computed(() => {
  return filteredEntries.value.reduce((sum, entry) => sum + entry.credit, 0);
});

// Delete journal entry
const deleteEntry = async (id) => {
  if (!confirm('Are you sure you want to delete this entry?')) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await financeService.deleteJournalEntry(id);
    journalEntries.value = journalEntries.value.filter(entry => entry.id !== id);
    console.log('Journal entry deleted successfully');
  } catch (err) {
    error.value = 'Failed to delete journal entry';
    console.error('Delete entry error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## Error Handling & Loading States

### Common Pattern for All Components

```javascript
// Loading state
const isLoading = ref(false);

// Error state
const error = ref(null);

// API call with error handling
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const data = await financeService.getSomeData();
    // Process data
  } catch (err) {
    error.value = err.message || 'An error occurred';
    console.error('Error:', err);
  } finally {
    isLoading.value = false;
  }
};

// In template
<div v-if="isLoading" class="text-center py-4">
  <p>Loading...</p>
</div>
<div v-else-if="error" class="bg-red-100 text-red-800 p-4 rounded">
  {{ error }}
</div>
<div v-else>
  <!-- Content here -->
</div>
```

## Authentication

### Adding Auth Token to Requests

The `financeService` automatically includes the auth token from localStorage:

```javascript
// In your login component
const login = async (credentials) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  
  // Now all financeService calls will include the token
};
```

## Pagination Example

```javascript
const currentPage = ref(1);
const pageSize = ref(10);

const fetchInvoices = async () => {
  const params = {
    page: currentPage.value,
    limit: pageSize.value
  };
  
  const data = await financeService.getInvoices(params);
  invoices.value = data.items;
  totalPages.value = data.totalPages;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchInvoices();
  }
};
```

## Debouncing Search

```javascript
import { debounce } from 'lodash-es';

const searchQuery = ref('');

const handleSearch = debounce(async () => {
  filters.value.search = searchQuery.value;
  await fetchData();
}, 300);

// In template
<input 
  v-model="searchQuery" 
  @input="handleSearch"
  placeholder="Search..."
>
```

## Conclusion

These examples show how to integrate the Finance frontend components with your backend API. Follow these patterns for consistent, maintainable code throughout the application.

