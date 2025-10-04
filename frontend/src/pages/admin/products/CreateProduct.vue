<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold gradient-text mb-4">
          {{ t('createProduct') }}
        </h1>
        <p class="text-secondary-600 text-lg">
          {{ t('addNewProductToInventory') || 'Add a new product to your inventory' }}
        </p>
      </div>

      <!-- Main Form Card -->
      <div class="card animate-fade-in">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-primary-600 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            {{ t('productDetails') || 'Product Details' }}
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="card-body space-y-6">
          <!-- Product Name -->
          <div class="form-group">
            <label for="name" class="form-label">
              {{ t('productName') }}
              <span class="text-error">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              v-model="name"
              class="form-control"
              :placeholder="t('enterProductName') || 'Enter product name'"
              required 
            />
          </div>

          <!-- Category and Price Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="category" class="form-label">
                {{ t('productCategory') }}
                <span class="text-error">*</span>
              </label>
              <div class="relative">
                <select 
                  id="category" 
                  v-model="category"
                  class="form-control appearance-none"
                  required
                >
                  <option value="" disabled>{{ t('selectCategory') }}</option>
                  <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                    {{ cat.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="price" class="form-label">
                {{ t('productPrice') }}
                <span class="text-error">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                <input 
                  type="number" 
                  id="price" 
                  v-model="price"
                  class="form-control pl-8"
                  :placeholder="t('enterPrice') || '0.00'"
                  step="0.01"
                  min="0"
                  required 
                />
              </div>
            </div>
          </div>

          <!-- Stock Quantity -->
          <div class="form-group">
            <label for="stockQuantity" class="form-label">
              {{ t('stockQuantity') }}
              <span class="text-error">*</span>
            </label>
            <input 
              type="number" 
              id="stockQuantity" 
              v-model="stockQuantity"
              class="form-control"
              :placeholder="t('enterStockQuantity') || 'Enter stock quantity'"
              min="0"
              required 
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label">
              {{ t('productDescription') }}
            </label>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Description Input -->
              <div>
                <textarea 
                  id="description" 
                  v-model="description"
                  class="form-control min-h-[120px] resize-y"
                  :placeholder="t('enterProductDescription') || 'Enter a detailed description of the product'"
                  rows="4"
                ></textarea>
                <div class="text-sm text-secondary-500 mt-1 space-y-1">
                  <p>{{ t('descriptionNote') || 'Line breaks and formatting will be preserved as you type them.' }}</p>
                  <div class="text-xs bg-secondary-50 p-2 rounded border">
                    <strong>Formatting tips:</strong><br>
                    • Use **text** for <strong>bold</strong><br>
                  </div>
                </div>
              </div>
              <!-- Description Preview -->
              <div v-if="description.trim()" class="lg:block hidden">
                <label class="form-label text-sm text-secondary-600">
                  {{ t('preview') || 'Preview' }}
                </label>
                <div class="border border-secondary-300 rounded-md p-3 min-h-[120px] bg-secondary-50">
                  <div 
                    class="text-secondary-700 text-sm leading-relaxed formatted-description"
                    v-html="formatDescription(description)"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Product Information Section -->
          <div class="border-t border-secondary-200 pt-6">
            <h3 class="text-lg font-semibold text-primary-600 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              {{ t('additionalInfo') || 'Additional Product Information' }}
            </h3>

            <!-- Skin Type -->
            <div class="form-group">
              <label class="form-label">
                {{ t('skinType') || 'Skin Type' }}
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label v-for="type in ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']" 
                       :key="type" 
                       class="flex items-center space-x-2 p-3 border border-secondary-300 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    :value="type" 
                    v-model="skinType"
                    class="rounded border-secondary-300"
                    style="accent-color: #C97F98;"
                  />
                  <span class="text-sm font-medium capitalize">{{ type }}</span>
                </label>
              </div>
            </div>

            <!-- Skin Concerns -->
            <div class="form-group">
              <label class="form-label">
                {{ t('skinConcerns') || 'Skin Concerns' }}
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
                {{ t('ingredients') || 'Ingredients' }}
              </label>
              <div class="space-y-3">
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    v-model="newIngredient"
                    @keyup.enter="addIngredient"
                    class="form-control flex-1"
                    :placeholder="t('addIngredient') || 'Add ingredient (e.g., Retinol, Vitamin C)'"
                  />
                  <button 
                    type="button" 
                    @click="addIngredient"
                    class="btn btn-secondary px-4"
                    :disabled="!newIngredient.trim()"
                  >
                    {{ t('add') || 'Add' }}
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
                {{ t('benefits') || 'Benefits' }}
              </label>
              <div class="space-y-3">
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    v-model="newBenefit"
                    @keyup.enter="addBenefit"
                    class="form-control flex-1"
                    :placeholder="t('addBenefit') || 'Add benefit (e.g., Anti-aging, Moisturizing)'"
                  />
                  <button 
                    type="button" 
                    @click="addBenefit"
                    class="btn btn-secondary px-4"
                    :disabled="!newBenefit.trim()"
                  >
                    {{ t('add') || 'Add' }}
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
                {{ t('tags') || 'Tags' }}
              </label>
              <div class="space-y-3">
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    v-model="newTag"
                    @keyup.enter="addTag"
                    class="form-control flex-1"
                    :placeholder="t('addTag') || 'Add tag (e.g., organic, cruelty-free)'"
                  />
                  <button 
                    type="button" 
                    @click="addTag"
                    class="btn btn-secondary px-4"
                    :disabled="!newTag.trim()"
                  >
                    {{ t('add') || 'Add' }}
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
                {{ t('usage') || 'Usage Instructions' }}
              </label>
              <textarea 
                id="usage" 
                v-model="usage"
                class="form-control min-h-[100px] resize-y"
                :placeholder="t('enterUsage') || 'How to use this product (e.g., Apply twice daily on clean skin)'"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Image Upload -->
          <div class="form-group">
            <label for="image" class="form-label">
              {{ t('productImage') }}
            </label>
            <div class="relative">
              <input 
                type="file" 
                id="image" 
                @change="handleImageUpload"
                accept="image/*"
                class="hidden"
                ref="fileInput"
              />
              <div 
                @click="$refs.fileInput.click()"
                class="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer bg-secondary-50 hover:bg-primary-50"
              >
                <div v-if="!image" class="space-y-2">
                  <svg class="w-12 h-12 mx-auto text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <p class="text-secondary-600">{{ t('clickToUploadImage') || 'Click to upload product image' }}</p>
                  <p class="text-sm text-secondary-400">{{ t('imageFormats') || 'PNG, JPG, GIF up to 10MB' }}</p>
                </div>
                <div v-else class="space-y-2">
                  <svg class="w-12 h-12 mx-auto text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-success font-medium">{{ image.name }}</p>
                  <p class="text-sm text-secondary-500">{{ t('clickToChangeImage') || 'Click to change image' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary-200">
            <button 
              type="button"
              @click="$router.push('/admin/products')"
              class="btn btn-secondary flex-1 sm:flex-none"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              {{ t('cancel') || 'Cancel' }}
            </button>
            
            <button 
              type="submit"
              class="btn btn-primary flex-1"
              :disabled="isSubmitting"
            >
              <svg v-if="isSubmitting" class="w-4 h-4 mr-2 loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              {{ isSubmitting ? (t('creating') || 'Creating...') : t('createProduct') }}
            </button>
          </div>
        </form>
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
const category = ref('');
const price = ref('');
const stockQuantity = ref('');
const description = ref('');
const image = ref(null);
const categories = ref([]);
const isSubmitting = ref(false);
const router = useRouter();

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

const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/categories`, {
      headers: {
        'x-auth-token': token,
      },
    });
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

onMounted(() => {
  fetchCategories();
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  image.value = file;
  console.log('Image was uploaded:', file);
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

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  try {
    isSubmitting.value = true;
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('name', name.value);
    formData.append('categoryId', category.value);
    formData.append('price', price.value);
    formData.append('stockQuantity', stockQuantity.value);
    formData.append('description', description.value);
    
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

    // Log the contents of formData for debugging
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // Also log the reactive values directly
    console.log('Reactive values:');
    console.log('ingredients.value:', ingredients.value);
    console.log('skinType.value:', skinType.value);
    console.log('benefits.value:', benefits.value);
    console.log('tags.value:', tags.value);
    console.log('usage.value:', usage.value);
    console.log('skinConcerns.value:', skinConcerns.value);

    const response = await axios.post(`${API_URL}/products`, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Product created:', response.data);
    router.push('/admin/products');
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.response) {
      console.error('Server response:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    isSubmitting.value = false;
  }
};

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
  @apply space-y-2;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure the file input styling matches the design system */
input[type="file"] {
  @apply hidden;
}

/* Custom dropdown arrow positioning for select elements */
select.form-control {
  background-image: none;
  padding-right: 2.5rem;
}

/* Price input with dollar sign positioning */
.price-input {
  padding-left: 2rem;
}

/* Enhanced upload area hover effects */
.upload-area {
  transition: all 0.3s ease;
}

.upload-area:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
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