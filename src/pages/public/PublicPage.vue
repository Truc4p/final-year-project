<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../utils/config';
import ChatWidget from '../../components/ChatWidget.vue';

const { t } = useI18n();
const products = ref([]);
const isLoading = ref(true);
const error = ref(null);
const categories = ref([]);
const selectedCategory = ref('all');

const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const res = await axios.get(`${API_URL}/products`);
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
  return `${API_URL}/${relativePath}`;
};

const onImageError = (event) => {
  event.target.src = '/images/fallback-image.jpg';
};

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') {
    return products.value;
  }
  return products.value.filter(product => 
    product.category && product.category.name === selectedCategory.value
  );
});

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="w-full">
    <!-- Enhanced Hero Section - Full Width -->
    <section class="hero-section text-white w-full">
      <div class="hero-floating-elements">
        <div class="hero-geometric">
          <svg viewBox="0 0 200 200">
            <polygon points="100,10 40,198 190,78 10,78 160,198" />
            <circle cx="100" cy="100" r="80" />
          </svg>
        </div>
      </div>
      
      <div class="w-full px-6 text-center hero-content">
        <div class="max-w-5xl mx-auto">
          <h1 class="hero-title animate-fade-in">
            {{ t('welcomeToWrenCos') }}
          </h1>
          <p class="hero-subtitle animate-slide-up">
            {{ t('heroSubtitle') || 'Discover premium products with exceptional quality and unmatched service. Join thousands of satisfied customers worldwide.' }}
          </p>
          <div class="hero-cta animate-scale-in">
            <router-link to="/login" class="btn btn-primary btn-lg">
              {{ t('shopNow') }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </router-link>
          </div>
          
          <!-- Hero Stats -->
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-number">10K+</span>
              <span class="hero-stat-label">{{ t('happyCustomers') || 'Happy Customers' }}</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-number">5K+</span>
              <span class="hero-stat-label">{{ t('products') || 'Products' }}</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-number">99%</span>
              <span class="hero-stat-label">{{ t('satisfaction') || 'Satisfaction' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Products Section - Full Width Background -->
    <div class="page-background">
      <div class="container mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-secondary-900 mb-4">{{ t('featuredProducts') }}</h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            {{ t('featuredProductsDesc') || 'Explore our carefully curated collection of premium products' }}
          </p>
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
            {{ t('allCategories') }}
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
          <div v-for="product in filteredProducts" :key="product._id" class="product-card group animate-fade-in cursor-pointer" @click="$router.push('/login')">
            <div class="relative overflow-hidden rounded-t-2xl">
              <img 
                :src="product.image ? getImageUrl(product.image) : '/images/fallback-image.jpg'" 
                :alt="product.name"
                class="product-image"
                @error="onImageError" 
              />
            </div>
            
            <div class="card-body">
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
                  {{ product.name }}
                </h3>
                <span class="text-2xl font-bold text-success">${{ product.price }}</span>
              </div>
              
              <div class="flex items-center">
                <span class="badge badge-info">{{ product.category ? product.category.name : t('noCategory') }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <svg class="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 class="text-2xl font-medium text-secondary-900 mb-2">{{ t('noProductsFound') }}</h3>
          <p class="text-secondary-500 mb-6">{{ t('tryDifferentCategory') }}</p>
          <button @click="selectedCategory = 'all'" class="btn btn-primary">
            {{ t('viewAllProducts') || 'View All Products' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Enhanced Features Section - Full Width -->
    <section class="w-full bg-gradient-to-br from-secondary-50 to-primary-50 py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-secondary-900 mb-4">{{ t('whyChooseUs') }}</h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            {{ t('whyChooseUsDesc') || 'We are committed to providing you with the best shopping experience possible' }}
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card">
            <div class="feature-icon text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-2xl font-semibold mb-3 text-secondary-900">{{ t('qualityProducts') }}</h3>
            <p class="text-secondary-600">{{ t('qualityProductsDesc') || 'Premium quality products that meet the highest standards' }}</p>
          </div>
          
          <!-- Feature 2 -->
          <div class="feature-card">
            <div class="feature-icon text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-semibold mb-3 text-secondary-900">{{ t('fastDelivery') }}</h3>
            <p class="text-secondary-600">{{ t('fastDeliveryDesc') || 'Quick and reliable delivery to your doorstep' }}</p>
          </div>
          
          <!-- Feature 3 -->
          <div class="feature-card">
            <div class="feature-icon text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-2xl font-semibold mb-3 text-secondary-900">{{ t('securePayments') }}</h3>
            <p class="text-secondary-600">{{ t('securePaymentsDesc') || 'Safe and secure payment processing you can trust' }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <ChatWidget />
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.2s both;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out 0.4s both;
}
</style>