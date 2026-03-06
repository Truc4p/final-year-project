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

            <div draggable="true" @dragstart="startDrag($event, 'split')" 
                 class="p-3 bg-accent/10 rounded-lg cursor-move hover:shadow-lg transition-shadow">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span class="text-sm font-medium">A/B Split</span>
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
          class="w-full h-full bg-base-200 overflow-auto relative"
          style="background-image: radial-gradient(circle, #888 1px, transparent 1px); background-size: 20px 20px;"
        >
          <!-- Connection mode banner -->
          <div v-if="connectingMode" class="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-success text-success-content px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span class="font-bold">Click a node to connect</span>
          </div>
          
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
                'bg-accent text-accent-content border-accent': node.type === 'split',
                'bg-error text-error-content border-error': node.type === 'end',
                'ring-4 ring-accent': selectedNode?.id === node.id,
                'ring-4 ring-success animate-pulse': connectingMode && connectingFromNode?.id !== node.id,
                'opacity-50': connectingMode && connectingFromNode?.id === node.id
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

          <div v-if="selectedNode.actionType === 'send_push'" class="form-control">
            <label class="label">
              <span class="label-text">Push Title</span>
            </label>
            <input v-model="selectedNode.actionConfig.pushTemplate.title" type="text" placeholder="Notification title" class="input input-bordered input-sm mb-2" />
            <label class="label">
              <span class="label-text">Push Body</span>
            </label>
            <textarea v-model="selectedNode.actionConfig.pushTemplate.body" class="textarea textarea-bordered" rows="3"></textarea>
          </div>

          <div v-if="selectedNode.actionType === 'webhook'" class="form-control">
            <label class="label">
              <span class="label-text">Webhook URL</span>
            </label>
            <input v-model="selectedNode.actionConfig.webhookUrl" type="url" placeholder="https://..." class="input input-bordered input-sm" />
          </div>
        </div>

        <!-- Split Settings -->
        <div v-if="selectedNode.type === 'split'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Split Percentage (Variant A)</span>
            </label>
            <div class="flex items-center gap-2">
              <input v-model.number="selectedNode.splitPercentage" type="range" min="0" max="100" class="range range-primary" />
              <span class="badge badge-primary">{{ selectedNode.splitPercentage }}%</span>
            </div>
            <label class="label">
              <span class="label-text-alt">Variant B gets {{ 100 - selectedNode.splitPercentage }}%</span>
            </label>
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
          
          <!-- Show existing connections -->
          <div v-if="selectedNode.nextNodes && selectedNode.nextNodes.length > 0" class="mb-3 space-y-2">
            <div v-for="(conn, idx) in selectedNode.nextNodes" :key="idx" class="flex items-center justify-between bg-base-200 p-2 rounded">
              <span class="text-sm">→ {{ getNodeById(conn.nodeId) ? getNodeLabel(getNodeById(conn.nodeId)) : 'Unknown node' }}</span>
              <button @click="removeConnection(idx)" class="btn btn-xs btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Add connection button -->
          <button 
            v-if="!connectingMode"
            @click="startConnecting" 
            class="btn btn-sm btn-primary w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect to Node
          </button>
          
          <button 
            v-else
            @click="cancelConnecting" 
            class="btn btn-sm btn-error w-full"
          >
            Cancel Connection
          </button>
          
          <div v-if="connectingMode" class="text-xs text-info mt-2">
            Click on another node to create connection
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
const connectingMode = ref(false);
const connectingFromNode = ref(null);

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
    newNode.actionConfig = {
      pushTemplate: { title: '', body: '' }
    };
  } else if (type === 'condition') {
    newNode.conditionType = 'customer_property';
    newNode.conditionRules = [];
  } else if (type === 'delay') {
    newNode.delayDuration = 1;
    newNode.delayUnit = 'days';
  } else if (type === 'split') {
    newNode.splitPercentage = 50;
  }

  workflow.value.nodes.push(newNode);
};

