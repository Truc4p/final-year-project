<!-- src/components/Admin-Navbar.vue -->
<template>
  <nav class="navbar sticky top-0 z-50">
    <div class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-3">
          <router-link to="/admin" class="navbar-brand">
            <span class="footer-brand-text">WrenCos Admin</span>
          </router-link>
        </div>
        
        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link :to="{ path: '/admin/products' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('products') }}
          </router-link>
          <router-link :to="{ path: '/admin/categories' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('categories') }}
          </router-link>
          <router-link :to="{ path: '/admin/orders' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('orders') }}
          </router-link>
          <router-link :to="{ path: '/admin/users' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('users') }}
          </router-link>
          <router-link :to="{ path: '/admin/analytics' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('analytics') }}
          </router-link>
          <router-link :to="{ path: '/admin/cashflow' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('cashFlow') }}
          </router-link>
          <router-link :to="{ path: '/admin/hr' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('hr') }}
          </router-link>
          <router-link :to="{ path: '/admin/live-stream' }" exact-active-class="router-link-exact-active" class="navbar-link">
            {{ t('liveStream') }}
          </router-link>
          <router-link :to="{ path: '/admin/finance' }" exact-active-class="router-link-exact-active" class="navbar-link">
            Finance
          </router-link>
          
          <!-- Email Marketing Dropdown -->
          <div class="relative group">
            <div class="navbar-link flex items-center space-x-1 cursor-pointer">
              <span>{{ t('marketing') }}</span>
              <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            <!-- Invisible bridge to prevent gap -->
            <div class="absolute top-full left-0 w-48 h-2 bg-transparent group-hover:block hidden"></div>
            
            <div 
              class="absolute top-full left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2"
            >
              <router-link 
                :to="{ path: '/admin/email-marketing/subscribers' }" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Subscribers
              </router-link>
              <router-link 
                :to="{ path: '/admin/email-marketing/templates' }" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Templates
              </router-link>
              <router-link 
                :to="{ path: '/admin/email-marketing/campaigns' }" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Campaigns
              </router-link>
              <router-link 
                :to="{ path: '/admin/email-marketing/analytics' }" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Analytics
              </router-link>
            </div>
          </div>
          
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
        <router-link :to="{ path: '/admin/products' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('products') }}
        </router-link>
        <router-link :to="{ path: '/admin/categories' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('categories') }}
        </router-link>
        <router-link :to="{ path: '/admin/orders' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('orders') }}
        </router-link>
        <router-link :to="{ path: '/admin/users' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('users') }}
        </router-link>
        <router-link :to="{ path: '/admin/analytics' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          Analytics
        </router-link>
        <router-link :to="{ path: '/admin/cashflow' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          Cash Flow
        </router-link>
        <router-link :to="{ path: '/admin/hr' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          Human Resources
        </router-link>
        <router-link :to="{ path: '/admin/live-stream' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('liveStream') }}
        </router-link>
        <router-link :to="{ path: '/admin/finance' }" exact-active-class="router-link-exact-active" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          Finance
        </router-link>
        
        <!-- Email Marketing Mobile Menu -->
        <div class="py-2">
          <button 
            @click="emailMobileDropdownOpen = !emailMobileDropdownOpen"
            class="w-full text-left navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200 flex items-center justify-between"
          >
            <span>Email Marketing</span>
            <svg 
              :class="{ 'rotate-180': emailMobileDropdownOpen }"
              class="w-4 h-4 transition-transform"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <div v-if="emailMobileDropdownOpen" class="ml-4 mt-2 space-y-1">
            <router-link 
              :to="{ path: '/admin/email-marketing/subscribers' }" 
              class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200 text-sm"
            >
              Subscribers
            </router-link>
            <router-link 
              :to="{ path: '/admin/email-marketing/templates' }" 
              class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200 text-sm"
            >
              Templates
            </router-link>
            <router-link 
              :to="{ path: '/admin/email-marketing/campaigns' }" 
              class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200 text-sm"
            >
              Campaigns
            </router-link>
            <router-link 
              :to="{ path: '/admin/email-marketing/analytics' }" 
              class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200 text-sm"
            >
              Analytics
            </router-link>
          </div>
        </div>
        
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
        
        <router-link to="/logout" class="block navbar-link py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
          {{ t('logout') }}
        </router-link>
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
const emailMobileDropdownOpen = ref(false);

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

/* Group hover styles for dropdown */
.group:hover .group-hover\:block {
  display: block;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\:visible {
  visibility: visible;
}

.group:hover .group-hover\:translate-y-0 {
  transform: translateY(0);
}

.group:hover .group-hover\:rotate-180 {
  transform: rotate(180deg);
}
</style>