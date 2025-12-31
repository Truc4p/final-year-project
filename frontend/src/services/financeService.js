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
    return apiCall(`/financial-reports/cash-flow-statement${queryString ? '?' + queryString : ''}`);
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
  }),

  // ===== BUDGET MANAGEMENT =====
  
  // Get all budgets
  getBudgets: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/budgets${queryString ? '?' + queryString : ''}`);
  },

  // Get single budget
  getBudget: (budgetId) => apiCall(`/api/finance/budgets/${budgetId}`),

  // Create budget
  createBudget: (data) => apiCall('/api/finance/budgets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update budget
  updateBudget: (budgetId, data) => apiCall(`/api/finance/budgets/${budgetId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete budget
  deleteBudget: (budgetId) => apiCall(`/api/finance/budgets/${budgetId}`, {
    method: 'DELETE'
  }),

  // Approve budget
  approveBudget: (budgetId) => apiCall(`/api/finance/budgets/${budgetId}/approve`, {
    method: 'POST'
  }),

  // Update budget actuals
  updateBudgetActuals: (budgetId) => apiCall(`/api/finance/budgets/${budgetId}/update-actuals`, {
    method: 'POST'
  }),

  // Get budget analysis
  getBudgetAnalysis: (budgetId) => apiCall(`/api/finance/budgets/${budgetId}/analysis`),

  // Duplicate budget
  duplicateBudget: (budgetId, data = {}) => apiCall(`/api/finance/budgets/${budgetId}/duplicate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Close budget
  closeBudget: (budgetId) => apiCall(`/api/finance/budgets/${budgetId}/close`, {
    method: 'POST'
  }),

  // Compare budgets
  compareBudgets: (budgetIds) => {
    const queryString = new URLSearchParams({ budgetIds }).toString();
    return apiCall(`/api/finance/budgets/compare?${queryString}`);
  }
,

  // ==================== APPROVAL WORKFLOWS ====================

  // Get all approvals
  getApprovals: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/approvals${queryString ? '?' + queryString : ''}`);
  },

  // Get single approval with document details
  getApproval: (id) => apiCall(`/api/finance/approvals/${id}`),

  // Create approval workflow
  createApproval: (data) => apiCall('/api/finance/approvals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Approve step
  approveStep: (approvalId, data) => apiCall(`/api/finance/approvals/${approvalId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Reject approval
  rejectApproval: (approvalId, data) => apiCall(`/api/finance/approvals/${approvalId}/reject`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Cancel approval
  cancelApproval: (approvalId, data) => apiCall(`/api/finance/approvals/${approvalId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Escalate approval (admin only)
  escalateApproval: (approvalId, data) => apiCall(`/api/finance/approvals/${approvalId}/escalate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Reassign approval step (admin only)
  reassignApproval: (approvalId, data) => apiCall(`/api/finance/approvals/${approvalId}/reassign`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Get approval statistics
  getApprovalStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/approvals/stats${queryString ? '?' + queryString : ''}`);
  },

  // ==================== CUSTOM REPORTS ====================

  // Get all reports
  getReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/reports${queryString ? '?' + queryString : ''}`);
  },

  // Get single report
  getReport: (id) => apiCall(`/api/finance/reports/${id}`),

  // Create report
  createReport: (data) => apiCall('/api/finance/reports', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update report
  updateReport: (id, data) => apiCall(`/api/finance/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete report
  deleteReport: (id) => apiCall(`/api/finance/reports/${id}`, {
    method: 'DELETE'
  }),

  // Run report
  runReport: (id) => apiCall(`/api/finance/reports/${id}/run`, {
    method: 'POST'
  }),

  // Export report as PDF
  exportReportPDF: (id) => apiCall(`/api/finance/reports/${id}/export/pdf`),

  // Export report as Excel
  exportReportExcel: (id) => apiCall(`/api/finance/reports/${id}/export/excel`),

  // Duplicate report
  duplicateReport: (id) => apiCall(`/api/finance/reports/${id}/duplicate`, {
    method: 'POST'
  }),

  // Share report
  shareReport: (id, data) => apiCall(`/api/finance/reports/${id}/share`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Get report templates
  getReportTemplates: () => apiCall('/api/finance/reports/templates'),

  // Get popular reports
  getPopularReports: (limit = 10) => {
    const queryString = new URLSearchParams({ limit }).toString();
    return apiCall(`/api/finance/reports/popular?${queryString}`);
  },

  // ==================== TAX MANAGEMENT ====================

  // Tax Rates
  getTaxRates: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiCall(`/api/finance/tax/rates?${queryString}`);
  },

  getTaxRate: (id) => apiCall(`/api/finance/tax/rates/${id}`),

  createTaxRate: (data) => apiCall('/api/finance/tax/rates', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateTaxRate: (id, data) => apiCall(`/api/finance/tax/rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteTaxRate: (id) => apiCall(`/api/finance/tax/rates/${id}`, {
    method: 'DELETE'
  }),

  getApplicableTaxRates: (criteria) => {
    const queryString = new URLSearchParams(criteria).toString();
    return apiCall(`/api/finance/tax/rates/applicable?${queryString}`);
  },

  // Tax Liabilities
  getTaxLiabilities: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiCall(`/api/finance/tax/liabilities?${queryString}`);
  },

  getTaxLiability: (id) => apiCall(`/api/finance/tax/liabilities/${id}`),

  createTaxLiability: (data) => apiCall('/api/finance/tax/liabilities', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateTaxLiability: (id, data) => apiCall(`/api/finance/tax/liabilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteTaxLiability: (id) => apiCall(`/api/finance/tax/liabilities/${id}`, {
    method: 'DELETE'
  }),

  calculateTaxLiability: (data) => apiCall('/api/finance/tax/liabilities/calculate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  fileTaxLiability: (id) => apiCall(`/api/finance/tax/liabilities/${id}/file`, {
    method: 'POST'
  }),

  addTaxPayment: (id, data) => apiCall(`/api/finance/tax/liabilities/${id}/payments`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  calculateTaxPenalties: (id, data = {}) => apiCall(`/api/finance/tax/liabilities/${id}/penalties`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getTaxSummary: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/finance/tax/summary?${queryString}`);
  },

  getOverdueTaxLiabilities: () => apiCall('/api/finance/tax/liabilities/overdue')

};

