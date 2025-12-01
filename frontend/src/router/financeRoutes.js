// Finance Module Routes
import FinanceDashboard from '../pages/admin/finance/FinanceDashboard.vue';
import InvoicesPage from '../pages/admin/finance/InvoicesPage.vue';
import BillsPage from '../pages/admin/finance/BillsPage.vue';
import BankAccountsPage from '../pages/admin/finance/BankAccountsPage.vue';
import ChartOfAccountsPage from '../pages/admin/finance/ChartOfAccountsPage.vue';
import FinancialReportsPage from '../pages/admin/finance/FinancialReportsPage.vue';
import GeneralLedgerPage from '../pages/admin/finance/GeneralLedgerPage.vue';

export const financeRoutes = [
  {
    path: '/admin/finance',
    name: 'FinanceDashboard',
    component: FinanceDashboard,
    meta: {
      title: 'Finance Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/invoices',
    name: 'Invoices',
    component: InvoicesPage,
    meta: {
      title: 'Invoices - Accounts Receivable',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/bills',
    name: 'Bills',
    component: BillsPage,
    meta: {
      title: 'Bills - Accounts Payable',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/bank-accounts',
    name: 'BankAccounts',
    component: BankAccountsPage,
    meta: {
      title: 'Bank Accounts',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/chart-of-accounts',
    name: 'ChartOfAccounts',
    component: ChartOfAccountsPage,
    meta: {
      title: 'Chart of Accounts',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/reports',
    name: 'FinancialReports',
    component: FinancialReportsPage,
    meta: {
      title: 'Financial Reports',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/general-ledger',
    name: 'GeneralLedger',
    component: GeneralLedgerPage,
    meta: {
      title: 'General Ledger',
      requiresAuth: true
    }
  }
];

export default financeRoutes;

