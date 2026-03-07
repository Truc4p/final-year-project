<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Marketing Automation</h1>
          <p class="text-gray-600 mt-1">Automate your marketing workflows across multiple channels</p>
        </div>
        <button @click="$router.push('/admin/automation/workflows/create')" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Workflow
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Active Workflows</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.activeWorkflows }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ stats.totalWorkflows }} total
              </p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Active Executions</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.activeExecutions }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ stats.totalExecutions }} completed
              </p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Conversion Rate</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.avgConversionRate }}%</p>
              <p class="text-sm text-gray-500 mt-1">
                Across all workflows
              </p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Revenue Generated</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">${{ formatNumber(stats.totalRevenue) }}</p>
              <p class="text-sm text-gray-500 mt-1">
                From automation
              </p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <button @click="$router.push('/admin/automation/workflows/create')" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Create Workflow</h3>
              <p class="text-sm text-gray-500">Build a new automation</p>
            </div>
          </div>
        </button>

        <button @click="$router.push('/admin/automation/templates')" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="bg-purple-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Browse Templates</h3>
              <p class="text-sm text-gray-500">Use pre-built workflows</p>
            </div>
          </div>
        </button>

        <button @click="loadWorkflows" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow text-left">
          <div class="flex items-center">
            <div class="bg-green-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">View Analytics</h3>
              <p class="text-sm text-gray-500">Track performance</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-700">Status</span>
            </label>
            <select v-model="filters.status" @change="loadWorkflows" class="select select-bordered select-sm">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-700">Category</span>
            </label>
            <select v-model="filters.category" @change="loadWorkflows" class="select select-bordered select-sm">
              <option value="">All Categories</option>
              <option value="welcome_series">Welcome Series</option>
              <option value="abandoned_cart">Abandoned Cart</option>
              <option value="post_purchase">Post-Purchase</option>
              <option value="re_engagement">Re-engagement</option>
              <option value="win_back">Win-back</option>
              <option value="nurture">Nurture</option>
              <option value="promotional">Promotional</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <button @click="loadWorkflows" class="btn btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Workflows List -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Active Workflows</h2>
        </div>
        
        <div v-if="loading" class="p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        
        <div v-else-if="workflows.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
          <p class="text-gray-500 mb-4">Create your first automation workflow to get started</p>
          <button @click="$router.push('/admin/automation/workflows/create')" class="btn btn-primary">
            Create Workflow
          </button>
        </div>
        
        <div v-else class="divide-y">
          <div v-for="workflow in workflows" :key="workflow._id" class="p-6 hover:bg-gray-50 cursor-pointer transition-colors" @click="editWorkflow(workflow._id)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ workflow.name }}</h3>
                  <span :class="getStatusColorClass(workflow.status)" class="ml-3 px-2 py-1 text-xs font-medium rounded-full capitalize">
                    {{ workflow.status }}
                  </span>
                  <span class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                    {{ formatCategory(workflow.category) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ workflow.description || 'No description provided' }}</p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">Entered</p>
                    <p class="font-semibold text-gray-900">{{ workflow.analytics.totalEntered }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Completed</p>
                    <p class="font-semibold text-gray-900">{{ workflow.analytics.totalCompleted }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Conversion Rate</p>
                    <p class="font-semibold text-gray-900">{{ workflow.analytics.conversionRate.toFixed(1) }}%</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Revenue</p>
                    <p class="font-semibold text-gray-900">${{ formatNumber(workflow.analytics.totalRevenue || 0) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-2 ml-4">
                <div class="dropdown dropdown-end">
                  <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-42 border rounded-lg">
                    <div class="divider my-0"></div>
                    <li v-if="workflow.status !== 'active'">
                      <a @click.stop="activateWorkflow(workflow._id)" class="text-green-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                        Activate
                      </a>
                    </li>
                    <li v-if="workflow.status === 'active'">
                      <a @click.stop="pauseWorkflow(workflow._id)" class="text-yellow-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Pause
                      </a>
                    </li>
                    <li>
                      <a @click.stop="duplicateWorkflow(workflow._id)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Duplicate
                      </a>
                    </li>
                    <li>
                      <a @click.stop="viewAnalytics(workflow._id)" class="text-blue-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        View Analytics
                      </a>
                    </li>
                    <li>
                      <a @click.stop="deleteWorkflow(workflow._id)" class="text-red-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const loading = ref(false);

const stats = ref({
  activeWorkflows: 0,
  totalWorkflows: 0,
  activeExecutions: 0,
  totalExecutions: 0,
  avgConversionRate: 0,
  totalRevenue: 0
});

const workflows = ref([]);
const filters = ref({
  status: '',
  category: ''
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const loadWorkflows = async () => {
  try {
    loading.value = true;
    const params = {};
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.category) params.category = filters.value.category;

    const response = await axios.get('http://localhost:3000/automation/workflows', {
      params,
      ...getAuthHeaders()
    });
    
    if (response.data.success) {
      workflows.value = response.data.data;
      calculateStats();
    }
  } catch (error) {
    console.error('Error loading workflows:', error);
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  stats.value.totalWorkflows = workflows.value.length;
  stats.value.activeWorkflows = workflows.value.filter(w => w.status === 'active').length;
  
  const totalConversion = workflows.value.reduce((sum, w) => sum + w.analytics.conversionRate, 0);
  stats.value.avgConversionRate = workflows.value.length > 0 ? (totalConversion / workflows.value.length).toFixed(1) : 0;
  
  stats.value.totalRevenue = workflows.value.reduce((sum, w) => sum + (w.analytics.totalRevenue || 0), 0);
  stats.value.activeExecutions = workflows.value.reduce((sum, w) => sum + (w.analytics.totalActive || 0), 0);
  stats.value.totalExecutions = workflows.value.reduce((sum, w) => sum + (w.analytics.totalCompleted || 0), 0);
};

const formatCategory = (category) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatNumber = (num) => {
  return num ? num.toLocaleString() : '0';
};

const getStatusColorClass = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const viewWorkflow = (id) => {
  router.push(`/admin/automation/workflows/${id}`);
};

const editWorkflow = (id) => {
  router.push(`/admin/automation/workflows/${id}/edit`);
};

const viewAnalytics = (id) => {
  router.push(`/admin/automation/workflows/${id}/analytics`);
};

const activateWorkflow = async (id) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/automation/workflows/${id}/activate`,
      {},
      getAuthHeaders()
    );
    
    if (response.data.success) {
      await loadWorkflows();
      alert('Workflow activated successfully!');
    }
  } catch (error) {
    console.error('Error activating workflow:', error);
    alert('Failed to activate workflow');
  }
};

const pauseWorkflow = async (id) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/automation/workflows/${id}/pause`,
      {},
      getAuthHeaders()
    );
    
    if (response.data.success) {
      await loadWorkflows();
      alert('Workflow paused successfully!');
    }
  } catch (error) {
    console.error('Error pausing workflow:', error);
    alert('Failed to pause workflow');
  }
};

const duplicateWorkflow = async (id) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/automation/workflows/${id}/duplicate`,
      {},
      getAuthHeaders()
    );
    
    if (response.data.success) {
      await loadWorkflows();
      alert('Workflow duplicated successfully!');
    }
  } catch (error) {
    console.error('Error duplicating workflow:', error);
    alert('Failed to duplicate workflow');
  }
};

const deleteWorkflow = async (id) => {
  if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await axios.delete(
      `http://localhost:3000/automation/workflows/${id}`,
      getAuthHeaders()
    );
    
    if (response.data.success) {
      await loadWorkflows();
      alert('Workflow deleted successfully!');
    }
  } catch (error) {
    console.error('Error deleting workflow:', error);
    alert('Failed to delete workflow');
  }
};

onMounted(() => {
  loadWorkflows();
});
</script>
