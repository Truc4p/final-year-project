<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">⚙️ Audience Builder</h1>
      <p class="text-gray-600">Create custom audience segments with rules</p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Audience Name</label>
        <input
          type="text"
          v-model="audienceName"
          placeholder="e.g., High-Value Cart Abandoners"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          v-model="audienceDescription"
          placeholder="Describe this audience..."
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="text-center py-12 text-gray-500">
        <div class="text-4xl mb-4">🚧</div>
        <p>Audience builder interface will be implemented here</p>
        <p class="text-sm mt-2">Add rules, conditions, and time windows</p>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <router-link
          to="/admin/retargeting/audiences"
          class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </router-link>
        <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Create Audience
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const audienceName = ref('');
const audienceDescription = ref('');
</script>
