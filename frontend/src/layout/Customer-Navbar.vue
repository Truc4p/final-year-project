<!-- src/components/Customer-Navbar.vue -->
<template>
  <nav class="navbar sticky top-0 z-50">
    <div class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-3">
          <router-link to="/customer" class="navbar-brand">
            <span class="footer-brand-text">WrenCos</span>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link :to="{ path: '/customer' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('home') }}
          </router-link>
          <router-link :to="{ path: '/customer/profile' }" exact-active-class="router-link-exact-active"
            class="navbar-link">
            {{ t('profile') }}
          </router-link>
          <a href="http://localhost:5175" target="_blank" class="navbar-link">
            {{ t('skinStudy') }}
          </a>
          <a href="http://localhost:5001" target="_blank" class="navbar-link">
            {{ t('trackNutrition') }}
          </a>
          <router-link :to="{ path: '/customer/order-history' }" exact-active-class="router-link-exact-active"
            class="navbar-link">
            {{ t('orderHistory') }}
          </router-link>
          <router-link :to="{ path: '/customer/live-stream' }" exact-active-class="router-link-exact-active"
            class="navbar-link">
            {{ t('liveStream') }}
          </router-link>
          <router-link :to="{ path: '/customer/cart' }" exact-active-class="router-link-exact-active"
            class="relative navbar-link group">
            <div class="flex items-center space-x-2">
              <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 transition-transform duration-200 group-hover:scale-110" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span v-if="cartItemCount > 0"
                  class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle">
                  {{ cartItemCount }}
                </span>
              </div>
            </div>
          </router-link>

          <!-- Language Switcher -->
          <div class="language-selector">
            <select @change="changeLanguage" v-model="currentLocale">
              <option value="en">🇺🇸 EN</option>
              <option value="vi">🇻🇳 VI</option>
            </select>
          </div>

          <router-link to="/logout" class="navbar-link">
            {{ t('logout') }}
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu"
            class="p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 transition-all duration-200 focus:outline-none focus:ring-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen"
        class="md:hidden mt-4 pb-4 space-y-3 border-t border-secondary-200 pt-4 animate-slide-up">
        <router-link :to="{ path: '/customer' }" exact-active-class="router-link-exact-active"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('home') }}
        </router-link>
        <router-link :to="{ path: '/customer/profile' }" exact-active-class="router-link-exact-active"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('profile') }}
        </router-link>
        <a href="http://localhost:5175" target="_blank"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          Skin Study
        </a>
        <a href="http://localhost:5001" target="_blank"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          Track Nutrition
        </a>
        <router-link :to="{ path: '/customer/order-history' }" exact-active-class="router-link-exact-active"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('orderHistory') }}
        </router-link>
        <router-link :to="{ path: '/customer/live-stream' }" exact-active-class="router-link-exact-active"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('liveStream') }}
        </router-link>
        <router-link :to="{ path: '/customer/cart' }" exact-active-class="router-link-exact-active"
          class="flex items-center justify-between navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          <span>{{ t('cart') }}</span>
          <span v-if="cartItemCount > 0"
            class="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {{ cartItemCount }}
          </span>
        </router-link>

        <!-- Mobile Language Switcher -->
        <div class="pt-3 border-t border-secondary-200">
          <label class="block text-sm font-medium text-secondary-700 mb-2">{{ t('language') || 'Language' }}</label>
          <div class="language-selector">
            <select @change="changeLanguage" v-model="currentLocale" class="w-full">
              <option value="en">🇺🇸 English</option>
              <option value="vi">🇻🇳 Tiếng Việt</option>
            </select>
          </div>
        </div>

        <router-link to="/logout"
          class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('logout') }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted, computed } from 'vue';

const { locale, t } = useI18n();
const currentLocale = ref(locale.value);
const mobileMenuOpen = ref(false);
const cartTrigger = ref(0); // Force reactivity trigger

const cartItemCount = computed(() => {
  // Trigger reactivity
  cartTrigger.value;
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
});

const updateCartCount = () => {
  cartTrigger.value++;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const changeLanguage = (event) => {
  locale.value = event.target.value;
  currentLocale.value = event.target.value;
};

onMounted(() => {
  // Listen for storage events to update cart count when it changes
  window.addEventListener('storage', updateCartCount);

  // Listen for custom cart update events
  window.addEventListener('cartUpdated', updateCartCount);

  // Initial cart count update
  updateCartCount();
});
</script>

<style scoped>
/* Additional custom styles for enhanced navbar */
.navbar {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>