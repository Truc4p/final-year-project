# Financial Reports Integration Guide

## Quick Start

### 1. Using the Improved FinancialReportsPage

The page now automatically loads data from the backend. No hardcoded values!

```vue
<template>
  <!-- Reports are automatically generated when component mounts -->
  <!-- Date range can be selected by user -->
</template>

<script setup>
// The component handles all API calls internally
// Just select a report type and date range
</script>
```

### 2. Using Financial Calculations Composable

Use the `useFinancialCalculations` composable in any component:

```javascript
import { useFinancialCalculations } from '@/composables/useFinancialCalculations';

export default {
  setup() {
    const {
      formatCurrency,
      calculateNetProfitMargin,
      calculateCurrentRatio,
      getDateRange
    } = useFinancialCalculations();

    // Format a number as currency
    const formatted = formatCurrency(1234.56); // "$1,234.56"

    // Calculate financial ratios
    const margin = calculateNetProfitMargin(75000, 170000); // 44.12%
    const ratio = calculateCurrentRatio(100000, 50000); // 2.0

    // Get date range for a period
    const { fromDate, toDate } = getDateRange('current_month');

    return { formatted, margin, ratio };
  }
};
```

## Integration Points

### 1. Finance Dashboard → Financial Reports

**File**: `/frontend/src/pages/admin/finance/FinanceDashboard.vue`

Add a link to financial reports:

```vue
<router-link 
  to="/admin/finance/reports" 
  class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"
>
  <div class="flex items-center space-x-4">
    <div class="bg-purple-100 rounded-lg p-3">
      <svg class="w-6 h-6 text-purple-600"><!-- chart icon --></svg>
    </div>
    <div>
      <h3 class="font-semibold text-gray-900">Financial Reports</h3>
      <p class="text-sm text-gray-600">View detailed financial statements</p>
    </div>
  </div>
</router-link>
```

### 2. General Ledger → Financial Reports

**File**: `/frontend/src/pages/admin/finance/GeneralLedgerPage.vue`

The trial balance data feeds into the balance sheet. Add a link:

```javascript
// In GeneralLedgerPage.vue
const viewInReport = () => {
  // Navigate to financial reports with pre-selected balance sheet
  router.push({
    path: '/admin/finance/reports',
    query: { report: 'balance_sheet' }
  });
};
```

### 3. Invoices → Income Statement

**File**: `/frontend/src/pages/admin/finance/InvoicesPage.vue`

Revenue data comes from posted invoices. Add analytics:

```javascript
// In InvoicesPage.vue
const viewRevenueReport = () => {
  router.push({
    path: '/admin/finance/reports',
    query: { report: 'income_statement' }
  });
};
```

### 4. Bills → Income Statement

**File**: `/frontend/src/pages/admin/finance/BillsPage.vue`

Expense data comes from posted bills. Add analytics:

```javascript
// In BillsPage.vue
const viewExpenseReport = () => {
  router.push({
    path: '/admin/finance/reports',
    query: { report: 'income_statement' }
  });
};
```

### 5. Bank Accounts → Cash Flow Statement

**File**: `/frontend/src/pages/admin/finance/BankAccountsPage.vue`

Cash balance and cash flows come from bank transactions. Add link:

```javascript
// In BankAccountsPage.vue
const viewCashFlowReport = () => {
  router.push({
    path: '/admin/finance/reports',
    query: { report: 'cash_flow' }
  });
};
```

## Data Flow Examples

### Example 1: Income Statement Generation

```
User selects "Income Statement" + "Current Month"
         ↓
FinancialReportsPage calculates date range
         ↓
Calls: financeService.getIncomeStatement({
  fromDate: '2025-12-01',
  toDate: '2025-12-04'
})
         ↓
Backend queries:
- All invoices (posted) between dates → Revenue
- All bills (posted) between dates → Expenses
         ↓
Backend calculates:
- Total Revenue = Sum of all invoice amounts
- Total Expenses = Sum of all bill amounts
- Net Income = Total Revenue - Total Expenses
         ↓
Returns structured data to frontend
         ↓
Frontend displays in template with proper formatting
```

