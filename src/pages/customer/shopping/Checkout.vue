<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_URL } from '../../../utils/config';
import ChatWidget from '../../../components/ChatWidget.vue';

const router = useRouter();
const route = useRoute();
const t = useI18n().t;

// Tax rate configuration (e.g., 0.10 = 10%, 0.08 = 8%)
const TAX_RATE = 0.10; // 10% tax

// Store/Business Address Configuration
const STORE_ADDRESS = '123 Business Street, City, Country'; // Update with your actual store address
const STORE_COORDINATES = { lat: 10.8231, lng: 106.6297 }; // Update with your actual coordinates (e.g., Ho Chi Minh City)

// Shipping fee configuration
const SHIPPING_CONFIG = {
    baseFee: 5.00,           // Base shipping fee
    perKmRate: 0.50,         // Cost per kilometer
    freeShippingThreshold: 100, // Free shipping if order total exceeds this
    maxDistance: 50          // Maximum delivery distance in km
};

const user = ref({
    phone: '',
    email: '',
    address: ''
});

const customerDetails = ref({
    paymentMethod: 'cash',
});

const shippingFee = ref(0);
const calculatingShipping = ref(false);
const shippingError = ref('');

// Parse the cart items from the query parameters
const cartItems = ref([]);
if (route.query.items) {
    try {
        cartItems.value = JSON.parse(route.query.items);
    } catch (error) {
        console.error('Error parsing cart items:', error);
    }
}

// Computed properties for price calculations
const subtotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const taxAmount = computed(() => {
    return subtotal.value * TAX_RATE;
});

const totalPrice = computed(() => {
    return subtotal.value + taxAmount.value + shippingFee.value;
});

// Get userId from localStorage
const userId = localStorage.getItem('userId');
if (!userId) {
    console.error('userId is not found in localStorage');
    // Handle the case where userId is not found, e.g., redirect to login page
    router.push('/login');
} else {
    console.log('userId:', userId); // Add this line to check the value of userId
}

// ========== SHIPPING CALCULATION FUNCTIONS ==========

/**
 * METHOD 1: Calculate distance using Haversine formula (no API needed)
 * This calculates the straight-line distance between two coordinates
 */
const calculateDistanceFromCoordinates = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
};

/**
 * METHOD 2: Calculate distance using Google Maps Distance Matrix API
 * This provides actual driving distance (more accurate for shipping)
 * Note: Requires Google Maps API key
 */
const calculateDistanceWithGoogleMaps = async (destinationAddress) => {
    try {
        // You need to add your Google Maps API key here
        const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key
        
        const origin = encodeURIComponent(STORE_ADDRESS);
        const destination = encodeURIComponent(destinationAddress);
        
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const response = await axios.get(url);
        
        if (response.data.rows[0].elements[0].status === 'OK') {
            const distanceInMeters = response.data.rows[0].elements[0].distance.value;
            const distanceInKm = distanceInMeters / 1000;
            return distanceInKm;
        } else {
            throw new Error('Unable to calculate distance');
        }
    } catch (error) {
        console.error('Error calculating distance with Google Maps:', error);
        throw error;
    }
};

/**
 * METHOD 3: Simple geocoding with Nominatim (OpenStreetMap - Free, no API key needed)
 * This is a free alternative to Google Maps
 */
const geocodeAddressWithNominatim = async (address) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'WrencosWebApp/1.0' // Required by Nominatim
            }
        });
        
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
};

/**
 * Calculate shipping fee based on distance
 */
const calculateShippingFee = (distanceInKm) => {
    // Check if order qualifies for free shipping
    if (subtotal.value >= SHIPPING_CONFIG.freeShippingThreshold) {
        return 0;
    }
    
    // Check if distance exceeds maximum
    if (distanceInKm > SHIPPING_CONFIG.maxDistance) {
        throw new Error(`Delivery distance (${distanceInKm.toFixed(1)}km) exceeds maximum delivery range (${SHIPPING_CONFIG.maxDistance}km)`);
    }
    
    // Calculate fee: base fee + (distance * per km rate)
    const fee = SHIPPING_CONFIG.baseFee + (distanceInKm * SHIPPING_CONFIG.perKmRate);
    return Math.max(fee, SHIPPING_CONFIG.baseFee); // Ensure minimum base fee
};

/**
 * Main function to calculate and update shipping fee
 * Uses free Nominatim API for geocoding
 */
