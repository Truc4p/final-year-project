import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../utils/config';

const SocialMediaScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    posts: { total: 0, scheduled: 0 },
    analytics: { totalReach: 0, totalEngagement: 0 },
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPosts(), loadStats()]);
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const params = { limit: 20, status: filter === 'all' ? undefined : filter };
      const response = await axios.get(`${API_URL}/social-media/posts`, { params });
      
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Load posts error:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/social-media/posts/stats`);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePublishPost = async (postId) => {
    Alert.alert(
      'Publish Post',
      'Are you sure you want to publish this post now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              const response = await axios.post(`${API_URL}/social-media/posts/${postId}/publish`);
              
              if (response.data.success) {
                Alert.alert('Success', 'Post published successfully!');
                await loadData();
              }
            } catch (error) {
              console.error('Publish error:', error);
              Alert.alert('Error', 'Failed to publish post');
            }
          },
        },
      ]
    );
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/social-media/posts/${postId}`);
              
              if (response.data.success) {
                await loadData();
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6B7280',
      scheduled: '#F59E0B',
      published: '#10B981',
      failed: '#EF4444',
    };
    return colors[status] || colors.draft;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: 'logo-facebook',
      instagram: 'logo-instagram',
      twitter: 'logo-twitter',
      linkedin: 'logo-linkedin',
    };
    return icons[platform] || 'share-social';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social Media</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateSocialPost')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="document-text" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.posts.total}</Text>
            <Text style={styles.statLabel}>Total Posts</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.posts.scheduled}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="people" size={24} color="#10B981" />
            <Text style={styles.statValue}>{formatNumber(stats.analytics.totalReach)}</Text>
            <Text style={styles.statLabel}>Total Reach</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="trending-up" size={24} color="#6366F1" />
            <Text style={styles.statValue}>{stats.engagementRate}%</Text>
            <Text style={styles.statLabel}>Engagement</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'draft', 'scheduled', 'published'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterTab, filter === status && styles.filterTabActive]}
                onPress={() => setFilter(status)}
              >
                <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Posts List */}
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No posts found</Text>
            <TouchableOpacity
              style={styles.createButtonLarge}
              onPress={() => navigation.navigate('CreateSocialPost')}
            >
              <Text style={styles.createButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postTitleContainer}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post.status) }]}>
                    <Text style={styles.statusText}>{post.status}</Text>
                  </View>
                </View>
                <View style={styles.postActions}>
                  {(post.status === 'draft' || post.status === 'scheduled') && (
                    <TouchableOpacity onPress={() => handlePublishPost(post._id)}>
                      <Ionicons name="play-circle" size={24} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDeletePost(post._id)}>
                    <Ionicons name="trash" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.postContent} numberOfLines={2}>
                {post.content}
              </Text>

              {/* Platforms */}
              <View style={styles.platformsContainer}>
                {post.platforms.map((platform, index) => (
                  <View key={index} style={styles.platformBadge}>
                    <Ionicons name={getPlatformIcon(platform.platform)} size={16} color="#FFF" />
                  </View>
                ))}
              </View>

              {/* Analytics */}
              {post.status === 'published' && post.analytics && (
                <View style={styles.analyticsContainer}>
                  <View style={styles.analyticItem}>
                    <Ionicons name="eye" size={16} color="#6B7280" />
                    <Text style={styles.analyticText}>{formatNumber(post.analytics.totalReach)}</Text>
                  </View>
                  <View style={styles.analyticItem}>
                    <Ionicons name="heart" size={16} color="#6B7280" />
                    <Text style={styles.analyticText}>{formatNumber(post.analytics.totalLikes)}</Text>
                  </View>
                  <View style={styles.analyticItem}>
                    <Ionicons name="chatbubble" size={16} color="#6B7280" />
                    <Text style={styles.analyticText}>{formatNumber(post.analytics.totalComments)}</Text>
                  </View>
                  <View style={styles.analyticItem}>
                    <Ionicons name="share-social" size={16} color="#6B7280" />
                    <Text style={styles.analyticText}>{formatNumber(post.analytics.totalShares)}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.postDate}>
                {new Date(post.scheduledAt || post.createdAt).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  postCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  postActions: {
    flexDirection: 'row',
    gap: 12,
  },
  postContent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  platformsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  platformBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  analyticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  postDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  createButtonLarge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialMediaScreen;
