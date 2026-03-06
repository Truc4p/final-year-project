// src/utils/auth.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get user role from localStorage (cached value for UX)
 * NOTE: This is NOT secure! Only use for UI display. 
 * Backend must verify all permissions via JWT token.
 */
export function getUserRole() {
    return localStorage.getItem("role");
}

/**
 * Check if user is admin or staff based on cached role
 * NOTE: This is NOT secure! Only use for UI display.
 * Backend must verify all permissions via JWT token.
 */
export function isAdmin() {
    const role = getUserRole();
    return role === 'admin' || role === 'staff';
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken() {
    return localStorage.getItem("token");
}

/**
 * Check if token exists and is not expired
 * NOTE: This only checks token expiry, not validity. 
 * Backend verifies the actual token signature.
 */
export function isAuthenticated() {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return tokenPayload.exp > currentTime;
    } catch (error) {
        return false;
    }
}

/**
 * Fetch current user info from backend (SECURE - verified by JWT)
 * This is the source of truth for user information.
 * Use this to verify user identity and permissions.
 */
export async function fetchCurrentUser() {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token');
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Update localStorage cache for UX
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('username', response.data.username);
        
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        throw error;
    }
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
}