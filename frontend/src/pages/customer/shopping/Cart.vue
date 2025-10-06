<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_URL } from '../../../utils/config';
import ChatWidget from '../../../components/ChatWidget.vue';

const { t } = useI18n();
const router = useRouter();
const cart = ref(JSON.parse(localStorage.getItem('cart')) || []);
const isLoading = ref(true);
const isProcessing = ref(false);

const getImageUrl = (relativePath) => {
  return `${API_URL}/${relativePath}`;
};

const onImageError = (event) => {
  event.target.src = '/images/fallback-image.jpg';
};

const removeFromCart = (productId) => {
  cart.value = cart.value.filter(item => item._id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart.value));

  // Dispatch custom event to notify other components about cart update
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

const updateQuantity = (item, change) => {
  const newQuantity = item.quantity + change;

  if (newQuantity > 0 && newQuantity <= item.stockQuantity) {
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart.value));

    // Dispatch custom event to notify other components about cart update
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
};

const fetchCartDetails = async () => {
  isLoading.value = true;

  try {
    for (const item of cart.value) {
      const response = await axios.get(`${API_URL}/products/${item._id}`);
      const product = response.data;
      item.name = product.name;
      item.category = product.category;
      item.price = product.price;
      item.image = product.image;
      item.stockQuantity = product.stockQuantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart.value));
  } catch (error) {
    console.error('Error fetching product details:', error);
  } finally {
    isLoading.value = false;
  }
};

const validateQuantity = (item) => {
  if (item.quantity > item.stockQuantity) {
    item.quantity = item.stockQuantity;
  }
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  localStorage.setItem('cart', JSON.stringify(cart.value));

  // Dispatch custom event to notify other components about cart update
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

const handleSubmitItem = async (event) => {
  event.preventDefault();

  // Validate cart items
  for (const item of cart.value) {
    if (item.quantity < 1) {
      alert(`${t('quantityForItem')} ${item.name} ${t('mustBeAtLeast1')}`);
      return;
    }
    if (item.quantity > item.stockQuantity) {
      alert(`${t('quantityForItem')} ${item.name} ${t('exceedsStock')}`);
      return;
    }
  }

  isProcessing.value = true;

  // Send full cart items with all necessary information for checkout display
  const transformedCartItems = cart.value.map(item => ({
    _id: item._id,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    category: item.category,
    stockQuantity: item.stockQuantity
  }));

  try {
    // Navigate to the checkout page with query parameters
    router.push({
      path: '/customer/checkout',
      query: { items: JSON.stringify(transformedCartItems) }
    });
  } catch (error) {
    console.error('Error submitting cart items:', error);
    alert(t('errorSubmittingCart'));
  } finally {
    isProcessing.value = false;
  }
};

const totalCost = computed(() => {
  return cart.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const totalItems = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0);
});

onMounted(() => {
  fetchCartDetails();
});
</script>

<template>
  <div class="page-background">
    <div class="w-full px-4 xl:px-8 2xl:px-12">
      <h1 class="text-2xl font-bold text-primary-600 mb-6">{{ t('yourCart') }} ({{ totalItems }} items)</h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>

      <!-- Empty Cart State -->
      <div v-else-if="cart.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
        <svg class="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-neutral-900">{{ t('yourCartIsEmpty') }}</h3>
        <p class="mt-1 text-neutral-500">{{ t('browseProductsToAddToCart') }}</p>
        <div class="mt-6">
          <router-link to="/customer" class="btn btn-primary">
            {{ t('continueShopping') }}
          </router-link>
        </div>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cart Items List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul>
              <li v-for="item in cart" :key="item._id" class="border-b border-neutral-200 last:border-b-0">
                <div class="p-4 flex flex-col sm:flex-row items-start gap-4">
                  <!-- Product Image -->
                  <div class="w-full sm:w-24 h-24 flex-shrink-0">
                    <img :src="item.image ? getImageUrl(item.image) : '/images/fallback-image.jpg'" :alt="item.name"
                      class="w-full h-full object-cover rounded" @error="onImageError" />
                  </div>

                  <!-- Product Details -->
                  <div class="flex-grow">
                    <h3 class="font-medium text-lg text-neutral-900">{{ item.name }}</h3>
                    <p class="text-neutral-500 text-sm">{{ item.category ? item.category.name : t('noCategory') }}</p>
                    <p class="text-primary-600 font-bold mt-1">${{ item.price }}</p>

                    <div class="flex flex-wrap items-center justify-between mt-3 gap-3">
                      <!-- Quantity Controls -->
                      <div class="flex items-center border border-neutral-300 rounded-md">
                        <button @click="updateQuantity(item, -1)"
                          class="px-3 py-1 text-neutral-600 hover:bg-neutral-100 focus:outline-none"
                          :disabled="item.quantity <= 1">
                          -
                        </button>
                        <input type="number" v-model.number="item.quantity" min="1" :max="item.stockQuantity"
                          class="w-12 text-center border-x border-neutral-300 py-1 focus:outline-none"
                          @change="validateQuantity(item)" />
                        <button @click="updateQuantity(item, 1)"
                          class="px-3 py-1 text-neutral-600 hover:bg-neutral-100 focus:outline-none"
                          :disabled="item.quantity >= item.stockQuantity">
                          +
                        </button>
                      </div>

                      <!-- Remove Button -->
                      <button @click="removeFromCart(item._id)"
                        class="text-red-500 hover:text-red-700 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {{ t('remove') }}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <h2 class="font-semibold text-lg mb-4">{{ t('orderSummary') }}</h2>

            <div class="flex justify-between text-lg font-bold">
              <span>{{ t('subtotal') }}</span>
              <span>${{ totalCost.toFixed(2) }}</span>
            </div>
            
            <p class="text-sm text-neutral-500 mt-2">
              {{ t('shippingAndTaxCalculatedAtCheckout') || 'Shipping and tax calculated at checkout' }}
            </p>

            <div class="mt-6">
              <button @click="handleSubmitItem" class="w-full btn btn-primary py-3 flex justify-center items-center"
                :disabled="isProcessing">
                <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ t('proceedToCheckout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ChatWidget />
  </div>
</template>

<style scoped>
.cart-item {
  @apply flex items-center;
}

.quantity-input {
  @apply border border-gray-300 rounded px-2 py-1 w-16 text-center;
}

.btn-primary {
  background: var(--gradient-primary);
  @apply text-white px-4 py-2 rounded transition-all duration-200;
}

.btn-delete {
  @apply bg-red-400 text-white px-2 py-1 rounded hover:bg-red-500 mx-1;
}
</style>