const updateShippingFee = async () => {
    if (!user.value.address || user.value.address.trim() === '') {
        shippingFee.value = 0;
        shippingError.value = '';
        return;
    }
    
    calculatingShipping.value = true;
    shippingError.value = '';
    
    try {
        // Option 1: Use Nominatim (Free, no API key needed)
        const customerCoords = await geocodeAddressWithNominatim(user.value.address);
        const distance = calculateDistanceFromCoordinates(
            STORE_COORDINATES.lat,
            STORE_COORDINATES.lng,
            customerCoords.lat,
            customerCoords.lng
        );
        
        // Option 2: If you have Google Maps API key, uncomment this instead:
        // const distance = await calculateDistanceWithGoogleMaps(user.value.address);
        
        console.log(`Distance calculated: ${distance.toFixed(2)} km`);
        shippingFee.value = calculateShippingFee(distance);
        
        if (shippingFee.value === 0 && subtotal.value >= SHIPPING_CONFIG.freeShippingThreshold) {
            shippingError.value = 'Free shipping applied!';
        }
    } catch (error) {
        console.error('Error calculating shipping:', error);
        shippingError.value = error.message || 'Unable to calculate shipping fee. Please check your address.';
        shippingFee.value = SHIPPING_CONFIG.baseFee; // Use base fee as fallback
    } finally {
        calculatingShipping.value = false;
    }
};

// ========== END SHIPPING CALCULATION FUNCTIONS ==========

const updateUser = async () => {
    try {
        const formData = {
            phone: user.value.phone,
            email: user.value.email,
            address: user.value.address,
        };

        console.log('Updating customer with phone:', user.value.phone); // Log userId
        console.log('Updating customer with email:', user.value.email); // Log userId
        console.log('Updating customer with address:', user.value.address); // Log userId
        console.log('Updating customer with ID:', userId); // Log userId

        const response = await axios.put(`${API_URL}/users/${userId}`, formData, {
            headers: {
                'x-auth-token': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },
        });
        console.log('Customer updated successfully:', response.data);
    } catch (error) {
        console.error('Error updating customer:', error);
        console.error('Error response:', error.response); // Log the error response
    }
};

const getImageUrl = (relativePath) => {
    if (!relativePath) return '/images/fallback-image.jpg';
    return `${API_URL}/${relativePath}`;
};

const onImageError = (event) => {
    event.target.src = '/images/fallback-image.jpg';
};

const getCustomer = async () => {
    try {
        console.log('Getting customer with ID:', userId); // Log userId
        const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },
        });
        console.log('Customer retrieved successfully:', response.data);
        user.value = response.data;
    } catch (error) {
        console.error('Error retrieving customer:', error);
    }
};

const placeOrder = async () => {
    try {
        // Transform cart items to the payload expected by the backend
        const productsPayload = cartItems.value.map((item) => ({
            productId: item._id || item.productId,
            quantity: item.quantity,
            price: item.price,
        }));

        const orderData = {
            user: userId,
            products: productsPayload,
            paymentMethod: customerDetails.value.paymentMethod,
            orderDate: new Date(),
            status: 'processing',
            totalPrice: totalPrice.value,
            subtotal: subtotal.value,
            tax: taxAmount.value,
            taxRate: TAX_RATE,
            shippingFee: shippingFee.value,
        };

        console.log('Order data:', orderData); // Log order data

        const response = await axios.post(`${API_URL}/orders`, orderData, {
            headers: {
                'x-auth-token': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },
        });

        console.log('Order placed successfully:', response.data);

        // Stock is now updated server-side during order creation

        alert("Order placed successfully!");

        // Remove the cart items in cart
        console.log('localStorage:', localStorage.getItem('cart'));
        localStorage.removeItem('cart');
        
        // Dispatch custom event to notify other components about cart update
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Redirect to the order details page
        const orderId = response.data._id; // Assuming the response contains the order ID
        router.push(`/customer/orders/order/${orderId}`);
        //router.push(`/customer/order-success`);
    } catch (error) {
        console.error('Error placing order:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data); // Log error response data
            console.error('Error response status:', error.response.status); // Log error response status
            console.error('Error response headers:', error.response.headers); // Log error response headers
        }
        const message = (error.response && (error.response.data?.error || error.response.data?.message)) || 'There was an error placing your order. Please try again.';
        alert(message);
    }
};

const handleSubmit = async () => {
    await updateUser();
    await getCustomer();
    await placeOrder();
};

onMounted(async () => {
    await getCustomer();
});

</script>

