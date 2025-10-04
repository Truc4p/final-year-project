<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-700 mb-2">Edit Product</h1>
        <p class="text-secondary-600 text-lg">Update product information and settings</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto">
        <div class="card p-8 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">Error Loading Product</h3>
          <p class="text-secondary-500 mb-6">{{ error }}</p>
          <div class="flex justify-center gap-4">
            <button @click="fetchProduct" class="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Product Form -->
      <div v-else-if="product" class="max-w-4xl mx-auto">
        <form @submit.prevent="updateProduct" class="space-y-6">
          <!-- Product Information Card -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                Product Information
              </h2>
            </div>
            
            <div class="card-body">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Product Name -->
                <div class="lg:col-span-2">
                  <label for="name" class="form-label">
                    Product Name <span class="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    v-model="name"
                    class="form-control"
                    :class="{ 'border-error focus:border-error focus:ring-error': nameError }"
                    placeholder="Enter product name"
                    required
                    @input="validateName"
                  />
                  <div v-if="nameError" class="form-error">
                    {{ nameError }}
                  </div>
                </div>

                <!-- Category -->
                <div>
                  <label for="category" class="form-label">
                    Category <span class="text-error">*</span>
                  </label>
                  <select
                    id="category"
                    v-model="category"
                    class="form-control"
                    :class="{ 'border-error focus:border-error focus:ring-error': categoryError }"
                    required
                    @change="validateCategory"
                  >
                    <option value="">Select a category</option>
                    <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                      {{ cat.name }}
                    </option>
                  </select>
                  <div v-if="categoryError" class="form-error">
                    {{ categoryError }}
                  </div>
                </div>

                <!-- Price -->
                <div>
                  <label for="price" class="form-label">
                    Price <span class="text-error">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      id="price"
                      v-model="price"
                      class="form-control pl-8"
                      :class="{ 'border-error focus:border-error focus:ring-error': priceError }"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      @input="validatePrice"
                    />
                  </div>
                  <div v-if="priceError" class="form-error">
                    {{ priceError }}
                  </div>
                </div>

                <!-- Stock Quantity -->
                <div>
                  <label for="stockQuantity" class="form-label">
                    Stock Quantity <span class="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    v-model="stockQuantity"
                    class="form-control"
                    :class="{ 'border-error focus:border-error focus:ring-error': stockError }"
                    placeholder="0"
                    min="0"
                    required
                    @input="validateStock"
                  />
                  <div v-if="stockError" class="form-error">
                    {{ stockError }}
                  </div>
                </div>

                <!-- Description -->
                <div class="lg:col-span-2">
                  <label for="description" class="form-label">
                    Description
                  </label>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Description Input -->
                    <div>
                      <textarea
                        id="description"
                        v-model="description"
                        class="form-control"
                        rows="4"
                        placeholder="Enter product description..."
                      ></textarea>
                      <div class="text-sm text-secondary-500 mt-1 space-y-1">
                        <p>Line breaks and formatting will be preserved as you type them.</p>
                        <div class="text-xs bg-secondary-50 p-2 rounded border">
                          <strong>Formatting tips:</strong><br>
                          • Use **text** for <strong>bold</strong><br>
                        </div>
                      </div>
                    </div>
                    <!-- Description Preview -->
                    <div v-if="description && description.trim()" class="lg:block hidden">
                      <label class="form-label text-sm text-secondary-600">
                        Preview
                      </label>
                      <div class="border border-secondary-300 rounded-md p-3 min-h-[100px] bg-secondary-50">
                        <div 
                          class="text-secondary-700 text-sm leading-relaxed formatted-description"
                          v-html="formatDescription(description)"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Image Card -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Product Image
              </h2>
            </div>
            
            <div class="card-body">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Image Upload -->
                <div>
                  <label for="image" class="form-label">
                    Upload New Image
                  </label>
                  <label for="image" class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-lg hover:border-primary-400 transition-colors duration-200 cursor-pointer">
                    <div class="space-y-1 text-center">
                      <svg class="mx-auto h-12 w-12 text-secondary-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="flex text-sm text-secondary-600">
                        <span class="font-medium text-primary-600 hover:text-primary-500">Upload a file</span>
                        <p class="pl-1">or drag and drop</p>
                      </div>
                      <p class="text-xs text-secondary-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      class="sr-only"
                      accept="image/*"
                      @change="handleImageUpload"
                    />
                  </label>
                </div>

                <!-- Current Image Preview -->
                <div>
                  <label class="form-label">Current Image</label>
                  <div class="mt-1">
                    <div v-if="product.image || imagePreview" class="relative">
                      <img 
                        :src="imagePreview || getImageUrl(product.image)" 
                        alt="Product Image" 
                        class="w-full h-64 object-cover rounded-lg"
                      />
                      <div v-if="imagePreview" class="absolute top-2 right-2">
                        <button
                          type="button"
                          @click="removeNewImage"
                          class="bg-error text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div v-else class="w-full h-64 bg-secondary-100 rounded-lg border border-secondary-200 flex items-center justify-center">
                      <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-secondary-500 text-sm mt-2">No image available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Product Information Card -->
          <div class="card">
            <div class="card-header">
              <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                Additional Product Information
              </h2>
            </div>
            
            <div class="card-body space-y-6">
              <!-- Skin Type -->
              <div class="form-group">
                <label class="form-label">
                  Skin Type
                </label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label v-for="type in ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']" 
                         :key="type" 
                         class="flex items-center space-x-2 p-3 border border-secondary-300 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      :value="type" 
                      v-model="skinType"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm font-medium capitalize">{{ type }}</span>
                  </label>
                </div>
              </div>

              <!-- Skin Concerns -->
              <div class="form-group">
                <label class="form-label">
                  Skin Concerns
                </label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label v-for="concern in ['acne', 'aging', 'dark-spots', 'wrinkles', 'dryness', 'sensitivity', 'dullness', 'pores', 'uneven-tone']" 
                         :key="concern" 
                         class="flex items-center space-x-2 p-3 border border-secondary-300 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      :value="concern" 
                      v-model="skinConcerns"
                      class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm font-medium capitalize">{{ concern.replace('-', ' ') }}</span>
                  </label>
                </div>
              </div>

              <!-- Ingredients -->
              <div class="form-group">
                <label class="form-label">
                  Ingredients
                </label>
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      v-model="newIngredient"
                      @keyup.enter="addIngredient"
                      class="form-control flex-1"
                      placeholder="Add ingredient (e.g., Retinol, Vitamin C)"
                    />
                    <button 
                      type="button" 
                      @click="addIngredient"
                      class="btn btn-secondary px-4"
                      :disabled="!newIngredient.trim()"
                    >
                      Add
                    </button>
                  </div>
                  <div v-if="ingredients.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="(ingredient, index) in ingredients" 
                          :key="index" 
                          class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {{ ingredient }}
                      <button 
                        type="button" 
                        @click="removeIngredient(index)"
                        class="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Benefits -->
              <div class="form-group">
                <label class="form-label">
                  Benefits
                </label>
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      v-model="newBenefit"
                      @keyup.enter="addBenefit"
                      class="form-control flex-1"
                      placeholder="Add benefit (e.g., Anti-aging, Moisturizing)"
                    />
                    <button 
                      type="button" 
                      @click="addBenefit"
                      class="btn btn-secondary px-4"
                      :disabled="!newBenefit.trim()"
                    >
                      Add
                    </button>
                  </div>
                  <div v-if="benefits.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="(benefit, index) in benefits" 
                          :key="index" 
                          class="inline-flex items-center gap-1 px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm">
                      {{ benefit }}
                      <button 
                        type="button" 
                        @click="removeBenefit(index)"
                        class="ml-1 text-success-600 hover:text-success-800"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div class="form-group">
                <label class="form-label">
                  Tags
                </label>
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      v-model="newTag"
                      @keyup.enter="addTag"
                      class="form-control flex-1"
                      placeholder="Add tag (e.g., organic, cruelty-free)"
                    />
                    <button 
                      type="button" 
                      @click="addTag"
                      class="btn btn-secondary px-4"
                      :disabled="!newTag.trim()"
                    >
                      Add
                    </button>
                  </div>
                  <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="(tag, index) in tags" 
                          :key="index" 
                          class="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm">
                      {{ tag }}
                      <button 
                        type="button" 
                        @click="removeTag(index)"
                        class="ml-1 text-secondary-600 hover:text-secondary-800"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Usage Instructions -->
              <div class="form-group">
                <label for="usage" class="form-label">
                  Usage Instructions
                </label>
                <textarea 
                  id="usage" 
                  v-model="usage"
                  class="form-control min-h-[100px] resize-y"
                  placeholder="How to use this product (e.g., Apply twice daily on clean skin)"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              @click="router.push('/admin/products')"
              class="btn btn-secondary"
              :disabled="updating"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="updating || !isFormValid"
            >
              <svg v-if="updating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              {{ updating ? 'Updating...' : 'Update Product' }}
            </button>
          </div>
        </form>

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
const product = ref(null);
const loading = ref(true);
const error = ref('');
const updating = ref(false);
const successMessage = ref('');
const updateError = ref('');

