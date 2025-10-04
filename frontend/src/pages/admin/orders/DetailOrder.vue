<template>
  <div class="page-background">
    <div class="w-full px-4 xl:px-8 2xl:px-12">
      
      <!-- Loading State -->
      <div v-if="!order" class="flex justify-center items-center py-20">
        <div class="text-center">
          <svg class="loading-spinner mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">{{ t('loading') || 'Loading order details...' }}</p>
        </div>
      </div>

      <!-- Order Content -->
      <div v-else>
        
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <h1 class="text-2xl font-bold text-primary-900 mb-2">{{ t('orderDetails') }}</h1>
            <p class="text-gray-600">{{ t('orderDetailsSubtitle') || 'Admin view of order information and products' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Order Information Card -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              <!-- Order Header -->
              <div class="px-6 py-8 text-gray-900" style="background: white; border-bottom: 1px solid #e5e7eb;">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-gray-900">{{ t('orderInformation') || 'Order Information' }}</h2>
                    <p class="text-gray-500 text-sm">{{ t('orderSummary') || 'Order Summary' }}</p>
                  </div>
                </div>
              </div>

              <!-- Order Details -->
              <div class="p-6 space-y-6">
                
                <!-- Order ID -->
                <div class="info-item">
                  <div class="flex items-center text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-sm font-medium">{{ t('orderId') }}</span>
                  </div>
                  <p class="text-gray-900 font-mono text-sm">#{{ order._id.slice(-8).toUpperCase() }}</p>
                </div>

                <!-- Customer -->
                <div class="info-item">
                  <div class="flex items-center text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-sm font-medium">{{ t('orderUser') || 'Customer' }}</span>
                  </div>
                  <p class="text-gray-900 font-semibold">{{ order.user?.username || 'Unknown User' }}</p>
                </div>

                <!-- Order Date -->
                <div class="info-item">
                  <div class="flex items-center text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-medium">{{ t('orderDate') }}</span>
                  </div>
                  <p class="text-gray-900">{{ new Date(order.orderDate).toLocaleString() }}</p>
                </div>

                <!-- Payment Method -->
                <div class="info-item">
                  <div class="flex items-center text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span class="text-sm font-medium">{{ t('paymentMethod') }}</span>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {{ t(order.paymentMethod) }}
                  </span>
                </div>

                <!-- Order Status -->
                <div class="info-item">
                  <div class="flex items-center text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm font-medium">{{ t('orderStatus') || 'Order Status' }}</span>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
                        :class="getStatusBadgeClass(order.status)">
                    {{ t(order.status) || order.status || 'Processing' }}
                  </span>
                </div>

                <!-- Total Price -->
                <div class="info-item border-t border-gray-100 pt-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span class="text-sm font-medium">{{ t('totalPrice') }}</span>
                    </div>
                    <span class="text-2xl font-bold text-gray-900">${{ order.totalPrice }}</span>
                  </div>
                </div>

                <!-- Admin Actions -->
                <div class="pt-4 border-t border-gray-100 space-y-3">
                  <router-link :to="`/admin/orders/delete/${order._id}`">
                    <button class="btn-action btn-delete w-full  inline-flex items-center justify-center" title="Delete Order">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      <span class="ml-2">{{ t('deleteOrder') || 'Delete Order' }}</span>
                    </button>
                  </router-link>
                </div>

              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              <!-- Products Header -->
              <div class="px-6 py-4 border-b border-gray-100 bg-white">
                <h3 class="text-xl font-semibold text-gray-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {{ t('orderProducts') }}
                </h3>
              </div>

              <!-- Products Content -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ t('product') || 'Product' }}
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ t('price') }}
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ t('quantity') }}
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ t('subtotal') || 'Subtotal' }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="product in order.products" :key="product.productId._id" class="hover:bg-gray-50 transition-colors duration-200">
                      
                      <!-- Product Info -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-4">
                          <div class="w-16 h-16 flex-shrink-0">
                            <img
                              :src="product.productId.image ? getImageUrl(product.productId.image) : '/images/fallback-image.jpg'"
                              :alt="product.productId.name"
                              class="w-16 h-16 object-cover rounded-lg" 
                              @error="onImageError" 
                            />
                          </div>
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ product.productId.name }}</div>
                            <div class="text-xs text-gray-500 font-mono">ID: {{ product.productId._id.slice(-8) }}</div>
                          </div>
                        </div>
                      </td>

                      <!-- Price -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-semibold text-gray-900">${{ product.productId.price }}</span>
                      </td>

                      <!-- Ordered Quantity -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {{ product.quantity }}
                        </span>
                      </td>

                      <!-- Subtotal -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-bold text-gray-900">${{ (product.productId.price * product.quantity).toFixed(2) }}</span>
                      </td>

                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
    <AdminChatWidget />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import AdminChatWidget from '../../../components/AdminChatWidget.vue';

const { t } = useI18n();
const order = ref(null);
const route = useRoute();

const getImageUrl = (relativePath) => {
  const url = `${API_URL}/${relativePath}`; // Adjust the base URL as needed
  return url;
};

const onImageError = (event) => {
  console.log('Image failed to load, using fallback image.');
  event.target.src = '/images/fallback-image.jpg'; // Provide a fallback image URL
};

const getStatusBadgeClass = (status) => {
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
      return 'bg-slate-100 text-slate-700';
  }
};

onMounted(async () => {
  const orderId = route.params.id;
  console.log('Fetching order with ID:', orderId); // Debugging log
  try {
    const response = await axios.get(`${API_URL}/orders/order/${orderId}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    console.log('API response:', response.data); // Debugging log
    console.log('User field:', response.data.user); // Debug user field specifically
    console.log('User type:', typeof response.data.user); // Check if it's string or object
    order.value = response.data;
    
    // If user is just an ID string, fetch the user details
    if (order.value.user && typeof order.value.user === 'string') {
      try {
        const userResponse = await axios.get(`${API_URL}/users/${order.value.user}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });
        console.log('User details:', userResponse.data);
        // Replace the user ID with the full user object
        order.value.user = userResponse.data;
      } catch (userError) {
        console.error('Error fetching user details:', userError);
        // Keep the original user ID if fetching fails
      }
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
});
</script>

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

/* Info item styling */
.info-item {
  @apply transition-all duration-200;
}

.info-item:hover {
  @apply transform translate-y-0.5;
}

/* Button styles */
.btn-action {
  @apply inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-delete {
  @apply text-error bg-red-50 hover:bg-red-100 hover:text-red-800 focus:ring-red-500;
}

/* Table row hover effects */
tbody tr:hover {
  background-color: #f9fafb;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .container {
    @apply px-4;
  }
  
  table {
    font-size: 0.875rem;
  }
}
</style>