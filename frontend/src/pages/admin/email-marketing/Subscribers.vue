<template>
  <div class="subscribers-management">
    <!-- Header -->
    <div class="page-header">
      <div class="flex justify-between items-center p-10">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p class="text-gray-600 mt-1">Manage your newsletter subscriber list</p>
        </div>
        <div class="flex gap-3">
          <button @click="exportSubscribers" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            </svg>
            Export CSV
          </button>
          <button @click="showAnalytics = true" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Analytics
          </button>
        </div>
      </div>
    </div>

    <!-- Segments Panel -->
    <div class="bg-white rounded-lg shadow-sm border p-6 m-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Subscriber Segments</h2>
        <div class="flex gap-2">
          <button @click="showCreateSegmentModal = true" class="btn btn-sm btn-primary">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Segment
          </button>
          <button @click="refreshSegments" class="btn btn-sm btn-outline">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="segment in segments" 
          :key="segment._id"
          @click="selectSegment(segment)"
          :class="[
            'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
            selectedSegment && selectedSegment._id === segment._id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-gray-900 text-sm">{{ segment.name }}</h3>
            <div class="flex gap-1" v-if="!segment.isDefault">
              <button @click.stop="editSegment(segment)" class="text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button @click.stop="deleteSegmentConfirm(segment)" class="text-gray-400 hover:text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-gray-600 text-xs mb-2" v-if="segment.description">{{ segment.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-blue-600">{{ segment.subscriberCount }}</span>
            <span class="text-xs text-gray-500">subscribers</span>
          </div>
          <div class="mt-2" v-if="segment.isDefault">
            <span class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Default</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 m-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by email..."
            class="form-input w-full"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Source</label>
          <select v-model="filters.source" @change="fetchSubscribers" class="form-select w-full">
            <option value="">All Sources</option>
            <option value="public_page">Public Page</option>
            <option value="checkout">Checkout</option>
            <option value="manual">Manual</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            @change="fetchSubscribers"
            class="form-input w-full"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
          <input
            v-model="filters.dateTo"
            type="date"
            @change="fetchSubscribers"
            class="form-input w-full"
          />
        </div>
      </div>
      
      <div class="mt-4 flex gap-2">
        <button @click="clearFilters" class="btn btn-outline btn-sm">Clear Filters</button>
        <div class="flex-1"></div>
        <span class="text-sm text-gray-500">
          {{ totalSubscribers }} total subscribers
        </span>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedSubscribers.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between">
        <span class="text-blue-800 font-medium">
          {{ selectedSubscribers.length }} subscriber(s) selected
        </span>
        <div class="flex gap-2">
          <button @click="bulkAction('activate')" class="btn btn-sm btn-success">Activate</button>
          <button @click="bulkAction('deactivate')" class="btn btn-sm btn-warning">Deactivate</button>
          <button @click="showBulkPreferences = true" class="btn btn-sm btn-primary">Update Preferences</button>
          <button @click="bulkAction('delete')" class="btn btn-sm btn-danger">Delete</button>
        </div>
      </div>
    </div>

    <!-- Subscribers Table -->
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden m-6">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="allSelected"
                  class="rounded border-gray-300 text-blue-600"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscribed
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferences
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="subscriber in subscribers" :key="subscriber._id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  :value="subscriber._id"
                  v-model="selectedSubscribers"
                  class="rounded border-gray-300 text-blue-600"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ subscriber.email }}</div>
                    <div v-if="subscriber.userId" class="text-sm text-gray-500">
                      User: {{ subscriber.userId.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getSourceBadgeClass(subscriber.source)">
                  {{ formatSource(subscriber.source) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(subscriber.subscriptionDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span v-if="subscriber.preferences.newProducts" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Products
                  </span>
                  <span v-if="subscriber.preferences.promotions" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Promotions
                  </span>
                  <span v-if="subscriber.preferences.newsletter" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Newsletter
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ subscriber.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button @click="editSubscriber(subscriber)" class="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                  <button @click="viewSubscriber(subscriber)" class="text-gray-600 hover:text-gray-900">
                    View
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-outline btn-sm">
            Previous
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-outline btn-sm">
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ startIndex }}</span> to 
              <span class="font-medium">{{ endIndex }}</span> of 
              <span class="font-medium">{{ totalSubscribers }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="prevPage" :disabled="currentPage === 1" 
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                      :class="[
                        page === currentPage 
                          ? 'bg-blue-50 border-blue-500 text-blue-600' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                      ]">
                {{ page }}
              </button>
              <button @click="nextPage" :disabled="currentPage === totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Modals will be added here -->
    <!-- Edit Subscriber Modal -->
    <!-- View Subscriber Modal -->
    <!-- Analytics Modal -->
    <!-- Bulk Preferences Modal -->

    <!-- Create/Edit Segment Modal -->
    <div v-if="showCreateSegmentModal || showEditSegmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showEditSegmentModal ? 'Edit Segment' : 'Create New Segment' }}
          </h3>
        </div>
        
        <div class="px-6 py-4">
          <form @submit.prevent="saveSegment">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Segment Name</label>
              <input
                v-model="segmentForm.name"
                type="text"
                required
                class="form-input w-full"
                placeholder="Enter segment name"
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="segmentForm.description"
                class="form-input w-full"
                rows="2"
                placeholder="Optional description"
              ></textarea>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Filter Criteria</label>
              
              <!-- Source Filter -->
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">Sources</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="source in availableSources" :key="source.value" class="flex items-center">
                    <input
                      type="checkbox"
                      :value="source.value"
                      v-model="segmentForm.criteria.source"
                      class="rounded border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ source.label }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Date Range Filter -->
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="segmentForm.criteria.dateRange.from"
                    type="date"
                    class="form-input"
                    placeholder="From"
                  />
                  <input
                    v-model="segmentForm.criteria.dateRange.to"
                    type="date"
                    class="form-input"
                    placeholder="To"
                  />
                </div>
              </div>
              
              <!-- Email Pattern Filter -->
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">Email Pattern</label>
                <input
                  v-model="segmentForm.criteria.emailPattern"
                  type="text"
                  class="form-input w-full"
                  placeholder="e.g., @company.com"
                />
              </div>
            </div>
            
            <!-- Preview Results -->
            <div v-if="segmentPreview" class="mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Preview</span>
                <button type="button" @click="previewSegment" class="text-blue-600 text-sm hover:text-blue-800">
                  Refresh
                </button>
              </div>
              <p class="text-sm text-gray-600">
                <strong>{{ segmentPreview.count }}</strong> subscribers match these criteria
              </p>
              <div v-if="segmentPreview.preview.length > 0" class="mt-2">
                <p class="text-xs text-gray-500 mb-1">Sample subscribers:</p>
                <div class="space-y-1">
                  <div v-for="sub in segmentPreview.preview" :key="sub.email" class="text-xs text-gray-600">
                    {{ sub.email }} ({{ sub.source }})
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end gap-3">
              <button type="button" @click="closeSegmentModals" class="btn btn-outline">
                Cancel
              </button>
              <button type="button" @click="previewSegment" class="btn btn-secondary">
                Preview
              </button>
              <button type="submit" :disabled="saving" class="btn btn-primary">
                {{ saving ? 'Saving...' : (showEditSegmentModal ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { API_URL } from '../../../utils/config';

// Simple debounce function to avoid external dependency
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Reactive data
const subscribers = ref([]);
const loading = ref(false);
const totalSubscribers = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const selectedSubscribers = ref([]);
const showAnalytics = ref(false);
const showBulkPreferences = ref(false);

// Segment-related reactive data
const segments = ref([]);
const selectedSegment = ref(null);
const showCreateSegmentModal = ref(false);
const showEditSegmentModal = ref(false);
const saving = ref(false);
const segmentPreview = ref(null);

// Segment form data
const segmentForm = ref({
  id: null,
  name: '',
  description: '',
  criteria: {
    source: [],
    dateRange: {
      from: '',
      to: ''
    },
    emailPattern: ''
  }
});

// Available sources for filtering
const availableSources = ref([
  { value: 'public_page', label: 'Public Page' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'manual', label: 'Manual' },
  { value: 'other', label: 'Other' }
]);

// Filters
const filters = ref({
  search: '',
  source: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'subscriptionDate',
  sortOrder: 'desc'
});

// Computed properties
const allSelected = computed(() => {
  return subscribers.value.length > 0 && selectedSubscribers.value.length === subscribers.value.length;
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * 50 + 1;
});

const endIndex = computed(() => {
  return Math.min(currentPage.value * 50, totalSubscribers.value);
});

const visiblePages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  
  for (let i = Math.max(2, currentPage.value - delta); 
       i <= Math.min(totalPages.value - 1, currentPage.value + delta); 
       i++) {
    range.push(i);
  }
  
  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }
  
  rangeWithDots.push(...range);
  
  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push('...', totalPages.value);
  } else {
    rangeWithDots.push(totalPages.value);
  }
  
  return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i);
});

// Methods
const fetchSubscribers = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: 50,
      ...filters.value
    });
    
    const response = await axios.get(`${API_URL}/newsletter/subscriptions?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    subscribers.value = response.data.data.subscriptions;
    totalSubscribers.value = response.data.data.pagination.total;
    totalPages.value = response.data.data.pagination.pages;
    
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    // Handle error
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  fetchSubscribers();
}, 500);

const clearFilters = () => {
  filters.value = {
    search: '',
    source: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'subscriptionDate',
    sortOrder: 'desc'
  };
  currentPage.value = 1;
  fetchSubscribers();
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedSubscribers.value = [];
  } else {
    selectedSubscribers.value = subscribers.value.map(s => s._id);
  }
};

const bulkAction = async (action) => {
  if (selectedSubscribers.value.length === 0) return;
  
  // Implement bulk actions
  console.log(`Bulk ${action} for:`, selectedSubscribers.value);
};

const exportSubscribers = async () => {
  try {
    const params = new URLSearchParams({
      format: 'csv',
      ...filters.value
    });
    
    const response = await axios.get(`${API_URL}/newsletter/subscriptions/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'newsletter_subscriptions.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
  } catch (error) {
    console.error('Error exporting subscribers:', error);
  }
};

