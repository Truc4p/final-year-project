<template>
  <div class="campaign-creation">
    <!-- Header -->
    <div class="page-header flex justify-between items-center m-10">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Campaign' : 'Create New Campaign' }}
        </h1>
        <p class="text-gray-600 mt-1">Design and send email campaigns to your subscribers</p>
      </div>
      <div class="flex gap-3">
        <button @click="$router.go(-1)" class="btn btn-outline">
          Cancel
        </button>
        <button @click="saveDraft" :disabled="!canSave" class="btn btn-outline">
          Save Draft
        </button>
        <button @click="previewCampaign" :disabled="!canPreview" class="btn btn-primary">
          Preview & Send
        </button>
      </div>
    </div>

    <!-- Campaign Form -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6 m-5 mr-0">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
              <input
                v-model="campaign.name"
                type="text"
                placeholder="Enter campaign name..."
                class="form-input w-full"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
              <input
                v-model="campaign.subject"
                type="text"
                placeholder="Enter email subject line..."
                class="form-input w-full"
                required
              />
              <p class="text-sm text-gray-500 mt-1">
                Keep it under 50 characters for better open rates
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
              <select v-model="campaign.type" class="form-select w-full">
                <option value="newsletter">Newsletter</option>
                <option value="promotion">Promotion</option>
                <option value="announcement">Announcement</option>
                <option value="welcome">Welcome</option>
                <option value="product_launch">Product Launch</option>
                <option value="abandoned_cart">Abandoned Cart</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Email Content -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Email Content</h3>
            <div class="flex gap-2">
              <button @click="showTemplateSelector = true" class="btn btn-outline btn-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                </svg>
                Use Template
              </button>
              <button @click="toggleView" class="btn btn-outline btn-sm">
                {{ isHtmlView ? 'Visual Editor' : 'HTML Editor' }}
              </button>
            </div>
          </div>

          <!-- Rich Text Editor -->
          <div v-if="!isHtmlView" class="border rounded-lg">
            <div class="border-b bg-gray-50 p-3">
              <div class="flex flex-wrap gap-2">
                <!-- Formatting Tools -->
                <button @click="formatText('bold')" class="editor-btn" title="Bold">
                  <strong>B</strong>
                </button>
                <button @click="formatText('italic')" class="editor-btn" title="Italic">
                  <em>I</em>
                </button>
                <button @click="formatText('underline')" class="editor-btn" title="Underline">
                  <u>U</u>
                </button>
                <div class="border-l mx-2"></div>
                <button @click="formatText('insertUnorderedList')" class="editor-btn" title="Bullet List">
                  •
                </button>
                <button @click="formatText('insertOrderedList')" class="editor-btn" title="Numbered List">
                  1.
                </button>
                <div class="border-l mx-2"></div>
                <button @click="insertLink" class="editor-btn" title="Insert Link">
                  🔗
                </button>
                <button @click="insertImage" class="editor-btn" title="Insert Image">
                  🖼️
                </button>
                <div class="border-l mx-2"></div>
                <select @change="changeHeading" class="text-sm border rounded px-2 py-1">
                  <option value="">Normal</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
              </div>
            </div>
            
            <div
              ref="editor"
              @input="updateContent"
              contenteditable="true"
              class="min-h-96 p-4 focus:outline-none"
              style="min-height: 400px;"
              placeholder="Start writing your email content..."
            ></div>
          </div>

          <!-- HTML Editor -->
          <div v-else>
            <textarea
              v-model="campaign.htmlContent"
              class="form-textarea w-full font-mono text-sm"
              rows="20"
              placeholder="Enter HTML content..."
            ></textarea>
          </div>

          <!-- Email Variables -->
          <div class="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-900 mb-2">Available Variables</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="variable in emailVariables"
                :key="variable.name"
                @click="insertVariable(variable.name)"
                class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {{ variable.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6 m-5 ml-0">
        <!-- Target Audience -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Target Audience</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Audience Type</label>
              <select v-model="campaign.targetAudience" @change="updateTargetCount" class="form-select w-full">
                <option value="all">All Subscribers</option>
                <option value="segment">Segment</option>
                <option value="custom">Custom List</option>
              </select>
            </div>

            <!-- Segment Criteria -->
            <div v-if="campaign.targetAudience === 'segment'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subscription Date</label>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="campaign.segmentCriteria.subscriptionDateFrom"
                    type="date"
                    class="form-input text-sm"
                    placeholder="From"
                  />
                  <input
                    v-model="campaign.segmentCriteria.subscriptionDateTo"
                    type="date"
                    class="form-input text-sm"
                    placeholder="To"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sources</label>
                <div class="space-y-2">
                  <label v-for="source in availableSources" :key="source.value" class="flex items-center">
                    <input
                      type="checkbox"
                      :value="source.value"
                      v-model="campaign.segmentCriteria.sources"
                      class="rounded border-gray-300 text-blue-600"
                    />
                    <span class="ml-2 text-sm">{{ source.label }}</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="campaign.segmentCriteria.preferences.newProducts"
                      class="rounded border-gray-300 text-blue-600"
                    />
                    <span class="ml-2 text-sm">New Products</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="campaign.segmentCriteria.preferences.promotions"
                      class="rounded border-gray-300 text-blue-600"
                    />
                    <span class="ml-2 text-sm">Promotions</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="campaign.segmentCriteria.preferences.newsletter"
                      class="rounded border-gray-300 text-blue-600"
                    />
                    <span class="ml-2 text-sm">Newsletter</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Custom Email List -->
            <div v-if="campaign.targetAudience === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
              <textarea
                v-model="customEmailList"
                @input="updateCustomEmails"
                placeholder="Enter email addresses, one per line..."
                class="form-textarea w-full text-sm"
                rows="6"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">One email per line</p>
            </div>

            <!-- Target Count -->
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm text-gray-600">
                <strong>{{ targetCount }}</strong> subscribers will receive this campaign
              </div>
            </div>
          </div>
        </div>

        <!-- Campaign Settings -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Send Time</label>
              <select v-model="sendTimeOption" class="form-select w-full">
                <option value="now">Send Now</option>
                <option value="scheduled">Schedule for Later</option>
              </select>
            </div>

            <div v-if="sendTimeOption === 'scheduled'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
              <input
                v-model="campaign.scheduledAt"
                type="datetime-local"
                class="form-input w-full"
              />
            </div>

            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="campaign.settings.trackOpens"
                  class="rounded border-gray-300 text-blue-600"
                />
                <span class="ml-2 text-sm">Track email opens</span>
              </label>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="campaign.settings.trackClicks"
                  class="rounded border-gray-300 text-blue-600"
                />
                <span class="ml-2 text-sm">Track link clicks</span>
              </label>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="campaign.settings.enableUnsubscribe"
                  class="rounded border-gray-300 text-blue-600"
                />
                <span class="ml-2 text-sm">Include unsubscribe link</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Campaign Stats (if editing) -->
        <div v-if="isEditing && campaign.status === 'sent'" class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Campaign Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Sent:</span>
              <span class="text-sm font-medium">{{ campaign.analytics?.emailsSent || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Opened:</span>
              <span class="text-sm font-medium">{{ campaign.analytics?.emailsOpened || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Clicked:</span>
              <span class="text-sm font-medium">{{ campaign.analytics?.emailsClicked || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Selector Modal -->
    <div v-if="showTemplateSelector" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Choose Email Template</h3>
            <button @click="showTemplateSelector = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Template grid will be implemented here -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            <!-- Template cards -->
            <div class="border rounded-lg p-4 hover:shadow-md cursor-pointer">
              <div class="bg-gray-100 h-32 rounded mb-3"></div>
              <h4 class="font-medium">Newsletter Template</h4>
              <p class="text-sm text-gray-600">Perfect for weekly newsletters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../../utils/config';

const route = useRoute();
const router = useRouter();

// Component state
const isEditing = computed(() => !!route.params.id);
const isHtmlView = ref(false);
const showTemplateSelector = ref(false);
const sendTimeOption = ref('now');
const customEmailList = ref('');
const targetCount = ref(0);
const editor = ref(null);

// Campaign data
const campaign = ref({
  name: '',
  subject: '',
  content: '',
  htmlContent: '',
  type: 'newsletter',
  targetAudience: 'all',
  segmentCriteria: {
    subscriptionDateFrom: '',
    subscriptionDateTo: '',
    sources: [],
    preferences: {
      newProducts: false,
      promotions: false,
      newsletter: false
    },
    customEmails: []
  },
  scheduledAt: null,
  settings: {
    trackOpens: true,
    trackClicks: true,
    enableUnsubscribe: true
  },
  status: 'draft'
});

// Email variables for personalization
const emailVariables = ref([
  { name: 'subscriber_email', label: 'Email' },
  { name: 'subscriber_name', label: 'Name' },
  { name: 'unsubscribe_url', label: 'Unsubscribe Link' },
  { name: 'company_name', label: 'Company Name' },
  { name: 'current_date', label: 'Current Date' }
]);

// Available sources for segmentation
const availableSources = ref([
  { value: 'public_page', label: 'Public Page' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'manual', label: 'Manual' },
  { value: 'other', label: 'Other' }
]);

// Computed properties
const canSave = computed(() => {
  return campaign.value.name && campaign.value.subject;
});

const canPreview = computed(() => {
  return canSave.value && (campaign.value.content || campaign.value.htmlContent);
});

// Methods
const toggleView = () => {
  if (!isHtmlView.value) {
    // Switching to HTML view, save current visual content
    campaign.value.htmlContent = editor.value?.innerHTML || '';
  } else {
    // Switching to visual view, load HTML content
    if (editor.value) {
      editor.value.innerHTML = campaign.value.htmlContent || '';
    }
  }
  isHtmlView.value = !isHtmlView.value;
};

const formatText = (command, value = null) => {
  document.execCommand(command, false, value);
  updateContent();
};

const changeHeading = (event) => {
  const value = event.target.value;
  if (value) {
    formatText('formatBlock', value);
  }
  event.target.value = '';
};

const insertLink = () => {
  const url = prompt('Enter URL:');
  if (url) {
    formatText('createLink', url);
  }
};

const insertImage = () => {
  const url = prompt('Enter image URL:');
  if (url) {
    formatText('insertImage', url);
  }
};

const insertVariable = (variableName) => {
  const variableText = `{{${variableName}}}`;
  if (isHtmlView.value) {
    // Insert into textarea
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    campaign.value.htmlContent = 
      campaign.value.htmlContent.substring(0, start) + 
      variableText + 
      campaign.value.htmlContent.substring(end);
  } else {
    // Insert into visual editor
    formatText('insertText', variableText);
  }
};

const updateContent = () => {
  if (editor.value) {
    campaign.value.content = editor.value.innerText;
    campaign.value.htmlContent = editor.value.innerHTML;
  }
};

const updateCustomEmails = () => {
  const emails = customEmailList.value
    .split('\n')
    .map(email => email.trim())
    .filter(email => email && email.includes('@'));
  campaign.value.segmentCriteria.customEmails = emails;
  updateTargetCount();
};

const updateTargetCount = async () => {
  // This would make an API call to get the count based on current criteria
  // For now, we'll simulate it
  try {
    if (campaign.value.targetAudience === 'all') {
      targetCount.value = 1250; // Simulated total
    } else if (campaign.value.targetAudience === 'custom') {
      targetCount.value = campaign.value.segmentCriteria.customEmails.length;
    } else {
      // Make API call to get segment count
      targetCount.value = 850; // Simulated segment count
    }
  } catch (error) {
    console.error('Error updating target count:', error);
  }
};

const saveDraft = async () => {
  try {
    updateContent();
    
    const campaignData = {
      ...campaign.value,
      status: 'draft'
    };

    if (isEditing.value) {
      await axios.put(`${API_URL}/email-campaigns/campaigns/${route.params.id}`, campaignData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } else {
      const response = await axios.post(`${API_URL}/email-campaigns/campaigns`, campaignData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      router.push(`/admin/email-marketing/campaigns/${response.data.data._id}/edit`);
    }
    
    // Show success message
    console.log('Campaign saved as draft');
  } catch (error) {
    console.error('Error saving campaign:', error);
  }
};

const previewCampaign = () => {
  updateContent();
  // Navigate to preview page
  router.push({
    name: 'CampaignPreview',
    params: { id: route.params.id || 'new' },
    query: { campaign: JSON.stringify(campaign.value) }
  });
};

const loadCampaign = async () => {
  if (isEditing.value) {
    try {
      const response = await axios.get(`${API_URL}/email-campaigns/campaigns/${route.params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      campaign.value = response.data.data;
      
      // Load content into editor
      if (editor.value && campaign.value.htmlContent) {
        editor.value.innerHTML = campaign.value.htmlContent;
      }
      
      updateTargetCount();
    } catch (error) {
      console.error('Error loading campaign:', error);
    }
  }
};

// Watchers
watch(() => campaign.value.targetAudience, updateTargetCount);
watch(() => campaign.value.segmentCriteria, updateTargetCount, { deep: true });

// Lifecycle
onMounted(() => {
  loadCampaign();
  updateTargetCount();
});
</script>

<style scoped>
.editor-btn {
  @apply px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500;
}

.form-input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
}

.form-select {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
}

.form-textarea {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
}

.page-header {
  @apply mb-6;
}
</style>