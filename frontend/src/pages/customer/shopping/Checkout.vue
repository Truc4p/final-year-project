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

// Shipping configuration
const FREE_SHIPPING_THRESHOLD = 100; // Free shipping for orders >= $100
const SHIPPING_FEE_MAJOR_CITIES = 5; // $5 for Ho Chi Minh City & Danang
const SHIPPING_FEE_OTHER = 7; // $7 for other provinces

const user = ref({
    phone: '',
    email: '',
    address: ''
});

const customerDetails = ref({
    paymentMethod: 'cod', // Default to Cash on Delivery
});

// Computed property to detect shipping location from address
const shippingLocation = computed(() => {
    const address = user.value.address?.toLowerCase() || '';
    // Check if address contains Ho Chi Minh City or Danang
    if (address.includes('ho chi minh') || 
        address.includes('hồ chí minh') || 
        address.includes('hcm') || 
        address.includes('saigon') || 
        address.includes('sài gòn') ||
        address.includes('danang') || 
        address.includes('da nang') ||
        address.includes('đà nẵng')) {
        return 'major';
    }
    return 'other';
});

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

const shippingFee = computed(() => {
    // Free shipping for orders >= $100
    if (subtotal.value >= FREE_SHIPPING_THRESHOLD) {
        return 0;
    }
    
    // Calculate shipping based on detected location from address
    if (shippingLocation.value === 'major') {
        return SHIPPING_FEE_MAJOR_CITIES;
    } else {
        return SHIPPING_FEE_OTHER;
    }
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
            shippingLocation: shippingLocation.value,
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
                                ></textarea>
                                <div class="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                                    <p class="text-xs text-primary-800 leading-relaxed">
                                        <strong class="font-semibold">Standard Delivery</strong><br/>
                                        Free shipping on orders from $100. Shipping fee: $5 (within Ho Chi Minh City & Danang); $7 (other provinces). Estimated delivery time: 2–5 days, excluding Sundays and public holidays.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-secondary-700 mb-2">
                                    {{ t('paymentMethod') || 'Payment Method' }}
                                </label>
                                <select 
                                    v-model="customerDetails.paymentMethod" 
                                    class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 transition-colors duration-200"
                                >
                                    <option value="cod">{{ t('cod') || 'Cash on Delivery' }}</option>
                                    <option value="onlinePayment">{{ t('onlinePayment') || 'Online Payment' }}</option>
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
                                <span>
                                    {{ t('shipping') || 'Shipping' }}
                                    <span v-if="shippingFee === 0" class="font-medium ml-1">({{ t('free') || 'FREE' }})</span>
                                </span>
                                <span :class="{ 'font-medium': shippingFee === 0 }">
                                    {{ shippingFee === 0 ? '$0.00' : `$${shippingFee.toFixed(2)}` }}
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