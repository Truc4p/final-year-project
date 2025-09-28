// Simple reactive livestream store for demo purposes
// In a real application, this would be replaced with WebSocket/Socket.io or API calls

import { reactive } from 'vue'

export const livestreamStore = reactive({
  // Admin stream state
  isAdminStreaming: false,
  adminStreamData: {
    title: '',
    description: '',
    startTime: null,
    viewerCount: 0,
    likes: 0,
    streamUrl: '', // In real app, this would be the actual stream URL
    quality: '720p'
  },
  
  // Chat messages shared between admin and customers
  chatMessages: [],
  
  // Methods to update stream state
  startAdminStream(streamData) {
    this.isAdminStreaming = true
    this.adminStreamData = {
      ...this.adminStreamData,
      ...streamData,
      startTime: new Date()
    }
    console.log('Admin stream started:', this.adminStreamData)
  },
  
  stopAdminStream() {
    this.isAdminStreaming = false
    this.adminStreamData.startTime = null
    console.log('Admin stream stopped')
  },
  
  updateViewerCount(count) {
    this.adminStreamData.viewerCount = count
  },
  
  updateLikes(likes) {
    this.adminStreamData.likes = likes
  },
  
  addChatMessage(message) {
    this.chatMessages.push(message)
    
    // Keep only last 50 messages for performance
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50)
    }
  },
  
  clearChatMessages() {
    this.chatMessages = []
  }
})