// Form fields
const name = ref('');
const category = ref('');
const price = ref('');
const stockQuantity = ref('');
const description = ref('');
const image = ref(null);
const imagePreview = ref('');

// Additional fields for AI assistant
const ingredients = ref([]);
const skinType = ref([]);
const benefits = ref([]);
const tags = ref([]);
const usage = ref('');
const skinConcerns = ref([]);

// Input fields for adding new items
const newIngredient = ref('');
const newBenefit = ref('');
const newTag = ref('');

// Categories
const categories = ref([]);

// Form validation
const nameError = ref('');
const categoryError = ref('');
const priceError = ref('');
const stockError = ref('');

// Computed properties
const isFormValid = computed(() => {
  return name.value.trim() && 
         category.value && 
         price.value && 
         stockQuantity.value >= 0 && 
         !nameError.value && 
         !categoryError.value && 
         !priceError.value && 
         !stockError.value;
});

// Validation functions
const validateName = () => {
  nameError.value = '';
  if (!name.value.trim()) {
    nameError.value = 'Product name is required';
  } else if (name.value.trim().length < 2) {
    nameError.value = 'Product name must be at least 2 characters long';
  } else if (name.value.trim().length > 100) {
    nameError.value = 'Product name must be less than 100 characters';
  }
};

const validateCategory = () => {
  categoryError.value = '';
  if (!category.value) {
    categoryError.value = 'Please select a category';
  }
};

