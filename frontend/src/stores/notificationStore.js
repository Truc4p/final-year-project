// Notification store with WebSocket support for real-time admin notifications

import { reactive } from 'vue';

export const notificationStore = reactive({
  // WebSocket connection
  ws: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: null,
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // Connect to WebSocket for admin notifications
  connectWebSocket(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔔 Notification WebSocket already connected');
      return;
    }

    if (!token) {
      console.error('🔔 Cannot connect notification WebSocket - no token provided');
      return;
    }

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔔 Notification WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Register as admin
        this.registerAdmin(token);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('🔔 Error parsing notification message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('🔔 Notification WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('🔔 Notification WebSocket disconnected');
        this.isConnected = false;
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔔 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          this.reconnectInterval = setTimeout(() => {
            this.connectWebSocket(token);
          }, 3000 * this.reconnectAttempts);
        }
      };
    } catch (error) {
      console.error('🔔 Error connecting notification WebSocket:', error);
    }
  },
  
  // Register as admin with the WebSocket server
  registerAdmin(token) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('🔔 Cannot register admin - WebSocket not connected');
      return;
    }

    try {
      // Decode token to get user ID
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decoded = JSON.parse(atob(paddedPayload));
      
      if (!decoded.user || !decoded.user.id) {
        throw new Error('Token missing user ID');
      }
      
      console.log('🔔 Registering admin for notifications:', decoded.user.id);
      
      this.ws.send(JSON.stringify({
        type: 'register_admin',
        userId: decoded.user.id,
        token: token
      }));
    } catch (error) {
      console.error('🔔 Error registering admin:', error);
    }
  },
  
  // Handle incoming WebSocket messages
  handleMessage(data) {
    console.log('🔔 Received notification message:', data);
    
    switch (data.type) {
      case 'admin_registered':
        console.log('✅ Admin registered for notifications');
        break;
        
      case 'new_order':
        this.handleNewOrderNotification(data);
        break;
        
      case 'error':
        console.error('🔔 Notification error:', data.message);
        break;
        
      default:
        console.log('🔔 Unknown notification type:', data.type);
    }
  },
  
  // Handle new order notifications
  handleNewOrderNotification(data) {
    console.log('🛒 New order notification received:', data);
    
    const notification = {
      id: `order-${data.orderId}-${Date.now()}`,
      type: 'order',
      title: 'New Order Received',
      message: `${data.customerName} placed an order worth $${data.totalPrice.toFixed(2)}`,
      orderId: data.orderId,
      customerName: data.customerName,
      totalPrice: data.totalPrice,
      products: data.products,
      timestamp: data.timestamp || new Date().toISOString(),
      read: false
    };
    
    // Add to notifications array (newest first)
    this.notifications.unshift(notification);
    
    // Increment unread count
    this.unreadCount++;
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
    
    // Play notification sound (optional)
    this.playNotificationSound();
  },
  
  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });
    }
  },
  
  // Play notification sound
  playNotificationSound() {
    // Optional: Add a notification sound file to public/notification.mp3
    // For now, we'll skip the sound to avoid errors
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if sound file doesn't exist
      });
    } catch (error) {
      // Silently fail if audio not supported
    }
  },
  
  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  },
  
  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  },
  
  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
  },
  
  // Clear a specific notification
  clearNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = this.notifications[index];
      if (!notification.read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(index, 1);
    }
  },
  
  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
  },
  
  // Disconnect WebSocket
  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
    console.log('🔔 Notification WebSocket disconnected');
  }
});
