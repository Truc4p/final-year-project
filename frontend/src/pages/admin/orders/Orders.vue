<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import AdminChatWidget from '../../../components/AdminChatWidget.vue';

const { t } = useI18n();
const router = useRouter();

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref('all'); // 'all', 'completed', 'processing', 'shipping', 'cancelled', 'refunded'

// Computed property for filtered orders
const filteredOrders = computed(() => {
  let filtered = orders.value;
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(order => 
      order.status?.toLowerCase() === statusFilter.value.toLowerCase()
    );
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order._id.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You need to login first");
    router.push("/login");
    return;
  }

  try {
    // Make the api request with axios with token in header
    const res = await axios.get(`${API_URL}/orders`, {
      headers: {
        "x-auth-token": `${token}`,
      },
    });

    console.log("Orders response:", res.data);
    orders.value = res.data;
  } catch (err) {
    console.error("Error fetching orders:", err);
    error.value = "Failed to load orders";
  } finally {
    loading.value = false;
  }
});

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-purple-100 text-purple-800';
    case 'shipping':
      return 'bg-orange-100 text-orange-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Safely format order date-time from possible fields and include time
const getOrderDateTime = (order) => {
  const raw = order?.createdAt || order?.orderDate || order?.date || order?.created_at || order?.created;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

// Function to clear all filters
const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
};
</script>

<template>
  <div class="page-background min-h-screen">
    <!-- Header and Action Bar in Container -->
    <div class="container mx-auto px-4 mb-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-600 mb-2">Order Management</h1>
        <p class="text-secondary-700 text-lg">Manage customer orders and track their status</p>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Search and Filter Controls -->
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
          <!-- Search Bar -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search orders by ID or status..."
                class="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 transition-colors duration-200"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <!-- Status Filter -->
          <div class="min-w-[200px]">
            <select
              v-model="statusFilter"
              class="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="shipping">Shipping</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        
        <div class="flex items-center gap-6 text-secondary-500">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span class="font-medium">{{ filteredOrders.length }} Orders</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-medium">{{ filteredOrders.filter(o => o.status?.toLowerCase() === 'completed').length }} Completed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Width Content Area -->
    <div class="w-full px-10">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto">
        <div class="card p-8 text-center">
          <div class="text-error text-lg font-medium mb-2">{{ error }}</div>
          <p class="text-secondary-500">Please try refreshing the page</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="max-w-4xl mx-auto">
        <div class="card p-12 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">No Orders Found</h3>
          <p class="text-secondary-500 mb-6">Orders will appear here once customers start placing them</p>
        </div>
      </div>

      <!-- No Search Results -->
      <div v-else-if="filteredOrders.length === 0" class="max-w-4xl mx-auto">
        <div class="card p-12 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">No Orders Match Your Search</h3>
          <p class="text-secondary-500 mb-6">Try adjusting your search terms or clear the search to see all orders</p>
          <button @click="clearFilters" class="btn btn-secondary">
            Clear All Filters
          </button>
        </div>
      </div>

      <!-- Full Width Orders Table -->
      <div v-else class="w-full">
        <div class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-secondary-100">
              <thead style="background-color: #f8fafc">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-secondary-100">
                <tr v-for="(order, index) in filteredOrders" :key="order._id" 
                    class="hover:bg-secondary-50 transition-colors duration-200 cursor-pointer"
                    @click="router.push(`/admin/orders/order/${order._id}`)">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-base font-medium text-secondary-700">#{{ order._id.slice(-8).toUpperCase() }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-base font-medium text-secondary-700">
                        {{ order.user.username }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-base text-secondary-700">
                      {{ getOrderDateTime(order) || 'N/A' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span :class="getStatusColor(order.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                        {{ order.status || 'N/A' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-base font-semibold text-success">
                      ${{ order.totalPrice || order.total || order.totalAmount || '0.00' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center" @click.stop>
                    <div class="flex items-center justify-center space-x-2">
                      <router-link :to="`/admin/orders/order/edit/${order._id}`">
                        <button class="btn-action btn-edit" title="Edit Order">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          <span class="hidden sm:inline ml-1">Edit</span>
                        </button>
                      </router-link>

                      <router-link :to="`/admin/orders/delete/${order._id}`">
                        <button class="btn-action btn-delete" title="Delete Order">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          <span class="hidden sm:inline ml-1">Delete</span>
                        </button>
                      </router-link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <AdminChatWidget />
  </div>
</template>

<style scoped>
.btn-action {
  @apply inline-flex items-center px-3 py-2 border border-transparent text-base leading-4 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-edit {
  @apply text-warning bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800 focus:ring-yellow-500;
}

.btn-delete {
  @apply text-error bg-red-50 hover:bg-red-100 hover:text-red-800 focus:ring-red-500;
}

.bg-secondary-25 {
  background-color: #fafbfc;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.3s ease-out;
}

tr:hover .btn-action {
  transform: scale(1.05);
}
</style>
