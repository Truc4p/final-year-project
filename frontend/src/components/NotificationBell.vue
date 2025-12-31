<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { notificationStore } from '../stores/notificationStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const showDropdown = ref(false);
const dropdownRef = ref(null);

// Computed properties
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnread = computed(() => notificationStore.unreadCount > 0);

// Toggle dropdown
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

// Mark notification as read and navigate to order
const handleNotificationClick = (notification) => {
  console.log('🔔 Notification clicked:', notification);
  
  notificationStore.markAsRead(notification.id);
  
  if (notification.type === 'order' && notification.orderId) {
    const orderPath = `/admin/orders/order/${notification.orderId}`;
    console.log('🔔 Navigating to:', orderPath);
    
    router.push(orderPath).then(() => {
      console.log('✅ Navigation successful');
      showDropdown.value = false;
    }).catch(err => {
      console.error('❌ Navigation failed:', err);
    });
  }
};

// Mark all as read
const markAllAsRead = () => {
  notificationStore.markAllAsRead();
};

// Clear all notifications
const clearAll = () => {
  notificationStore.clearAll();
  showDropdown.value = false;
};

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Initialize WebSocket connection
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    notificationStore.connectWebSocket(token);
    notificationStore.requestNotificationPermission();
  }
  
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="notification-bell" ref="dropdownRef">
    <!-- Bell Icon Button -->
    <button 
      @click="toggleDropdown" 
      class="bell-button"
      :class="{ 'has-unread': hasUnread }"
      aria-label="Notifications"
    >
      <svg class="bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="hasUnread" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Dropdown -->
    <transition name="dropdown">
      <div v-if="showDropdown" class="notification-dropdown">
        <!-- Header -->
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <div class="header-actions">
            <button v-if="notifications.length > 0" @click="markAllAsRead" class="action-btn" title="Mark all as read">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button v-if="notifications.length > 0" @click="clearAll" class="action-btn" title="Clear all">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="notifications-list">
          <div v-if="notifications.length === 0" class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications</p>
          </div>

          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
          >
            <div class="notification-icon" :class="`type-${notification.type}`">
              <svg v-if="notification.type === 'order'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div v-if="notification.products && notification.products.length > 0" class="notification-details">
                <span class="product-count">{{ notification.products.length }} item(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #4a5568;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.bell-button:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.bell-button.has-unread {
  color: #c97f98;
}

.bell-button.has-unread:hover {
  color: #9b4d6b;
}

.bell-icon {
  width: 24px;
  height: 24px;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #718096;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.notifications-list {
  overflow-y: auto;
  max-height: 420px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f7fafc;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f7fafc;
}

.notification-item.unread {
  background-color: #fef5f8;
}

.notification-item.unread:hover {
  background-color: #fdedf2;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.notification-icon.type-order {
  background: #e0f2fe;
  color: #0284c7;
}

.notification-icon svg {
  width: 20px;
  height: 20px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.notification-time {
  font-size: 12px;
  color: #a0aec0;
  white-space: nowrap;
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.4;
}

.notification-details {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #718096;
}

.product-count {
  background: #f7fafc;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 640px) {
  .notification-dropdown {
    position: fixed;
    top: 60px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>
