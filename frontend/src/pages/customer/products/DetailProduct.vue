<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import ChatWidget from '../../../components/ChatWidget.vue';

const { t, locale } = useI18n();
const product = ref(null);
const route = useRoute();
const isLoading = ref(true);
const error = ref(null);
const quantity = ref(1);
const buttonState = ref('default'); // 'default', 'loading', 'success'

const getImageUrl = (relativePath) => {
  return `${API_URL}/${relativePath}`;
};

const onImageError = (event) => {
  event.target.src = '/images/fallback-image.jpg';
};

const increaseQuantity = () => {
  if (quantity.value < product.value.stockQuantity) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const updateQuantity = (event) => {
  const value = parseInt(event.target.value);
  if (value >= 1 && value <= product.value.stockQuantity) {
    quantity.value = value;
  }
};

const addToCart = async () => {
  // Set loading state
  buttonState.value = 'loading';

  // Get current cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if product already exists in cart
  const existingItem = cart.find(item => item._id === product.value._id);

  if (existingItem) {
    // Check if adding quantity would exceed stock
    if (existingItem.quantity + quantity.value > product.value.stockQuantity) {
      alert('You have reached the maximum stock quantity for this product.');
      buttonState.value = 'default';
      return;
    }
    // Update existing item quantity
    existingItem.quantity += quantity.value;
  } else {
    // Check if quantity exceeds stock
    if (quantity.value > product.value.stockQuantity) {
      alert('You have reached the maximum stock quantity for this product.');
      buttonState.value = 'default';
      return;
    }
    // Add new item to cart
    cart.push({
      ...product.value,
      quantity: quantity.value
    });
  }

  // Simulate loading time
  await new Promise(resolve => setTimeout(resolve, 400));

  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Dispatch custom event to notify other components about cart update
  window.dispatchEvent(new CustomEvent('cartUpdated'));

  // Set success state
  buttonState.value = 'success';

  // Reset quantity to 1
  quantity.value = 1;

  // Reset button state after 2 seconds
  setTimeout(() => {
    buttonState.value = 'default';
  }, 2000);
};

onMounted(async () => {
  const productId = route.params.id;
  console.log('Fetching product with ID:', productId);
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    console.log('API response:', response.data);
    product.value = response.data;
    console.log('Product image URL:', getImageUrl(product.value.image));
  } catch (error) {
    console.error('Error fetching product details:', error);
    error.value = 'Failed to load product details. Please try again.';
  } finally {
    isLoading.value = false;
  }
});

// Format description to preserve formatting and convert common patterns to HTML
const formatDescription = (text) => {
  if (!text) return '';
  
  return text
    // Convert line breaks to <br> tags
    .replace(/\n/g, '<br>')
    // Convert bullet points (• or -) to HTML list items
    .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in <ul> tags
    .replace(/(<li>.*<\/li>)(?:\s*<br>\s*(<li>.*<\/li>))+/g, function(match) {
      return '<ul class="list-disc ml-6 my-2">' + match.replace(/<br>/g, '') + '</ul>';
    })
    // Convert **bold** or strong text patterns
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert numbered sections
    .replace(/^(\d+\.\s+.+)$/gm, '<div class="mt-2"><strong>$1</strong></div>')
    // Clean up any double <br> tags
    .replace(/<br><br>/g, '<br>')
    // Add spacing between sections
    .replace(/(<\/h4>)/g, '$1<br>');
};
</script>

