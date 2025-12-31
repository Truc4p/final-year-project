<template>
  <div class="min-h-screen bg-base-200">
    <!-- Top Bar -->
    <div class="bg-base-100 border-b border-base-300 p-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="$router.back()" class="btn btn-ghost btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold">{{ isEditing ? 'Edit Workflow' : 'Create Workflow' }}</h1>
            <p class="text-sm text-base-content/70">{{ workflow.name || 'Untitled Workflow' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button @click="saveWorkflow" class="btn btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
          <button v-if="isEditing && workflow.status === 'draft'" @click="activateWorkflow" class="btn btn-success btn-sm">Activate</button>
        </div>
      </div>
    </div>

    <div class="flex h-[calc(100vh-73px)]">
      <!-- Left Sidebar - Node Palette -->
      <div class="w-64 bg-base-100 border-r border-base-300 p-4 overflow-y-auto">
        <h3 class="font-bold mb-4">Add Nodes</h3>
        
        <!-- Trigger Nodes -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-base-content/70 mb-2">Triggers</h4>
          <div class="space-y-2">
            <div draggable="true" @dragstart="startDrag($event, 'trigger')" 
                 class="p-3 bg-primary/10 rounded-lg cursor-move hover:shadow-lg transition-shadow">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="text-sm font-medium">Trigger</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Nodes -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-base-content/70 mb-2">Actions</h4>
          <div class="space-y-2">
            <div draggable="true" @dragstart="startDrag($event, 'action')" 
                 class="p-3 bg-info/10 rounded-lg cursor-move hover:shadow-lg transition-shadow">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-sm font-medium">Send Action</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Condition Nodes -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-base-content/70 mb-2">Logic</h4>
          <div class="space-y-2">
            <div draggable="true" @dragstart="startDrag($event, 'condition')" 
                 class="p-3 bg-warning/10 rounded-lg cursor-move hover:shadow-lg transition-shadow">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium">Condition</span>
              </div>
            </div>

            <div draggable="true" @dragstart="startDrag($event, 'delay')" 
                 class="p-3 bg-secondary/10 rounded-lg cursor-move hover:shadow-lg transition-shadow">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium">Delay</span>
              </div>
            </div>
          </div>
        </div>

        <!-- End Node -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-base-content/70 mb-2">End</h4>
          <div draggable="true" @dragstart="startDrag($event, 'end')" 
               class="p-3 bg-error/10 rounded-lg cursor-move hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">End</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Canvas -->
      <div class="flex-1 relative overflow-hidden">
        <div 
          ref="canvas"
          @drop="onDrop"
          @dragover.prevent
          @click="selectedNode = null"
          class="w-full h-full bg-base-200 overflow-auto"
          style="background-image: radial-gradient(circle, #888 1px, transparent 1px); background-size: 20px 20px;"
        >
          <!-- Workflow Nodes -->
          <div
            v-for="node in workflow.nodes"
            :key="node.id"
            @click.stop="selectNode(node)"
            :style="{ position: 'absolute', left: node.position.x + 'px', top: node.position.y + 'px' }"
            class="cursor-pointer"
          >
            <div 
              class="p-4 rounded-lg shadow-lg min-w-[200px] border-2 transition-all"
              :class="{
                'bg-primary text-primary-content border-primary': node.type === 'trigger',
                'bg-info text-info-content border-info': node.type === 'action',
                'bg-warning text-warning-content border-warning': node.type === 'condition',
                'bg-secondary text-secondary-content border-secondary': node.type === 'delay',
                'bg-error text-error-content border-error': node.type === 'end',
                'ring-4 ring-accent': selectedNode?.id === node.id
              }"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm">{{ getNodeLabel(node) }}</span>
                <button @click.stop="deleteNode(node.id)" class="btn btn-xs btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="text-xs opacity-80">
                {{ getNodeDescription(node) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar - Node Properties -->
      <div v-if="selectedNode" class="w-96 bg-base-100 border-l border-base-300 p-4 overflow-y-auto">
        <h3 class="font-bold mb-4">Node Properties</h3>
        
        <!-- Trigger Settings -->
        <div v-if="selectedNode.type === 'trigger'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Trigger Type</span>
            </label>
            <select v-model="selectedNode.triggerType" class="select select-bordered select-sm">
              <option value="customer_signup">Customer Signup</option>
              <option value="order_placed">Order Placed</option>
              <option value="cart_abandoned">Cart Abandoned</option>
              <option value="product_viewed">Product Viewed</option>
              <option value="subscription_cancelled">Subscription Cancelled</option>
              <option value="customer_inactive">Customer Inactive</option>
              <option value="manual">Manual Trigger</option>
            </select>
          </div>
        </div>

        <!-- Action Settings -->
        <div v-if="selectedNode.type === 'action'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Action Type</span>
            </label>
            <select v-model="selectedNode.actionType" class="select select-bordered select-sm">
              <option value="send_email">Send Email</option>
              <option value="send_sms">Send SMS</option>
              <option value="send_push">Send Push Notification</option>
              <option value="add_tag">Add Tag</option>
              <option value="remove_tag">Remove Tag</option>
              <option value="update_field">Update Field</option>
            </select>
          </div>

          <div v-if="selectedNode.actionType === 'send_email'" class="form-control">
            <label class="label">
              <span class="label-text">Email Template</span>
            </label>
            <input v-model="selectedNode.actionConfig.emailTemplate" type="text" placeholder="Template ID" class="input input-bordered input-sm" />
          </div>

          <div v-if="selectedNode.actionType === 'send_sms'" class="form-control">
            <label class="label">
              <span class="label-text">SMS Message</span>
            </label>
            <textarea v-model="selectedNode.actionConfig.smsTemplate" class="textarea textarea-bordered" rows="3"></textarea>
          </div>
        </div>

        <!-- Condition Settings -->
        <div v-if="selectedNode.type === 'condition'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Condition Type</span>
            </label>
            <select v-model="selectedNode.conditionType" class="select select-bordered select-sm">
              <option value="customer_property">Customer Property</option>
              <option value="order_property">Order Property</option>
              <option value="tag">Has Tag</option>
            </select>
          </div>
        </div>

        <!-- Delay Settings -->
        <div v-if="selectedNode.type === 'delay'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Duration</span>
            </label>
            <div class="flex gap-2">
              <input v-model.number="selectedNode.delayDuration" type="number" min="1" class="input input-bordered input-sm flex-1" />
              <select v-model="selectedNode.delayUnit" class="select select-bordered select-sm">
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Connection Settings -->
        <div class="mt-6">
          <h4 class="font-semibold mb-2">Connections</h4>
          <div class="text-sm text-base-content/70">
            Click another node to connect
          </div>
        </div>
      </div>

      <!-- Settings Panel (when no node selected) -->
      <div v-else class="w-96 bg-base-100 border-l border-base-300 p-4 overflow-y-auto">
        <h3 class="font-bold mb-4">Workflow Settings</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Workflow Name</span>
            </label>
            <input v-model="workflow.name" type="text" placeholder="Enter workflow name" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea v-model="workflow.description" class="textarea textarea-bordered" rows="3" placeholder="Describe what this workflow does"></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <select v-model="workflow.category" class="select select-bordered">
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

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Allow Re-entry</span>
              <input v-model="workflow.settings.allowReEntry" type="checkbox" class="checkbox checkbox-primary" />
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Max Executions Per Customer</span>
            </label>
            <input v-model.number="workflow.settings.maxExecutionsPerCustomer" type="number" min="0" class="input input-bordered" />
            <label class="label">
              <span class="label-text-alt">0 = unlimited</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const canvas = ref(null);
const selectedNode = ref(null);

const workflow = ref({
  name: '',
  description: '',
  status: 'draft',
  category: 'custom',
  nodes: [],
  entryNode: '',
  settings: {
    allowReEntry: false,
    maxExecutionsPerCustomer: 0,
    timeWindow: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC',
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    goalTracking: {
      enabled: false,
      goalType: 'purchase',
      goalValue: 0
    }
  }
});

const isEditing = computed(() => !!route.params.id);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const loadWorkflow = async () => {
  if (!isEditing.value) return;

  try {
    const response = await axios.get(
      `http://localhost:3000/automation/workflows/${route.params.id}`,
      getAuthHeaders()
    );

    if (response.data.success) {
      workflow.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading workflow:', error);
    alert('Failed to load workflow');
  }
};

const startDrag = (event, nodeType) => {
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('nodeType', nodeType);
};

const onDrop = (event) => {
  event.preventDefault();
  const nodeType = event.dataTransfer.getData('nodeType');
  
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left + canvas.value.scrollLeft;
  const y = event.clientY - rect.top + canvas.value.scrollTop;

  addNode(nodeType, x, y);
};

const addNode = (type, x, y) => {
  const nodeId = `node_${Date.now()}`;
  
  const newNode = {
    id: nodeId,
    type,
    position: { x, y },
    nextNodes: []
  };

  // Add type-specific defaults
  if (type === 'trigger') {
    newNode.triggerType = 'customer_signup';
    if (!workflow.value.entryNode) {
      workflow.value.entryNode = nodeId;
    }
  } else if (type === 'action') {
    newNode.actionType = 'send_email';
    newNode.actionConfig = {};
  } else if (type === 'condition') {
    newNode.conditionType = 'customer_property';
    newNode.conditionRules = [];
  } else if (type === 'delay') {
    newNode.delayDuration = 1;
    newNode.delayUnit = 'days';
  }

  workflow.value.nodes.push(newNode);
};

const selectNode = (node) => {
  selectedNode.value = node;
};

const deleteNode = (nodeId) => {
  workflow.value.nodes = workflow.value.nodes.filter(n => n.id !== nodeId);
  
  // Remove connections to this node
  workflow.value.nodes.forEach(node => {
    node.nextNodes = node.nextNodes.filter(next => next.nodeId !== nodeId);
  });

  // Clear entry node if deleted
  if (workflow.value.entryNode === nodeId) {
    workflow.value.entryNode = '';
  }

  if (selectedNode.value?.id === nodeId) {
    selectedNode.value = null;
  }
};

const getNodeLabel = (node) => {
  const labels = {
    trigger: 'Trigger',
    action: 'Send Action',
    condition: 'Condition',
    delay: 'Wait',
    end: 'End'
  };
  return labels[node.type] || node.type;
};

const getNodeDescription = (node) => {
  if (node.type === 'trigger' && node.triggerType) {
    return node.triggerType.replace(/_/g, ' ');
  }
  if (node.type === 'action' && node.actionType) {
    return node.actionType.replace(/_/g, ' ');
  }
  if (node.type === 'delay') {
    return `Wait ${node.delayDuration} ${node.delayUnit}`;
  }
  return 'Click to configure';
};

const saveWorkflow = async () => {
  if (!workflow.value.name) {
    alert('Please enter a workflow name');
    return;
  }

  if (workflow.value.nodes.length === 0) {
    alert('Please add at least one node to the workflow');
    return;
  }

  if (!workflow.value.entryNode) {
    alert('Please set an entry node (trigger)');
    return;
  }

  try {
    let response;
    if (isEditing.value) {
      response = await axios.put(
        `http://localhost:3000/automation/workflows/${route.params.id}`,
        workflow.value,
        getAuthHeaders()
      );
    } else {
      response = await axios.post(
        'http://localhost:3000/automation/workflows',
        workflow.value,
        getAuthHeaders()
      );
    }

    if (response.data.success) {
      alert('Workflow saved successfully!');
      router.push('/admin/automation');
    }
  } catch (error) {
    console.error('Error saving workflow:', error);
    alert('Failed to save workflow: ' + (error.response?.data?.message || error.message));
  }
};

const activateWorkflow = async () => {
  try {
    const response = await axios.post(
      `http://localhost:3000/automation/workflows/${route.params.id}/activate`,
      {},
      getAuthHeaders()
    );

    if (response.data.success) {
      alert('Workflow activated successfully!');
      router.push('/admin/automation');
    }
  } catch (error) {
    console.error('Error activating workflow:', error);
    alert('Failed to activate workflow');
  }
};

onMounted(() => {
  loadWorkflow();
});
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
