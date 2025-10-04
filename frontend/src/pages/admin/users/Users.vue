<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import AdminChatWidget from '../../../components/AdminChatWidget.vue';

const { t } = useI18n();
const router = useRouter();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Computed property for filtered users
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    (user.username || user.name || '').toLowerCase().includes(query) ||
    (user.email || '').toLowerCase().includes(query) ||
    (user.phone || '').toLowerCase().includes(query) ||
    (user.address || '').toLowerCase().includes(query)
  );
});

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You need to login first");
    router.push("/login");
    return;
  }

  try {
    // Make the api request with axios with token in header
    const res = await axios.get(`${API_URL}/users`, {
      headers: {
        "x-auth-token": `${token}`,
      },
    });

    console.log("Users response:", res.data);
    users.value = res.data;
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = "Failed to load users";
  } finally {
    loading.value = false;
  }
});

const getUserInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};

const getUserStatus = (user) => {
  if (user.isActive === false) return 'Inactive';
  if (user.isVerified === false) return 'Unverified';
  return 'Active';
};

const getUserStatusColor = (user) => {
  if (user.isActive === false) return 'bg-error text-white';
  if (user.isVerified === false) return 'bg-warning text-white';
  return 'bg-green-100 text-success';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <div class="page-background min-h-screen">
    <!-- Header and Action Bar in Container -->
    <div class="container mx-auto px-4 mb-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-primary-600 mb-2">User Management</h1>
        <p class="text-secondary-700 text-lg">Manage registered users and their information</p>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Search Bar -->
        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name, email, or phone..."
              class="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 transition-colors duration-200"
            />
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div class="flex items-center gap-6 text-secondary-500">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="font-medium">{{ filteredUsers.length }} Users</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-medium">{{ users.filter(u => u.isActive !== false).length }} Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Width Content Area -->
    <div class="w-full px-10">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto">
        <div class="card p-8 text-center">
          <div class="text-error text-lg font-medium mb-2">{{ error }}</div>
          <p class="text-secondary-500">Please try refreshing the page</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="users.length === 0" class="max-w-4xl mx-auto">
        <div class="card p-12 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">No Users Found</h3>
          <p class="text-secondary-500 mb-6">Users will appear here once they register</p>
        </div>
      </div>

      <!-- No Search Results -->
      <div v-else-if="filteredUsers.length === 0" class="max-w-4xl mx-auto">
        <div class="card p-12 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-700 mb-2">No Users Match Your Search</h3>
          <p class="text-secondary-500 mb-6">Try adjusting your search terms or clear the search to see all users</p>
          <button @click="searchQuery = ''" class="btn btn-secondary">
            Clear Search
          </button>
        </div>
      </div>

      <!-- Full Width Users Table -->
      <div v-else class="w-full">
        <div class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-secondary-100">
              <thead style="background-color: #f8fafc">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-secondary-100">
                <tr v-for="user in filteredUsers" :key="user._id" 
                    class="hover:bg-secondary-50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="ml-4">
                        <div class="text-base font-medium text-secondary-700">
                          {{ user.username || user.name || 'Unknown User' }}
                        </div>
                        <div class="text-base text-secondary-500">
                          ID: #{{ user._id.slice(-6).toUpperCase() }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-base text-secondary-700">{{ user.email || 'No email' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-base text-secondary-700">{{ user.phone || 'No phone' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-base text-secondary-700 max-w-xs truncate" :title="user.address">
                      {{ user.address || 'No address' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getUserStatusColor(user)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ getUserStatus(user) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-base text-secondary-700">
                      {{ formatDate(user.createdAt || user.joinedAt) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <AdminChatWidget />
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.3s ease-out;
}
</style>