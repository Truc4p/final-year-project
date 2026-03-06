import { createRouter, createWebHistory } from "vue-router";
import { getUserRole, getAuthToken, isAuthenticated } from '../utils/auth';

import Login from "@/pages/public/Login.vue";
import Register from "@/pages/public/Register.vue";
import Logout from "@/pages/public/Logout.vue";
import PublicPage from "@/pages/public/PublicPage.vue";
import PublicLayout from "@/layout/PublicLayout.vue";
import Unsubscribe from "@/pages/public/Unsubscribe.vue";

import AdminLayout from "@/layout/AdminLayout.vue";
import AdminPage from "@/pages/admin/AdminPage.vue";
import CustomerPage from "@/pages/customer/CustomerPage.vue";

// Admin - Categories
import Categories from "@/pages/admin/categories/Categories.vue";
import CreateCategory from '@/pages/admin/categories/CreateCategory.vue';
import DetailCategory from '@/pages/admin/categories/DetailCategory.vue';
import EditCategory from '@/pages/admin/categories/EditCategory.vue';
import DeleteCategory from '@/pages/admin/categories/DeleteCategory.vue';

// Admin - Products
import Products from '@/pages/admin/products/Products.vue';
import CreateProduct from '@/pages/admin/products/CreateProduct.vue';
import DetailProductAdmin from '@/pages/admin/products/DetailProductAdmin.vue';
import EditProduct from '@/pages/admin/products/EditProduct.vue';
import DeleteProduct from '@/pages/admin/products/DeleteProduct.vue';

// Admin - Orders
import Orders from '@/pages/admin/orders/Orders.vue';
import DetailOrder from '@/pages/admin/orders/DetailOrder.vue';
import EditOrder from '@/pages/admin/orders/EditOrder.vue';
import DeleteOrderByAdmin from '@/pages/admin/orders/DeleteOrderByAdmin.vue';

// Admin - Users
import Users from '@/pages/admin/users/Users.vue';

// Admin - Finance
import CashFlow from '@/pages/admin/finance/CashFlow.vue';
import HumanResources from '@/pages/admin/hr/HumanResources.vue';
import FinanceDashboard from '@/pages/admin/finance/FinanceDashboard.vue';
import InvoicesPage from '@/pages/admin/finance/InvoicesPage.vue';
import InvoiceDetailPage from '@/pages/admin/finance/InvoiceDetailPage.vue';
import BillsPage from '@/pages/admin/finance/BillsPage.vue';
import BillDetailPage from '@/pages/admin/finance/BillDetailPage.vue';
import BankAccountsPage from '@/pages/admin/finance/BankAccountsPage.vue';
import ChartOfAccountsPage from '@/pages/admin/finance/ChartOfAccountsPage.vue';
import FinancialReportsPage from '@/pages/admin/finance/FinancialReportsPage.vue';
import GeneralLedgerPage from '@/pages/admin/finance/GeneralLedgerPage.vue';

// Admin - Analytics
import Analytics from '@/pages/admin/analytics/Analytics.vue';

// Customer
import CustomerLayout from "@/layout/CustomerLayout.vue";

// Customer - Products
import DetailProduct from '@/pages/customer/products/DetailProduct.vue';

// Customer - Shopping
import Cart from '@/pages/customer/shopping/Cart.vue';
import Checkout from '@/pages/customer/shopping/Checkout.vue';

// Customer - Orders
import OrderDetail from '@/pages/customer/orders/OrderDetail.vue';
import OrderHistory from '@/pages/customer/orders/OrderHistory.vue';
import DeleteOrder from '@/pages/customer/orders/DeleteOrder.vue';

// Customer - Account
import Profile from '@/pages/customer/account/Profile.vue';

// Customer - Live Stream
import LiveStream from '@/pages/customer/live-stream/LiveStream.vue';
import LiveStreamWatch from '@/pages/customer/live-stream/LiveStreamWatch.vue';

// Customer - Skin Study
import SkinStudy from '@/pages/customer/skin-study/AIDermatologyExpert.vue';

// Admin - Live Stream
import AdminLiveStream from '@/pages/admin/live-stream/AdminLiveStream.vue';

