<!-- src/layout/AdminLayout.vue -->
<template>
  <div class="min-h-screen h-screen flex flex-col">
    <AdminNavbar />

    <main class="flex-grow w-full">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AdminNavbar from "./Admin-Navbar.vue";
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { locale } = useI18n();
const currentLocale = ref(locale.value);

const changeLanguage = (event) => {
  locale.value = event.target.value;
};
</script>

<style scoped>
/* Additional custom styles for enhanced layout */
</style>