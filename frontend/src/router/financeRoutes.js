// Finance Module Routes
import FinanceDashboard from '../pages/admin/finance/FinanceDashboard.vue';
import InvoicesPage from '../pages/admin/finance/InvoicesPage.vue';
import BillsPage from '../pages/admin/finance/BillsPage.vue';
import BankAccountsPage from '../pages/admin/finance/BankAccountsPage.vue';
import ChartOfAccountsPage from '../pages/admin/finance/ChartOfAccountsPage.vue';
import FinancialReportsPage from '../pages/admin/finance/FinancialReportsPage.vue';
import GeneralLedgerPage from '../pages/admin/finance/GeneralLedgerPage.vue';
import BudgetsPage from '../pages/admin/finance/BudgetsPage.vue';
import BudgetAnalysisPage from '../pages/admin/finance/BudgetAnalysisPage.vue';
import ApprovalsPage from '../pages/admin/finance/ApprovalsPage.vue';
import ApprovalDetailPage from '../pages/admin/finance/ApprovalDetailPage.vue';
import CustomReportsPage from '../pages/admin/finance/CustomReportsPage.vue';
import ReportViewerPage from '../pages/admin/finance/ReportViewerPage.vue';
import TaxManagementPage from '../pages/admin/finance/TaxManagementPage.vue';
import PaymentManagementPage from '../pages/admin/finance/PaymentManagementPage.vue';

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
  },
  {
    path: '/admin/finance/budgets',
    name: 'Budgets',
    component: BudgetsPage,
    meta: {
      title: 'Budget Management',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/budgets/:id/analysis',
    name: 'BudgetAnalysis',
    component: BudgetAnalysisPage,
    meta: {
      title: 'Budget Analysis',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/approvals',
    name: 'Approvals',
    component: ApprovalsPage,
    meta: {
      title: 'Approval Workflows',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/approvals/:id',
    name: 'ApprovalDetail',
    component: ApprovalDetailPage,
    meta: {
      title: 'Approval Details',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/custom-reports',
    name: 'CustomReports',
    component: CustomReportsPage,
    meta: {
      title: 'Custom Reports',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/reports/:id/view',
    name: 'ReportViewer',
    component: ReportViewerPage,
    meta: {
      title: 'View Report',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/tax',
    name: 'TaxManagement',
    component: TaxManagementPage,
    meta: {
      title: 'Tax Management',
      requiresAuth: true
    }
  },
  {
    path: '/admin/finance/payments',
    name: 'PaymentManagement',
    component: PaymentManagementPage,
    meta: {
      title: 'Payment Management',
      requiresAuth: true
    }
  }
];

export default financeRoutes;

