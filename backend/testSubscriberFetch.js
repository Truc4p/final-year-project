const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';

async function testSubscriberFetch() {
  try {
    console.log('Testing subscriber fetch...');
    
    // Test getting subscribers (you may need to replace with a valid admin token)
    const response = await axios.get(`${API_URL}/newsletter/subscriptions?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-admin-token'}`
      }
    });
    
    console.log('API Response status:', response.status);
    console.log('Number of subscribers returned:', response.data.data.subscriptions.length);
    
    // Check the first subscriber to see if isActive field is included
    if (response.data.data.subscriptions.length > 0) {
      const firstSubscriber = response.data.data.subscriptions[0];
      console.log('\nFirst subscriber data:');
      console.log('Email:', firstSubscriber.email);
      console.log('isActive field present:', 'isActive' in firstSubscriber);
      console.log('isActive value:', firstSubscriber.isActive);
      console.log('Full subscriber object:', JSON.stringify(firstSubscriber, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Note: You may need to provide a valid admin token in the TEST_TOKEN environment variable');
      console.log('Or test directly in the frontend after logging in as admin');
    }
  }
}

testSubscriberFetch();