const validatePrice = () => {
  priceError.value = '';
  if (!price.value) {
    priceError.value = 'Price is required';
  } else if (parseFloat(price.value) <= 0) {
    priceError.value = 'Price must be greater than 0';
  } else if (parseFloat(price.value) > 999999) {
    priceError.value = 'Price cannot exceed $999,999';
  }
};

const validateStock = () => {
  stockError.value = '';
  if (stockQuantity.value === '' || stockQuantity.value === null) {
    stockError.value = 'Stock quantity is required';
  } else if (parseInt(stockQuantity.value) < 0) {
    stockError.value = 'Stock quantity cannot be negative';
  } else if (parseInt(stockQuantity.value) > 999999) {
    stockError.value = 'Stock quantity cannot exceed 999,999';
  }
};

// Fetch functions
const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    const response = await axios.get(`${API_URL}/categories`, {
      headers: {
        'x-auth-token': token,
      },
    });
    categories.value = response.data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    // Don't set error here as it's not critical for loading
  }
};

const fetchProduct = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    const productId = route.params.id;
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
    
    product.value = response.data;
    
    // Populate form fields
    name.value = product.value.name;
    category.value = product.value.category?._id || '';
    price.value = product.value.price;
    stockQuantity.value = product.value.stockQuantity;
    description.value = product.value.description || '';
    
    // Populate additional fields
    ingredients.value = product.value.ingredients || [];
    skinType.value = product.value.skinType || [];
    benefits.value = product.value.benefits || [];
    tags.value = product.value.tags || [];
    usage.value = product.value.usage || '';
    skinConcerns.value = product.value.skinConcerns || [];
    
  } catch (err) {
    console.error('Error fetching product details:', err);
    if (err.response?.status === 404) {
      error.value = 'Product not found. It may have been deleted.';
    } else if (err.response?.status === 401) {
      error.value = 'Authentication failed. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      error.value = 'Failed to load product details. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

// Image handling
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      updateError.value = 'Please select a valid image file';
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      updateError.value = 'Image size must be less than 10MB';
      return;
    }
    
    image.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Clear any previous error
    updateError.value = '';
  }
};

const removeNewImage = () => {
  image.value = null;
  imagePreview.value = '';
};

// Methods for managing additional fields
const addIngredient = () => {
  if (newIngredient.value.trim()) {
    ingredients.value.push(newIngredient.value.trim().toLowerCase());
    newIngredient.value = '';
  }
};

const removeIngredient = (index) => {
  ingredients.value.splice(index, 1);
};

