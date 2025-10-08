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
            <div 
              v-for="template in emailTemplates" 
              :key="template.id"
              @click="selectTemplate(template)"
              class="border rounded-lg p-4 hover:shadow-md cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div class="bg-gray-100 h-32 rounded mb-3 flex items-center justify-center">
                <div class="text-gray-400 text-xs">{{ template.name }} Preview</div>
              </div>
              <h4 class="font-medium">{{ template.name }}</h4>
              <p class="text-sm text-gray-600">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Preview Modal -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Campaign Preview</h3>
              <p class="text-sm text-gray-600">{{ campaign.name }}</p>
            </div>
            <div class="flex gap-3">
              <button @click="showPreviewModal = false" class="btn btn-outline">
                Close
              </button>
              <button @click="sendCampaign" class="btn btn-primary">
                Send Campaign
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Email Preview -->
            <div class="lg:col-span-2">
              <div class="bg-white border rounded-lg">
                <div class="border-b p-4">
                  <h4 class="font-medium text-gray-900">Email Preview</h4>
                  <div class="text-sm text-gray-600 mt-2">
                    <div><strong>Subject:</strong> {{ campaign.subject }}</div>
                    <div><strong>From:</strong> Company Name &lt;noreply@company.com&gt;</div>
                  </div>
                </div>
                <div class="p-4">
                  <div class="border rounded-lg overflow-hidden">
                    <iframe 
                      :srcdoc="previewHtml" 
                      class="w-full h-96 border-0"
                      style="height: 500px;"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Campaign Details -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Campaign Details</h4>
                <div class="space-y-2 text-sm">
                  <div><strong>Campaign Name:</strong> {{ campaign.name }}</div>
                  <div><strong>Type:</strong> {{ campaign.type }}</div>
                  <div><strong>Target Audience:</strong> {{ campaign.targetAudience }}</div>
                  <div><strong>Recipients:</strong> {{ targetCount }} subscribers</div>
                  <div v-if="sendTimeOption === 'scheduled'">
                    <strong>Scheduled:</strong> {{ formatDate(campaign.scheduledAt) }}
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Settings</h4>
                <div class="space-y-2 text-sm">
                  <div>✓ Track Opens: {{ campaign.settings.trackOpens ? 'Yes' : 'No' }}</div>
                  <div>✓ Track Clicks: {{ campaign.settings.trackClicks ? 'Yes' : 'No' }}</div>
                  <div>✓ Unsubscribe Link: {{ campaign.settings.enableUnsubscribe ? 'Yes' : 'No' }}</div>
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
const showPreviewModal = ref(false);
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

