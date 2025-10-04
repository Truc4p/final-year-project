<script setup>
import axios from "axios";
import { ref } from "vue";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../utils/config';
import ChatWidget from '../../components/ChatWidget.vue';

const { t } = useI18n();

const username = ref("");
const password = ref("");
const role = ref("customer"); // Default role is customer
const adminKey = ref(""); // Admin key for admin registration
const isLoading = ref(false);
const errorMessage = ref("");

const isPasswordStrong = (password) => {
  // Example criteria: at least 8 characters, one uppercase, one lowercase, one number, and one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

const register = async () => {
  // Reset error message
  errorMessage.value = "";

  if (!isPasswordStrong(password.value)) {
    errorMessage.value = t('weakPassword');
    return;
  }

  isLoading.value = true;

  try {
    const data = {
      username: username.value,
      password: password.value,
      role: role.value,
    };

    // Include adminKey if the role is admin
    if (role.value === "admin") {
      data.adminKey = adminKey.value;
    }

    const response = await axios.post(`${API_URL}/auth/register`, data);
    console.log("Registration successful:", response.data);
    alert(t('registerSuccess'));
  } catch (error) {
    console.error("Error during registration:", error.response?.data?.msg);
    errorMessage.value = `${t('registerFail')}${error.response?.data?.msg || ''}`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="text-center mb-8 mt-12">
      <h1 class="text-2xl font-bold text-primary-700">{{ t('register') }}</h1>
      <p class="text-gray-600 mt-2">{{ t('createAccount') }}</p>
    </div>
    
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
      <svg class="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>
    
    <form @submit.prevent="register" class="space-y-6">
      <div>
        <label class="form-label" for="username">{{ t('username') }}</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          :placeholder="t('enterUsername')"
          required
        />
      </div>
      
      <div>
        <label class="form-label" for="password">{{ t('password') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          :placeholder="t('enterPassword')"
          required
        />
      </div>
      
      <div>
        <label class="form-label" for="role">{{ t('role') }}</label>
        <select
          class="form-control"
          v-model="role"
          id="role"
        >
          <option value="customer">{{ t('customer') }}</option>
          <option value="admin">{{ t('admin') }}</option>
        </select>
      </div>
      
      <!-- Conditionally render the adminKey input field -->
      <div v-if="role === 'admin'">
        <label class="form-label" for="adminKey">{{ t('adminKey') }}</label>
        <input
          class="form-control"
          v-model="adminKey"
          id="adminKey"
          type="text"
          :placeholder="t('enterAdminKey')"
        />
      </div>
      
      <div>
        <button
          type="submit"
          class="w-full btn btn-primary py-3 flex justify-center"
          :disabled="isLoading"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? t('registering') : t('register') }}
        </button>
      </div>
    </form>
    
    <div class="mt-12 mb-8 text-center">
      <p class="text-gray-600">
        {{ t('alreadyHaveAccount') }} 
        <router-link to="/login" class="text-primary-700 hover:text-primary-800 font-medium">
          {{ t('loginNow') }}
        </router-link>
      </p>
    </div>

    <ChatWidget />
  </div>
</template>