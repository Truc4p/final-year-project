
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import ChatWidget from '../../../components/ChatWidget.vue';

const router = useRouter();
const { t } = useI18n();
const user = ref(null);
const isEditing = ref(false);
const editForm = ref({
  username: '',
  email: '',
  phone: '',
  address: ''
});
const loading = ref(false);
const error = ref(null);
const success = ref(null);

// Get userId from localStorage
const userId = localStorage.getItem('userId');
if (!userId) {
    console.error('userId is not found in localStorage');
    router.push('/login');
} else {
    console.log('userId:', userId);
}

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).getFullYear();
  } catch {
    return null;
  }
};

const getCustomer = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert(t('login'));
        router.push("/login");
        return;
    }

    try {
        const res = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                "x-auth-token": token,
            },
        });
        console.log("User response:", res.data);
        user.value = res.data;
        // Initialize edit form with current user data
        editForm.value = {
          username: res.data.username || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};

const startEditing = () => {
  isEditing.value = true;
  // Reset form to current values
  editForm.value = {
    username: user.value.username || '',
    email: user.value.email || '',
    phone: user.value.phone || '',
    address: user.value.address || ''
  };
  error.value = null;
  success.value = null;
};

const cancelEditing = () => {
  isEditing.value = false;
  error.value = null;
  success.value = null;
};

const updateProfile = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;
  
  const token = localStorage.getItem("token");
  if (!token) {
    error.value = "Authentication token not found";
    loading.value = false;
    return;
  }

  try {
    const res = await axios.put(`${API_URL}/users/${userId}`, editForm.value, {
      headers: {
        "x-auth-token": token,
      },
    });
    
    console.log("Profile update response:", res.data);
    user.value = { ...user.value, ...editForm.value };
    success.value = "Profile updated successfully!";
    isEditing.value = false;
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = null;
    }, 3000);
    
  } catch (err) {
    console.error("Error updating profile:", err);
    error.value = err.response?.data?.message || "Failed to update profile. Please try again.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
    getCustomer();
});
</script>

