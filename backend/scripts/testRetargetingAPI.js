/**
 * Test Retargeting Ads API
 * 
 * Quick test to verify retargeting ads endpoints are working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Sample auth token - replace with actual token
let authToken = 'your_jwt_token_here';

async function testRetargetingAPI() {
  console.log('🧪 Testing Retargeting Ads API\n');
  
  try {
    // Test 1: Get tracking pixels (public - no auth)
    console.log('1️⃣  Testing: GET /api/marketing/pixels');
    const pixelsResponse = await axios.get(`${BASE_URL}/api/marketing/pixels`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Success:', pixelsResponse.data.pixels.length, 'pixels found\n');
    
    // Test 2: Get pixel script (public)
    console.log('2️⃣  Testing: GET /api/marketing/tracking/pixel.js');
    const scriptResponse = await axios.get(`${BASE_URL}/api/marketing/tracking/pixel.js?id=test`);
    console.log('✅ Success: Pixel script loaded\n');
    
    // Test 3: Get audiences
    console.log('3️⃣  Testing: GET /api/marketing/audiences');
    const audiencesResponse = await axios.get(`${BASE_URL}/api/marketing/audiences`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Success:', audiencesResponse.data.audiences.length, 'audiences found\n');
    
    // Test 4: Get campaigns
    console.log('4️⃣  Testing: GET /api/marketing/campaigns');
    const campaignsResponse = await axios.get(`${BASE_URL}/api/marketing/campaigns`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Success:', campaignsResponse.data.campaigns.length, 'campaigns found\n');
    
    // Test 5: Get dashboard analytics
    console.log('5️⃣  Testing: GET /api/marketing/analytics/dashboard');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/marketing/analytics/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      params: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      }
    });
    console.log('✅ Success: Dashboard data loaded');
    console.log('   - Active Campaigns:', dashboardResponse.data.summary.activeCampaigns);
    console.log('   - Active Audiences:', dashboardResponse.data.summary.activeAudiences);
    console.log('   - Total Spend:', dashboardResponse.data.summary.metrics.totalSpend);
    console.log('   - Total Revenue:', dashboardResponse.data.summary.metrics.totalRevenue);
    console.log();
    
    // Test 6: Track event (public - no auth)
    console.log('6️⃣  Testing: POST /api/marketing/tracking/event');
    const trackingData = {
      pixelId: 'test_pixel_id',
      eventType: 'page_view',
      visitorId: 'test_visitor_123',
      sessionId: 'test_session_456',
      data: {
        url: 'https://example.com/test',
        referrer: 'https://google.com'
      }
    };
    
    try {
      const trackResponse = await axios.post(
        `${BASE_URL}/api/marketing/tracking/event`,
        trackingData
      );
      console.log('✅ Success: Event tracked\n');
    } catch (trackError) {
      console.log('⚠️  Expected error (pixel not found):', trackError.response?.data?.message || trackError.message);
      console.log();
    }
    
    console.log('🎉 All tests completed!\n');
    console.log('📖 For full API documentation, see RETARGETING_ADS_SETUP.md\n');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
      console.error('   Make sure the server is running on', BASE_URL);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running\n');
    return true;
  } catch (error) {
    console.error('❌ Server is not running on', BASE_URL);
    console.error('   Please start the server first: npm start\n');
    return false;
  }
}

// Main
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testRetargetingAPI();
  }
  process.exit(0);
})();
