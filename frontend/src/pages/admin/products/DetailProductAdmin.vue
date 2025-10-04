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
    .replace(/(<li>.*<\/li>)(?:\s*<br>\s*(<li>.*<\/li>))+/g, function (match) {
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

                <!-- Stock Information -->
                <div class="bg-white rounded-xl p-6">
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-secondary-600">{{ t('stockQuantity') || 'Stock Quantity' }}:</span>
                      <span class="font-semibold" :class="{
                        'text-red-600': product.stockQuantity <= 10,
                        'text-yellow-600': product.stockQuantity > 10 && product.stockQuantity <= 50,
                        'text-green-600': product.stockQuantity > 50
                      }">
                        {{ product.stockQuantity }} {{ t('units') || 'units' }}
                      </span>

                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="{
                        'bg-red-100 text-red-800': product.stockQuantity <= 0,
                        'bg-yellow-100 text-yellow-800': product.stockQuantity > 0 && product.stockQuantity <= 10,
                        'bg-green-100 text-green-800': product.stockQuantity > 10
                      }">
                        <span v-if="product.stockQuantity <= 0">{{ t('outOfStock') || 'Out of Stock' }}</span>
                        <span v-else-if="product.stockQuantity <= 10">{{ t('lowStock') || 'Low Stock' }}</span>
                        <span v-else>{{ t('inStock') || 'In Stock' }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Admin Actions -->
              <div class="flex items-center justify-center space-x-2">
                <router-link :to="`/admin/products/edit/${product._id}`">
                  <button class="btn-action btn-edit" title="Edit Product">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                      </path>
                    </svg>
                    <span class="hidden sm:inline ml-1">Edit</span>
                  </button>
                </router-link>

                <router-link :to="`/admin/products/delete/${product._id}`">
                  <button class="btn-action btn-delete" title="Delete Product">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                      </path>
                    </svg>
                    <span class="hidden sm:inline ml-1">Delete</span>
                  </button>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Product Description -->
          <div class="rounded-xl p-8 mb-8">

            <!-- Product Description -->
            <div v-if="product.description && product.description.trim()" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-800" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('description') || 'Product Description' }}
                </h4>
              </div>
              <div class="bg-pink-50 rounded-lg p-4">
                <div class="text-pink-800 leading-relaxed formatted-description"
                  v-html="formatDescription(product.description)">
                </div>
              </div>
            </div>

            <!-- Skin Type -->
            <div v-if="product.skinType && product.skinType.length > 0" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('skinType') || 'Skin Type' }}
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="type in product.skinType" :key="type"
                  class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {{ type }}
                </span>
              </div>
            </div>

            <!-- Skin Concerns -->
            <div v-if="product.skinConcerns && product.skinConcerns.length > 0" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-800" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('skinConcerns') || 'Skin Concerns' }}
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="concern in product.skinConcerns" :key="concern"
                  class="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                  {{ concern.replace('-', ' ') }}
                </span>
              </div>
            </div>


            <!-- Ingredients -->
            <div v-if="product.ingredients && (typeof product.ingredients === 'string' ? product.ingredients.trim() : product.ingredients.length > 0)" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-800" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('ingredients') || 'Ingredients' }}
                </h4>
              </div>
              <div class="bg-orange-50 rounded-lg p-4">
                <div class="text-orange-800 leading-relaxed formatted-description"
                  v-html="formatDescription(typeof product.ingredients === 'string' ? product.ingredients : product.ingredients.join(', '))">
                </div>
              </div>
            </div>

            <!-- Benefits -->
            <div v-if="product.benefits && (typeof product.benefits === 'string' ? product.benefits.trim() : product.benefits.length > 0)" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-800" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('benefits') || 'Benefits' }}
                </h4>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4">
                <div class="text-yellow-800 leading-relaxed formatted-description"
                  v-html="formatDescription(typeof product.benefits === 'string' ? product.benefits : product.benefits.join(', '))">
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="product.tags && product.tags.length > 0" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-800" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('tags') || 'Tags' }}
                </h4>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in product.tags" :key="tag"
                  class="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Usage Instructions -->
            <div v-if="product.usage && product.usage.trim()" class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-800" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-secondary-900">
                  {{ t('usage') || 'Usage Instructions' }}
                </h4>
              </div>
              <div class="bg-teal-50 rounded-lg p-4">
                <div class="text-teal-800 leading-relaxed formatted-description"
                  v-html="formatDescription(product.usage)">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ChatWidget />
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