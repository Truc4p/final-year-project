# Finance Module Frontend Setup Guide

## Overview

This guide explains how to integrate the Finance module frontend components into your Vue.js admin application.

## Files Created

### Pages (7 files)
1. **FinanceDashboard.vue** - Main finance dashboard with key metrics
2. **InvoicesPage.vue** - Accounts Receivable management
3. **BillsPage.vue** - Accounts Payable management
4. **BankAccountsPage.vue** - Bank account management
5. **ChartOfAccountsPage.vue** - Chart of Accounts management
6. **FinancialReportsPage.vue** - Financial reports (Income Statement, Balance Sheet, Cash Flow)
7. **GeneralLedgerPage.vue** - General Ledger and Trial Balance

### Router Configuration
- **financeRoutes.js** - Route definitions for all finance pages

### Navigation
- **Admin-Navbar.vue** - Updated with Finance dropdown menu

## Installation Steps

### Step 1: Copy Files to Your Project

```bash
# Copy page components
cp frontend/src/pages/admin/finance/*.vue your-project/src/pages/admin/finance/

# Copy router configuration
cp frontend/src/router/financeRoutes.js your-project/src/router/
```

### Step 2: Update Your Main Router

In your main router file (e.g., `src/router/index.js`):

```javascript
import { financeRoutes } from './financeRoutes';

const routes = [
  // ... existing routes
  ...financeRoutes,
  // ... other routes
];

export default new Router({
  routes
});
```

### Step 3: Verify Navigation Bar Update

The `Admin-Navbar.vue` has been updated with:
- Finance dropdown menu in desktop view
- Finance mobile menu in mobile view
- Links to all finance pages

### Step 4: API Integration

Each page currently uses sample data. To integrate with your backend API:

#### FinanceDashboard.vue
```javascript
// Replace sample data with API calls
onMounted(async () => {
  try {
    const response = await fetch('/api/finance/dashboard');
    const data = await response.json();
    totalRevenue.value = data.totalRevenue;
    totalExpenses.value = data.totalExpenses;
    netIncome.value = data.netIncome;
    cashBalance.value = data.cashBalance;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});
```

#### InvoicesPage.vue
```javascript
// Fetch invoices from API
onMounted(async () => {
  try {
    const response = await fetch('/invoices');
    invoices.value = await response.json();
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
});

// Create invoice
const submitInvoice = async () => {
  try {
    const response = await fetch('/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    });
    const newInvoice = await response.json();
    invoices.value.push(newInvoice);
    showCreateModal.value = false;
  } catch (error) {
    console.error('Error creating invoice:', error);
  }
};
```

#### BillsPage.vue
```javascript
// Similar pattern for bills
// API endpoints: /bills
```

#### BankAccountsPage.vue
```javascript
// API endpoints: /api/finance/bank-accounts
```

#### ChartOfAccountsPage.vue
```javascript
// API endpoints: /api/finance/chart-of-accounts
```

#### FinancialReportsPage.vue
```javascript
// API endpoints: /financial-reports
```

#### GeneralLedgerPage.vue
```javascript
// API endpoints: /api/finance/general-ledger
```

## API Endpoints Reference

### Finance Dashboard
```
GET /api/finance/dashboard
```

### Invoices (Accounts Receivable)
```
GET /invoices - List all invoices
POST /invoices - Create invoice
GET /invoices/:id - Get invoice details
PUT /invoices/:id - Update invoice
DELETE /invoices/:id - Delete invoice
```

### Bills (Accounts Payable)
```
GET /bills - List all bills
POST /bills - Create bill
GET /bills/:id - Get bill details
PUT /bills/:id - Update bill
DELETE /bills/:id - Delete bill
```

### Bank Accounts
```
GET /api/finance/bank-accounts - List all accounts
POST /api/finance/bank-accounts - Create account
GET /api/finance/bank-accounts/:id - Get account details
PUT /api/finance/bank-accounts/:id - Update account
DELETE /api/finance/bank-accounts/:id - Delete account
GET /api/finance/bank-accounts/:id/transactions - Get transactions
POST /api/finance/bank-accounts/:id/transactions - Add transaction
```

### Chart of Accounts
```
GET /api/finance/chart-of-accounts - List all accounts
POST /api/finance/chart-of-accounts - Create account
GET /api/finance/chart-of-accounts/:id - Get account details
PUT /api/finance/chart-of-accounts/:id - Update account
DELETE /api/finance/chart-of-accounts/:id - Delete account
```

### Financial Reports
```
GET /financial-reports/income-statement - Income Statement
GET /financial-reports/balance-sheet - Balance Sheet
GET /financial-reports/cash-flow - Cash Flow Statement
```

