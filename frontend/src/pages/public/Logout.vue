<!-- src/pages/Logout.vue -->

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem('token'); // Remove token from local storage
  localStorage.removeItem('username'); // Remove username from local storage
  router.push('/login'); // Redirect to login page
};

handleLogout();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Logging out...</h1>
  </div>
</template>