<template>
  <div class="page-background">
    <div class="container mx-auto px-6 max-w-6xl">

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <svg class="loading-spinner mx-auto mb-4 h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <p class="text-lg text-secondary-600 font-medium">{{ t('loading') || 'Loading product details...' }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-red-500" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">{{ error }}</p>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="animate-fade-in">
        <!-- Header Section -->
        <div class="text-center mb-12">
          <h1 class="text-2xl md:text-5xl font-bold text-secondary-900 mb-4 gradient-text">
            {{ t('productDetails') || 'Product Details' }}
          </h1>
        </div>

        <!-- Main Product Card -->
        <div class="bg-white rounded-2xl overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- Product Image Section -->
            <div class="relative white p-4 flex items-center justify-center">
              <div class="relative group w-full">
                <img :src="product.image ? getImageUrl(product.image) : '/images/fallback-image.jpg'"
                  :alt="product.name"
                  class="relative w-full h-auto max-h-none object-contain transform group-hover:scale-105 transition-transform duration-300"
                  @error="onImageError" />
              </div>
            </div>

            <!-- Product Information Section -->
            <div class="p-8 lg:p-12">
              <!-- Product Name & Category -->
              <div class="mb-8">
                <div class="flex items-center gap-3 mb-4">
                  <span class="badge badge-info text-sm px-3 py-1">
                    {{ product.category ? product.category.name : t('noCategory') || 'No Category' }}
                  </span>
                  <span v-if="product.stockQuantity <= 0" class="badge badge-error text-sm px-3 py-1">
                    {{ t('outOfStock') || 'Out of Stock' }}
                  </span>
                </div>
                <h2 class="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4 leading-tight">
                  {{ product.name }}
                </h2>
                <div class="flex items-center gap-4">
                  <span class="text-4xl font-bold text-primary-600">${{ product.price }}</span>
                </div>
              </div>

              <!-- Quantity Selector -->
              <div class="mb-6">
                <div class="flex items-center gap-4">
                  <span class="text-lg font-medium text-secondary-800">{{ t('quantity') || 'Số Lượng' }}</span>
                  <div class="flex items-center border border-gray-300 rounded-lg">
                    <button @click="decreaseQuantity" :disabled="quantity <= 1"
                      class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input type="number" v-model="quantity" @input="updateQuantity" :min="1"
                      :max="product.stockQuantity"
                      class="w-16 h-10 text-center border-0 bg-transparent text-lg font-medium text-gray-500 focus:outline-none" />
                    <button @click="increaseQuantity" :disabled="quantity >= product.stockQuantity"
                      class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span class="text-gray-500">{{ product.stockQuantity }} {{ t('productsAvailable') || 'sản phẩm có sẵn'
                  }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                  <button :disabled="product.stockQuantity <= 0 || buttonState === 'loading'" @click="addToCart" :class="[
                    'w-48 text-lg py-3 font-medium transition-all duration-300 rounded-xl flex items-center justify-center gap-2',
                    {
                      'bg-primary-600 hover:bg-primary-700 text-white': buttonState === 'default' && product.stockQuantity > 0,
                      'bg-primary-300 cursor-not-allowed': buttonState === 'loading',
                      'bg-primary-600 text-white': buttonState === 'success',
                      'bg-gray-200 text-gray-600 cursor-not-allowed': product.stockQuantity <= 0
                    }
                  ]">
                    <!-- Loading Spinner -->
                    <svg v-if="buttonState === 'loading'" class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>

                    <!-- Cart Icon for default and success states -->
                    <svg v-else-if="buttonState === 'default' || buttonState === 'success'"
                      xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>

                    <!-- Check Icon for success state -->
                    <svg v-if="buttonState === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>

                    <!-- Button Text -->
                    <span>
                      <template v-if="product.stockQuantity <= 0">
                        {{ t('outOfStock') || 'Out of Stock' }}
                      </template>
                      <template v-else-if="buttonState === 'loading'">
                        {{ t('adding') || 'Adding...' }}
                      </template>
                      <template v-else-if="buttonState === 'success'">
                        {{ t('added') || 'Added!' }}
                      </template>
                      <template v-else>
                        {{ t('addToCart') || 'Add to Cart' }}
                      </template>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Description -->
          <div class="rounded-xl p-8 mb-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-secondary-900">
                {{ t('description') || 'Product Description' }}
              </h3>
            </div>
            
            <div class="bg-white rounded-lg p-6">
              <div 
                class="text-secondary-700 leading-relaxed text-base"
                v-html="formatDescription(product.description || t('noDescription') || 'No description available.')"
              ></div>
            </div>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <!-- Shipping Info -->
          <div class="feature-card text-center">
            <div class="feature-icon text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">{{ t('freeShipping') || 'Free Shipping' }}</h3>
            <p class="text-secondary-600 text-sm">{{ t('freeShippingDesc') || 'Free shipping on orders over $50' }}</p>
          </div>

          <!-- Return Policy -->
          <div class="feature-card text-center">
            <div class="feature-icon text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">{{ t('easyReturns') || 'Easy Returns' }}</h3>
            <p class="text-secondary-600 text-sm">{{ t('easyReturnsDesc') || '30-day return policy' }}</p>
          </div>

          <!-- Customer Support -->
          <div class="feature-card text-center">
            <div class="feature-icon text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">{{ t('support') || '24/7 Support' }}</h3>
            <p class="text-secondary-600 text-sm">{{ t('supportDesc') || 'Customer support available 24/7' }}</p>
          </div>
        </div>
      </div>
    </div>
    <ChatWidget />
  </div>
</template>

<style scoped>
/* Custom animations for this component */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 50%, var(--secondary-800) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.formatted-description {
  white-space: normal;
}

.formatted-description h4 {
  color: var(--secondary-800);
}

.formatted-description ul {
  padding-left: 1.5rem;
}

.formatted-description li {
  margin-bottom: 0.5rem;
}

.formatted-description strong {
  font-weight: 600;
  color: var(--secondary-800);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 50%, var(--primary-700) 100%);
}

/* Hide number input arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>