import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { OrderService } from '../services/orderService';
import { COLORS, API_BASE_URL, ORDER_STATUS, PAYMENT_METHODS } from '../constants';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      console.log('📦 Loading order details for ID:', orderId);
      const orderData = await OrderService.getOrderById(orderId);
      console.log('📦 Order data received:', JSON.stringify(orderData, null, 2));
      console.log('📦 Order date fields:', {
        createdAt: orderData.createdAt,
        orderDate: orderData.orderDate
      });
      console.log('📦 Order products:', orderData.products);
      setOrder(orderData);
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        return COLORS.warning;
      case ORDER_STATUS.SHIPPING:
        return COLORS.info;
      case ORDER_STATUS.COMPLETED:
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        return 'Processing';
      case ORDER_STATUS.SHIPPING:
        return 'Shipping';
      case ORDER_STATUS.COMPLETED:
        return 'Completed';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    return method === PAYMENT_METHODS.COD ? 'Cash on Delivery' : 'Online Payment';
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await OrderService.cancelOrder(orderId);
              Alert.alert('Success', 'Order cancelled successfully');
              navigation.goBack();
            } catch (error) {
              console.error('❌ Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order._id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(order.orderDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method:</Text>
          <Text style={styles.infoValue}>{getPaymentMethodText(order.paymentMethod)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>
        {order.products?.map((item, index) => {
          console.log(`🖼️ Product ${index}:`, item);
          console.log(`🖼️ Product ID object:`, item.productId);
          console.log(`🖼️ Product image field:`, item.productId?.image);
          console.log(`🖼️ Product imageUrl field:`, item.productId?.imageUrl);
          
          const imageUrl = item.productId?.image
            ? `${API_BASE_URL}/${item.productId.image}`
            : 'https://via.placeholder.com/80';
          
          console.log(`🖼️ Final image URL:`, imageUrl);
          console.log(`🖼️ API_BASE_URL:`, API_BASE_URL);
          
          return (
          <View key={index} style={styles.productItem}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              onError={(e) => console.error(`❌ Image load error for product ${index}:`, e.nativeEvent.error)}
              onLoad={() => console.log(`✅ Image loaded successfully for product ${index}`)}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {item.productId?.name || 'Product'}
              </Text>
              <Text style={styles.productPrice}>
                ${item.productId?.price?.toFixed(2)} x {item.quantity}
              </Text>
              <Text style={styles.productTotal}>
                Total: ${(item.productId?.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        );})}
      </View>

      <View style={styles.section}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>${order.totalPrice?.toFixed(2)}</Text>
        </View>
      </View>

      {order.status === ORDER_STATUS.PROCESSING && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cancelButton: {
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
