/**
 * Finance Service
 * Handles all API calls for the Finance module
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available (support multiple keys for compatibility)
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token; // backward compatibility with some endpoints
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      // Try to extract useful error message from JSON or text body
      let message = `Request failed (${response.status})`;
      try {
        if (contentType.includes('application/json')) {
          const errJson = await response.json();
          if (errJson && (errJson.message || errJson.error)) {
            message = errJson.message || errJson.error;
          }
        } else {
          const errText = await response.text();
          if (errText) message = errText;
        }
      } catch (_) {
        // ignore parse errors, use default message
      }
      throw new Error(message);
    }

    if (response.status === 204) return null;
    if (contentType.includes('application/json')) {
    return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// ==================== DASHBOARD ====================

export const financeService = {
  // Dashboard
  getDashboard: () => apiCall('/api/finance/dashboard'),

  // ==================== CUSTOMERS ====================
  
  // Get customers
  getCustomers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/customers${queryString ? '?' + queryString : ''}`);
  },

  // Create customer
  createCustomer: (data) => apiCall('/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // ==================== INVOICES ====================
  
  // Get all invoices
  getInvoices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/invoices${queryString ? '?' + queryString : ''}`);
  },

  // Get single invoice
  getInvoice: (id) => apiCall(`/invoices/${id}`),

  // Create invoice
  createInvoice: (data) => apiCall('/invoices', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update invoice
  updateInvoice: (id, data) => apiCall(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete invoice
  deleteInvoice: (id) => apiCall(`/invoices/${id}`, {
    method: 'DELETE'
  }),

  // Post invoice to general ledger
  postInvoice: (id) => apiCall(`/invoices/${id}/post`, { method: 'POST' }),

  // ==================== BILLS ====================

  // Get all bills
  getBills: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/bills${queryString ? '?' + queryString : ''}`);
  },

  // Get single bill
  getBill: (id) => apiCall(`/bills/${id}`),

  // Create bill
  createBill: (data) => apiCall('/bills', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update bill
  updateBill: (id, data) => apiCall(`/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete bill
  deleteBill: (id) => apiCall(`/bills/${id}`, {
    method: 'DELETE'
  }),

  // Approve bill
  approveBill: (id) => apiCall(`/bills/${id}/approve`, { method: 'POST' }),

  // Post bill to general ledger
  postBill: (id) => apiCall(`/bills/${id}/post`, { method: 'POST' }),

  // Bill form data helpers
  getBillVendors: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/bills/form-data/vendors${queryString ? '?' + queryString : ''}`);
  },
  getBillExpenseAccounts: () => apiCall('/bills/form-data/expense-accounts'),
  getVendorDetails: (vendorId) => apiCall(`/bills/form-data/vendor/${vendorId}`),

  // ==================== BANK ACCOUNTS ====================

  // Get all bank accounts
  getBankAccounts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/bank-accounts${queryString ? '?' + queryString : ''}`);
  },

  // Get single bank account
  getBankAccount: (id) => apiCall(`/api/finance/bank-accounts/${id}`),

  // Create bank account
  createBankAccount: (data) => apiCall('/api/finance/bank-accounts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update bank account
  updateBankAccount: (id, data) => apiCall(`/api/finance/bank-accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete bank account
  deleteBankAccount: (id) => apiCall(`/api/finance/bank-accounts/${id}`, {
    method: 'DELETE'
  }),

  // Get bank account transactions
  getBankAccountTransactions: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/bank-accounts/${id}/transactions${queryString ? '?' + queryString : ''}`);
  },

  // Delete a specific bank transaction
  deleteBankTransaction: (accountId, transactionId) =>
    apiCall(`/api/finance/bank-accounts/${accountId}/transactions/${transactionId}`, {
      method: 'DELETE'
    }),

  // Add bank transaction
  addBankTransaction: (id, data) => apiCall(`/api/finance/bank-accounts/${id}/transactions`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Get bank account summary
  getBankAccountSummary: (id) => apiCall(`/api/finance/bank-accounts/${id}/summary`),



  // ==================== CHART OF ACCOUNTS ====================

  // Get all chart of accounts
  getChartOfAccounts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/chart-of-accounts${queryString ? '?' + queryString : ''}`);
  },

  // Get single account
  getAccount: (id) => apiCall(`/api/finance/chart-of-accounts/${id}`),

  // Create account
  createAccount: (data) => apiCall('/api/finance/chart-of-accounts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update account
  updateAccount: (id, data) => apiCall(`/api/finance/chart-of-accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete account
  deleteAccount: (id) => apiCall(`/api/finance/chart-of-accounts/${id}`, {
    method: 'DELETE'
  }),

  // ==================== FINANCIAL REPORTS ====================

  // Get income statement
  getIncomeStatement: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/financial-reports/income-statement${queryString ? '?' + queryString : ''}`);
  },

  // Get balance sheet
  getBalanceSheet: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/financial-reports/balance-sheet${queryString ? '?' + queryString : ''}`);
  },

  // Get cash flow statement
  getCashFlowStatement: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/financial-reports/cash-flow${queryString ? '?' + queryString : ''}`);
  },

  // ==================== GENERAL LEDGER ====================

  // Get all journal entries
  getJournalEntries: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/general-ledger${queryString ? '?' + queryString : ''}`);
  },

  // Get single journal entry
  getJournalEntry: (id) => apiCall(`/api/finance/general-ledger/${id}`),

  // Create journal entry
  createJournalEntry: (data) => apiCall('/api/finance/general-ledger', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update journal entry
  updateJournalEntry: (id, data) => apiCall(`/api/finance/general-ledger/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete journal entry
  deleteJournalEntry: (id) => apiCall(`/api/finance/general-ledger/${id}`, {
    method: 'DELETE'
  }),

  // Get trial balance
  getTrialBalance: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/general-ledger/trial-balance${queryString ? '?' + queryString : ''}`);
  },

  // ==================== EMAIL BANK NOTIFICATIONS ====================

  // Connect email account for bank notifications
  connectEmailAccount: (data) => apiCall('/api/finance/email-notifications/connect', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Disconnect email account
  disconnectEmailAccount: (accountId) => apiCall(`/api/finance/email-notifications/disconnect/${accountId}`, {
    method: 'POST'
  }),

  // Get connected email accounts
  getEmailAccounts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/email-notifications/accounts${queryString ? '?' + queryString : ''}`);
  },

  // Sync transactions from email notifications
  syncEmailTransactions: (bankAccountId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/email-notifications/sync/${bankAccountId}${queryString ? '?' + queryString : ''}`, {
      method: 'POST'
    });
  },

  // Get parsed transactions from emails
  getParsedEmailTransactions: (bankAccountId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/email-notifications/transactions/${bankAccountId}${queryString ? '?' + queryString : ''}`);
  },

  // Test email connection
  testEmailConnection: (data) => apiCall('/api/finance/email-notifications/test', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export default financeService;

