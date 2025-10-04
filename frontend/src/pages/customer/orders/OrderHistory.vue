<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import ChatWidget from '../../../components/ChatWidget.vue';

const router = useRouter();
const { t } = useI18n();

const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Get userId from localStorage
const userId = localStorage.getItem('userId');
if (!userId) {
  console.error('userId is not found in localStorage');
  // Handle the case where userId is not found, e.g., redirect to login page
  router.push('/login');
} else {
  console.log('userId:', userId); // Add this line to check the value of userId
}

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

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

const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Getting customer with ID:', userId); // Log userId
    const token = localStorage.getItem("token");
    if (!token) {
      alert(t('login'));
      return;
    }
    const response = await axios.get(`${API_URL}/orders/user/${userId}`, {
      headers: {
        "x-auth-token": token,
      },
    });
    // Sort latest first by orderDate (fallback to createdAt)
    const sorted = [...response.data].sort((a, b) => {
      const aDate = new Date(a.orderDate || a.createdAt || 0);
      const bDate = new Date(b.orderDate || b.createdAt || 0);
      return bDate - aDate;
    });
    orders.value = sorted;
    console.log('Orders response:', response.data);
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = 'Failed to load orders. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="page-background">
    <div class="w-full px-4 xl:px-8 2xl:px-12">
      
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ t('orderHistory') || 'Your Order History' }}</h1>
        <p class="text-gray-500 mb-8 max-w-md mx-auto">{{ t('orderHistoryDesc') || 'View your order history and track your purchases.' }}</p>
      </div>

      <!-- Quick Actions Bar -->
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <router-link to="/customer" class="btn-primary inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {{ t('continueShopping') || 'Continue Shopping' }}
          </router-link>
        </div>
        
        <div class="text-sm text-gray-500">
          {{ orders.length }} {{ t('ordersFound') || 'orders found' }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <svg class="loading-spinner mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">{{ t('loading') || 'Loading your orders...' }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">{{ error }}</p>
        <button @click="fetchOrders" class="mt-3 btn-primary text-sm">
          {{ t('tryAgain') || 'Try Again' }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-20">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-2xl font-medium text-gray-900 mb-2">{{ t('noOrdersYet') || 'No Orders Yet' }}</h3>
        <p class="text-gray-500 mb-8 max-w-md mx-auto">
          {{ t('noOrdersDesc') || 'You haven\'t placed any orders yet. Start shopping to see your order history here.' }}
        </p>
        <router-link to="/customer" class="btn-primary inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {{ t('startShopping') || 'Start Shopping' }}
        </router-link>
      </div>

      <!-- Orders Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <div v-for="order in orders" :key="order._id" class="order-card group">
          <router-link :to="`/customer/orders/order/${order._id}`" class="block h-full">
            
            <!-- Order Header -->
            <div class="px-6 py-4 text-gray-900" style="background: white; border-bottom: 1px solid #e5e7eb;">
              <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-900">{{ t('order') || 'Order' }} #{{ order._id.slice(-8) }}</p>
                      <p class="text-gray-500 text-sm">{{ formatDate(order.orderDate) }}</p>
                    </div>
                  </div>
                
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Order Content -->
            <div class="p-6 flex-grow">
              
              <!-- Order Summary -->
              <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p class="text-sm text-gray-500">{{ t('totalAmount') || 'Total Amount' }}</p>
                  <p class="text-2xl font-bold text-gray-900">${{ order.totalPrice }}</p>
                </div>
                
                <div class="text-right">
                  <p class="text-sm text-gray-500 mb-1">{{ t('status') || 'Status' }}</p>
                  <span :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    getStatusColor(order.status)
                  ]">
                    {{ order.status || 'Processing' }}
                  </span>
                </div>
              </div>

              <!-- Products Preview -->
              <div v-if="order.products && order.products.length > 0" class="space-y-3">
                <p class="text-sm font-medium text-gray-700 mb-3">
                  {{ t('items') || 'Items' }} ({{ order.products.length }})
                </p>
                
                <div v-for="(product, index) in order.products.slice(0, 2)" :key="index" class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      v-if="product.productId?.image" 
                      :src="`${$API_URL || API_URL}/${product.productId.image}`" 
                      :alt="product.productId?.name || 'Product'"
                      class="w-full h-full object-cover"
                      @error="$event.target.src = '/images/fallback-image.jpg'"
                    />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  
                  <div class="flex-grow min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ product.productId?.name || 'Product' }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ t('qty') || 'Qty' }}: {{ product.quantity }} × ${{ product.productId?.price || product.price }}
                    </p>
                  </div>
                </div>
                
                <div v-if="order.products.length > 2" class="text-sm text-gray-500 text-center py-2 border-t border-gray-100">
                  + {{ order.products.length - 2 }} {{ t('moreItems') || 'more items' }}
                </div>
              </div>

              <!-- Legacy items support -->
              <div v-else-if="order.items && order.items.length > 0" class="space-y-3">
                <p class="text-sm font-medium text-gray-700 mb-3">
                  {{ t('items') || 'Items' }} ({{ order.items.length }})
                </p>
                
                <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name"
                      class="w-full h-full object-cover"
                      @error="$event.target.src = '/images/fallback-image.jpg'"
                    />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  
                  <div class="flex-grow min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ t('qty') || 'Qty' }}: {{ item.quantity }} × ${{ item.price }}
                    </p>
                  </div>
                </div>
                
                <div v-if="order.items.length > 2" class="text-sm text-gray-500 text-center py-2 border-t border-gray-100">
                  + {{ order.items.length - 2 }} {{ t('moreItems') || 'more items' }}
                </div>
              </div>

            </div>

          </router-link>
        </div>
      </div>
    </div>
    <ChatWidget />
  </div>
</template>

<style scoped>
/* Loading spinner */
.loading-spinner {
  width: 3rem;
  height: 3rem;
  color: var(--primary-600);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Order card styling */
.order-card {
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.order-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-4px);
}

/* Button styles using CSS variables */
.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200;
}

.btn-secondary:hover {
  @apply transform translate-y-0.5 shadow-md;
}



.btn-primary {
  background: var(--gradient-primary);
  @apply text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md;
}

.btn-primary:hover {
  background: var(--primary-700);
  @apply transform translate-y-0.5;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .order-card {
    margin-bottom: 1rem;
  }
}
</style>