const selectNode = (node) => {
  // If in connecting mode, create connection
  if (connectingMode.value && connectingFromNode.value) {
    if (connectingFromNode.value.id !== node.id) {
      // Add connection
      if (!connectingFromNode.value.nextNodes) {
        connectingFromNode.value.nextNodes = [];
      }
      
      // Check if connection already exists
      const exists = connectingFromNode.value.nextNodes.some(n => n.nodeId === node.id);
      if (!exists) {
        connectingFromNode.value.nextNodes.push({ nodeId: node.id });
      }
    }
    
    // Exit connecting mode
    connectingMode.value = false;
    connectingFromNode.value = null;
    return;
  }
  
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

// Connection management functions
const startConnecting = () => {
  connectingMode.value = true;
  connectingFromNode.value = selectedNode.value;
};

const cancelConnecting = () => {
  connectingMode.value = false;
  connectingFromNode.value = null;
};

const removeConnection = (index) => {
  if (selectedNode.value && selectedNode.value.nextNodes) {
    selectedNode.value.nextNodes.splice(index, 1);
  }
};

const getNodeById = (nodeId) => {
  return workflow.value.nodes.find(n => n.id === nodeId);
};

const getNodeLabel = (node) => {
  const labels = {
    trigger: 'Trigger',
    action: 'Send Action',
    condition: 'Condition',
    delay: 'Wait',
    split: 'A/B Split',
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
  if (node.type === 'split') {
    return `${node.splitPercentage}% / ${100 - node.splitPercentage}%`;
  }
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
    // Clean up workflow data before sending
    const workflowData = JSON.parse(JSON.stringify(workflow.value));
    
    // Clean up action nodes - remove invalid ObjectId strings
    workflowData.nodes = workflowData.nodes.map(node => {
      if (node.type === 'action' && node.actionConfig) {
        // Remove emailTemplate if it's a string (not a valid ObjectId)
        if (node.actionConfig.emailTemplate && typeof node.actionConfig.emailTemplate === 'string') {
          // If it looks like a description, remove it
          if (!node.actionConfig.emailTemplate.match(/^[0-9a-fA-F]{24}$/)) {
            delete node.actionConfig.emailTemplate;
          }
        }
      }
      return node;
    });
    
    let response;
    if (isEditing.value) {
      response = await axios.put(
        `http://localhost:3000/automation/workflows/${route.params.id}`,
        workflowData,
        getAuthHeaders()
      );
    } else {
      response = await axios.post(
        'http://localhost:3000/automation/workflows',
        workflowData,
        getAuthHeaders()
      );
    }

    if (response.data.success) {
      alert('Workflow saved successfully!');
      router.push('/admin/automation');
    }
  } catch (error) {
    console.error('Error saving workflow:', error);
    console.error('Error response:', error.response?.data);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
    alert('Failed to save workflow: ' + errorMsg);
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

// Template definitions
const getTemplateData = (templateType) => {
  const templates = {
    welcome_series: {
      name: 'Welcome Series',
      description: 'Nurture new customers with a series of welcome emails',
      category: 'welcome_series',
      nodes: [
        {
          id: 'node_trigger_1',
          type: 'trigger',
          position: { x: 400, y: 50 },
          triggerType: 'customer_signup',
          nextNodes: [{ nodeId: 'node_action_1' }]
        },
        {
          id: 'node_action_1',
          type: 'action',
          position: { x: 400, y: 200 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Welcome Email - Day 1',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_1' }]
        },
        {
          id: 'node_delay_1',
          type: 'delay',
          position: { x: 400, y: 350 },
          delayDuration: 2,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_2' }]
        },
        {
          id: 'node_action_2',
          type: 'action',
          position: { x: 400, y: 500 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Product Guide - Day 3',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_2' }]
        },
        {
          id: 'node_delay_2',
          type: 'delay',
          position: { x: 400, y: 650 },
          delayDuration: 4,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_3' }]
        },
        {
          id: 'node_action_3',
          type: 'action',
          position: { x: 400, y: 800 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Special Offer - Day 7',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_end_1' }]
        },
        {
          id: 'node_end_1',
          type: 'end',
          position: { x: 400, y: 950 },
          nextNodes: []
        }
      ],
      entryNode: 'node_trigger_1'
    },
    abandoned_cart: {
      name: 'Abandoned Cart Recovery',
      description: 'Recover lost sales with timely reminders',
      category: 'abandoned_cart',
      nodes: [
        {
          id: 'node_trigger_1',
          type: 'trigger',
          position: { x: 400, y: 50 },
          triggerType: 'cart_abandoned',
          nextNodes: [{ nodeId: 'node_delay_1' }]
        },
        {
          id: 'node_delay_1',
          type: 'delay',
          position: { x: 400, y: 200 },
          delayDuration: 1,
          delayUnit: 'hours',
          nextNodes: [{ nodeId: 'node_action_1' }]
        },
        {
          id: 'node_action_1',
          type: 'action',
          position: { x: 400, y: 350 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Cart Reminder - 1 hour',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_2' }]
        },
        {
          id: 'node_delay_2',
          type: 'delay',
          position: { x: 400, y: 500 },
          delayDuration: 23,
          delayUnit: 'hours',
          nextNodes: [{ nodeId: 'node_action_2' }]
        },
        {
          id: 'node_action_2',
          type: 'action',
          position: { x: 400, y: 650 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: '10% Discount - 24 hours',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_3' }]
        },
        {
          id: 'node_delay_3',
          type: 'delay',
          position: { x: 400, y: 800 },
          delayDuration: 2,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_3' }]
        },
        {
          id: 'node_action_3',
          type: 'action',
          position: { x: 400, y: 950 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Last Chance - 3 days',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_end_1' }]
        },
        {
          id: 'node_end_1',
          type: 'end',
          position: { x: 400, y: 1100 },
          nextNodes: []
        }
      ],
      entryNode: 'node_trigger_1'
    },
    post_purchase: {
      name: 'Post-Purchase Follow-up',
      description: 'Build loyalty and encourage repeat purchases',
      category: 'post_purchase',
      nodes: [
        {
          id: 'node_trigger_1',
          type: 'trigger',
          position: { x: 400, y: 50 },
          triggerType: 'order_placed',
          nextNodes: [{ nodeId: 'node_action_1' }]
        },
        {
          id: 'node_action_1',
          type: 'action',
          position: { x: 400, y: 200 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Thank You Email',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_1' }]
        },
        {
          id: 'node_delay_1',
          type: 'delay',
          position: { x: 400, y: 350 },
          delayDuration: 7,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_2' }]
        },
        {
          id: 'node_action_2',
          type: 'action',
          position: { x: 400, y: 500 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Review Request',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_2' }]
        },
        {
          id: 'node_delay_2',
          type: 'delay',
          position: { x: 400, y: 650 },
          delayDuration: 23,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_3' }]
        },
        {
          id: 'node_action_3',
          type: 'action',
          position: { x: 400, y: 800 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Cross-sell Recommendations',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_end_1' }]
        },
        {
          id: 'node_end_1',
          type: 'end',
          position: { x: 400, y: 950 },
          nextNodes: []
        }
      ],
      entryNode: 'node_trigger_1'
    },
    re_engagement: {
      name: 'Re-engagement Campaign',
      description: 'Bring back inactive customers',
      category: 're_engagement',
      nodes: [
        {
          id: 'node_trigger_1',
          type: 'trigger',
          position: { x: 400, y: 50 },
          triggerType: 'customer_inactive',
          nextNodes: [{ nodeId: 'node_action_1' }]
        },
        {
          id: 'node_action_1',
          type: 'action',
          position: { x: 400, y: 200 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'We Miss You',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_1' }]
        },
        {
          id: 'node_delay_1',
          type: 'delay',
          position: { x: 400, y: 350 },
          delayDuration: 7,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_2' }]
        },
        {
          id: 'node_action_2',
          type: 'action',
          position: { x: 400, y: 500 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Special Comeback Offer',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_end_1' }]
        },
        {
          id: 'node_end_1',
          type: 'end',
          position: { x: 400, y: 650 },
          nextNodes: []
        }
      ],
      entryNode: 'node_trigger_1'
    },
    win_back: {
      name: 'Win-back Campaign',
      description: 'Aggressive campaign to win back churned customers',
      category: 'win_back',
      nodes: [
        {
          id: 'node_trigger_1',
          type: 'trigger',
          position: { x: 400, y: 50 },
          triggerType: 'customer_inactive',
          nextNodes: [{ nodeId: 'node_action_1' }]
        },
        {
          id: 'node_action_1',
          type: 'action',
          position: { x: 400, y: 200 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'We Want You Back - 20% Off',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_1' }]
        },
        {
          id: 'node_delay_1',
          type: 'delay',
          position: { x: 400, y: 350 },
          delayDuration: 3,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_2' }]
        },
        {
          id: 'node_action_2',
          type: 'action',
          position: { x: 400, y: 500 },
          actionType: 'send_sms',
          actionConfig: {
            smsTemplate: 'Limited time: 20% off everything!',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_delay_2' }]
        },
        {
          id: 'node_delay_2',
          type: 'delay',
          position: { x: 400, y: 650 },
          delayDuration: 4,
          delayUnit: 'days',
          nextNodes: [{ nodeId: 'node_action_3' }]
        },
        {
          id: 'node_action_3',
          type: 'action',
          position: { x: 400, y: 800 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Final Chance - Offer Expires',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_end_1' }]
        },
        {
          id: 'node_end_1',
          type: 'end',
          position: { x: 400, y: 950 },
          nextNodes: []
        }
      ],
      entryNode: 'node_trigger_1'
    },
    birthday: {
      name: 'Birthday Campaign',
      description: 'Celebrate customer birthdays with special offers',
      category: 'promotional',
      nodes: [
        {
          id: 'node_trigger_1',
          type: 'trigger',
          position: { x: 400, y: 50 },
          triggerType: 'custom_event',
          nextNodes: [{ nodeId: 'node_action_1' }]
        },
        {
          id: 'node_action_1',
          type: 'action',
          position: { x: 400, y: 200 },
          actionType: 'send_email',
          actionConfig: {
            emailTemplate: 'Happy Birthday with Gift',
            pushTemplate: { title: '', body: '' }
          },
          nextNodes: [{ nodeId: 'node_end_1' }]
        },
        {
          id: 'node_end_1',
          type: 'end',
          position: { x: 400, y: 350 },
          nextNodes: []
        }
      ],
      entryNode: 'node_trigger_1'
    }
  };

  return templates[templateType] || null;
};

const loadTemplate = () => {
  const templateType = route.query.template;
  if (!templateType) return;

  const templateData = getTemplateData(templateType);
  if (templateData) {
    workflow.value = {
      ...workflow.value,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      nodes: templateData.nodes,
      entryNode: templateData.entryNode
    };
  }
};

onMounted(() => {
  if (isEditing.value) {
    loadWorkflow();
  } else {
    loadTemplate();
  }
});
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