const addBenefit = () => {
  if (newBenefit.value.trim()) {
    benefits.value.push(newBenefit.value.trim().toLowerCase());
    newBenefit.value = '';
  }
};

const removeBenefit = (index) => {
  benefits.value.splice(index, 1);
};

const addTag = () => {
  if (newTag.value.trim()) {
    tags.value.push(newTag.value.trim().toLowerCase());
    newTag.value = '';
  }
};

const removeTag = (index) => {
  tags.value.splice(index, 1);
};

// Update product
const updateProduct = async () => {
  // Clear previous messages
  successMessage.value = '';
  updateError.value = '';
  
  // Validate all fields
  validateName();
  validateCategory();
  validatePrice();
  validateStock();
  
  if (!isFormValid.value) {
    updateError.value = 'Please fix the errors above before submitting';
    return;
  }
  
  updating.value = true;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      updateError.value = 'Authentication required. Please log in again.';
      router.push('/login');
      return;
    }

    const productId = route.params.id;
    const formData = new FormData();
    
    formData.append('name', name.value.trim());
    formData.append('categoryId', category.value);
    formData.append('price', price.value);
    formData.append('stockQuantity', stockQuantity.value);
    formData.append('description', description.value.trim());
    
    // Additional fields - always append them, even if empty
    formData.append('ingredients', JSON.stringify(ingredients.value));
    formData.append('skinType', JSON.stringify(skinType.value));
    formData.append('benefits', JSON.stringify(benefits.value));
    formData.append('tags', JSON.stringify(tags.value));
    formData.append('usage', usage.value || '');
    formData.append('skinConcerns', JSON.stringify(skinConcerns.value));
    
    if (image.value) {
      formData.append('image', image.value);
    }

    const response = await axios.put(`${API_URL}/products/${productId}`, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Product updated successfully:', response.data);
    successMessage.value = 'Product updated successfully!';
    
    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push('/admin/products');
    }, 1500);
    
  } catch (err) {
    console.error('Error updating product:', err);
    
    if (err.response?.status === 401) {
      updateError.value = 'Authentication failed. Please log in again.';
      router.push('/login');
    } else if (err.response?.status === 404) {
      updateError.value = 'Product not found. It may have been deleted.';
    } else if (err.response?.status === 400) {
      updateError.value = err.response.data?.message || 'Invalid product data. Please check your inputs.';
    } else if (err.response?.data?.message) {
      updateError.value = err.response.data.message;
    } else {
      updateError.value = 'Failed to update product. Please try again.';
    }
  } finally {
    updating.value = false;
  }
};

// Utility functions
const getImageUrl = (relativePath) => {
  return `${API_URL}/${relativePath}`;
};

// Initialize component
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProduct()]);
});

// Format description to preserve formatting and convert common patterns to HTML
const formatDescription = (text) => {
  if (!text) return '';
  
  return text
    // Convert line breaks to <br> tags
    .replace(/\n/g, '<br>')
    // Convert bullet points (• or -) to HTML list items
    .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in <ul> tags
    .replace(/(<li>.*<\/li>)(?:\s*<br>\s*(<li>.*<\/li>))+/g, function(match) {
      return '<ul class="list-disc ml-6 my-2">' + match.replace(/<br>/g, '') + '</ul>';
    })
    // Convert **bold** or strong text patterns
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert numbered sections
    .replace(/^(\d+\.\s+.+)$/gm, '<div class="mt-2"><strong>$1</strong></div>')
    // Clean up any double <br> tags
    .replace(/<br><br>/g, '<br>')
    // Add spacing between sections
    .replace(/(<\/h4>)/g, '$1<br>');
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group > * + * {
  margin-top: 0.5rem;
}

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

/* Image upload area hover effect */
.border-dashed:hover {
  background-color: var(--primary-50);
}

/* File input styling */
input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Enhanced select styling */
select.form-control {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Grid responsive adjustments */
@media (max-width: 1024px) {
  .grid.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .lg\\:col-span-2 {
    grid-column: span 1;
  }
}

/* Formatted description styles */
.formatted-description {
  white-space: normal;
}

.formatted-description h4 {
  color: var(--secondary-800);
}

.formatted-description ul {
  padding-left: 1.5rem;
}

.formatted-description li {
  margin-bottom: 0.5rem;
}

.formatted-description strong {
  font-weight: 600;
  color: var(--secondary-800);
}
</style>