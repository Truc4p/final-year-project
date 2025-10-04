<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-700 mb-2">Delete Category</h1>
        <p class="text-secondary-600 text-lg">Remove category from your system</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div class="card p-8 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">Error Loading Category</h3>
          <p class="text-secondary-500 mb-6">{{ error }}</p>
          <div class="flex justify-center gap-4">
            <button @click="fetchCategory" class="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <div v-else-if="category" class="max-w-2xl mx-auto">
        <!-- Category Information Card -->
        <div class="card mb-6">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
              <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Category Details
            </h2>
          </div>
          
          <div class="card-body">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-secondary-500 uppercase tracking-wide">Category ID</label>
                <div class="mt-1 text-sm font-mono text-secondary-600 bg-secondary-100 px-3 py-2 rounded-lg">
                  {{ category._id }}
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium text-secondary-500 uppercase tracking-wide">Category Name</label>
                <div class="mt-1 text-lg font-semibold text-secondary-900">
                  {{ category.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning Card -->
        <div class="card border-error border-2 mb-6">
          <div class="card-body">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-error mb-2">Warning: This action cannot be undone</h3>
                <div class="text-secondary-700 space-y-2">
                  <p>You are about to permanently delete the category <strong>"{{ category.name }}"</strong>.</p>
                  <p>This will:</p>
                  <ul class="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li>Remove the category from your system</li>
                    <li>Potentially affect products associated with this category</li>
                    <li>Cannot be reversed once confirmed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Input -->
        <div class="card mb-6">
          <div class="card-body">
            <label class="form-label">
              Type <strong>"{{ category.name }}"</strong> to confirm deletion
            </label>
            <input
              type="text"
              v-model="confirmationText"
              class="form-control"
              :class="{ 'border-error focus:border-error focus:ring-error': confirmationError }"
              placeholder="Enter category name to confirm"
              @input="validateConfirmation"
            />
            <div v-if="confirmationError" class="form-error">
              {{ confirmationError }}
            </div>
            <p class="text-secondary-500 text-sm mt-1">
              This confirmation helps prevent accidental deletions
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-4">
          <button
            @click="router.push('/admin/categories')"
            class="btn btn-secondary"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button
            @click="deleteCategory"
            class="btn btn-danger"
            :disabled="deleting || !isConfirmationValid"
          >
            <svg v-if="deleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            {{ deleting ? 'Deleting...' : 'Delete Category' }}
          </button>
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
        <div v-if="deleteError" class="mt-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-error font-medium">{{ deleteError }}</span>
          </div>
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

const route = useRoute();
const router = useRouter();

// Reactive state
const category = ref(null);
const loading = ref(true);
const error = ref('');
const deleting = ref(false);
const successMessage = ref('');
const deleteError = ref('');
const confirmationText = ref('');
const confirmationError = ref('');

// Computed properties
const isConfirmationValid = computed(() => {
  return confirmationText.value.trim() === category.value?.name;
});

// Fetch category details
const fetchCategory = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    const categoryId = route.params.id;
    const response = await axios.get(`${API_URL}/categories/${categoryId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    
    category.value = response.data;
  } catch (err) {
    console.error('Error fetching category details:', err);
    if (err.response?.status === 404) {
      error.value = 'Category not found. It may have already been deleted.';
    } else if (err.response?.status === 401) {
      error.value = 'Authentication failed. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      error.value = 'Failed to load category details. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

// Validate confirmation text
const validateConfirmation = () => {
  confirmationError.value = '';
  
  if (!confirmationText.value.trim()) {
    return;
  }
  
  if (confirmationText.value.trim() !== category.value?.name) {
    confirmationError.value = 'Category name does not match. Please type the exact name.';
  }
};

// Delete category
const deleteCategory = async () => {
  // Clear previous messages
  successMessage.value = '';
  deleteError.value = '';
  
  // Validate confirmation
  if (!isConfirmationValid.value) {
    confirmationError.value = 'Please type the exact category name to confirm deletion.';
    return;
  }
  
  deleting.value = true;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      deleteError.value = 'Authentication required. Please log in again.';
      router.push('/login');
      return;
    }

    const categoryId = route.params.id;
    await axios.delete(`${API_URL}/categories/${categoryId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    
    console.log('Category deleted successfully');
    successMessage.value = 'Category deleted successfully!';
    
    // Redirect after showing success message
    setTimeout(() => {
      router.push('/admin/categories');
    }, 1500);
    
  } catch (err) {
    console.error('Error deleting category:', err);
    
    if (err.response?.status === 401) {
      deleteError.value = 'Authentication failed. Please log in again.';
      router.push('/login');
    } else if (err.response?.status === 404) {
      deleteError.value = 'Category not found. It may have already been deleted.';
    } else if (err.response?.status === 400) {
      deleteError.value = 'Cannot delete category. It may be associated with existing products.';
    } else if (err.response?.data?.message) {
      deleteError.value = err.response.data.message;
    } else {
      deleteError.value = 'Failed to delete category. Please try again.';
    }
  } finally {
    deleting.value = false;
  }
};

// Initialize component
onMounted(() => {
  fetchCategory();
});
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

/* Danger button specific styles */
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error border enhancement */
.border-error {
  border-color: var(--error) !important;
}

/* Warning card animation */
.card.border-error {
  animation: fadeIn 0.3s ease-out, pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    border-color: var(--error);
  }
  50% { 
    border-color: #f87171;
  }
}

/* Loading state for form */
.form-control:disabled {
  background-color: var(--secondary-100);
  cursor: not-allowed;
}
</style>