### Example 2: Balance Sheet Generation

```
User selects "Balance Sheet" + Custom date range
         ↓
FinancialReportsPage validates dates
         ↓
Calls: financeService.getBalanceSheet({
  fromDate: '2025-01-01',
  toDate: '2025-12-04'
})
         ↓
Backend queries:
- Chart of Accounts (asset accounts) → Assets
- Chart of Accounts (liability accounts) → Liabilities
- Chart of Accounts (equity accounts) → Equity
- Trial Balance as of toDate
         ↓
Backend calculates:
- Total Assets = Sum of all asset account balances
- Total Liabilities = Sum of all liability account balances
- Total Equity = Sum of all equity account balances
- isBalanced = (Total Assets === Total Liabilities + Total Equity)
         ↓
Returns structured data to frontend
         ↓
Frontend displays with validation indicator
```

### Example 3: Cash Flow Statement Generation

```
User selects "Cash Flow Statement" + "Last Quarter"
         ↓
FinancialReportsPage calculates quarter dates
         ↓
Calls: financeService.getCashFlowStatement({
  fromDate: '2025-09-01',
  toDate: '2025-11-30'
})
         ↓
Backend queries:
- Journal entries for operating activities
- Journal entries for investing activities
- Journal entries for financing activities
- Bank transactions for cash movements
         ↓
Backend calculates:
- Net Cash from Operations
- Net Cash from Investing
- Net Cash from Financing
- Net Change in Cash
         ↓
Returns structured data to frontend
         ↓
Frontend displays with color-coded positive/negative values
```

## Adding New Report Types

To add a new report type (e.g., "Profitability Analysis"):

### Step 1: Add to FinancialReportsPage.vue

```javascript
// In availableReports array
{
  id: 'profitability_analysis',
  name: 'Profitability Analysis',
  description: 'Detailed profitability metrics and ratios',
  icon: 'svg',
  color: 'bg-indigo-500'
}

// Add data ref
const profitabilityAnalysis = ref({
  grossProfitMargin: 0,
  operatingProfitMargin: 0,
  netProfitMargin: 0,
  roa: 0,
  roe: 0
});

// Add case in generateReport()
else if (selectedReport.value === 'profitability_analysis') {
  const data = await financeService.getProfitabilityAnalysis(params);
  profitabilityAnalysis.value = data;
}
```

### Step 2: Add to financeService.js

```javascript
// In financeService object
getProfitabilityAnalysis: (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/financial-reports/profitability-analysis${queryString ? '?' + queryString : ''}`);
}
```

### Step 3: Add template section

```vue
<div v-if="selectedReport === 'profitability_analysis' && !loading" class="bg-white rounded-lg shadow-md p-6 mb-6">
  <h2 class="text-2xl font-bold text-gray-900 mb-6">Profitability Analysis</h2>
  <!-- Add your profitability metrics here -->
</div>
```

### Step 4: Implement backend endpoint

Create `/financial-reports/profitability-analysis` endpoint that:
- Calculates profitability metrics
- Returns structured data matching the expected format

## Using Financial Calculations in Reports

Example: Add financial ratios to the balance sheet report

```vue
<script setup>
import { useFinancialCalculations } from '@/composables/useFinancialCalculations';

const { calculateCurrentRatio, calculateDebtToEquityRatio } = useFinancialCalculations();

