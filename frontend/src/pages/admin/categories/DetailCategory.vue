<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Category Details</h2>
      <div v-if="category">
        <p><strong>ID:</strong> {{ category._id }}</p>
        <p><strong>Name:</strong> {{ category.name }}</p>
        <!-- Add more fields as needed -->
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
      <AdminChatWidget />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRoute } from 'vue-router';
  import { API_URL } from '../../../utils/config';
  import AdminChatWidget from '../../../components/AdminChatWidget.vue';

  const category = ref(null);
  const route = useRoute();
  
  onMounted(async () => {
    const categoryId = route.params.id;
    console.log('Fetching category with ID:', categoryId); // Debugging log
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      console.log('API response:', response.data); // Debugging log
      category.value = response.data;
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>