const routes = [
  {
    path: "/",
    component: PublicLayout,
    children: [
      { path: "", component: PublicPage },
      { path: "login", component: Login },
      { path: "register", component: Register },
      { path: "logout", component: Logout },
      { path: "unsubscribe/:token", component: Unsubscribe },
      { path: "unsubscribe", component: Unsubscribe }, // For legacy email links with ?email parameter
    ],
  },

  {
    path: "/admin",
    component: AdminLayout, meta: { requiresAuth: true, role: 'admin' },
    children: [
      // { path: "", component: AdminPage },
      { path: "", component: CashFlow },
      { path: "categories", component: Categories },
      { path: "create-category", component: CreateCategory },
      { path: "categories/:id", component: DetailCategory },
      { path: "categories/edit/:id", component: EditCategory },
      { path: "categories/delete/:id", component: DeleteCategory },

      { path: "products", component: Products },
      { path: "create-product", component: CreateProduct },
      { path: "products/:id", component: DetailProductAdmin },
      { path: "products/edit/:id", component: EditProduct },
      { path: "products/delete/:id", component: DeleteProduct },

      { path: "users", component: Users },
      { path: "analytics", component: Analytics },
      { path: "cashflow", component: CashFlow },
      { path: "hr", component: HumanResources },

      { path: "orders", component: Orders },
      { path: "orders/order/:id", component: DetailOrder },
      { path: "orders/order/edit/:id", component: EditOrder },
      { path: "orders/delete/:id", component: DeleteOrderByAdmin },
      
      { path: "live-stream", component: AdminLiveStream },
      { path: "live-stream/watch/:id", component: LiveStreamWatch },

      // Finance Module Routes
      { path: "finance", component: FinanceDashboard },
      { path: "finance/invoices", component: InvoicesPage },
      { path: "finance/invoices/:id", component: InvoiceDetailPage },
      { path: "finance/bills", component: BillsPage },
      { path: "finance/bills/:id", component: BillDetailPage },
      { path: "finance/bank-accounts", component: BankAccountsPage },
      { path: "finance/chart-of-accounts", component: ChartOfAccountsPage },
      { path: "finance/reports", component: FinancialReportsPage },
      { path: "finance/general-ledger", component: GeneralLedgerPage },

      // Email Marketing Routes
      { path: "email-marketing/subscribers", component: () => import("@/pages/admin/email-marketing/Subscribers.vue") },
      { path: "email-marketing/templates", component: () => import("@/pages/admin/email-marketing/Templates.vue") },
      { path: "email-marketing/campaigns", component: () => import("@/pages/admin/email-marketing/CreateCampaign.vue") },
      { path: "email-marketing/campaigns/create", component: () => import("@/pages/admin/email-marketing/CreateCampaign.vue") },
      { path: "email-marketing/analytics", component: () => import("@/pages/admin/email-marketing/Analytics.vue") },

      // Social Media Marketing Routes
      { path: "social-media", component: () => import("@/pages/admin/social-media/Dashboard.vue") },
      { path: "social-media/accounts", component: () => import("@/pages/admin/social-media/Accounts.vue") },
      { path: "social-media/posts/create", component: () => import("@/pages/admin/social-media/CreatePost.vue") },
      { path: "social-media/posts/:id", component: () => import("@/pages/admin/social-media/CreatePost.vue") },
      { path: "social-media/calendar", component: () => import("@/pages/admin/social-media/Calendar.vue") },

      // Referral Marketing Routes
      { path: "referral", component: () => import("@/pages/admin/referral/Dashboard.vue") },
      { path: "referral/programs", component: () => import("@/pages/admin/referral/Dashboard.vue") },
      { path: "referral/programs/create", component: () => import("@/pages/admin/referral/ProgramBuilder.vue") },
      { path: "referral/programs/:id/edit", component: () => import("@/pages/admin/referral/ProgramBuilder.vue") },
      { path: "referral/programs/:id/analytics", component: () => import("@/pages/admin/referral/ProgramAnalytics.vue") },
      { path: "referral/rewards", component: () => import("@/pages/admin/referral/Dashboard.vue") },
      { path: "referral/leaderboard", component: () => import("@/pages/admin/referral/Leaderboard.vue") },

      // Marketing Automation Routes
      { path: "automation", component: () => import("@/pages/admin/automation/Dashboard.vue") },
      { path: "automation/workflows/create", component: () => import("@/pages/admin/automation/WorkflowBuilder.vue") },
      { path: "automation/workflows/:id/edit", component: () => import("@/pages/admin/automation/WorkflowBuilder.vue") },
      { path: "automation/templates", component: () => import("@/pages/admin/automation/Templates.vue") },

      // Retargeting/Display Ads Routes
      { path: "retargeting/dashboard", component: () => import("@/pages/admin/retargeting/Dashboard.vue") },
      { path: "retargeting/pixels", component: () => import("@/pages/admin/retargeting/TrackingPixels.vue") },
      { path: "retargeting/audiences", component: () => import("@/pages/admin/retargeting/Audiences.vue") },
      { path: "retargeting/audiences/create", component: () => import("@/pages/admin/retargeting/AudienceBuilder.vue") },
      { path: "retargeting/campaigns", component: () => import("@/pages/admin/retargeting/Campaigns.vue") },
      { path: "retargeting/campaigns/create", component: () => import("@/pages/admin/retargeting/CampaignBuilder.vue") },
      { path: "retargeting/campaigns/:id/edit", component: () => import("@/pages/admin/retargeting/CampaignBuilder.vue") },
      { path: "retargeting/platforms", component: () => import("@/pages/admin/retargeting/Platforms.vue") },
      { path: "retargeting/analytics", component: () => import("@/pages/admin/retargeting/Analytics.vue") },

    ],
  },

  {
    path: "/customer",
    component: CustomerLayout, meta: { requiresAuth: true, role: 'customer' },
    children: [
      { path: "", component: CustomerPage },
      { path: "products", component: CustomerPage }, // Products list page
      { path: "products/:id", component: DetailProduct },
      { path: "categories", component: CustomerPage }, // Categories page  
      { path: "orders", component: OrderHistory }, // Orders list page
      { path: "cart", component: Cart },
      { path: "checkout", component: Checkout },
      { path: "orders/order/:id", component: OrderDetail },
      { path: "order-history", component: OrderHistory },
      { path: "live-stream", component: LiveStream },
      { path: "live-stream/watch/:id", component: LiveStreamWatch },
      { path: "skin-study", component: SkinStudy },
      { path: "profile", component: Profile },
      { path: "orders/delete/:id", component: DeleteOrder },

    ],
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const hasToken = getAuthToken();
  const tokenValid = isAuthenticated();

  if (requiresAuth) {
    // Check if user has a valid token
    if (!hasToken || !tokenValid) {
      console.log('🔐 No valid token, redirecting to login');
      next('/login');
      return;
    }

    // Get cached role from localStorage (for UX only)
    // Backend will verify the actual role from JWT token in API calls
    const userRole = getUserRole();
    const routeRole = to.meta.role;
    
    if (routeRole && routeRole !== userRole) {
      console.log('🔐 Role mismatch, redirecting to login');
      // Clear potentially invalid cache
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      next('/login');
      return;
    }

    next();
  } else {
    next();
  }
});

export default router;