# Retargeting/Display Ads Management Implementation 🎯

## Overview
Complete implementation of retargeting and display ads management system with pixel tracking, audience segmentation, campaign builder, budget management, platform integrations (Google Ads & Facebook Ads), creative management, and ROI tracking.

---

## 📁 Project Structure

```
backend/
├── models/marketing/
│   ├── TrackingPixel.js         # Tracking pixel configuration
│   ├── TrackingEvent.js         # Visitor events and tracking data
│   ├── Audience.js              # Audience segments
│   ├── AdCampaign.js            # Ad campaign management
│   ├── AdCreative.js            # Ad creative assets
│   ├── AdBudget.js              # Budget management
│   ├── AdPlatformConnection.js  # Platform integrations
│   └── AdPerformance.js         # Performance metrics
│
├── services/
│   ├── trackingPixelService.js           # Pixel tracking logic
│   ├── audienceSegmentationService.js    # Audience building
│   ├── googleAdsService.js               # Google Ads API
│   └── facebookAdsService.js             # Facebook Ads API
│
├── controllers/marketing/
│   ├── trackingPixelController.js   # Pixel management
│   ├── audienceController.js        # Audience operations
│   ├── adCampaignController.js      # Campaign management
│   ├── adPlatformController.js      # Platform connections
│   └── adAnalyticsController.js     # Analytics & reporting
│
└── routes/marketing/
    └── retargetingRoutes.js        # All retargeting endpoints
```

---

## 🚀 Features Implemented

### 1. Pixel Tracking Setup ✅
- **Tracking Pixel Model**: Store pixel configurations with customizable event types
- **Dynamic Pixel Script**: JavaScript snippet generator for website integration
- **Event Tracking**: Capture page views, product views, add to cart, cart abandonment, purchases
- **Visitor Identification**: Cookie-based visitor and session tracking
- **Geo-location**: IP-based country and city detection
- **Device Detection**: Browser, OS, and device type identification

**Usage:**
```javascript
// Create tracking pixel
POST /api/marketing/pixels
{
  "name": "Main Website Pixel",
  "eventTypes": ["page_view", "product_view", "add_to_cart", "cart_abandon", "purchase"],
  "domains": ["example.com"]
}

// Get installation code
GET /api/marketing/pixels/:id
// Returns JavaScript code to paste on website
```

### 2. Audience Segmentation 🎯
- **Cart Abandoners**: Identify users who added items but didn't purchase
- **Product Viewers**: Segment users who viewed specific products
- **Purchasers**: Track recent buyers for upsell/cross-sell
- **Lookalike Audiences**: Find similar users based on seed audience
- **Custom Rules**: Build audiences with flexible conditions
- **Real-time Updates**: Automatic audience refresh on schedule
- **Platform Sync**: Export audiences to Google Ads & Facebook Ads

**Predefined Audiences:**
```javascript
// Cart abandoners
POST /api/marketing/audiences/cart-abandoners
{
  "name": "High-Value Cart Abandoners",
  "timeWindow": { "value": 7, "unit": "days" },
  "minCartValue": 100000
}

// Product viewers
POST /api/marketing/audiences/product-viewers
{
  "name": "iPhone Viewers",
  "productIds": ["product_id_1", "product_id_2"],
  "timeWindow": { "value": 14, "unit": "days" },
  "minViews": 2
}

// Purchasers
POST /api/marketing/audiences/purchasers
{
  "name": "VIP Customers",
  "timeWindow": { "value": 30, "unit": "days" },
  "minOrderValue": 500000
}

// Lookalike
POST /api/marketing/audiences/lookalike
{
  "sourceAudienceId": "audience_id",
  "similarityScore": 7
}
```

### 3. Ad Campaign Builder 📢
- **Campaign Management**: Create, update, pause, resume, delete campaigns
- **Multi-Platform Support**: Google Ads, Facebook Ads, Instagram, TikTok, LinkedIn
- **Objective Selection**: Brand awareness, traffic, conversions, etc.
- **Scheduling**: Start/end dates, day parting
- **Targeting**: Demographics, locations, interests, behaviors, devices
- **Budget Integration**: Link campaigns to budget controls

