import axios from 'axios'

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for AI responses
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token and fix API paths
api.interceptors.request.use(
  (config) => {
    // Add /api prefix for AI dermatology expert endpoints
    if (config.url?.startsWith('/ai-dermatology-expert')) {
      config.url = '/api' + config.url
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AI Dermatology Expert services
export const aiDermatologyService = {
  async chat(message, conversationHistory = []) {
    const response = await api.post('/api/ai-dermatology-expert/chat', {
      message,
      conversationHistory
    })
    return response.data
  },

  async analyzeSkinImage(imageFile, message, conversationHistory = []) {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('message', message || 'Analyze this skin image')
    formData.append('conversationHistory', JSON.stringify(conversationHistory))

    const response = await api.post('/api/ai-dermatology-expert/analyze-skin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async transcribeAudio(audioFile) {
    const formData = new FormData()
    formData.append('audio', audioFile)

    const response = await api.post('/api/ai-dermatology-expert/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async textToSpeech(text) {
    const response = await api.post('/api/ai-dermatology-expert/text-to-speech', { text })
    return response.data
  }
}

export default api