// Email templates
const emailTemplates = ref([
  {
    id: 'newsletter',
    name: 'Newsletter Template',
    description: 'Perfect for weekly newsletters',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">{{company_name}} Newsletter</h1>
        </header>
        <main style="padding: 20px;">
          <h2 style="color: #333;">Hello {{subscriber_name}},</h2>
          <p style="line-height: 1.6; color: #666;">Welcome to our weekly newsletter! Here's what's new this week.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #333;">Featured Article</h3>
            <p style="margin-bottom: 0; color: #666;">Add your featured content here...</p>
          </div>
          
          <p style="line-height: 1.6; color: #666;">Thank you for being a valued subscriber!</p>
        </main>
        <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Best regards,<br>{{company_name}} Team</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            <a href="{{unsubscribe_url}}" style="color: #ccc;">Unsubscribe</a>
          </p>
        </footer>
      </div>
    `
  },
  {
    id: 'promotion',
    name: 'Promotion Template',
    description: 'Great for sales and special offers',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Special Offer!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Limited Time Only</p>
        </header>
        <main style="padding: 30px;">
          <h2 style="color: #333; text-align: center;">Hi {{subscriber_name}},</h2>
          <p style="line-height: 1.6; color: #666; text-align: center; font-size: 18px;">
            Don't miss out on this amazing deal!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #ff6b6b; color: white; display: inline-block; padding: 15px 30px; border-radius: 50px; font-size: 24px; font-weight: bold;">
              50% OFF
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Shop Now
            </a>
          </div>
          
          <p style="line-height: 1.6; color: #666; text-align: center; font-style: italic;">
            Offer valid until {{current_date}}
          </p>
        </main>
        <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">{{company_name}}</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            <a href="{{unsubscribe_url}}" style="color: #ccc;">Unsubscribe</a>
          </p>
        </footer>
      </div>
    `
  },
  {
    id: 'welcome',
    name: 'Welcome Template',
    description: 'Perfect for welcoming new subscribers',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <header style="background-color: #28a745; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to {{company_name}}!</h1>
        </header>
        <main style="padding: 30px;">
          <h2 style="color: #333;">Hello {{subscriber_name}},</h2>
          <p style="line-height: 1.6; color: #666; font-size: 18px;">
            Welcome aboard! We're thrilled to have you join our community.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h3 style="margin-top: 0; color: #333;">What's Next?</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin: 10px 0; color: #666;">✓ Explore our latest products</li>
              <li style="margin: 10px 0; color: #666;">✓ Follow us on social media</li>
              <li style="margin: 10px 0; color: #666;">✓ Watch for exclusive offers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Get Started
            </a>
          </div>
          
          <p style="line-height: 1.6; color: #666;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </main>
        <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thanks for joining us!</p>
          <p style="margin: 5px 0 0 0;">{{company_name}} Team</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            <a href="{{unsubscribe_url}}" style="color: #ccc;">Unsubscribe</a>
          </p>
        </footer>
      </div>
    `
  }
]);

// Computed properties
const canSave = computed(() => {
  return campaign.value.name && campaign.value.subject;
});

const canPreview = computed(() => {
  return canSave.value && (campaign.value.content || campaign.value.htmlContent);
});

const previewHtml = computed(() => {
  let html = campaign.value.htmlContent || '';
  
  // Replace variables with sample data for preview
  const replacements = {
    '{{company_name}}': 'Your Company Name',
    '{{subscriber_name}}': 'John Doe',
    '{{subscriber_email}}': 'john.doe@example.com',
    '{{current_date}}': new Date().toLocaleDateString(),
    '{{unsubscribe_url}}': '#unsubscribe'
  };
  
  Object.entries(replacements).forEach(([variable, value]) => {
    html = html.replace(new RegExp(variable, 'g'), value);
  });
  
  return html;
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

const selectTemplate = (template) => {
  // Load the selected template content
  campaign.value.htmlContent = template.htmlContent;
  
  // If we're in visual editor mode, update the editor content
  if (!isHtmlView.value && editor.value) {
    editor.value.innerHTML = template.htmlContent;
  }
  
  // Update the campaign name if it's empty
  if (!campaign.value.name) {
    campaign.value.name = `Campaign using ${template.name}`;
  }
  
  // Update content for both views
  updateContent();
  
  // Close the template selector
  showTemplateSelector.value = false;
  
  // Show success message (you could replace this with a toast notification)
  console.log(`Template "${template.name}" loaded successfully!`);
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
  // Open preview modal instead of navigating to a non-existent route
  showPreviewModal.value = true;
};

const sendCampaign = async () => {
  try {
    updateContent();
    
    const campaignData = {
      ...campaign.value,
      status: sendTimeOption.value === 'now' ? 'sent' : 'scheduled'
    };

    let response;
    if (isEditing.value) {
      // Send existing campaign
      response = await axios.post(`${API_URL}/email-campaigns/campaigns/${route.params.id}/send`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } else {
      // Create and send new campaign
      response = await axios.post(`${API_URL}/email-campaigns/campaigns/send`, campaignData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
    
    showPreviewModal.value = false;
    
    // Show success message with details
    const { emailsSent, emailsFailed } = response.data.data;
    if (sendTimeOption.value === 'now') {
      alert(`Campaign sent successfully!\n✅ Emails sent: ${emailsSent}\n❌ Failed: ${emailsFailed || 0}`);
      console.log('Campaign sent successfully!', response.data);
    } else {
      alert('Campaign has been scheduled successfully!');
      console.log('Campaign scheduled successfully!', response.data);
    }
    
    // Navigate back to campaigns list
    router.push('/admin/email-marketing/campaigns');
  } catch (error) {
    console.error('Error sending campaign:', error);
    
    // Show detailed error message
    const errorMessage = error.response?.data?.message || 'Failed to send campaign. Please try again.';
    alert(`Error: ${errorMessage}`);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
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