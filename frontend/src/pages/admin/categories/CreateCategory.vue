<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-primary-600 mb-2">Create New Category</h1>
        <p class="text-secondary-600 text-lg">Add a new category to organize your products</p>
      </div>

      <!-- Form Card -->
      <div class="max-w-2xl mx-auto">
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Category Information
            </h2>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Category Name Field -->
              <div>
                <label for="name" class="form-label">
                  Category Name <span class="text-error">*</span>
                </label>
                <div class="relative">
                  <input
                    type="text"
                    id="name"
                    v-model="name"
                    class="form-control pr-10"
                    :class="{ 
                      'border-error focus:border-error focus:ring-error': nameError,
                      'border-success focus:border-success focus:ring-success': isNameAvailable && name.trim() && !nameError,
                      'border-warning focus:border-warning focus:ring-warning': checkingAvailability
                    }"
                    placeholder="Enter category name (e.g., Electronics, Clothing, Books)"
                    required
                    @input="handleNameInput"
                  />
                  <!-- Status Icon -->
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <!-- Checking availability spinner -->
                    <svg v-if="checkingAvailability" class="animate-spin h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <!-- Success checkmark -->
                    <svg v-else-if="isNameAvailable && name.trim() && !nameError" class="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <!-- Error X -->
                    <svg v-else-if="nameError" class="h-5 w-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Error Message -->
                <div v-if="nameError" class="form-error">
                  {{ nameError }}
                </div>
                
                <!-- Success Message -->
                <div v-else-if="isNameAvailable && name.trim() && !checkingAvailability" class="text-success text-sm mt-1 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  This category name is available
                </div>
                
                <!-- Checking Message -->
                <div v-else-if="checkingAvailability" class="text-warning text-sm mt-1 flex items-center gap-1">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking availability...
                </div>
                
                <!-- Help Text -->
                <p v-else class="text-secondary-500 text-sm mt-1">
                  Choose a clear, descriptive name for your category
                </p>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end gap-4 pt-4 border-t border-secondary-200">
                <button
                  type="button"
                  @click="router.push('/admin/categories')"
                  class="btn btn-secondary"
                  :disabled="loading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading || !name.trim() || nameError || checkingAvailability || !isNameAvailable"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  {{ loading ? 'Creating...' : 'Create Category' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-6 p-4 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-success font-medium">{{ successMessage }}</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-error font-medium">{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';

const { t } = useI18n();
const name = ref('');
const nameError = ref('');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const router = useRouter();

// Availability checking states
const checkingAvailability = ref(false);
const isNameAvailable = ref(false);
const existingCategories = ref([]);
const debounceTimer = ref(null);

// Fetch existing categories on component mount
onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await axios.get(`${API_URL}/categories`, {
        headers: {
          'x-auth-token': token,
        },
      });
      existingCategories.value = response.data.map(cat => cat.name.toLowerCase());
    }
  } catch (error) {
    console.error('Error fetching existing categories:', error);
  }
});

const validateName = () => {
  nameError.value = '';
  
  if (!name.value.trim()) {
    nameError.value = 'Category name is required';
    return false;
  }
  
  if (name.value.trim().length < 2) {
    nameError.value = 'Category name must be at least 2 characters long';
    return false;
  }
  
  if (name.value.trim().length > 50) {
    nameError.value = 'Category name must be less than 50 characters';
    return false;
  }
  
  return true;
};

const checkNameAvailability = async (categoryName) => {
  if (!categoryName.trim() || categoryName.trim().length < 2) {
    isNameAvailable.value = false;
    return;
  }

  // First check against locally cached categories for instant feedback
  const normalizedName = categoryName.trim().toLowerCase();
  if (existingCategories.value.includes(normalizedName)) {
    nameError.value = 'This category name is already taken';
    isNameAvailable.value = false;
    return;
  }

  checkingAvailability.value = true;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      checkingAvailability.value = false;
      return;
    }

    // Make a request to check availability (we'll use the categories endpoint)
    const response = await axios.get(`${API_URL}/categories`, {
      headers: {
        'x-auth-token': token,
      },
    });
    
    // Check if the name already exists (case-insensitive)
    const existingNames = response.data.map(cat => cat.name.toLowerCase());
    const nameExists = existingNames.includes(normalizedName);
    
    if (nameExists) {
      nameError.value = 'This category name is already taken';
      isNameAvailable.value = false;
    } else {
      isNameAvailable.value = true;
      // Update our local cache
      existingCategories.value = existingNames;
    }
  } catch (error) {
    console.error('Error checking category availability:', error);
    // On error, don't block the user but don't show as available either
    isNameAvailable.value = false;
  } finally {
    checkingAvailability.value = false;
  }
};

const handleNameInput = () => {
  // Clear previous error and availability status
  nameError.value = '';
  isNameAvailable.value = false;
  
  // Clear existing debounce timer
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  
  // Validate name format first
  if (!validateName()) {
    return;
  }
  
  // Debounce the availability check
  debounceTimer.value = setTimeout(() => {
    checkNameAvailability(name.value);
  }, 500); // Wait 500ms after user stops typing
};

const handleSubmit = async () => {
  // Clear previous messages
  successMessage.value = '';
  errorMessage.value = '';
  
  // Validate form
  if (!validateName()) {
    return;
  }

  // Check if name is available
  if (!isNameAvailable.value) {
    if (!nameError.value) {
      nameError.value = 'Please choose a different category name';
    }
    return;
  }
  
  loading.value = true;
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      errorMessage.value = 'Authentication required. Please log in again.';
      router.push('/login');
      return;
    }
    
    const response = await axios.post(`${API_URL}/categories`, 
      { name: name.value.trim() }, 
      {
        headers: {
          'x-auth-token': token,
        },
      }
    );
    
    console.log('Category created:', response.data);
    successMessage.value = 'Category created successfully!';
    
    // Reset form
    name.value = '';
    nameError.value = '';
    isNameAvailable.value = false;
    
    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push('/admin/categories');
    }, 1500);
    
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.response?.status === 401) {
      errorMessage.value = 'Authentication failed. Please log in again.';
      router.push('/login');
    } else if (error.response?.status === 409) {
      errorMessage.value = 'A category with this name already exists.';
      nameError.value = 'This category name is already taken';
      isNameAvailable.value = false;
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Failed to create category. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.3s ease-out;
}

/* Enhanced form focus states */
.form-control:focus {
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft), 0 0 0 3px rgba(20, 184, 166, 0.1);
}

/* Button hover effects */
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

/* Loading state for form */
.form-control:disabled {
  background-color: var(--secondary-100);
  cursor: not-allowed;
}

/* Enhanced border colors for different states */
.form-control.border-success {
  border-color: #10b981;
}

.form-control.border-warning {
  border-color: #f59e0b;
}

.form-control.focus\:border-success:focus {
  border-color: #10b981;
}

.form-control.focus\:border-warning:focus {
  border-color: #f59e0b;
}

.form-control.focus\:ring-success:focus {
  --tw-ring-color: rgba(16, 185, 129, 0.1);
}

.form-control.focus\:ring-warning:focus {
  --tw-ring-color: rgba(245, 158, 11, 0.1);
}
</style>