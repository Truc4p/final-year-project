import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ProductService } from '../services/productService';
import { COLORS, API_BASE_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await ProductService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product || product.stockQuantity < quantity) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    try {
      const cartJson = await AsyncStorage.getItem('cart');
      const cart = cartJson ? JSON.parse(cartJson) : [];

      const existingIndex = cart.findIndex((item) => item.productId === product._id);

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.image || product.imageUrl,
          quantity,
          stockQuantity: product.stockQuantity,
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Success', 'Added to cart', [
        { text: 'Continue Shopping', onPress: () => navigation.goBack() },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: (product.image || product.imageUrl)
            ? `${API_BASE_URL}/${product.image || product.imageUrl}`
            : 'https://via.placeholder.com/400',
        }}
        style={styles.productImage}
      />

      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price?.toFixed(2)}</Text>

        <View style={styles.stockContainer}>
          <Text style={styles.stockLabel}>Availability: </Text>
          <Text
            style={[
              styles.stockValue,
              { color: product.stockQuantity > 0 ? COLORS.success : COLORS.error },
            ]}
          >
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : 'Out of stock'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {product.description || 'No description available'}
        </Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                setQuantity(Math.min(product.stockQuantity, quantity + 1))
              }
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            product.stockQuantity === 0 && styles.addToCartButtonDisabled,
          ]}
          onPress={addToCart}
          disabled={product.stockQuantity === 0}
        >
          <Text style={styles.addToCartButtonText}>
            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stockLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 18,
    color: COLORS.text,
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  addToCartButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
