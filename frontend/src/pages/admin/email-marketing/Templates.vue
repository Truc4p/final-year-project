<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Email Templates</h1>
            <p class="text-gray-600 mt-2">Create and manage reusable email templates for your campaigns</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Create Template</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Templates</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by name or description..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="newsletter">Newsletter</option>
              <option value="promotion">Promotion</option>
              <option value="welcome">Welcome</option>
              <option value="product_launch">Product Launch</option>
              <option value="announcement">Announcement</option>
              <option value="abandoned_cart">Abandoned Cart</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="filters.isDefault"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Templates</option>
              <option value="true">Default Templates</option>
              <option value="false">Custom Templates</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              @click="loadTemplates"
              class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Templates Grid -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="templates.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
        <p class="text-gray-600">Create your first email template to get started.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in templates"
          :key="template._id"
          class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-visible"
        >
          <!-- Template Preview -->
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
              <iframe
                :srcdoc="sanitizeHtmlForPreview(template.htmlContent)"
                class="w-full h-full transform scale-50 origin-top-left"
                style="width: 200%; height: 200%;"
                sandbox="allow-same-origin"
                @load="disableLinksInIframe($event)"
              ></iframe>
            </div>
            
            <!-- Category Badge -->
            <div class="absolute top-3 left-3">
              <span class="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                {{ getCategoryLabel(template.category) }}
              </span>
            </div>
            
            <!-- Default Badge -->
            <div v-if="template.isDefault" class="absolute top-3 right-3">
              <span class="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                Default
              </span>
            </div>
          </div>

          <!-- Template Info -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ template.name }}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ template.description }}</p>
            
            <!-- Template Stats -->
            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Used {{ template.usageCount || 0 }} times</span>
              <span>{{ formatDate(template.createdAt) }}</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <button
                @click="previewTemplate(template)"
                class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Preview
              </button>
              <button
                @click="duplicateTemplate(template)"
                class="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                Duplicate
              </button>
              <div class="relative">
                <button
                    @click.stop="toggleDropdown(template._id)"
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                  <div
                    v-if="activeDropdown === template._id"
                    class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl border z-50"
                    style="box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);"
                    @click.stop
                  >
                  <div class="py-1">
                    <button
                      @click="editTemplate(template)"
                      class="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit Template
                      </span>
                    </button>
                    <button
                      @click="useTemplate(template)"
                      class="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Use in Campaign
                      </span>
                    </button>
                    <hr class="my-1 border-gray-200">
                    <button
                      v-if="!template.isDefault"
                      @click="deleteTemplate(template)"
                      class="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete Template
                      </span>
                    </button>
                    <button
                      v-if="template.isDefault"
                      disabled
                      class="block w-full text-left px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    >
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Default Template (Protected)
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <nav class="flex space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="loadTemplates(page)"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            ]"
          >
            {{ page }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeModals"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ showCreateModal ? 'Create New Template' : 'Edit Template' }}
            </h2>
            <button @click="closeModals" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Template Starters (only for new templates) -->
          <div v-if="showCreateModal && !templateForm.htmlContent" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Choose a Template Starter</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div
                v-for="starter in templateStarters"
                :key="starter.name"
                @click="loadTemplateStarter(starter)"
                class="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h4 class="font-semibold text-gray-900 mb-2">{{ starter.name }}</h4>
                <p class="text-sm text-gray-600">{{ starter.description }}</p>
                <div v-if="starter.category" class="mt-2">
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {{ getCategoryLabel(starter.category) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form @submit.prevent="saveTemplate" class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                <input
                  v-model="templateForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  v-model="templateForm.category"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="promotion">Promotion</option>
                  <option value="welcome">Welcome</option>
                  <option value="product_launch">Product Launch</option>
                  <option value="announcement">Announcement</option>
                  <option value="abandoned_cart">Abandoned Cart</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="templateForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this template is for..."
              ></textarea>
            </div>

            <!-- Template Content with Live Preview -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- HTML Content Editor -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="block text-sm font-medium text-gray-700">HTML Content *</label>
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      @click="detectVariablesInHtml"
                      class="text-blue-600 hover:text-blue-700 text-sm"
                      title="Auto-detect variables from HTML"
                    >
                      🔍 Detect Variables
                    </button>
                    <button
                      type="button"
                      @click="validateHtmlContent"
                      class="text-green-600 hover:text-green-700 text-sm"
                      title="Validate HTML content"
                    >
                      ✓ Validate
                    </button>
                  </div>
                </div>
                <textarea
                  v-model="templateForm.htmlContent"
                  rows="20"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter HTML content with variables like {{variable_name}}"
                  @input="debouncedPreviewUpdate"
                ></textarea>
                
                <!-- Validation Results -->
                <div v-if="validationResult.errors.length > 0" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 class="text-sm font-medium text-yellow-800 mb-2">📋 Suggestions:</h4>
                  <ul class="text-sm text-yellow-700 space-y-1">
                    <li v-for="error in validationResult.errors" :key="error" class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>{{ error }}</span>
                    </li>
                  </ul>
                </div>
                
                <!-- HTML Snippets -->
                <div class="mt-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Quick Insert:</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="snippet in htmlSnippets"
                      :key="snippet.name"
                      type="button"
                      @click="insertHtmlSnippet(snippet.code)"
                      class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      {{ snippet.name }}
                    </button>
                  </div>
                </div>
                
                <!-- HTML Tips -->
                <div class="mt-2 text-xs text-gray-600">
                  <strong>Tips:</strong> Use {{variable_name}} for dynamic content • Max width: 600px • Include unsubscribe link
                </div>
              </div>

              <!-- Live Preview -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Live Preview</label>
                <div class="border border-gray-300 rounded-md h-96 overflow-hidden bg-gray-50">
                  <iframe
                    v-if="templateForm.htmlContent"
                    :srcdoc="sanitizeHtmlForPreview(templateForm.htmlContent)"
                    class="w-full h-full"
                    sandbox="allow-same-origin"
                  ></iframe>
                  <div v-else class="flex items-center justify-center h-full text-gray-500">
                    <div class="text-center">
                      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <p>Preview will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Variables -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-sm font-medium text-gray-700">Template Variables</label>
                <div class="flex space-x-2">
                  <button
                    type="button"
                    @click="detectVariablesInHtml"
                    class="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    🔄 Auto-detect
                  </button>
                  <button
                    type="button"
                    @click="addVariable"
                    class="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Variable
                  </button>
                </div>
              </div>
              
              <div class="space-y-3">
                <div
                  v-for="(variable, index) in templateForm.variables"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-md"
                >
                  <input
                    v-model="variable.name"
                    placeholder="Variable name (e.g., company_name)"
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    v-model="variable.label"
                    placeholder="Display label"
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    v-model="variable.type"
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="url">URL</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                  </select>
                  <input
                    v-model="variable.defaultValue"
                    placeholder="Default value"
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="variable.required"
                      class="mr-2"
                    />
                    <span class="text-sm">Required</span>
                  </label>
                  <button
                    type="button"
                    @click="removeVariable(index)"
                    class="px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                @click="closeModals"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary"
              >
                {{ saving ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreviewModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closePreview"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Template Preview</h2>
            <button @click="closePreview" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div v-if="previewContent" class="border rounded-lg overflow-hidden">
            <iframe
              :srcdoc="sanitizeHtmlForPreview(previewContent)"
              class="w-full h-96"
              sandbox="allow-same-origin"
              @load="disableLinksInIframe($event)"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_URL } from '../../../utils/config.js'

export default {
  name: 'EmailTemplates',
  setup() {
    const router = useRouter()
    
    // State
    const loading = ref(false)
    const saving = ref(false)
    const templates = ref([])
    const totalPages = ref(1)
    const currentPage = ref(1)
    const activeDropdown = ref(null)
    const validationResult = ref({ isValid: true, errors: [] })
    
    // Modals
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showPreviewModal = ref(false)
    const previewContent = ref('')
    
    // Filters
    const filters = reactive({
      search: '',
      category: '',
      isDefault: ''
    })
    
    // Form
    const templateForm = reactive({
      name: '',
      description: '',
      category: '',
      htmlContent: '',
      textContent: '',
      variables: []
    })
    
    // Template starters
    const templateStarters = ref([
      {
        name: 'Blank Template',
        description: 'Start from scratch',
        category: '',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{email_subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
        </div>
        <div class="content">
            <h2>{{headline}}</h2>
            <p>{{content}}</p>
        </div>
        <div class="footer">
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
            <a href="{{unsubscribe_url}}">Unsubscribe</a>
        </div>
    </div>
</body>
</html>`,
        variables: [
          { name: 'email_subject', label: 'Email Subject', type: 'text', defaultValue: '', required: true },
          { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'Your Company', required: true },
          { name: 'headline', label: 'Main Headline', type: 'text', defaultValue: 'Welcome!', required: true },
          { name: 'content', label: 'Main Content', type: 'text', defaultValue: 'Your message here...', required: true }
        ]
      },
      {
        name: 'Newsletter Template',
        description: 'Professional newsletter with sections',
        category: 'newsletter',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{newsletter_title}} - {{company_name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .article { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
            <p>{{newsletter_title}}</p>
        </div>
        <div class="content">
            <div class="article">
                <h2>{{article_1_title}}</h2>
                <p>{{article_1_content}}</p>
                <a href="{{article_1_url}}" class="button">Read More</a>
            </div>
            <div class="article">
                <h2>{{article_2_title}}</h2>
                <p>{{article_2_content}}</p>
                <a href="{{article_2_url}}" class="button">Read More</a>
            </div>
        </div>
        <div class="footer">
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
            <a href="{{unsubscribe_url}}" style="color: #3498db;">Unsubscribe</a>
        </div>
    </div>
</body>
</html>`,
        variables: [
          { name: 'newsletter_title', label: 'Newsletter Title', type: 'text', defaultValue: 'Monthly Newsletter', required: true },
          { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'Your Company', required: true },
          { name: 'article_1_title', label: 'First Article Title', type: 'text', defaultValue: 'Article Title', required: true },
          { name: 'article_1_content', label: 'First Article Content', type: 'text', defaultValue: 'Article content here...', required: true },
          { name: 'article_1_url', label: 'First Article URL', type: 'url', defaultValue: '#', required: false },
          { name: 'article_2_title', label: 'Second Article Title', type: 'text', defaultValue: 'Second Article Title', required: false },
          { name: 'article_2_content', label: 'Second Article Content', type: 'text', defaultValue: 'Second article content here...', required: false },
          { name: 'article_2_url', label: 'Second Article URL', type: 'url', defaultValue: '#', required: false },
          { name: 'current_year', label: 'Current Year', type: 'number', defaultValue: '2025', required: false },
          { name: 'unsubscribe_url', label: 'Unsubscribe URL', type: 'url', defaultValue: '#unsubscribe', required: true }
        ]
      },
      {
        name: 'Promotion Template',
        description: 'Eye-catching promotional email',
        category: 'promotion',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{promotion_title}} - {{company_name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 40px; text-align: center; }
        .badge { background-color: #f39c12; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .content { padding: 40px; text-align: center; }
        .discount { font-size: 48px; font-weight: bold; color: #e74c3c; margin: 20px 0; }
        .big-button { background-color: #e74c3c; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; }
        .footer { background-color: #34495e; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">{{promotion_type}}</div>
            <h1>{{promotion_title}}</h1>
            <p>{{promotion_subtitle}}</p>
        </div>
        <div class="content">
            <div class="discount">{{discount_amount}}</div>
            <h2>{{offer_description}}</h2>
            <p>{{offer_details}}</p>
            <a href="{{shop_url}}" class="big-button">{{cta_text}}</a>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">{{terms_conditions}}</p>
        </div>
        <div class="footer">
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
            <a href="{{unsubscribe_url}}" style="color: #3498db;">Unsubscribe</a>
        </div>
    </div>
</body>
</html>`,
        variables: [
          { name: 'promotion_type', label: 'Promotion Type', type: 'text', defaultValue: 'SPECIAL OFFER', required: true },
          { name: 'promotion_title', label: 'Promotion Title', type: 'text', defaultValue: 'Limited Time Sale!', required: true },
          { name: 'promotion_subtitle', label: 'Promotion Subtitle', type: 'text', defaultValue: 'Don\'t miss out on these amazing deals', required: false },
          { name: 'discount_amount', label: 'Discount Amount', type: 'text', defaultValue: '50% OFF', required: true },
          { name: 'offer_description', label: 'Offer Description', type: 'text', defaultValue: 'Save big on all items', required: true },
          { name: 'offer_details', label: 'Offer Details', type: 'text', defaultValue: 'Valid until end of month. Terms and conditions apply.', required: false },
          { name: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Shop Now', required: true },
          { name: 'shop_url', label: 'Shop URL', type: 'url', defaultValue: '#', required: true },
          { name: 'terms_conditions', label: 'Terms & Conditions', type: 'text', defaultValue: 'Terms and conditions apply. See website for details.', required: false },
          { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'Your Company', required: true },
          { name: 'current_year', label: 'Current Year', type: 'number', defaultValue: '2025', required: false },
          { name: 'unsubscribe_url', label: 'Unsubscribe URL', type: 'url', defaultValue: '#unsubscribe', required: true }
        ]
      },
      {
        name: 'Welcome Email',
        description: 'Warm welcome message for new users',
        category: 'welcome',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{company_name}}!</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 40px; text-align: center; }
        .welcome-icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 40px; }
        .steps { margin: 30px 0; }
        .step { background-color: #f8f9fa; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #27ae60; }
        .button { background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="welcome-icon">🎉</div>
            <h1>Welcome to {{company_name}}!</h1>
            <p>{{welcome_message}}</p>
        </div>
        <div class="content">
            <p>Hi {{user_name}},</p>
            <p>{{personal_message}}</p>
            
            <div class="steps">
                <div class="step">
                    <strong>Step 1:</strong> {{step_1_description}}
                </div>
                <div class="step">
                    <strong>Step 2:</strong> {{step_2_description}}
                </div>
                <div class="step">
                    <strong>Step 3:</strong> {{step_3_description}}
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{get_started_url}}" class="button">{{cta_text}}</a>
            </div>
            
            <p>{{closing_message}}</p>
            <p>Best regards,<br>The {{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        variables: [
          { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'Your Company', required: true },
          { name: 'user_name', label: 'User Name', type: 'text', defaultValue: 'there', required: false },
          { name: 'welcome_message', label: 'Welcome Message', type: 'text', defaultValue: 'Thanks for joining our community!', required: true },
          { name: 'personal_message', label: 'Personal Message', type: 'text', defaultValue: 'We\'re excited to have you on board!', required: true },
          { name: 'step_1_description', label: 'Step 1 Description', type: 'text', defaultValue: 'Complete your profile', required: true },
          { name: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Get Started', required: true },
          { name: 'get_started_url', label: 'Get Started URL', type: 'url', defaultValue: '#', required: true }
        ]
      }
    ])
    
    // Methods
    const loadTemplates = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit: 10,
          ...filters
        })
        
        const response = await axios.get(`${API_URL}/email-templates?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        templates.value = response.data.data
        totalPages.value = Math.ceil(response.data.total / 10)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        loading.value = false
      }
    }

    const saveTemplate = async () => {
      saving.value = true
      try {
        const token = localStorage.getItem('token')
        
        if (showEditModal.value) {
          // Update existing template
          await axios.put(`${API_URL}/email-templates/${templateForm.id}`, templateForm, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        } else {
          // Create new template
          await axios.post(`${API_URL}/email-templates`, templateForm, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        }
        
        await loadTemplates()
        closeModals()
      } catch (error) {
        console.error('Error saving template:', error)
        alert('Failed to save template')
      } finally {
        saving.value = false
      }
    }
    
    const previewTemplate = async (template) => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_URL}/email-templates/${template._id}/preview`, {
          variables: template.variables?.reduce((acc, variable) => {
            acc[variable.name] = variable.defaultValue || `[${variable.label}]`
            return acc
          }, {}) || {}
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // Handle different possible response structures
        let htmlContent = ''
        if (response.data?.rendered?.html) {
          htmlContent = response.data.rendered.html
        } else if (response.data?.html) {
          htmlContent = response.data.html
        } else if (response.data?.data?.html) {
          htmlContent = response.data.data.html
        } else if (typeof response.data === 'string') {
          htmlContent = response.data
        } else {
          // Fallback to original template content with basic variable replacement
          htmlContent = template.htmlContent
          if (template.variables) {
            template.variables.forEach(variable => {
              const regex = new RegExp(`{{${variable.name}}}`, 'g')
              htmlContent = htmlContent.replace(regex, variable.defaultValue || `[${variable.label}]`)
            })
          }
        }
        
        previewContent.value = htmlContent
        showPreviewModal.value = true
      } catch (error) {
        console.error('Error previewing template:', error)
        // Fallback to showing the original template with variable substitution
        let htmlContent = template.htmlContent
        if (template.variables) {
          template.variables.forEach(variable => {
            const regex = new RegExp(`{{${variable.name}}}`, 'g')
            htmlContent = htmlContent.replace(regex, variable.defaultValue || `[${variable.label}]`)
          })
        }
        previewContent.value = htmlContent
        showPreviewModal.value = true
      }
    }
    
    const duplicateTemplate = async (template) => {
      try {
        const token = localStorage.getItem('token')
        await axios.post(`${API_URL}/email-templates/${template._id}/duplicate`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        await loadTemplates()
      } catch (error) {
        console.error('Error duplicating template:', error)
        alert('Failed to duplicate template')
      }
    }
    
    const editTemplate = (template) => {
      Object.assign(templateForm, {
        id: template._id,
        name: template.name,
        description: template.description || '',
        category: template.category,
        htmlContent: template.htmlContent,
        textContent: template.textContent || '',
        variables: [...(template.variables || [])]
      })
      showEditModal.value = true
    }
    
    const deleteTemplate = async (template) => {
      if (!confirm('Are you sure you want to delete this template?')) return
      
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_URL}/email-templates/${template._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        await loadTemplates()
      } catch (error) {
        console.error('Error deleting template:', error)
        alert('Failed to delete template')
      }
    }
    
    const useTemplate = (template) => {
      router.push({
        name: 'CreateCampaign',
        query: { templateId: template._id }
      })
    }
    
    const addVariable = () => {
      templateForm.variables.push({
        name: '',
        label: '',
        type: 'text',
        defaultValue: '',
        required: false
      })
    }
    
    const removeVariable = (index) => {
      templateForm.variables.splice(index, 1)
    }
    
    const loadTemplateStarter = (starter) => {
      Object.assign(templateForm, {
        name: starter.name,
        description: starter.description,
        category: starter.category,
        htmlContent: starter.htmlContent,
        textContent: '',
        variables: [...starter.variables]
      })
    }
    
    const detectVariablesInHtml = () => {
      const htmlContent = templateForm.htmlContent
      if (!htmlContent) return
      
      // Find all variables in the format {{variable_name}}
      const variableRegex = /\{\{([^}]+)\}\}/g
      const foundVariables = new Set()
      let match
      
      while ((match = variableRegex.exec(htmlContent)) !== null) {
        const variableName = match[1].trim()
        if (variableName && !variableName.startsWith('style.')) {
          foundVariables.add(variableName)
        }
      }
      
      // Check which variables are not already in the form
      const existingVariableNames = templateForm.variables.map(v => v.name)
      const newVariables = Array.from(foundVariables).filter(name => !existingVariableNames.includes(name))
      
      // Add new variables to the form
      newVariables.forEach(name => {
        let label = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        let type = 'text'
        
        // Guess the type based on the variable name
        if (name.includes('url') || name.includes('link')) {
          type = 'url'
        } else if (name.includes('email')) {
          type = 'email'
        } else if (name.includes('year') || name.includes('count') || name.includes('number')) {
          type = 'number'
        }
        
        templateForm.variables.push({
          name: name,
          label: label,
          type: type,
          defaultValue: '',
          required: false
        })
      })
    }
    
    const validateHtmlContent = () => {
      const htmlContent = templateForm.htmlContent
      if (!htmlContent) return { isValid: true, errors: [] }
      
      const errors = []
      
      // Check for basic HTML structure
      if (!htmlContent.includes('<!DOCTYPE html>')) {
        errors.push('Consider adding DOCTYPE declaration for better email client compatibility')
      }
      
      if (!htmlContent.includes('<meta name="viewport"')) {
        errors.push('Add viewport meta tag for mobile responsiveness')
      }
      
      // Check for email-specific requirements
      if (!htmlContent.includes('{{unsubscribe_url}}')) {
        errors.push('Include an unsubscribe link ({{unsubscribe_url}}) for compliance')
      }
      
      if (!htmlContent.includes('max-width')) {
        errors.push('Consider setting max-width (600px recommended) for email containers')
      }
      
      // Check for potential issues
      if (htmlContent.includes('position: fixed') || htmlContent.includes('position: absolute')) {
        errors.push('Avoid fixed/absolute positioning - not supported in many email clients')
      }
      
      if (htmlContent.includes('background-image') && !htmlContent.includes('background-color')) {
        errors.push('Always include background-color fallback when using background-image')
      }
      
      validationResult.value = { isValid: errors.length === 0, errors }
      return validationResult.value
    }
    
    // Debounced function for live preview updates
    let previewUpdateTimeout = null
    const debouncedPreviewUpdate = () => {
      if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout)
      }
      previewUpdateTimeout = setTimeout(() => {
        // Auto-validate when content changes
        validateHtmlContent()
      }, 500)
    }
    
    const insertHtmlSnippet = (snippet) => {
      const textarea = document.querySelector('textarea[v-model="templateForm.htmlContent"]')
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = templateForm.htmlContent
        templateForm.htmlContent = text.substring(0, start) + snippet + text.substring(end)
        
        // Set cursor position after the inserted snippet
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + snippet.length, start + snippet.length)
        }, 0)
      }
    }
    
    const htmlSnippets = ref([
      {
        name: 'Button',
        code: '<a href="{{button_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">{{button_text}}</a>'
      },
      {
        name: 'Two Column Layout',
        code: `<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="50%" style="padding: 10px;">
      <h3>{{left_title}}</h3>
      <p>{{left_content}}</p>
    </td>
    <td width="50%" style="padding: 10px;">
      <h3>{{right_title}}</h3>
      <p>{{right_content}}</p>
    </td>
  </tr>
</table>`
      },
      {
        name: 'Image with Text',
        code: `<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="text-align: center; padding: 20px;">
      <img src="{{image_url}}" alt="{{image_alt}}" style="max-width: 100%; height: auto;" />
      <h3>{{image_title}}</h3>
      <p>{{image_description}}</p>
    </td>
  </tr>
</table>`
      }
    ])
    
    const toggleDropdown = (templateId) => {
      activeDropdown.value = activeDropdown.value === templateId ? null : templateId
    }
    
    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      Object.assign(templateForm, {
        id: null,
        name: '',
        description: '',
        category: '',
        htmlContent: '',
        textContent: '',
        variables: []
      })
    }
    
    const closePreview = () => {
      showPreviewModal.value = false
      previewContent.value = ''
    }
    
    const getCategoryLabel = (category) => {
      const categoryMap = {
        'newsletter': 'Newsletter',
        'promotional': 'Promotional',
        'transactional': 'Transactional',
        'welcome': 'Welcome',
        'abandoned-cart': 'Abandoned Cart',
        'other': 'Other'
      }
      return categoryMap[category] || category
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No date'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Invalid date'
        return date.toLocaleDateString()
      } catch (error) {
        return 'Invalid date'
      }
    }

    const sanitizeHtmlForPreview = (htmlContent) => {
      if (!htmlContent) return ''
      
      // Remove script tags and their content
      let sanitized = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      
      // Remove dangerous style content but preserve basic CSS styles
      // Only remove styles that contain javascript or expressions
      sanitized = sanitized.replace(/<style\b[^>]*>[\s\S]*?expression\s*\([\s\S]*?<\/style>/gi, '')
      sanitized = sanitized.replace(/<style\b[^>]*>[\s\S]*?javascript[\s\S]*?<\/style>/gi, '')
      
      // Remove all event handlers (onclick, onload, etc.)
      sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      
      // Remove javascript: URLs
      sanitized = sanitized.replace(/javascript:[^"']*/gi, '')
      
      // Remove any remaining script-related attributes
      sanitized = sanitized.replace(/\s*javascript\s*:/gi, '')
      
      // Remove meta tags that might cause issues
      sanitized = sanitized.replace(/<meta\b[^>]*>/gi, '')
      
      // Remove link tags that might load external scripts
      sanitized = sanitized.replace(/<link\b[^>]*>/gi, '')
      
      // Remove any data: URLs that might contain scripts
      sanitized = sanitized.replace(/data:[^"'\s>]*/gi, '#')
      
      // Replace template variables with realistic preview values instead of ugly badges
      const variableReplacements = {
        'company_name': 'Your Company',
        'email_subject': 'Sample Email Subject',
        'newsletter_title': 'Monthly Newsletter',
        'headline': 'Welcome to Our Newsletter!',
        'main_headline': 'Welcome to Our Newsletter!',
        'content': 'This is sample content to show how your email will look when sent to recipients.',
        'main_content': 'This is sample content to show how your email will look when sent to recipients.',
        'article_1_title': 'Article Title',
        'article_1_content': 'Article content here...',
        'article_1_url': '#',
        'article_2_title': 'Second Article Title',
        'article_2_content': 'Second article content here...',
        'article_2_url': '#',
        'promotion_title': 'Limited Time Sale!',
        'promotion_type': 'SPECIAL OFFER',
        'promotion_subtitle': 'Don\'t miss out on these amazing deals',
        'discount_amount': '50% OFF',
        'offer_description': 'Save big on all items',
        'offer_details': 'Valid until end of month. Terms and conditions apply.',
        'cta_text': 'Shop Now',
        'cta_url': '#',
        'shop_url': '#',
        'button_text': 'Click Here',
        'button_url': '#',
        'user_name': 'John Doe',
        'welcome_message': 'Thanks for joining our community!',
        'personal_message': 'We\'re excited to have you on board!',
        'step_1_description': 'Complete your profile',
        'step_2_description': 'Explore our features',
        'step_3_description': 'Start using the platform',
        'get_started_url': '#',
        'closing_message': 'If you have any questions, feel free to reach out to our support team.',
        'signature_name': 'The Team',
        'signature_title': 'Customer Success',
        'current_year': '2025',
        'company_address': '123 Main Street, City, State 12345',
        'company_phone': '(555) 123-4567',
        'company_email': 'hello@company.com',
        'unsubscribe_url': '#',
        'preferences_url': '#',
        'view_online_url': '#',
        'terms_conditions': 'Terms and conditions apply. See website for details.',
        'expiry_date': 'December 31, 2025'
      }
      
      // Replace variables with sample values from the form or defaults
      sanitized = sanitized.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        const cleanName = variableName.trim()
        
        // Check if this variable exists in the form with a default value
        const formVariable = templateForm.variables?.find(v => v.name === cleanName)
        if (formVariable && formVariable.defaultValue) {
          return formVariable.defaultValue
        }
        
        // Use predefined replacements
        if (variableReplacements[cleanName]) {
          return variableReplacements[cleanName]
        }
        
        // Return a styled placeholder for unknown variables
        return `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px; font-size: 11px; color: #92400e;">[${cleanName}]</span>`
      })
      
      // Disable all links by removing href attributes or replacing with #
      sanitized = sanitized.replace(/href\s*=\s*["'][^"']*["']/gi, 'href="#"')
      
      // Remove any potential XSS vectors
      sanitized = sanitized.replace(/<iframe\b[^>]*>/gi, '')
      sanitized = sanitized.replace(/<embed\b[^>]*>/gi, '')
      sanitized = sanitized.replace(/<object\b[^>]*>/gi, '')
      sanitized = sanitized.replace(/<applet\b[^>]*>/gi, '')
      
      // Wrap in a basic HTML structure for better preview
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              margin: 0; 
              padding: 10px; 
              font-family: Arial, sans-serif; 
              background: white;
              overflow-x: hidden;
            }
            * { 
              max-width: 100% !important; 
              box-sizing: border-box !important;
            }
            img { 
              max-width: 100% !important; 
              height: auto !important; 
            }
            table {
              border-collapse: collapse !important;
            }
            .container {
              max-width: 600px !important;
              margin: 0 auto !important;
            }
          </style>
        </head>
        <body>${sanitized}</body>
        </html>
      `
    }

    const disableLinksInIframe = (event) => {
      try {
        const iframe = event.target
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        
        // Disable all links
        const links = iframeDoc.querySelectorAll('a')
        links.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            return false
          })
          link.style.cursor = 'default'
        })
        
        // Disable forms
        const forms = iframeDoc.querySelectorAll('form')
        forms.forEach(form => {
          form.addEventListener('submit', (e) => {
            e.preventDefault()
            e.stopPropagation()
            return false
          })
        })
      } catch (error) {
        // Silently handle cross-origin errors
        console.debug('Could not access iframe content:', error)
      }
    }

    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      activeDropdown.value = null
    }
    
    // Watchers
    watch([() => filters.search, () => filters.category, () => filters.isDefault], () => {
      if (currentPage.value === 1) {
        loadTemplates()
      } else {
        loadTemplates(1)
      }
    }, { debounce: 300 })
    
    // Lifecycle
    onMounted(() => {
      loadTemplates()
      document.addEventListener('click', handleClickOutside)
    })
    
    return {
      // State
      loading,
      saving,
      templates,
      totalPages,
      currentPage,
      activeDropdown,
      validationResult,
      
      // Modals
      showCreateModal,
      showEditModal,
      showPreviewModal,
      previewContent,
      
      // Filters & Form
      filters,
      templateForm,
      templateStarters,
      htmlSnippets,
      
      // Methods
      loadTemplates,
      saveTemplate,
      previewTemplate,
      duplicateTemplate,
      editTemplate,
      deleteTemplate,
      useTemplate,
      addVariable,
      removeVariable,
      loadTemplateStarter,
      detectVariablesInHtml,
      validateHtmlContent,
      debouncedPreviewUpdate,
      insertHtmlSnippet,
      toggleDropdown,
      closeModals,
      closePreview,
      getCategoryLabel,
      formatDate,
      sanitizeHtmlForPreview,
      disableLinksInIframe
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>