### General Ledger
```
GET /api/finance/general-ledger - List all entries
POST /api/finance/general-ledger - Create entry
GET /api/finance/general-ledger/:id - Get entry details
PUT /api/finance/general-ledger/:id - Update entry
DELETE /api/finance/general-ledger/:id - Delete entry
GET /api/finance/general-ledger/trial-balance - Trial Balance
```

## Component Features

### FinanceDashboard
- Key financial metrics (Revenue, Expenses, Net Income, Cash Balance)
- Quick action cards linking to other modules
- Recent invoices and bills preview
- Responsive grid layout

### InvoicesPage
- List all invoices with filtering
- Search by invoice number or customer
- Filter by status and date range
- Create new invoices
- Edit and delete invoices
- Status badges (Draft, Sent, Paid, Overdue)

### BillsPage
- List all bills with filtering
- Search by bill number or vendor
- Filter by status and date range
- Create new bills
- Edit and delete bills
- Status badges (Draft, Received, Paid, Overdue)

### BankAccountsPage
- Display bank accounts as cards
- Show current balance and account type
- Primary account indicator
- Recent transactions table
- Add new bank accounts
- Edit and delete accounts

### ChartOfAccountsPage
- List all accounts with filtering
- Filter by account type and status
- Search by code or name
- Color-coded account types
- Add new accounts
- Edit and delete accounts
- Display account balances

### FinancialReportsPage
- Income Statement report
- Balance Sheet report
- Cash Flow Statement report
- Period selection (Month, Quarter, Year)
- Custom date range support
- Export to PDF
- Export to Excel

### GeneralLedgerPage
- List all journal entries
- Filter by account and date
- Search functionality
- Trial Balance summary
- Debit/Credit totals
- Entry status tracking
- Edit and delete draft entries

## Styling

All components use Tailwind CSS classes for styling. Ensure your project has Tailwind CSS configured.

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Orange (#F97316)
- Danger: Red (#EF4444)
- Info: Purple (#8B5CF6)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible grids and tables with horizontal scrolling

## Internationalization (i18n)

The components use Vue I18n for translations. Add these keys to your i18n configuration:

```javascript
{
  finance: 'Finance',
  invoices: 'Invoices',
  bills: 'Bills',
  bankAccounts: 'Bank Accounts',
  chartOfAccounts: 'Chart of Accounts',
  financialReports: 'Financial Reports',
  generalLedger: 'General Ledger',
  // Add more as needed
}
```

## State Management

For production, consider using Vuex or Pinia for state management:

```javascript
// Example Vuex store for finance
export const financeStore = {
  state: {
    invoices: [],
    bills: [],
    bankAccounts: [],
    chartOfAccounts: [],
    loading: false,
    error: null
  },
  mutations: {
    setInvoices(state, invoices) {
      state.invoices = invoices;
    },
    // ... other mutations
  },
  actions: {
    async fetchInvoices({ commit }) {
      try {
        const response = await fetch('/invoices');
        const data = await response.json();
        commit('setInvoices', data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    }
    // ... other actions
  }
};
```

## Error Handling

Add error handling to all API calls:

```javascript
const handleError = (error) => {
  console.error('Error:', error);
  // Show toast notification
  // Update error state
};
```

## Loading States

Add loading indicators for better UX:

```javascript
const isLoading = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  try {
    // API call
  } finally {
    isLoading.value = false;
  }
};
```

## Testing

Each component should be tested with:
- Unit tests for computed properties and methods
- Integration tests for API calls
- E2E tests for user workflows

## Performance Optimization

1. **Lazy Loading**: Load pages only when needed
2. **Pagination**: Implement pagination for large datasets
3. **Caching**: Cache API responses
4. **Debouncing**: Debounce search and filter inputs
5. **Virtual Scrolling**: For large tables

## Accessibility

- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast compliance
- Focus management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Routes Not Working
- Ensure financeRoutes.js is imported in your main router
- Check route paths match the links in navbar

### Styling Issues
- Verify Tailwind CSS is properly configured
- Check class names are correct
- Ensure CSS is compiled

### API Integration Issues
- Check API endpoints match your backend
- Verify CORS is configured
- Check authentication headers

### Data Not Displaying
- Check browser console for errors
- Verify API responses match expected format
- Check data binding in templates

## Future Enhancements

1. Real-time data updates with WebSockets
2. Advanced filtering and search
3. Data export (PDF, Excel, CSV)
4. Batch operations
5. Audit trail and history
6. Multi-currency support
7. Advanced reporting and analytics
8. Mobile app integration
9. API documentation
10. Performance monitoring

## Support

For issues or questions:
1. Check the documentation
2. Review component code comments
3. Check browser console for errors
4. Review API responses
5. Contact development team

## License

These components are part of the WrenCos Finance Module and follow the same license as the main project.

