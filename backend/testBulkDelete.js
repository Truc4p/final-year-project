const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';

async function testBulkDelete() {
  try {
    // First, let's add a test subscriber
    console.log('Adding test subscriber...');
    const addResponse = await axios.post(`${API_URL}/newsletter/subscribe`, {
      email: 'test-bulk-delete@example.com',
      source: 'manual',
      preferences: {
        newProducts: true,
        promotions: false,
        newsletter: true
      }
    });
    
    console.log('Test subscriber added:', addResponse.data);
    
    // Get the subscriber ID
    const listResponse = await axios.get(`${API_URL}/newsletter/subscriptions`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-admin-token'}`
      }
    });
    
    const testSubscriber = listResponse.data.data.subscriptions.find(sub => 
      sub.email === 'test-bulk-delete@example.com'
    );
    
    if (!testSubscriber) {
      console.log('Test subscriber not found in list');
      return;
    }
    
    console.log('Found test subscriber:', testSubscriber._id);
    
    // Test bulk delete
    console.log('Testing bulk delete...');
    const deleteResponse = await axios.post(`${API_URL}/newsletter/subscriptions/bulk`, {
      operation: 'delete',
      subscriptionIds: [testSubscriber._id]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-admin-token'}`
      }
    });
    
    console.log('Bulk delete response:', deleteResponse.data);
    
    // Verify deletion
    const verifyResponse = await axios.get(`${API_URL}/newsletter/subscriptions`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-admin-token'}`
      }
    });
    
    const deletedSubscriber = verifyResponse.data.data.subscriptions.find(sub => 
      sub.email === 'test-bulk-delete@example.com'
    );
    
    if (deletedSubscriber) {
      console.log('❌ ERROR: Subscriber was not deleted!');
    } else {
      console.log('✅ SUCCESS: Subscriber was successfully deleted!');
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testBulkDelete();