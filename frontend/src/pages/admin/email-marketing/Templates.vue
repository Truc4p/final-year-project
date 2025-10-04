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
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
          class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <!-- Template Preview -->
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
              <iframe
                :srcdoc="template.htmlContent"
                class="w-full h-full transform scale-50 origin-top-left"
                style="width: 200%; height: 200%;"
                sandbox="allow-same-origin"
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
                  @click="toggleDropdown(template._id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div
                  v-if="activeDropdown === template._id"
                  class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10"
                >
                  <div class="py-1">
                    <button
                      @click="editTemplate(template)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Template
                    </button>
                    <button
                      @click="useTemplate(template)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Use in Campaign
                    </button>
                    <hr class="my-1">
                    <button
                      v-if="!template.isDefault"
                      @click="deleteTemplate(template)"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Template
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
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

            <!-- Template Content -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">HTML Content *</label>
              <textarea
                v-model="templateForm.htmlContent"
                rows="15"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter HTML content with variables like {{variable_name}}"
              ></textarea>
            </div>

            <!-- Template Variables -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-sm font-medium text-gray-700">Template Variables</label>
                <button
                  type="button"
                  @click="addVariable"
                  class="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Variable
                </button>
              </div>
              
              <div class="space-y-3">
                <div
                  v-for="(variable, index) in templateForm.variables"
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-md"
                >
                  <input
                    v-model="variable.name"
                    placeholder="Variable name"
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
                  <button
                    type="button"
                    @click="removeVariable(index)"
                    class="px-3 py-2 text-red-600 hover:text-red-700"
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
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
              :srcdoc="previewContent"
              class="w-full h-96"
              sandbox="allow-same-origin"
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
          variables: template.variables.reduce((acc, variable) => {
            acc[variable.name] = variable.defaultValue || `[${variable.label}]`
            return acc
          }, {})
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        previewContent.value = response.data.htmlContent
        showPreviewModal.value = true
      } catch (error) {
        console.error('Error previewing template:', error)
        alert('Failed to generate preview')
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

    return {
      templates,
      loading,
      saving,
      totalPages,
      currentPage,
      activeDropdown,
      showCreateModal,
      showEditModal,
      showPreviewModal,
      previewContent,
      templateForm,
      filters,
      loadTemplates,
      saveTemplate,
      previewTemplate,
      duplicateTemplate,
      editTemplate,
      deleteTemplate,
      useTemplate,
      addVariable,
      removeVariable,
      toggleDropdown,
      closeModals,
      closePreview,
      getCategoryLabel,
      formatDate
    }    // Close dropdown when clicking outside
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
      
      // Modals
      showCreateModal,
      showEditModal,
      showPreviewModal,
      previewContent,
      
      // Filters & Form
      filters,
      templateForm,
      
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
      toggleDropdown,
      closeModals,
      closePreview,
      getCategoryLabel
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