<template>
  <div class="page-background">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('profile') }}</h1>
        <p class="text-gray-600">{{ t('manageYourAccountInformation') || 'Manage your account information and preferences' }}</p>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="success" class="mb-6 max-w-4xl mx-auto">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-green-800 font-medium">{{ success }}</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="mb-6 max-w-4xl mx-auto">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-red-800 font-medium">{{ error }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="!user" class="flex justify-center items-center py-20">
        <div class="text-center">
          <svg class="loading-spinner mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">{{ t('loading') || 'Loading profile...' }}</p>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Profile Card -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl overflow-hidden">
            <!-- Profile Header -->
            <div class="px-6 py-8 text-gray-900" style="background: white; border-bottom: 1px solid #e5e7eb;">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900">{{ user.username }}</h2>
                    <p class="text-gray-500">{{ t('customerAccount') || 'Customer Account' }}</p>
                  </div>
                </div>
                
                <!-- Edit Profile Button -->
                <div class="flex items-center space-x-2">
                  <button 
                    v-if="!isEditing"
                    @click="startEditing" 
                    class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <!-- Profile Information -->
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">{{ t('personalInformation') || 'Personal Information' }}</h3>
              
              <!-- View Mode -->
              <div v-if="!isEditing">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <!-- User ID -->
                  <div class="info-item">
                    <div class="flex items-center text-gray-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0V5a2 2 0 014 0v1" />
                      </svg>
                      <span class="text-sm font-medium">{{ t('userID') || 'User ID' }}</span>
                    </div>
                    <p class="text-gray-900 font-mono text-sm px-3 py-2 rounded-lg">#{{ user._id.slice(-8) }}</p>
                  </div>

                  <!-- Username -->
                  <div class="info-item">
                    <div class="flex items-center text-gray-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span class="text-sm font-medium">{{ t('username') }}</span>
                    </div>
                    <p class="text-gray-900 font-semibold">{{ user.username }}</p>
                  </div>

                  <!-- Email -->
                  <div class="info-item">
                    <div class="flex items-center text-gray-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span class="text-sm font-medium">{{ t('email') || 'Email' }}</span>
                    </div>
                    <p class="text-gray-900" :class="!user.email ? 'text-gray-400 italic' : ''">
                      {{ user.email || (t('noEmailProvided') || 'No email provided') }}
                    </p>
                  </div>

                  <!-- Phone -->
                  <div class="info-item">
                    <div class="flex items-center text-gray-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span class="text-sm font-medium">{{ t('phone') }}</span>
                    </div>
                    <p class="text-gray-900" :class="!user.phone ? 'text-gray-400 italic' : ''">
                      {{ user.phone || (t('noPhone') || 'No phone number provided') }}
                    </p>
                  </div>

                </div>

                <!-- Address (Full Width) -->
                <div class="info-item mt-6">
                  <div class="flex items-center text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-sm font-medium">{{ t('address') }}</span>
                  </div>
                  <p class="text-gray-900" :class="!user.address ? 'text-gray-400 italic' : ''">
                    {{ user.address || (t('noAddress') || 'No address provided') }}
                  </p>
                </div>
              </div>

              <!-- Edit Mode -->
              <div v-else>
                <form @submit.prevent="updateProfile" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Username -->
                    <div class="form-group">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ t('username') }}
                      </label>
                      <input
                        v-model="editForm.username"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      />
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        {{ t('email') || 'Email' }}
                      </label>
                      <input
                        v-model="editForm.email"
                        type="email"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      />
                    </div>

                    <!-- Phone -->
                    <div class="form-group">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {{ t('phone') }}
                      </label>
                      <input
                        v-model="editForm.phone"
                        type="tel"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      />
                    </div>

                    <!-- Address -->
                    <div class="form-group">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ t('address') }}
                      </label>
                      <input
                        v-model="editForm.address"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      @click="cancelEditing"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="loading"
                      class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                    >
                      <span v-if="loading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                      <span v-else>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">{{ t('quickActions') || 'Quick Actions' }}</h3>
            
            <div class="space-y-4">
              <router-link to="/customer/order-history" class="quick-action-btn group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{{ t('orderHistory') }}</span>
              </router-link>

              <router-link to="/customer/cart" class="quick-action-btn group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{{ t('viewCart') || 'View Cart' }}</span>
              </router-link>

              <router-link to="/customer" class="quick-action-btn group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>{{ t('continueShopping') || 'Continue Shopping' }}</span>
              </router-link>
            </div>
          </div>

          <!-- Account Stats -->
          <div class="bg-white rounded-2xl p-6 mt-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">{{ t('accountStats') || 'Account Stats' }}</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ t('memberSince') || 'Member Since' }}</span>
                <span class="font-semibold text-gray-900">{{ formatDate(user.createdAt) || '2024' }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ t('accountStatus') || 'Account Status' }}</span>
                <span class="px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
                  {{ t('active') || 'Active' }}
                </span>
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

/* Info item styling */
.info-item {
  @apply transition-all duration-200;
}

.info-item:hover {
  @apply transform translate-y-0.5;
}

/* Quick action buttons */
.quick-action-btn {
  @apply flex items-center space-x-3 w-full p-4 text-left bg-gray-50 hover:bg-teal-50 rounded-xl transition-all duration-200 text-gray-700 hover:text-teal-700;
}

.quick-action-btn:hover {
  @apply transform translate-y-0.5;
}

.quick-action-btn svg {
  @apply transition-transform duration-200 group-hover:scale-110;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .container {
    @apply px-4;
  }
}

/* Form styling */
.form-group {
  @apply transition-all duration-200;
}

.form-group:hover {
  @apply transform translate-y-0.5;
}

.form-group input:focus {
  @apply ring-2 ring-primary-500 border-primary-500;
}

/* Button hover effects */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}
</style>