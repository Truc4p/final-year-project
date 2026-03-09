// Use VITE_API_URL env variable in production, fall back to localhost for dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
