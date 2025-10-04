<template>
  <div class="page-background min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-secondary-900 mb-1">Delete Order</h2>
          <p class="text-secondary-600">Are you sure you want to delete this order? This action cannot be undone.</p>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end space-x-3">
        <router-link to="/customer/order-history">
          <button
            class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-secondary-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            type="button"
            :disabled="isDeleting">
            Cancel
          </button>
        </router-link>

        <button
          class="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60"
          @click="deleteOrder"
          :disabled="isDeleting">
          <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ isDeleting ? 'Deleting...' : 'Delete Order' }}</span>
        </button>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { API_URL } from '../../../utils/config';

const route = useRoute();
const router = useRouter();
const orderId = ref(route.params.id);
const isDeleting = ref(false);

const deleteOrder = async () => {
  try {
    isDeleting.value = true;
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/orders/${orderId.value}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    console.log('Order deleted successfully');
    router.push('/customer/order-history');
  } catch (error) {
    console.error('Error deleting order:', error);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
.page-background {
  @apply bg-secondary-50;
}
</style>