**Create Campaign:**
```javascript
POST /api/marketing/campaigns
{
  "name": "Summer Sale Campaign",
  "objective": "conversions",
  "status": "draft",
  "targetAudiences": ["audience_id_1", "audience_id_2"],
  "platforms": [
    { "platform": "google_ads" },
    { "platform": "facebook_ads" }
  ],
  "schedule": {
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "budgetData": {
    "name": "Summer Sale Budget",
    "budgetType": "daily",
    "amount": 1000000,
    "currency": "VND"
  },
  "bidding": {
    "strategy": "cpc",
    "amount": 5000
  },
  "targeting": {
    "locations": [
      { "country": "VN", "city": "Ho Chi Minh" }
    ],
    "demographics": {
      "ageMin": 18,
      "ageMax": 45,
      "genders": ["all"]
    },
    "deviceTypes": ["mobile", "desktop"]
  }
}
```

### 4. Budget Management 💰
- **Budget Types**: Daily, lifetime, monthly
- **Multi-Platform Allocation**: Distribute budget across platforms
- **Spend Tracking**: Real-time spend monitoring
- **Alert Thresholds**: Notifications at 50%, 75%, 90%, 100%
- **Pacing Control**: Standard vs accelerated delivery
- **Spend History**: Track spend over time
- **Budget Utilization Reports**: Monitor budget efficiency

**Budget Operations:**
```javascript
// Create budget
POST /api/marketing/budgets
{
  "name": "Q2 Ad Budget",
  "budgetType": "monthly",
  "amount": 30000000,
  "currency": "VND",
  "pacing": "standard",
  "alerts": {
    "enabled": true,
    "thresholds": [
      { "percentage": 50 },
      { "percentage": 75 },
      { "percentage": 90 }
    ]
  },
  "period": {
    "startDate": "2026-04-01",
    "endDate": "2026-06-30"
  }
}

// Record spend
POST /api/marketing/budgets/:id/spend
{
  "amount": 150000,
  "platform": "google_ads",
  "campaignId": "campaign_id"
}
```

### 5. Platform Integrations 🔗

#### Google Ads Integration
- Create campaigns, ad groups, responsive search ads
- Audience/customer list management
- Performance data sync
- Budget and bidding strategy support
- OAuth2 authentication

#### Facebook Ads Integration
- Campaign, ad set, and ad creation
- Custom audience management
- Creative formats: Image, video, carousel
- Detailed targeting options
- Insights and metrics retrieval

**Setup Platform Connection:**
```javascript
POST /api/marketing/platforms
{
  "platform": "google_ads",
  "name": "Main Google Ads Account",
  "credentials": {
    "accessToken": "encrypted_token",
    "refreshToken": "encrypted_token",
    "customerId": "1234567890",
    "expiresAt": "2026-12-31T23:59:59Z"
  },
  "settings": {
    "autoSync": true,
    "syncFrequency": "hourly",
    "syncCampaigns": true,
    "syncAudiences": true,
    "syncPerformance": true
  }
}

// Test connection
POST /api/marketing/platforms/:id/test

// Sync data
POST /api/marketing/platforms/:id/sync
```

### 6. Creative Management 🎨
- **Multiple Formats**: Image, video, carousel, collection
- **Asset Management**: Images, videos, headlines, descriptions
- **Call-to-Action**: 10+ CTA options
- **A/B Testing**: Test variants with tracking
- **Performance Tracking**: CTR, conversion rate per creative
- **Approval Workflow**: Pending, approved, rejected states