// In your report generation
const generateReport = async () => {
  // ... fetch data ...
  
  // Calculate ratios
  const currentRatio = calculateCurrentRatio(
    balanceSheet.currentAssets,
    balanceSheet.currentLiabilities
  );
  
  const debtToEquity = calculateDebtToEquityRatio(
    balanceSheet.totalLiabilities,
    balanceSheet.totalEquity
  );
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4 mt-6">
    <div class="bg-blue-50 p-4 rounded">
      <p class="text-gray-600 text-sm">Current Ratio</p>
      <p class="text-2xl font-bold text-gray-900">{{ currentRatio.toFixed(2) }}</p>
    </div>
    <div class="bg-blue-50 p-4 rounded">
      <p class="text-gray-600 text-sm">Debt-to-Equity</p>
      <p class="text-2xl font-bold text-gray-900">{{ debtToEquity.toFixed(2) }}</p>
    </div>
  </div>
</template>
```

## Testing Integration

### Test 1: Verify API Calls

```javascript
// In your test file
import { describe, it, expect, vi } from 'vitest';
import financeService from '@/services/financeService';

describe('Financial Reports Integration', () => {
  it('should call getIncomeStatement with correct parameters', async () => {
    const spy = vi.spyOn(financeService, 'getIncomeStatement');
    
    await financeService.getIncomeStatement({
      fromDate: '2025-12-01',
      toDate: '2025-12-04'
    });
    
    expect(spy).toHaveBeenCalledWith({
      fromDate: '2025-12-01',
      toDate: '2025-12-04'
    });
  });
});
```

### Test 2: Verify Data Formatting

```javascript
import { useFinancialCalculations } from '@/composables/useFinancialCalculations';

describe('Financial Calculations', () => {
  it('should format currency correctly', () => {
    const { formatCurrency } = useFinancialCalculations();
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
```

### Test 3: Verify Balance Sheet Validation

```javascript
describe('Balance Sheet Validation', () => {
  it('should validate balanced balance sheet', () => {
    const balanceSheet = {
      totalAssets: 100000,
      totalLiabilitiesAndEquity: 100000,
      isBalanced: true
    };
    
    expect(balanceSheet.isBalanced).toBe(true);
  });
});
```

## Troubleshooting Common Issues

### Issue: "Cannot read property 'revenue' of undefined"

**Cause**: API returned undefined or null

**Solution**: Add null checks in template
```vue
<div v-if="incomeStatement && incomeStatement.revenue">
  <!-- render revenue -->
</div>
```

### Issue: Date range not working correctly

**Cause**: Date format mismatch between frontend and backend

**Solution**: Ensure dates are in ISO format (YYYY-MM-DD)
```javascript
const formatDateToISO = (date) => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};
```

### Issue: Balance sheet doesn't balance

**Cause**: Unposted journal entries or data inconsistency

**Solution**: Check that all transactions are properly posted before generating reports

## Performance Optimization

### 1. Add Caching

```javascript
// In financeService.js
const reportCache = new Map();

export const getIncomeStatement = async (params) => {
  const cacheKey = JSON.stringify(params);
  
  if (reportCache.has(cacheKey)) {
    return reportCache.get(cacheKey);
  }
  
  const data = await apiCall('/financial-reports/income-statement', { params });
  reportCache.set(cacheKey, data);
  
  return data;
};
```

### 2. Add Pagination for Large Datasets

```javascript
// Backend should support pagination
getIncomeStatement: (params = {}) => {
  const queryString = new URLSearchParams({
    ...params,
    page: params.page || 1,
    limit: params.limit || 50
  }).toString();
  return apiCall(`/financial-reports/income-statement?${queryString}`);
}
```

### 3. Lazy Load Reports

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

const IncomeStatement = defineAsyncComponent(() =>
  import('./components/IncomeStatementReport.vue')
);
</script>
```

## Next Steps

1. **Implement Backend Endpoints**: Create the three financial report endpoints
2. **Test Integration**: Run integration tests with real data
3. **Add Export Functionality**: Implement PDF and Excel export
4. **Add Charts**: Visualize financial data with charts
5. **Add Comparisons**: Compare periods and show trends
6. **Add Alerts**: Notify users of financial anomalies

## Support

For questions or issues, refer to:
- Backend API documentation
- Finance module documentation
- Vue 3 Composition API documentation
- Tailwind CSS documentation

