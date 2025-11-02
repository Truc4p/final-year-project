import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ProductService, CategoryService } from '../services/productService';
import { COLORS, API_BASE_URL } from '../constants';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadData = async () => {
    try {
      console.log('Loading data from API...');
      console.log('API Base URL:', API_BASE_URL);
      
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getAllProducts(),
        CategoryService.getAllCategories(),
      ]);
      
      console.log('Products loaded successfully:', productsData.length);
      console.log('Categories loaded:', categoriesData.length);
      
      if (productsData.length > 0) {
        console.log('First product sample:', JSON.stringify(productsData[0], null, 2));
      }
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert(
        'Error', 
        `Failed to load products: ${error.response?.data?.message || error.message || 'Network error'}`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => {
          // Handle both populated and unpopulated category field
          const categoryId = product.category?._id || product.category;
          return categoryId === selectedCategory;
        }
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    console.log('Filtered products:', filtered.length, 'of', products.length);
    setFilteredProducts(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderProduct = ({ item }) => {
    // Construct the full image URL - check both 'image' and 'imageUrl' fields
    const imagePath = item.image || item.imageUrl;
    const imageUri = imagePath 
      ? `${API_BASE_URL}/${imagePath}`
      : 'https://via.placeholder.com/150';
    
    console.log('Product:', item.name, 'Image URL:', imageUri);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          onError={(error) => console.log('Image load error for', item.name, error.nativeEvent.error)}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
          <Text style={styles.productStock}>
            {item.stockQuantity > 0 ? `In Stock: ${item.stockQuantity}` : 'Out of Stock'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item._id && styles.categoryChipActive,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item._id ? null : item._id)
      }
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item._id && styles.categoryTextActive,
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)}
            style={styles.iconButton}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      )}

      {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item._id}
            style={styles.categoryList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  searchIcon: {
    fontSize: 24,
  },
  cartIcon: {
    fontSize: 24,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryContainer: {
    marginBottom: 0,
    height: 40,
  },
  categoryList: {
    paddingHorizontal: 16,
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 15,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  productList: {
    padding: 8,
    paddingTop: 2,
    paddingBottom: 16,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
