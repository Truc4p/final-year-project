## 🏗️ **System Architecture Overview**

### **Backend Layer (Node.js/Express)**

#### **1. `liveStream.js` (Database Model)**
```javascript
// Defines the database schema for livestreams
const liveStreamSchema = new mongoose.Schema({
  title: String,
  description: String,
  // ... other fields
  pinnedProducts: [{
    productId: { type: ObjectId, ref: 'Product' },
    pinnedAt: { type: Date, default: Date.now },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }]
});
```
**Role**: Defines the data structure and relationships in MongoDB

#### **2. `liveStreamController.js` (Business Logic)**
```javascript
// Handles HTTP requests and database operations
exports.pinProduct = async (req, res) => {
  // Add product to livestream's pinnedProducts array
  livestream.pinnedProducts.push({ productId, displayOrder });
  await livestream.save();
};

exports.getPinnedProducts = async (req, res) => {
  // Fetch and return pinned products for a livestream
};
```
**Role**: Contains all API endpoint logic for CRUD operations

#### **3. `liveStreamRoutes.js` (API Endpoints)**
```javascript
// Defines URL routes and connects them to controller functions
router.post('/:id/pin-product', auth, role('admin'), liveStreamController.pinProduct);
router.get('/:id/pinned-products', liveStreamController.getPinnedProducts);
```
**Role**: Maps HTTP requests to controller functions with authentication

#### **4. `websocket.js` (Real-time Communication)**
```javascript
// Handles WebSocket connections and real-time updates
case 'pinned_products_updated':
  await this.broadcastPinnedProductsUpdate(data);
  break;
```
**Role**: Manages real-time communication between admin and customers

### **Frontend Layer (Vue.js)**

#### **5. `livestreamStore.js` (State Management)**
```javascript
// Centralized state management for livestream data
export const livestreamStore = reactive({
  pinnedProducts: [],
  
  async pinProduct(streamId, productId) {
    // API call to pin product
    const response = await fetch(`/livestreams/${streamId}/pin-product`);
    // Update local state
    this.pinnedProducts = data.pinnedProducts;
    // Broadcast via WebSocket
    this.broadcastPinnedProductsUpdate();
  }
});
```
**Role**: Manages shared state and API communication

#### **6. `AdminLiveStream.vue` (Admin Interface)**
```vue
<!-- Admin can pin/unpin products -->
<button @click="pinSelectedProduct">Pin Product</button>
<div v-for="pinnedProduct in livestreamStore.pinnedProducts">
  <!-- Display pinned products -->
</div>
```
**Role**: Admin interface for managing livestreams and pinned products

#### **7. `LiveStream.vue` (Customer Interface)**
```vue
<!-- Customers can view and purchase pinned products -->
<div v-for="pinnedProduct in livestreamStore.pinnedProducts">
  <button @click="addToCart(pinnedProduct.productId)">Add to Cart</button>
</div>
```
**Role**: Customer interface for watching livestreams and shopping

## 🔄 **Data Flow Diagram**

```
┌─────────────────┐    HTTP API    ┌──────────────────┐
│ AdminLiveStream │ ──────────────► │ liveStreamRoutes │
│      .vue       │                │       .js        │
└─────────────────┘                └─────────┬────────┘
         │                                   │
         │ livestreamStore.js                │
         │ (API calls)                       ▼
         │                          ┌──────────────────┐
         │                          │ liveStreamController│
         │                          │       .js        │
         │                          └─────────┬────────┘
         │                                   │
         │ WebSocket                         │ MongoDB
         │ Updates                          ▼
         │                          ┌──────────────────┐
         │                          │   liveStream.js  │
         │                          │   (Database)     │
         │                          └──────────────────┘
         │
         ▼
┌─────────────────┐                ┌──────────────────┐
│   websocket.js  │◄──────────────►│   LiveStream.vue │
│ (Real-time)     │   WebSocket    │   (Customer)     │
└─────────────────┘                └──────────────────┘
```

## 🎯 **Complete Workflow Example**

### **1. Admin Pins a Product**
```javascript
// AdminLiveStream.vue
const pinSelectedProduct = async () => {
  // 1. Call store method
  await livestreamStore.pinProduct(streamId, productId);
};

// livestreamStore.js
async pinProduct(streamId, productId) {
  // 2. Make API call
  const response = await fetch(`/livestreams/${streamId}/pin-product`);
  
  // 3. Update local state
  this.pinnedProducts = data.pinnedProducts;
  
  // 4. Broadcast via WebSocket
  this.broadcastPinnedProductsUpdate();
}
```

### **2. Backend Processing**
```javascript
// liveStreamController.js
exports.pinProduct = async (req, res) => {
  // 1. Find livestream
  const livestream = await LiveStream.findById(id);
  
  // 2. Add product to pinnedProducts array
  livestream.pinnedProducts.push({ productId, displayOrder });
  
  // 3. Save to database
  await livestream.save();
  
  // 4. Return updated data
  res.json({ pinnedProducts: livestream.pinnedProducts });
};
```

### **3. Real-time Updates**
```javascript
// websocket.js
async broadcastPinnedProductsUpdate(data) {
  // Broadcast to all connected customers
  for (const connection of this.customerConnections.values()) {
    connection.ws.send(JSON.stringify(data));
  }
}
```

### **4. Customer Sees Update**
```javascript
// LiveStream.vue
// WebSocket automatically updates livestreamStore.pinnedProducts
// Vue reactivity updates the UI automatically
```

## 🔧 **Key Integration Points**

### **State Synchronization**
- **livestreamStore.js** acts as the single source of truth
- WebSocket ensures real-time synchronization
- Vue reactivity automatically updates UI

### **Authentication & Authorization**
- **liveStreamRoutes.js** protects admin endpoints with `auth` and `role('admin')`
- Customer endpoints are public for viewing pinned products

### **Database Relationships**
- **liveStream.js** references Product model via `productId`
- Mongoose population loads full product details
- Indexes optimize query performance

### **Error Handling**
- Controllers handle database errors
- Store methods catch API errors
- UI shows user-friendly error messages

## 🚀 **Real-time Features**

1. **Admin pins product** → WebSocket broadcasts → **All customers see it instantly**
2. **Admin reorders products** → WebSocket broadcasts → **Customer view updates**
3. **Admin unpins product** → WebSocket broadcasts → **Product disappears from customer view**
4. **Stream starts/stops** → WebSocket broadcasts → **Pinned products appear/disappear**

This architecture ensures that all connected users see changes in real-time while maintaining data consistency across the entire system.