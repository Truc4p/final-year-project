# Frontend Documentation

## Overview

The frontend is a modern web application built with Vue.js 3, serving both admin and customer interfaces.

**Framework**: Vue 3 (Composition API)
**Build Tool**: Vite
**Styling**: Tailwind CSS
**State Management**: Vue Reactivity System + localStorage
**Routing**: Vue Router
**HTTP Client**: Axios

## Directory Structure

```
frontend/
├── index.html              # Entry HTML file
├── package.json            # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── jsconfig.json          # JavaScript configuration
├── src/
│   ├── main.js           # Application entry point
│   ├── App.vue           # Root component
│   ├── i18n.js           # Internationalization setup
│   ├── assets/           # Static assets (CSS, images)
│   │   ├── index.css    # Tailwind directives
│   │   ├── base.css     # Custom base styles
│   │   └── styles.css   # Design system styles
│   ├── components/       # Reusable Vue components
│   │   ├── common/      # Shared components
│   │   ├── admin/       # Admin-specific components
│   │   └── customer/    # Customer-specific components
│   ├── layout/           # Layout components
│   │   ├── PublicLayout.vue
│   │   ├── AdminLayout.vue
│   │   └── CustomerLayout.vue
│   ├── pages/            # Page components
│   │   ├── public/      # Public pages (login, register)
│   │   ├── admin/       # Admin pages
│   │   └── customer/    # Customer pages
│   ├── router/           # Vue Router configuration
│   │   └── index.js
│   ├── stores/           # State management
│   └── utils/            # Utility functions
│       ├── auth.js      # Authentication helpers
│       └── api.js       # API client configuration
```

## Key Technologies

### Vue 3 Features Used

1. **Composition API**: Modern, flexible component logic
2. **Script Setup**: Simplified component syntax
3. **Reactive State**: `ref`, `reactive`, `computed`
4. **Lifecycle Hooks**: `onMounted`, `onUnmounted`, etc.
5. **Provide/Inject**: Dependency injection

### Tailwind CSS

**Configuration**: `tailwind.config.js`

Custom theme extensions:
- Custom colors for brand identity
- Responsive breakpoints
- Custom spacing
- Typography scales
- Animation utilities

### Vue Router

**File**: `src/router/index.js`

**Route Structure**:
```
/                          (Public Layout)
├── /                      → PublicPage
├── /login                 → Login
├── /register              → Register
└── /logout                → Logout

/admin                     (Admin Layout, requires auth)
├── /admin                 → Cash Flow Dashboard
├── /admin/categories      → Categories List
├── /admin/products        → Products List
├── /admin/orders          → Orders List
├── /admin/users           → Users Management
├── /admin/analytics       → Analytics Dashboard
├── /admin/cashflow        → Financial Management
├── /admin/hr              → HR Management
├── /admin/live-stream     → Live Stream Management
└── /admin/email-marketing → Email Marketing

/customer                  (Customer Layout, requires auth)
├── /customer              → Product Catalog
├── /customer/products/:id → Product Details
├── /customer/cart         → Shopping Cart
├── /customer/checkout     → Checkout
├── /customer/orders       → Order History
├── /customer/profile      → User Profile
└── /customer/live-stream  → Live Stream Viewer
```

**Navigation Guards**:
```javascript
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userRole = getUserRole();

  if (requiresAuth) {
    if (!userRole) {
      next('/login'); // Redirect to login
    } else {
      const routeRole = to.meta.role;
      if (routeRole && routeRole !== userRole) {
        next('/login'); // Unauthorized
      } else {
        next(); // Authorized
      }
    }
  } else {
    next(); // Public route
  }
});
```

## Authentication System

### Token Management

**File**: `src/utils/auth.js`

**Functions**:
```javascript
// Store authentication data
export function setAuth(token, role, userId)

// Get token from localStorage
export function getToken()

// Get user role
export function getUserRole()

// Get user ID
export function getUserId()

// Check if user is authenticated
export function isAuthenticated()

// Clear authentication data (logout)
export function clearAuth()
```

**Storage**: localStorage
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "customer",
  "userId": "507f1f77bcf86cd799439011"
}
```

### HTTP Interceptors

**File**: `src/utils/api.js` (if exists)

Axios interceptors to:
1. Add Authorization header to all requests
2. Handle 401 (Unauthorized) responses
3. Redirect to login on authentication failure

```javascript
axios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuth();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

## Layouts

### PublicLayout

**Purpose**: Layout for unauthenticated users
**Features**:
- Navigation header
- Hero section
- Product showcase
- Footer

### AdminLayout

**Purpose**: Layout for admin users
**Features**:
- Sidebar navigation
- Top bar with logout
- Main content area
- Quick access menu
- Sections:
  - Dashboard
  - Products Management
  - Categories
  - Orders
  - Users
  - Analytics
  - Finance (Cash Flow)
  - HR
  - Live Stream
  - Email Marketing

