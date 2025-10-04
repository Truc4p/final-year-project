<template>
  <div class="page-background min-h-screen">
    <!-- Header in Container -->
    <div class="container mx-auto px-4 mb-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-700 mb-2">{{ t('orderDetails') }}</h1>
        <p class="text-secondary-600 text-lg">{{ t('manageOrderDetails') }}</p>
      </div>
    </div>

    <!-- Full Width Content Area -->
    <div class="w-full">
      <!-- Loading State -->
      <div v-if="!order" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Order Content -->
      <div v-else class="px-10 space-y-8">
        <!-- Order Information Card -->
        <div class="bg-white shadow-sm border border-secondary-100 rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-secondary-100" style="background-color: white">
            <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ t('orderInformation') }}
            </h2>
          </div>
          
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="space-y-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('orderId') }}</span>
                  <span class="text-lg font-semibold text-secondary-900 mt-1">#{{ order._id?.slice(-8).toUpperCase() }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('orderUser') }}</span>
                  <span class="text-lg font-semibold text-secondary-900 mt-1">{{ order.user?.username || 'Unknown User' }}</span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('orderDate') }}</span>
                  <span class="text-lg font-semibold text-secondary-900 mt-1">{{ new Date(order.orderDate).toLocaleString() }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('paymentMethod') }}</span>
                  <span class="text-lg font-semibold text-secondary-900 mt-1">{{ t(order.paymentMethod) }}</span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('totalPrice') }}</span>
                  <span class="text-2xl font-bold text-primary-600 mt-1">${{ order.totalPrice }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('orderStatus') }}</span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1"
                        :class="{
                          'bg-green-100 text-green-800': order.status === 'completed',
                          'bg-purple-100 text-purple-800': order.status === 'processing',
                          'bg-orange-100 text-orange-800': order.status === 'shipping',
                          'bg-red-100 text-red-800': order.status === 'cancelled',
                          'bg-blue-100 text-blue-800': order.status === 'refunded',
                          'bg-gray-100 text-gray-800': !['completed', 'processing', 'shipping', 'cancelled', 'refunded'].includes(order.status)
                        }">
                    {{ t(order.status) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-secondary-500 uppercase tracking-wide">{{ t('productCount') }}</span>
                  <span class="font-medium">{{ order.products?.length || 0 }} Products</span>
                </div>
              </div>

            <!-- Status Update Form -->
            <div class="mt-8 pt-6 border-t border-secondary-100">
              <form @submit.prevent="updateOrder" class="space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-secondary-600 uppercase tracking-wider mb-2" for="status">
                    {{ t('updateOrderStatus') }}
                  </label>
                  <div class="relative">
                    <select v-model="selectedStatus" id="status" class="block w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200">
                      <option v-for="statusOption in statusOptions" :key="statusOption" :value="statusOption">
                        {{ t(statusOption) }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ t('updateOrder') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Products Table Card -->
        <div class="bg-white shadow-sm border border-secondary-100 rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-secondary-100" style="background-color: white">
            <h3 class="text-xl font-semibold text-secondary-900 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {{ t('orderProducts') }}
            </h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-secondary-100">
              <thead style="background-color: white">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">{{ t('product') }}</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">{{ t('price') }}</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">{{ t('stockQuantity') }}</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">{{ t('quantity') }}</th>
                  <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-secondary-600 uppercase tracking-wider">{{ t('subtotal') }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-secondary-100">
                  <tr v-for="product in order.products" :key="product.productId" class="hover:bg-secondary-50 transition-colors duration-200">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0 h-24 w-24">
                          <img
                            :src="product.productId.image ? getImageUrl(product.productId.image) : '/images/fallback-image.jpg'"
                            :alt="product.productId.name"
                            class="h-24 w-24 rounded-lg object-cover"
                            @error="onImageError"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-secondary-900">{{ product.productId.name }}</div>
                          <div class="text-xs text-secondary-500 mt-1">ID: #{{ product.productId._id?.slice(-8) }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-lg font-semibold text-secondary-900">${{ product.productId.price }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <span v-if="product.productId.stockQuantity > 10" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-primary-800">
                          {{ product.productId.stockQuantity }} units
                        </span>
                        <span v-else-if="product.productId.stockQuantity > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {{ product.productId.stockQuantity }} units
                        </span>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-lg font-semibold text-secondary-900">{{ product.quantity }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-lg font-semibold text-secondary-900">${{ (product.productId.price * product.quantity).toFixed(2) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';

const { t } = useI18n();
const order = ref(null);
const route = useRoute();
const router = useRouter(); // Create a router instance

const selectedStatus = ref('');
const statusOptions = ['processing', 'shipping', 'completed', 'cancelled', 'refunded'];

// Initialize selectedStatus when order is loaded
const initializeForm = () => {
  if (order.value) {
    selectedStatus.value = order.value.status;
  }
};

const getImageUrl = (relativePath) => {
  const url = `${API_URL}/${relativePath}`; // Adjust the base URL as needed
  return url;
};

const onImageError = (event) => {
  console.log('Image failed to load, using fallback image.');
  event.target.src = '/images/fallback-image.jpg'; // Provide a fallback image URL
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
    
    initializeForm(); // Initialize form after order is loaded
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
});

const updateOrder = async () => {
  const orderId = route.params.id;
  console.log('Updating order status:', selectedStatus.value);

  try {
    const response = await axios.put(`${API_URL}/orders/${orderId}`, { status: selectedStatus.value }, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    console.log("Order status updated successfully:", response.data);
    router.push('/admin/orders');
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};

</script>

<style scoped>
.btn-action {
  @apply inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-details {
  @apply text-primary-700 bg-primary-50 hover:bg-primary-100 hover:text-primary-800;
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

/* Product image hover effect */
tr:hover img {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>