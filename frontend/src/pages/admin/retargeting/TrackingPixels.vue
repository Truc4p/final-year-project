<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🔍 Tracking Pixels</h1>
      <p class="text-gray-600">Manage tracking pixels to monitor visitor behavior across your website</p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Your Tracking Pixels</h2>
        <button
          @click="createPixel"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Pixel
        </button>
      </div>

      <div v-if="pixels.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Tracking Pixels Yet</h3>
        <p class="text-gray-600 mb-4">Create your first tracking pixel to start monitoring visitor behavior</p>
        <button
          @click="createPixel"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create First Pixel
        </button>
      </div>

      <div v-else class="space-y-4">
        <div v-for="pixel in pixels" :key="pixel._id" class="border rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900">{{ pixel.name }}</h3>
              <p class="text-sm text-gray-600">Pixel ID: {{ pixel.pixelId }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ pixel.eventsTracked?.toLocaleString() || 0 }} events tracked</p>
            </div>
            <button
              @click="showInstallCode(pixel)"
              class="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
            >
              Get Install Code
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Installation Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showModal = false">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" @click.stop>
        <h3 class="text-xl font-semibold mb-4">Installation Code</h3>
        <p class="text-sm text-gray-600 mb-4">Copy and paste this code into the &lt;head&gt; section of your website:</p>
        <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">{{ installCode }}</pre>
        <div class="mt-4 flex justify-end space-x-3">
          <button @click="showModal = false" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Close
          </button>
          <button @click="copyCode" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Copy Code
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const pixels = ref([]);
const showModal = ref(false);
const installCode = ref('');

onMounted(() => {
  loadPixels();
});

const loadPixels = async () => {
  // TODO: Implement API call
  pixels.value = [];
};

const createPixel = async () => {
  // TODO: Implement pixel creation
  alert('Pixel creation will be implemented');
};

const showInstallCode = (pixel) => {
  installCode.value = `<!-- Retargeting Pixel: ${pixel.name} -->
<script>
(function() {
  var pixelId = '${pixel.pixelId}';
  // Pixel code will be loaded here
})();
<\/script>`;
  showModal.value = true;
};

const copyCode = () => {
  navigator.clipboard.writeText(installCode.value);
  alert('Code copied to clipboard!');
};
</script>