### CustomerLayout

**Purpose**: Layout for customer users
**Features**:
- Top navigation bar
- Shopping cart icon with count
- User profile menu
- Main content area
- Footer

## Key Features

### 1. Product Catalog (Customer)

**Components**:
- `ProductGrid.vue`: Display products in grid
- `ProductCard.vue`: Individual product card
- `ProductFilter.vue`: Filter by category, price
- `ProductSearch.vue`: Search products

**Features**:
- Browse all products
- Filter by category
- Search by name/description
- View product details
- Add to cart
- Stock availability indicator

### 2. Shopping Cart

**Storage**: localStorage (client-side)
**Components**:
- `Cart.vue`: Cart page
- `CartItem.vue`: Individual cart item
- `CartSummary.vue`: Order summary

**Features**:
- Add/remove products
- Update quantities
- Real-time price calculation
- Persist cart across sessions
- Proceed to checkout

**Cart Data Structure**:
```javascript
{
  items: [
    {
      product: { /* Product object */ },
      quantity: 2
    }
  ]
}
```

### 3. Checkout Process

**Component**: `Checkout.vue`

**Steps**:
1. Review cart items
2. Select payment method (COD/Online)
3. Enter shipping information
4. Calculate shipping fee based on location
5. Review order summary (subtotal, tax, shipping)
6. Place order

**Calculations**:
```javascript
subtotal = sum(item.price × item.quantity)
tax = subtotal × taxRate (e.g., 5%)
shippingFee = based on location (major: 5, other: 10)
totalPrice = subtotal + tax + shippingFee
```

### 4. Order Management

**Customer Pages**:
- `OrderHistory.vue`: List all orders
- `OrderDetail.vue`: View order details
- `DeleteOrder.vue`: Cancel order (if pending)

**Admin Pages**:
- `Orders.vue`: View all customer orders
- `DetailOrder.vue`: Order details
- `EditOrder.vue`: Update order status
- `DeleteOrderByAdmin.vue`: Cancel/delete order

**Order Statuses**:
- `pending`: Order placed, awaiting processing
- `processing`: Order being prepared
- `shipping`: Order in transit
- `completed`: Order delivered
- `cancelled`: Order cancelled

### 5. Live Streaming

#### Customer View (`LiveStream.vue`, `LiveStreamWatch.vue`)

**Features**:
- Browse active and past streams
- Watch live stream with real-time video
- Participate in live chat
- Like/unlike stream
- View pinned products
- Add pinned products to cart

**WebSocket Integration**:
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000');

// Register customer
ws.send(JSON.stringify({
  type: 'register',
  sessionId: sessionStorage.getItem('sessionId'),
  token: getToken()
}));

// Handle stream updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'stream_started':
      // Update UI with stream data
      break;
    case 'chat_message':
      // Add message to chat
      break;
    case 'stream_update':
      // Update viewer count, likes
      break;
  }
};

// Send chat message
function sendMessage(message) {
  ws.send(JSON.stringify({
    type: 'chat_message',
    username: currentUser.username,
    message: message,
    timestamp: new Date().toISOString()
  }));
}

// Toggle like
function toggleLike() {
  ws.send(JSON.stringify({
    type: 'toggle_like',
    userId: getUserId(),
    sessionId: sessionStorage.getItem('sessionId')
  }));
}
```

#### Admin View (`AdminLiveStream.vue`)

**Features**:
- Start/stop live stream
- Configure stream settings (title, description, quality)
- Monitor viewer count and likes
- Moderate live chat
- Pin/unpin products to stream
- View stream analytics

**Stream Creation**:
```javascript
async function startStream() {
  const response = await axios.post('/livestreams', {
    title: streamTitle,
    description: streamDescription,
    quality: selectedQuality,
    streamUrl: streamUrl
  });
  
  // Broadcast via WebSocket
  ws.send(JSON.stringify({
    type: 'stream_started',
    streamData: response.data.livestream
  }));
}
```

### 6. AI Chat Assistant (Customer)

**Component**: `ChatWidget.vue` or integrated in `CustomerPage.vue`

**Features**:
- **FAQ Mode**: Browse predefined questions
- **AI Mode**: Free-form conversation with Gemini AI
- **Staff Escalation**: Connect to human support
- Conversation history
- Product recommendations
- Skin type/concern analysis

**Flow**:
```javascript
// Send message to AI
async function sendToAI(message) {
  const response = await axios.post('/chat/ai', {
    message: message,
    sessionId: chatSessionId
  });
  
  // Display AI response
  chatMessages.push({
    role: 'assistant',
    content: response.data.data.message,
    relatedProducts: response.data.data.relatedProducts
  });
}

