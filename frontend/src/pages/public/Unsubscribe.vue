<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">
          Newsletter Unsubscribe
        </h2>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-sm text-gray-600">Processing your request...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isSuccess" class="text-center">
          <div class="rounded-full bg-green-100 p-2 mx-auto w-12 h-12 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Successfully Unsubscribed</h3>
          <p class="text-sm text-gray-600 mb-4">
            You have been successfully unsubscribed from our newsletter.
            <span v-if="unsubscribedEmail" class="block mt-1 font-medium">{{ unsubscribedEmail }}</span>
          </p>
          <p class="text-xs text-gray-500">
            You will no longer receive promotional emails from us. We're sorry to see you go!
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="hasError" class="text-center">
          <div class="rounded-full bg-red-100 p-2 mx-auto w-12 h-12 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Unsubscribe Failed</h3>
          <p class="text-sm text-gray-600 mb-4">{{ errorMessage }}</p>
          <p class="text-xs text-gray-500">
            The unsubscribe link may be invalid or expired. Please contact support if you continue to receive emails.
          </p>
        </div>

        <!-- Form for email-based unsubscribe (legacy) -->
        <div v-else-if="showEmailForm" class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Unsubscribe</h3>
          <p class="text-sm text-gray-600 mb-4">
            Enter your email address to unsubscribe from our newsletter:
          </p>
          <form @submit.prevent="handleEmailUnsubscribe" class="space-y-4">
            <div>
              <input
                type="email"
                v-model="emailInput"
                :placeholder="emailFromQuery || 'Enter your email address'"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Unsubscribe
            </button>
          </form>
        </div>

        <!-- Back to homepage link -->
        <div class="mt-6 text-center">
          <router-link 
            to="/" 
            class="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            ← Back to Homepage
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../utils/config';

export default {
  name: 'Unsubscribe',
  setup() {
    const route = useRoute();
    const isLoading = ref(false);
    const isSuccess = ref(false);
    const hasError = ref(false);
    const errorMessage = ref('');
    const unsubscribedEmail = ref('');
    const showEmailForm = ref(false);
    const emailInput = ref('');
    const emailFromQuery = ref('');

    const handleTokenUnsubscribe = async (token) => {
      try {
        isLoading.value = true;
        const response = await axios.post(`${API_URL}/newsletter/unsubscribe/${token}`);
        
        if (response.data.success) {
          isSuccess.value = true;
          unsubscribedEmail.value = response.data.data.email;
        } else {
          throw new Error(response.data.message || 'Unsubscribe failed');
        }
      } catch (error) {
        hasError.value = true;
        errorMessage.value = error.response?.data?.message || error.message || 'An error occurred while unsubscribing';
      } finally {
        isLoading.value = false;
      }
    };

    const handleEmailUnsubscribe = async () => {
      try {
        isLoading.value = true;
        const email = emailInput.value || emailFromQuery.value;
        
        if (!email) {
          throw new Error('Email address is required');
        }

        const response = await axios.post(`${API_URL}/newsletter/unsubscribe-by-email`, {
          email: email
        });
        
        if (response.data.success) {
          isSuccess.value = true;
          unsubscribedEmail.value = response.data.data.email;
          showEmailForm.value = false;
        } else {
          throw new Error(response.data.message || 'Unsubscribe failed');
        }
        
      } catch (error) {
        hasError.value = true;
        errorMessage.value = error.response?.data?.message || error.message || 'An error occurred while unsubscribing';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      const token = route.params.token;
      const email = route.query.email;

      if (token) {
        // Handle token-based unsubscribe (new method)
        handleTokenUnsubscribe(token);
      } else if (email) {
        // Handle legacy email-based unsubscribe - automatically process it
        emailFromQuery.value = email;
        emailInput.value = email;
        handleEmailUnsubscribe();
      } else {
        // No token or email provided
        showEmailForm.value = true;
      }
    });

    return {
      isLoading,
      isSuccess,
      hasError,
      errorMessage,
      unsubscribedEmail,
      showEmailForm,
      emailInput,
      emailFromQuery,
      handleEmailUnsubscribe
    };
  }
};
</script>