const editSubscriber = (subscriber) => {
  // Implement edit functionality
  console.log('Edit subscriber:', subscriber);
};

const viewSubscriber = (subscriber) => {
  // Implement view functionality
  console.log('View subscriber:', subscriber);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchSubscribers();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchSubscribers();
  }
};

const goToPage = (page) => {
  if (page !== '...' && page !== currentPage.value) {
    currentPage.value = page;
    fetchSubscribers();
  }
};

// Utility functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const formatSource = (source) => {
  const sourceMap = {
    'public_page': 'Public Page',
    'checkout': 'Checkout',
    'manual': 'Manual',
    'other': 'Other'
  };
  return sourceMap[source] || source;
};

const getSourceBadgeClass = (source) => {
  const classMap = {
    'public_page': 'bg-blue-100 text-blue-800',
    'checkout': 'bg-green-100 text-green-800',
    'manual': 'bg-purple-100 text-purple-800',
    'other': 'bg-gray-100 text-gray-800'
  };
  return classMap[source] || 'bg-gray-100 text-gray-800';
};

// Segment methods
const fetchSegments = async () => {
  try {
    const response = await axios.get(`${API_URL}/email-segments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    segments.value = response.data.data;
  } catch (error) {
    console.error('Error fetching segments:', error);
  }
};

const selectSegment = async (segment) => {
  selectedSegment.value = segment;
  
  // Update filters to match segment criteria
  if (segment.criteria) {
    filters.value = {
      search: segment.criteria.emailPattern || '',
      source: segment.criteria.source && segment.criteria.source.length > 0 ? segment.criteria.source[0] : '',
      dateFrom: segment.criteria.dateRange?.from || '',
      dateTo: segment.criteria.dateRange?.to || '',
      sortBy: 'subscriptionDate',
      sortOrder: 'desc'
    };
  }
  
  currentPage.value = 1;
  await fetchSubscribers();
};

const closeSegmentModals = () => {
  showCreateSegmentModal.value = false;
  showEditSegmentModal.value = false;
  segmentPreview.value = null;
  segmentForm.value = {
    id: null,
    name: '',
    description: '',
    criteria: {
      source: [],
      dateRange: {
        from: '',
        to: ''
      },
      emailPattern: ''
    }
  };
};

const editSegment = (segment) => {
  segmentForm.value = {
    id: segment._id,
    name: segment.name,
    description: segment.description || '',
    criteria: {
      source: segment.criteria.source || [],
      dateRange: {
        from: segment.criteria.dateRange?.from ? new Date(segment.criteria.dateRange.from).toISOString().split('T')[0] : '',
        to: segment.criteria.dateRange?.to ? new Date(segment.criteria.dateRange.to).toISOString().split('T')[0] : ''
      },
      emailPattern: segment.criteria.emailPattern || ''
    }
  };
  showEditSegmentModal.value = true;
};

const previewSegment = async () => {
  try {
    const criteria = {
      source: segmentForm.value.criteria.source,
      emailPattern: segmentForm.value.criteria.emailPattern,
      dateRange: {}
    };
    
    if (segmentForm.value.criteria.dateRange.from) {
      criteria.dateRange.from = new Date(segmentForm.value.criteria.dateRange.from);
    }
    if (segmentForm.value.criteria.dateRange.to) {
      criteria.dateRange.to = new Date(segmentForm.value.criteria.dateRange.to);
    }
    
    const response = await axios.post(`${API_URL}/email-segments/preview`, { criteria }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    segmentPreview.value = response.data.data;
  } catch (error) {
    console.error('Error previewing segment:', error);
    alert('Failed to preview segment');
  }
};

const saveSegment = async () => {
  saving.value = true;
  try {
    const segmentData = {
      name: segmentForm.value.name,
      description: segmentForm.value.description,
      criteria: {
        source: segmentForm.value.criteria.source,
        emailPattern: segmentForm.value.criteria.emailPattern,
        dateRange: {}
      }
    };
    
    if (segmentForm.value.criteria.dateRange.from) {
      segmentData.criteria.dateRange.from = new Date(segmentForm.value.criteria.dateRange.from);
    }
    if (segmentForm.value.criteria.dateRange.to) {
      segmentData.criteria.dateRange.to = new Date(segmentForm.value.criteria.dateRange.to);
    }
    
    if (showEditSegmentModal.value) {
      await axios.put(`${API_URL}/email-segments/${segmentForm.value.id}`, segmentData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } else {
      await axios.post(`${API_URL}/email-segments`, segmentData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
    
    await fetchSegments();
    closeSegmentModals();
  } catch (error) {
    console.error('Error saving segment:', error);
    alert('Failed to save segment');
  } finally {
    saving.value = false;
  }
};

const deleteSegmentConfirm = async (segment) => {
  if (!confirm(`Are you sure you want to delete the segment "${segment.name}"?`)) return;
  
  try {
    await axios.delete(`${API_URL}/email-segments/${segment._id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (selectedSegment.value && selectedSegment.value._id === segment._id) {
      selectedSegment.value = null;
      clearFilters();
    }
    
    await fetchSegments();
  } catch (error) {
    console.error('Error deleting segment:', error);
    alert('Failed to delete segment');
  }
};

const refreshSegments = async () => {
  await fetchSegments();
};

// Lifecycle
onMounted(async () => {
  await fetchSubscribers();
  await fetchSegments();
  
  // Initialize default segments if none exist
  if (segments.value.length === 0) {
    try {
      await axios.post(`${API_URL}/email-segments/initialize`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchSegments();
    } catch (error) {
      console.error('Error initializing default segments:', error);
    }
  }
});
</script>

<style scoped>
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-header {
  @apply mb-6;
}
</style>