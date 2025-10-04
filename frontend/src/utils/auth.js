// src/utils/auth.js
export function getUserRole() {
    return localStorage.getItem("role");
}

export function isAdmin() {
    const role = getUserRole();
    return role === 'admin' || role === 'staff';
}

export function getAuthToken() {
    return localStorage.getItem("token");
}

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