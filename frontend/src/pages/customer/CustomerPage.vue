<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../utils/config';
import ChatWidget from '../../components/ChatWidget.vue';

const { t, locale } = useI18n();
const router = useRouter();
const products = ref([]);
const cart = ref(JSON.parse(localStorage.getItem('cart')) || []);
const searchQuery = ref('');
const isLoading = ref(true);
const error = ref(null);
const categories = ref([]);
const selectedCategory = ref('all');

// Method to refresh cart from localStorage
const refreshCart = () => {
  cart.value = JSON.parse(localStorage.getItem('cart')) || [];
};

const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;
  
  const token = localStorage.getItem("token");
  if (!token) {
    alert(t('login'));
    router.push("/login");
    return;
  }

  try {
    // Make the api request with axios with token in header
    const res = await axios.get(`${API_URL}/products`, {
      headers: {
        "x-auth-token": `${token}`,
      },
    });

    console.log("Products response:", res.data);
    products.value = res.data;
    
    // Extract unique categories
    const uniqueCategories = [...new Set(res.data
      .filter(product => product.category)
      .map(product => product.category.name))];
    
    categories.value = uniqueCategories;
  } catch (err) {
    console.error("Error fetching products:", err);
    error.value = "Failed to load products. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const getImageUrl = (relativePath) => {
  return `${API_URL}/${relativePath}`; // Adjust the base URL as needed
};

const onImageError = (event) => {
  event.target.src = '/images/fallback-image.jpg'; // Provide a fallback image URL
};

const updateCart = (product, quantity) => {
  const cartItem = cart.value.find(item => item._id === product._id);
  if (cartItem) {
    if (cartItem.quantity + quantity > product.stockQuantity) {
      alert('You have reached the maximum stock quantity for this product.');
      return;
    }
    cartItem.quantity += quantity;
  } else {
    if (quantity > product.stockQuantity) {
      alert('You have reached the maximum stock quantity for this product.');
      return;
    }
    cart.value.push({ ...product, quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart.value));
  // Force reactivity update
  cart.value = [...cart.value];
  
  // Dispatch custom event to notify other components about cart update
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

const validateQuantity = (product) => {
  if (product.quantity > product.stockQuantity) {
    product.quantity = product.stockQuantity;
  }
};

const filteredProducts = computed(() => {
  let filtered = products.value;
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(product => 
      product.category && product.category.name === selectedCategory.value
    );
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    filtered = filtered.filter(product => {
      return product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (product.category && product.category.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    });
  }
  
  return filtered;
});

onMounted(() => {
  fetchProducts();
  // Refresh cart on component mount to ensure it's up to date
  refreshCart();
});
</script>

<template>
  <div class="w-full">
    <!-- Products Section - Full Width Background -->
    <div class="page-background">
      <div class="container mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h1 class="text-2xl font-bold text-primary-600 mb-4">{{ t('products') || 'Products' }}</h1>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            {{ t('featuredProductsDesc') || 'Explore our carefully curated collection of premium products' }}
          </p>
        </div>
        
        <!-- Search and Cart Section -->
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <!-- Search -->
          <div class="w-full md:w-1/4">
            <div class="search-container relative">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search"
                class="search-input w-full bg-transparent border-0 text-lg text-primary-800 focus:outline-none transition-all duration-300 pr-10"
              />
              <div class="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" style="color: var(--secondary-500);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Category Filter -->
        <div class="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button 
            @click="selectedCategory = 'all'" 
            :class="[
              'category-filter',
              selectedCategory === 'all' ? 'active' : ''
            ]"
          >
            {{ t('allCategories') || 'All Categories' }}
          </button>
          
          <button 
            v-for="category in categories" 
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'category-filter',
              selectedCategory === category ? 'active' : ''
            ]"
          >
            {{ category }}
          </button>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <div class="text-center">
            <svg class="loading-spinner mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-secondary-600">{{ t('loading') || 'Loading products...' }}</p>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="font-medium">{{ error }}</p>
        </div>
        
        <!-- Products Grid -->
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div v-for="product in filteredProducts" :key="product._id" class="product-card group animate-fade-in cursor-pointer flex flex-col h-full" @click="$router.push(`/customer/products/${product._id}`)">
            <div class="relative overflow-hidden rounded-t-2xl">
              <img 
                :src="product.image ? getImageUrl(product.image) : '/images/fallback-image.jpg'" 
                :alt="product.name"
                class="product-image"
                @error="onImageError" 
              />
            </div>
            
            <div class="card-body flex flex-col flex-grow">
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg text-secondary-900 group-hover:text-primary-700 transition-colors duration-200">
                  {{ product.name }}
                </h3>
                <span class="text-2xl font-bold text-success">${{ product.price }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="badge badge-info">{{ product.category ? product.category.name : t('noCategory') || 'No Category' }}</span>
                <!-- Add to Cart -->
                <button 
                  class="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors duration-200" 
                  @click.stop="updateCart(product, product.quantity || 1)"
                  :title="t('addToCart')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
              
              <div class="flex-grow"></div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <svg class="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 class="text-2xl font-medium text-secondary-900 mb-2">{{ t('noProductsFound') || 'No Products Found' }}</h3>
          <p class="text-secondary-500 mb-6">{{ t('tryDifferentCategory') || 'Try selecting a different category or search term' }}</p>
          <button @click="selectedCategory = 'all'; searchQuery = ''" class="btn btn-primary">
            {{ t('viewAllProducts') || 'View All Products' }}
          </button>
        </div>
      </div>
    </div>
    <ChatWidget />
  </div>
</template>

<style scoped>
/* Custom animations - same as PublicPage.vue */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Loading spinner */
.loading-spinner {
  width: 3rem;
  height: 3rem;
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Search Input Styling */
.search-container {
  max-width: 100%;
}

.search-input {
  border-radius: 0 !important;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: 0.02em;
  padding-bottom: 12px;
  border-bottom: 3px solid transparent;
  background: linear-gradient(to bottom right, var(--primary-50)) padding-box,
              linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 50%, var(--primary-700) 100%) border-box;
  outline: none !important;
}

.search-input::placeholder {
  color: var(--secondary-500);
  font-size: 1.125rem;
  font-weight: 500;
}

.search-input:focus {
  background: linear-gradient(to bottom right, var(--primary-50)) padding-box,
              linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 50%, var(--primary-800) 100%) border-box;
}

</style>