**Create Creative:**
```javascript
POST /api/marketing/creatives
{
  "name": "Summer Sale Banner",
  "type": "image",
  "format": "single_image",
  "assets": {
    "images": [{
      "url": "/uploads/banner.jpg",
      "width": 1200,
      "height": 628
    }],
    "headlines": [{
      "text": "Up to 50% Off Summer Collection",
      "language": "en"
    }],
    "descriptions": [{
      "text": "Shop now and save big on all summer items!",
      "language": "en"
    }],
    "callToAction": "shop_now",
    "landingUrl": "https://example.com/summer-sale"
  },
  "targeting": {
    "platforms": ["facebook_ads", "instagram_ads"],
    "deviceTypes": ["mobile", "desktop"]
  }
}

// Carousel creative
POST /api/marketing/creatives
{
  "name": "Product Showcase Carousel",
  "type": "carousel",
  "carousel": {
    "cards": [
      {
        "image": "/uploads/product1.jpg",
        "headline": "Product 1",
        "description": "Amazing product",
        "destinationUrl": "https://example.com/product1",
        "callToAction": "shop_now"
      },
      {
        "image": "/uploads/product2.jpg",
        "headline": "Product 2",
        "description": "Great quality",
        "destinationUrl": "https://example.com/product2",
        "callToAction": "shop_now"
      }
    ]
  }
}
```

### 7. ROI Tracking & Analytics 📊

#### Dashboard Summary
```javascript
GET /api/marketing/analytics/dashboard?startDate=2026-01-01&endDate=2026-01-31
```
**Returns:**
- Total spend, revenue, impressions, clicks, conversions
- Active campaigns and audiences count
- Average ROAS
- Top performing campaign

#### Campaign Performance
```javascript
GET /api/marketing/analytics/performance?campaignId=xxx&startDate=2026-01-01&endDate=2026-01-31&groupBy=date
```
**Metrics:**
- Impressions, clicks, CTR
- Conversions, conversion rate
- Spend, CPC, CPA
- Revenue, ROAS, ROI

#### Creative Performance Comparison
```javascript
GET /api/marketing/analytics/creative-performance?campaignId=xxx
```
**Analysis:**
- Performance by creative
- Best performing creatives
- CTR and conversion rate comparison

#### ROI Analysis
```javascript
GET /api/marketing/analytics/roi?startDate=2026-01-01&endDate=2026-01-31
```
**Insights:**
- Overall ROAS and ROI
- CPA and conversion metrics
- Top 5 campaigns by ROAS
- Platform performance breakdown

#### Conversion Funnel
```javascript
GET /api/marketing/analytics/conversion-funnel?campaignId=xxx
```
**Stages:**
- Impressions → Clicks (Click Rate)
- Clicks → Conversions (Conversion Rate)
- Overall conversion rate

#### Budget Utilization
```javascript
GET /api/marketing/analytics/budget-utilization
```
**Reports:**
- Budget vs spend by campaign
- Utilization percentage
- Days remaining
- Budget alerts status

---

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

**New packages added:**
- `geoip-lite`: IP geolocation
- `useragent`: User agent parsing

