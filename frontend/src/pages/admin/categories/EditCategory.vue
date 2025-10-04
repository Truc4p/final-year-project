<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-700 mb-2">Edit Category</h1>
        <p class="text-secondary-600 text-lg">Update category information</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div class="card p-8 text-center">
          <div class="text-error text-lg font-medium mb-2">{{ error }}</div>
          <p class="text-secondary-500 mb-4">Please try again or go back to categories</p>
        </div>
      </div>

      <!-- Form Card -->
      <div v-else-if="category" class="max-w-2xl mx-auto">
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Category Information
            </h2>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="updateCategory" class="space-y-6">
              <!-- Category ID Display -->
              <div class="p-4 rounded-lg">
                <label class="form-label text-secondary-500 text-sm">Category ID</label>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-sm font-mono text-secondary-600 bg-white px-2 py-1 rounded">
                    {{ category._id }}
                  </span>
                </div>
              </div>

              <!-- Category Name Field -->
              <div>
                <label for="name" class="form-label">
                  Category Name <span class="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  v-model="category.name"
                  class="form-control"
                  :class="{ 'border-error focus:border-error focus:ring-error': nameError }"
                  placeholder="Enter category name (e.g., Electronics, Clothing, Books)"
                  required
                  @input="validateName"
                />
                <div v-if="nameError" class="form-error">
                  {{ nameError }}
                </div>
                <p class="text-secondary-500 text-sm mt-1">
                  Choose a clear, descriptive name for your category
                </p>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end gap-4 pt-4 border-t border-secondary-200">
                <button
                  type="button"
                  @click="router.push('/admin/categories')"
                  class="btn btn-secondary"
                  :disabled="formLoading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isUpdateDisabled"
                >
                  <svg v-if="formLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {{ formLoading ? 'Updating...' : 'Update Category' }}
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
        <div v-if="updateError" class="mt-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-error font-medium">{{ updateError }}</span>
          </div>
        </div>
      </div>

      <!-- Category Not Found -->
      <div v-else class="max-w-2xl mx-auto">
        <div class="card p-12 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">Category Not Found</h3>
          <p class="text-secondary-500 mb-6">The category you're looking for doesn't exist or has been deleted</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { API_URL } from '../../../utils/config';

const category = ref(null);
const loading = ref(true);
const error = ref(null);
const formLoading = ref(false);
const nameError = ref('');
const successMessage = ref('');
const updateError = ref('');
const route = useRoute();
const router = useRouter();

// Computed property for button state
const isUpdateDisabled = computed(() => {
  return formLoading.value || !category.value?.name?.trim() || !!nameError.value;
});

onMounted(async () => {
  const categoryId = route.params.id;
  console.log('Fetching category with ID:', categoryId);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    const response = await axios.get(`${API_URL}/categories/${categoryId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    
    console.log('API response:', response.data);
    category.value = response.data;
  } catch (err) {
    console.error('Error fetching category details:', err);
    if (err.response?.status === 404) {
      error.value = 'Category not found';
    } else if (err.response?.status === 401) {
      error.value = 'Authentication failed. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      error.value = 'Failed to load category details';
    }
  } finally {
    loading.value = false;
  }
});

const validateName = () => {
  nameError.value = '';
  
  if (!category.value?.name?.trim()) {
    nameError.value = 'Category name is required';
    return false;
  }
  
  if (category.value.name.trim().length < 2) {
    nameError.value = 'Category name must be at least 2 characters long';
    return false;
  }
  
  if (category.value.name.trim().length > 50) {
    nameError.value = 'Category name must be less than 50 characters';
    return false;
  }
  
  return true;
};

const updateCategory = async () => {
  // Clear previous messages
  successMessage.value = '';
  updateError.value = '';
  
  // Validate form
  if (!validateName()) {
    return;
  }
  
  const categoryId = route.params.id;
  console.log('Updating category with ID:', categoryId);
  
  formLoading.value = true;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      updateError.value = 'Authentication required. Please log in again.';
      router.push('/login');
      return;
    }

    await axios.put(`${API_URL}/categories/${categoryId}`, 
      { name: category.value.name.trim() }, 
      {
        headers: {
          'x-auth-token': token,
        },
      }
    );
    
    console.log('Category updated successfully');
    successMessage.value = 'Category updated successfully!';
    
    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push('/admin/categories');
    }, 1500);
    
  } catch (err) {
    console.error('Error updating category:', err);
    
    if (err.response?.status === 401) {
      updateError.value = 'Authentication failed. Please log in again.';
      router.push('/login');
    } else if (err.response?.status === 409) {
      updateError.value = 'A category with this name already exists.';
      nameError.value = 'This category name is already taken';
    } else if (err.response?.status === 404) {
      updateError.value = 'Category not found. It may have been deleted.';
    } else if (err.response?.data?.message) {
      updateError.value = err.response.data.message;
    } else {
      updateError.value = 'Failed to update category. Please try again.';
    }
  } finally {
    formLoading.value = false;
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
</style>