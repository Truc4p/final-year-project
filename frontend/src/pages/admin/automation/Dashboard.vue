<template>
  <div class="min-h-screen bg-base-200 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">Marketing Automation 🤖</h1>
        <p class="text-base-content/70">Automate your marketing workflows across multiple channels</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="stat-title">Active Workflows</div>
            <div class="stat-value text-primary">{{ stats.activeWorkflows }}</div>
            <div class="stat-desc">{{ stats.totalWorkflows }} total</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <div class="stat-title">Active Executions</div>
            <div class="stat-value text-secondary">{{ stats.activeExecutions }}</div>
            <div class="stat-desc">{{ stats.totalExecutions }} completed</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title">Conversion Rate</div>
            <div class="stat-value text-success">{{ stats.avgConversionRate }}%</div>
            <div class="stat-desc">Across all workflows</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title">Revenue Generated</div>
            <div class="stat-value text-info">${{ (stats.totalRevenue / 1000).toFixed(1) }}k</div>
            <div class="stat-desc">From automation</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-3 mb-6">
        <button @click="$router.push('/admin/automation/workflows/create')" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Workflow
        </button>
        <button @click="$router.push('/admin/automation/templates')" class="btn btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Browse Templates
        </button>
        <button @click="loadWorkflows" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-base-100 rounded-lg shadow p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Status</span>
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
              <span class="label-text">Category</span>
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
        </div>
      </div>

      <!-- Workflows Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="workflow in workflows" :key="workflow._id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div class="card-body">
            <div class="flex items-start justify-between mb-2">
              <h2 class="card-title text-lg">{{ workflow.name }}</h2>
              <div class="badge" :class="{
                'badge-success': workflow.status === 'active',
                'badge-warning': workflow.status === 'paused',
                'badge-ghost': workflow.status === 'draft',
                'badge-error': workflow.status === 'archived'
              }">
                {{ workflow.status }}
              </div>
            </div>
            
            <p class="text-sm text-base-content/70 mb-4">{{ workflow.description || 'No description' }}</p>
            
            <!-- Category Badge -->
            <div class="mb-3">
              <div class="badge badge-outline">{{ formatCategory(workflow.category) }}</div>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-2 mb-4 text-center">
              <div>
                <div class="text-xs text-base-content/70">Entered</div>
                <div class="font-bold">{{ workflow.analytics.totalEntered }}</div>
              </div>
              <div>
                <div class="text-xs text-base-content/70">Completed</div>
                <div class="font-bold">{{ workflow.analytics.totalCompleted }}</div>
              </div>
              <div>
                <div class="text-xs text-base-content/70">Conv. Rate</div>
                <div class="font-bold text-success">{{ workflow.analytics.conversionRate.toFixed(1) }}%</div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="card-actions justify-between">
              <div class="flex gap-2">
                <button @click="viewWorkflow(workflow._id)" class="btn btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="editWorkflow(workflow._id)" class="btn btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li v-if="workflow.status !== 'active'"><a @click="activateWorkflow(workflow._id)">Activate</a></li>
                  <li v-if="workflow.status === 'active'"><a @click="pauseWorkflow(workflow._id)">Pause</a></li>
                  <li><a @click="duplicateWorkflow(workflow._id)">Duplicate</a></li>
                  <li><a @click="viewAnalytics(workflow._id)">View Analytics</a></li>
                  <li><a @click="deleteWorkflow(workflow._id)" class="text-error">Delete</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="workflows.length === 0" class="col-span-full text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="text-xl font-bold mb-2">No Workflows Yet</h3>
          <p class="text-base-content/70 mb-4">Create your first automation workflow to get started</p>
          <button @click="$router.push('/admin/automation/workflows/create')" class="btn btn-primary">
            Create Workflow
          </button>
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
    alert(error.response?.data?.message || 'Failed to delete workflow');
  }
};

onMounted(() => {
  loadWorkflows();
});
</script>