<template>
    <div class="page-background min-h-screen py-8">
        <div class="container mx-auto px-6 max-w-7xl">
            <!-- Page Header -->
            <div class="text-center mb-12">
                <h1 class="text-2xl md:text-5xl font-bold text-secondary-900 mb-4 gradient-text">
                    {{ t('checkout') || 'Checkout' }}
                </h1>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-7 gap-8">
                <!-- Customer Details Form -->
                <div class="xl:col-span-3">
                    <div class="bg-white rounded-2xl p-8">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold text-secondary-900">
                                {{ t('customerDetails') || 'Customer Details' }}
                            </h2>
                        </div>

                        <form @submit.prevent="handleSubmit" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-secondary-700 mb-2">
                                        {{ t('phone') || 'Phone Number' }}
                                    </label>
                                    <input 
                                        v-model="user.phone"
                                        class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 transition-colors duration-200"
                                        type="tel" 
                                        placeholder="+1 (555) 123-4567" 
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-secondary-700 mb-2">
                                        {{ t('email') || 'Email Address' }}
                                    </label>
                                    <input 
                                        v-model="user.email" 
                                        type="email" 
                                        class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 transition-colors duration-200"
                                        placeholder="your@email.com" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-secondary-700 mb-2">
                                    {{ t('address') || 'Delivery Address' }}
                                </label>
                                <textarea 
                                    v-model="user.address" 
                                    rows="3"
                                    class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 transition-colors duration-200"
                                    placeholder="Enter your full delivery address"
                                    @blur="updateShippingFee"
                                ></textarea>
                                
                                <!-- Calculate Shipping Button -->
                                <button 
                                    type="button"
                                    @click="updateShippingFee"
                                    :disabled="!user.address || calculatingShipping"
                                    class="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg v-if="calculatingShipping" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {{ calculatingShipping ? 'Calculating...' : 'Calculate Shipping Fee' }}
                                </button>
                                
                                <!-- Shipping Error/Success Message -->
                                <p v-if="shippingError" :class="shippingFee === 0 && subtotal >= SHIPPING_CONFIG.freeShippingThreshold ? 'text-green-600' : 'text-red-600'" class="text-sm mt-2">
                                    {{ shippingError }}
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-secondary-700 mb-2">
                                    {{ t('paymentMethod') || 'Payment Method' }}
                                </label>
                                <select 
                                    v-model="customerDetails.paymentMethod" 
                                    class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 transition-colors duration-200"
                                >
                                    <option value="cash">{{ t('cash') || 'Cash on Delivery' }}</option>
                                    <option value="credit_card">{{ t('creditCard') || 'Credit Card' }}</option>
                                    <option value="zalopay">{{ t('zalopay') || 'ZaloPay' }}</option>
                                </select>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="xl:col-span-4">
                    <div class="bg-white rounded-2xl p-6 sticky top-8">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-secondary-900">
                                {{ t('orderSummary') || 'Order Summary' }}
                            </h3>
                        </div>

                        <!-- Cart Items -->
                        <div class="space-y-4 mb-6">
                            <div v-for="item in cartItems" :key="item._id" class="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                                <img 
                                    :src="getImageUrl(item.image)" 
                                    :alt="item.name || 'Product'"
                                    class="w-12 h-12 rounded-lg object-cover"
                                    @error="onImageError"
                                />
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-sm font-medium text-secondary-900 truncate">{{ item.name }}</h4>
                                    <p class="text-xs text-secondary-500">Qty: {{ item.quantity }}</p>
                                </div>
                                <span class="text-sm font-semibold text-secondary-900">${{ (item.price * item.quantity).toFixed(2) }}</span>
                            </div>
                        </div>

                        <!-- Price Breakdown -->
                        <div class="border-t border-secondary-200 pt-4 mb-6 space-y-2">
                            <div class="flex justify-between items-center text-sm text-secondary-600">
                                <span>{{ t('subtotal') || 'Subtotal' }}</span>
                                <span>${{ subtotal.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between items-center text-sm text-secondary-600">
                                <span>{{ t('tax') || 'Tax' }} ({{ (TAX_RATE * 100).toFixed(0) }}%)</span>
                                <span>${{ taxAmount.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between items-center text-sm text-secondary-600">
                                <span class="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    {{ t('shipping') || 'Shipping' }}
                                </span>
                                <span>
                                    <span v-if="calculatingShipping" class="text-xs italic">Calculating...</span>
                                    <span v-else-if="shippingFee === 0 && subtotal >= SHIPPING_CONFIG.freeShippingThreshold" class="text-green-600 font-medium">FREE</span>
                                    <span v-else-if="shippingFee > 0">${{ shippingFee.toFixed(2) }}</span>
                                    <span v-else class="text-xs italic">Enter address</span>
                                </span>
                            </div>
                            <div class="flex justify-between items-center text-lg font-bold text-secondary-900 pt-2 border-t border-secondary-200">
                                <span>{{ t('total') || 'Total' }}</span>
                                <span>${{ totalPrice.toFixed(2) }}</span>
                            </div>
                        </div>

                        <!-- Place Order Button -->
                        <button 
                            @click="handleSubmit" 
                            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {{ t('placeOrder') || 'Place Order' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <ChatWidget />
    </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 50%, var(--secondary-800) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 50%, var(--primary-700) 100%);
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-background {
  animation: fadeIn 0.6s ease-out;
}
</style>