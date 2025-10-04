// export const API_URL = 'http://192.168.88.55:3000'; 

// Automatically detect the appropriate API URL
const getApiUrl = () => {
  // If we're running on localhost, use localhost for API
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // If we're accessing via network IP, use the network IP for API
  else {
    return 'http://172.25.175.149:3000';
  }
};

export const API_URL = getApiUrl(); 