### 2. Environment Variables
Add to `.env`:
```env
# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret

# Facebook Ads
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Encryption (for storing credentials)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 3. Start Server
```bash
npm start
```

### 4. Install Tracking Pixel
1. Create a tracking pixel via API
2. Copy the installation code from response
3. Paste before `</head>` tag on your website
4. Events will automatically be tracked

---

## 📡 API Endpoints

### Tracking Pixels
- `GET /api/marketing/tracking/pixel.js` - Get pixel JavaScript (public)
- `POST /api/marketing/tracking/event` - Track event (public)
- `GET /api/marketing/pixels` - List all pixels
- `GET /api/marketing/pixels/:id` - Get pixel details
- `POST /api/marketing/pixels` - Create pixel
- `PUT /api/marketing/pixels/:id` - Update pixel
- `DELETE /api/marketing/pixels/:id` - Delete pixel
- `GET /api/marketing/pixels/:id/events` - Get pixel events
- `GET /api/marketing/pixels/:id/analytics` - Get pixel analytics
- `GET /api/marketing/tracking/cart-abandoners` - Get cart abandoners

### Audiences
- `GET /api/marketing/audiences` - List audiences
- `GET /api/marketing/audiences/:id` - Get audience
- `POST /api/marketing/audiences` - Create custom audience
- `PUT /api/marketing/audiences/:id` - Update audience
- `DELETE /api/marketing/audiences/:id` - Delete audience
- `POST /api/marketing/audiences/:id/refresh` - Refresh audience
- `GET /api/marketing/audiences/:id/members` - Get members
- `GET /api/marketing/audiences/:id/overlap` - Get overlap with another
- `POST /api/marketing/audiences/:id/sync` - Sync to platform
- `POST /api/marketing/audiences/cart-abandoners` - Create cart abandoners
- `POST /api/marketing/audiences/product-viewers` - Create product viewers
- `POST /api/marketing/audiences/purchasers` - Create purchasers
- `POST /api/marketing/audiences/lookalike` - Create lookalike

### Campaigns
- `GET /api/marketing/campaigns` - List campaigns
- `GET /api/marketing/campaigns/:id` - Get campaign
- `POST /api/marketing/campaigns` - Create campaign
- `PUT /api/marketing/campaigns/:id` - Update campaign
- `DELETE /api/marketing/campaigns/:id` - Delete campaign
- `GET /api/marketing/campaigns/:id/performance` - Get performance
- `POST /api/marketing/campaigns/:id/toggle-status` - Pause/resume

### Creatives
- `GET /api/marketing/creatives` - List creatives
- `POST /api/marketing/creatives` - Create creative
- `PUT /api/marketing/creatives/:id` - Update creative
- `DELETE /api/marketing/creatives/:id` - Delete creative

### Budgets
- `GET /api/marketing/budgets` - List budgets
- `POST /api/marketing/budgets` - Create budget
- `PUT /api/marketing/budgets/:id` - Update budget
- `POST /api/marketing/budgets/:id/spend` - Record spend

### Platforms
- `GET /api/marketing/platforms` - List connections
- `GET /api/marketing/platforms/:id` - Get connection
- `POST /api/marketing/platforms` - Create connection
- `PUT /api/marketing/platforms/:id` - Update connection
- `DELETE /api/marketing/platforms/:id` - Delete connection
- `POST /api/marketing/platforms/:id/test` - Test connection
- `POST /api/marketing/platforms/:id/sync` - Sync data

### Analytics
- `GET /api/marketing/analytics/dashboard` - Dashboard summary
- `GET /api/marketing/analytics/performance` - Campaign performance
- `GET /api/marketing/analytics/creative-performance` - Creative comparison
- `GET /api/marketing/analytics/roi` - ROI analysis
- `GET /api/marketing/analytics/conversion-funnel` - Conversion funnel
- `GET /api/marketing/analytics/budget-utilization` - Budget reports

---

## 🎯 Usage Examples

### Example 1: Complete Retargeting Campaign Setup

```javascript
// Step 1: Create tracking pixel
const pixelResponse = await fetch('/api/marketing/pixels', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    name: 'Main Website Pixel',
    eventTypes: ['page_view', 'product_view', 'add_to_cart', 'cart_abandon', 'purchase']
  })
});

// Step 2: Install pixel on website (use pixelResponse.installationCode)

// Step 3: Wait for data collection (few days)

// Step 4: Create cart abandoners audience
const audienceResponse = await fetch('/api/marketing/audiences/cart-abandoners', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    name: 'Cart Abandoners - Last 7 Days',
    timeWindow: { value: 7, unit: 'days' },
    minCartValue: 50000
  })
});

// Step 5: Create campaign creatives
const creativeResponse = await fetch('/api/marketing/creatives', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    name: 'Cart Recovery Ad',
    type: 'image',
    assets: {
      images: [{ url: '/uploads/cart-recovery.jpg' }],
      headlines: [{ text: 'Complete Your Purchase!' }],
      descriptions: [{ text: 'Get 10% off if you checkout now' }],
      callToAction: 'shop_now',
      landingUrl: 'https://example.com/cart'
    }
  })
});

