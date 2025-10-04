<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import AdminChatWidget from '../../../components/AdminChatWidget.vue';

const { t } = useI18n();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You need to login first");
    router.push("/login");
    return;
  }

  try {
    // Make the api request with axios with token in header
    const res = await axios.get(`${API_URL}/products`, {
      headers: {
        "x-auth-token": `${token}`,
      },
    });

    console.log("Products response:", res.data);
    products.value = res.data;
  } catch (err) {
    console.error("Error fetching products:", err);
    error.value = "Failed to load products";
  } finally {
    loading.value = false;
  }
});

const getImageUrl = (relativePath) => {
  const url = `${API_URL}/${relativePath}`; // Adjust the base URL as needed
  return url;
};

const onImageError = (event) => {
  console.log('Image failed to load, using fallback image.');
  event.target.src = '/images/fallback-image.jpg'; // Provide a fallback image URL
};
</script>

<template>
  <div class="page-background min-h-screen">
    <!-- Header and Action Bar in Container -->
    <div class="container mx-auto px-4 mb-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-600 mb-2">Product Management</h1>
        <p class="text-secondary-700 text-lg">Manage your product inventory</p>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4 mb-4 sm:mb-0">
          <router-link to="/admin/create-product">
            <button class="btn btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Product
            </button>
          </router-link>
        </div>
        
        <div class="flex items-center gap-6 text-secondary-500">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span class="font-medium">{{ products.length }} Products</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-medium">{{ products.filter(p => p.stockQuantity > 0).length }} In Stock</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Width Content Area -->
    <div class="w-full">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto px-4">
        <div class="card p-8 text-center">
          <div class="text-error text-lg font-medium mb-2">{{ error }}</div>
          <p class="text-secondary-500">Please try refreshing the page</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="max-w-4xl mx-auto px-4">
        <div class="card p-12 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">No Products Found</h3>
          <p class="text-secondary-500 mb-6">Get started by creating your first product</p>
          <router-link to="/admin/create-product">
            <button class="btn btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create First Product
            </button>
          </router-link>
        </div>
      </div>

      <!-- Full Width Products Table -->
      <div v-else class="w-full px-10">
        <div class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-secondary-100">
              <thead style="background-color: #f8fafc">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-1/3">
                    {{ t('productName') }}
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-32">
                    Image
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-32">
                    {{ t('productCategory') }}
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-24">
                    Stock
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-24">
                    Price
                  </th>
                  <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-secondary-700 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-secondary-100">
                <tr v-for="(product) in products" :key="product._id" 
                    class="hover:bg-secondary-50 transition-colors duration-200 cursor-pointer"
                    @click="router.push(`/admin/products/${product._id}`)">
                  <td class="px-6 py-4">
                    <div class="flex items-start">
                      <div class="text-base font-medium text-secondary-700 break-words max-w-xs leading-relaxed">{{ product.name }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-24 w-24">
                        <img 
                          :src="product.image ? getImageUrl(product.image) : '/images/fallback-image.jpg'" 
                          alt="Product Image" 
                          class="h-24 w-24 rounded-lg object-cover" 
                          @error="onImageError" 
                        />
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span v-if="product.category" class="inline-flex items-center px-2.5 py-0.5">
                        {{ product.category.name }}
                      </span>
                      <span v-else class="inline-flex items-center px-2.5 py-0.5">
                        No Category
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span v-if="product.stockQuantity > 10" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-green-100 text-success">
                        {{ product.stockQuantity }} units
                      </span>
                      <span v-else-if="product.stockQuantity > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-amber-100 text-amber-800">
                        {{ product.stockQuantity }} units
                      </span>
                      <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-lg font-semibold text-success">${{ product.price }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center" @click.stop>
                    <div class="flex items-center justify-center space-x-2">
                      <router-link :to="`/admin/products/edit/${product._id}`">
                        <button class="btn-action btn-edit" title="Edit Product">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          <span class="hidden sm:inline ml-1">Edit</span>
                        </button>
                      </router-link>

                      <router-link :to="`/admin/products/delete/${product._id}`">
                        <button class="btn-action btn-delete" title="Delete Product">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          <span class="hidden sm:inline ml-1">Delete</span>
                        </button>
                      </router-link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <AdminChatWidget />
  </div>
</template>

<style scoped>
.btn-action {
  @apply inline-flex items-center px-3 py-2 border border-transparent text-base leading-4 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-details {
  @apply text-primary-700 bg-primary-50 hover:bg-primary-100 hover:text-primary-800;
}

.btn-edit {
  @apply text-warning bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800 focus:ring-yellow-500;
}

.btn-delete {
  @apply text-error bg-red-50 hover:bg-red-100 hover:text-red-800 focus:ring-red-500;
}

.bg-secondary-25 {
  background-color: #fafbfc;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.3s ease-out;
}

tr:hover .btn-action {
  transform: scale(1.05);
}

/* Product image hover effect */
tr:hover img {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>