<template>
  <nav class="navbar sticky top-0 z-50">
    <div class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-3">
          <router-link to="/" class="navbar-brand">
            <span class="footer-brand-text">WrenCos</span>
          </router-link>
        </div>
        
        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link :to="{ path: '/' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('home') }}
          </router-link>
          <router-link :to="{ path: '/login' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('login') }}
          </router-link>
          <router-link :to="{ path: '/register' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('register') }}
          </router-link>
          
          <!-- Language Switcher -->
          <div class="language-selector">
            <select @change="changeLanguage" v-model="currentLocale">
              <option value="en">🇺🇸 EN</option>
              <option value="vi">🇻🇳 VI</option>
            </select>
          </div>
        </div>
        
        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 transition-all duration-200 focus:outline-none focus:ring-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden mt-4 pb-4 space-y-3 border-t border-secondary-200 pt-4 animate-slide-up">
        <router-link :to="{ path: '/' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('home') }}
        </router-link>
        <router-link :to="{ path: '/login' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('login') }}
        </router-link>
        <router-link :to="{ path: '/register' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('register') }}
        </router-link>
        
        <!-- Mobile Language Switcher -->
        <div class="pt-3 border-t border-secondary-200">
          <label class="block text-sm font-medium text-secondary-700 mb-2">{{ t('language') || 'Language' }}</label>
          <div class="language-selector">
            <select @change="changeLanguage" v-model="currentLocale">
              <option value="en">🇺🇸 EN</option>
              <option value="vi">🇻🇳 VI</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { locale, t } = useI18n();
const currentLocale = ref(locale.value);
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const changeLanguage = (event) => {
  locale.value = event.target.value;
  currentLocale.value = event.target.value;
};
</script>

<style scoped>
/* Additional custom styles for enhanced navbar */
.navbar {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>