// Connect to staff
async function connectToStaff() {
  await axios.post('/chat/connect-staff', {
    sessionId: chatSessionId
  });
  
  // Enable WebSocket for real-time staff chat
  enableStaffChat();
}
```

### 7. Email Marketing (Admin)

**Pages**:
- `Subscribers.vue`: Manage newsletter subscribers
- `Templates.vue`: Create/edit email templates
- `CreateCampaign.vue`: Create and send campaigns
- `Analytics.vue`: View campaign performance

**Campaign Creation Flow**:
1. Choose template or create from scratch
2. Set campaign name and subject
3. Edit email content (WYSIWYG editor)
4. Select target audience (all, segment, custom)
5. Schedule or send immediately
6. View analytics after sending

### 8. Analytics Dashboard (Admin)

**Component**: `Analytics.vue`

**Features**:
- Sales charts (Chart.js)
- Revenue tracking
- Top products
- Customer statistics
- Order trends
- Time period filtering (daily, weekly, monthly)

**Chart Types**:
- Line charts: Sales over time
- Bar charts: Product performance
- Pie charts: Category distribution
- Donut charts: Order status breakdown

**Chart.js Integration**:
```vue
<script setup>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale);

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    label: 'Sales',
    data: [65, 59, 80, 81, 56],
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};
</script>

<template>
  <Line :data="chartData" />
</template>
```

### 9. Finance Management (Admin)

**Page**: `CashFlow.vue`

**Features**:
- Add income/expense transactions
- Categorize transactions
- View financial summary
- Revenue vs. expense charts
- Filter by date range
- Export reports

### 10. HR Management (Admin)

**Page**: `HumanResources.vue`

**Features**:
- Employee records
- Document uploads
- Employee information
- Department management

## Internationalization (i18n)

**File**: `src/i18n.js`

**Setup**:
```javascript
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    // ... more translations
  },
  vi: {
    welcome: 'Chào mừng',
    login: 'Đăng nhập',
    // ... more translations
  }
};

const i18n = createI18n({
  locale: 'en', // default locale
  fallbackLocale: 'en',
  messages
});

export default i18n;
```

**Usage in Components**:
```vue
<template>
  <h1>{{ $t('welcome') }}</h1>
</template>
```

## State Management

### Local State

Each component manages its own state using Vue 3 reactivity:

```vue
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}
</script>
```

### Shared State (localStorage)

For persistence across sessions:
- **Authentication**: Token, role, userId
- **Shopping Cart**: Cart items
- **User Preferences**: Language, theme

### Props & Emits

Parent-child communication:

```vue
<!-- Parent -->
<ChildComponent :product="product" @add-to-cart="handleAddToCart" />

<!-- Child -->
<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  product: Object
});

const emit = defineEmits(['add-to-cart']);

function addToCart() {
  emit('add-to-cart', props.product);
}
</script>
```

## API Integration

### Axios Base Configuration

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Common API Calls

```javascript
// Products
const getProducts = () => axios.get('/products');
const getProduct = (id) => axios.get(`/products/${id}`);
const createProduct = (data) => axios.post('/products', data);
const updateProduct = (id, data) => axios.put(`/products/${id}`, data);
const deleteProduct = (id) => axios.delete(`/products/${id}`);

// Orders
const getOrders = () => axios.get('/orders');
const createOrder = (data) => axios.post('/orders', data);

// Auth
const login = (credentials) => axios.post('/auth/login', credentials);
const register = (data) => axios.post('/auth/register', data);
```

## Styling Guidelines

### Tailwind Utility Classes

Common patterns:
```html
<!-- Card -->
<div class="bg-white rounded-lg shadow-md p-6">

<!-- Button Primary -->
<button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">

<!-- Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- Flex Center -->
<div class="flex items-center justify-center">
```

### Custom CSS

**File**: `src/assets/styles.css`

Contains design system variables and custom components.

## Build & Deployment

### Development

```bash
npm run dev
```

Runs on: http://localhost:5173

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Preview Production Build

```bash
npm run preview
```

## Performance Optimizations

1. **Code Splitting**: Lazy-load routes
```javascript
{
  path: '/admin/analytics',
  component: () => import('@/pages/admin/analytics/Analytics.vue')
}
```

2. **Image Optimization**: Use appropriate formats and sizes

3. **Lazy Loading**: Load components on demand

4. **Caching**: Cache API responses where appropriate

5. **Minimize Bundle Size**: Tree-shaking with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Testing

```bash
npm run test
```

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

## Future Enhancements

- [ ] Dark mode support
- [ ] Progressive Web App (PWA)
- [ ] Offline functionality
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] A/B testing
- [ ] SEO optimization
- [ ] Server-side rendering (SSR)