// Step 6: Create campaign
const campaignResponse = await fetch('/api/marketing/campaigns', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    name: 'Cart Recovery Campaign',
    objective: 'conversions',
    targetAudiences: [audienceResponse.audience._id],
    platforms: [{ platform: 'facebook_ads' }],
    creatives: [creativeResponse.creative._id],
    budgetData: {
      budgetType: 'daily',
      amount: 200000,
      currency: 'VND'
    },
    bidding: {
      strategy: 'cpa',
      amount: 50000
    }
  })
});

// Step 7: Activate campaign
await fetch(`/api/marketing/campaigns/${campaignResponse.campaign._id}/toggle-status`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' }
});
```

### Example 2: Monitor ROI

```javascript
// Get dashboard summary
const dashboard = await fetch('/api/marketing/analytics/dashboard?startDate=2026-01-01&endDate=2026-01-31');

// Get ROI analysis
const roi = await fetch('/api/marketing/analytics/roi?startDate=2026-01-01&endDate=2026-01-31');

// Get budget utilization
const budgets = await fetch('/api/marketing/analytics/budget-utilization');

// Check campaign performance
const performance = await fetch('/api/marketing/analytics/performance?campaignId=xxx&groupBy=date');
```

---

## 🔐 Security Features

1. **Encrypted Credentials**: Platform credentials stored with AES-256 encryption
2. **Authentication Required**: All management endpoints require JWT auth
3. **Role-Based Access**: Marketing manager or admin role required for modifications
4. **Rate Limiting**: Prevent API abuse
5. **CORS Protection**: Cross-origin request validation
6. **Input Validation**: Sanitize all user inputs

---

## 📈 Performance Optimizations

1. **Indexed Queries**: Database indexes on frequently queried fields
2. **TTL Indexes**: Auto-delete old tracking events after 90 days
3. **Aggregation Pipeline**: Efficient analytics calculations
4. **Caching**: Cache audience calculations
5. **Batch Operations**: Sync multiple items in one request
6. **Background Jobs**: Audience refresh runs in background

---

## 🚦 Next Steps

### Integration Checklist:
- ✅ Install tracking pixel on website
- ✅ Connect ad platform accounts (Google Ads, Facebook Ads)
- ✅ Create initial audiences (cart abandoners, product viewers)
- ✅ Design and upload ad creatives
- ✅ Set up budgets and alerts
- ✅ Create and launch first campaign
- ✅ Monitor performance daily
- ✅ Optimize based on ROI data

### Recommended Workflows:
1. **Daily**: Check dashboard summary, review budget utilization
2. **Weekly**: Analyze campaign performance, adjust bids
3. **Bi-weekly**: Refresh audiences, test new creatives
4. **Monthly**: Comprehensive ROI analysis, strategic planning

---

## 🛠️ Troubleshooting

### Pixel Not Tracking
- Verify pixel is active in database
- Check installation code on website
- Test in browser console: `window._wrencos`
- Review CORS settings

### Platform Connection Failed
- Verify credentials are correct
- Check token expiration
- Test connection via API
- Review platform API status

### Audience Size is Zero
- Check time window settings
- Verify tracking events exist
- Review rule conditions
- Refresh audience manually

### Campaign Not Delivering
- Check budget status (not exhausted)
- Verify campaign is active
- Check schedule dates
- Review audience size (>1000 recommended)

---

## 📚 Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Pixel Tracking Best Practices](#)
- [Audience Segmentation Strategies](#)

---

## 🎉 Congratulations!

You now have a complete retargeting and display ads management system with:
- ✅ Pixel tracking
- ✅ Audience segmentation
- ✅ Ad campaign builder
- ✅ Budget management
- ✅ Platform integrations (Google Ads & Facebook Ads)
- ✅ Creative management
- ✅ ROI tracking

Happy advertising! 🚀
