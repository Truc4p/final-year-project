const SocialMediaPost = require('../../models/marketing/socialMediaPost');
const SocialMediaAccount = require('../../models/marketing/socialMediaAccount');
const SocialMediaAnalytics = require('../../models/marketing/socialMediaAnalytics');
const PostTemplate = require('../../models/marketing/postTemplate');
const socialMediaService = require('../../services/socialMediaService');

// Get all posts with pagination and filters
const getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      platform,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (platform && platform !== 'all') {
      query['platforms.platform'] = platform;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [posts, total] = await Promise.all([
      SocialMediaPost.find(query)
        .populate('createdBy', 'username email')
        .populate('platforms.accountId', 'platform accountName')
        .populate('templateId', 'name category')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      SocialMediaPost.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
    
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await SocialMediaPost.findById(id)
      .populate('createdBy', 'username email')
      .populate('platforms.accountId', 'platform accountName profilePicture')
      .populate('templateId', 'name category')
      .populate('productId', 'name price images');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
    
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const post = new SocialMediaPost(postData);
    await post.save();
    
    // If scheduled, add to scheduler
    if (post.status === 'scheduled' && post.scheduledAt) {
      await socialMediaService.schedulePost(post);
    }
    
    await post.populate([
      { path: 'createdBy', select: 'username email' },
      { path: 'platforms.accountId', select: 'platform accountName' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
    
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await SocialMediaPost.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Don't allow updating published posts
    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update published posts'
      });
    }
    
    Object.assign(post, req.body);
    await post.save();
    
    // Update scheduler if needed
    if (post.status === 'scheduled' && post.scheduledAt) {
      await socialMediaService.reschedulePost(post);
    }
    
    await post.populate([
      { path: 'createdBy', select: 'username email' },
      { path: 'platforms.accountId', select: 'platform accountName' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
    
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await SocialMediaPost.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Cancel scheduled post
    if (post.status === 'scheduled') {
      await socialMediaService.cancelScheduledPost(post);
    }
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Publish post immediately
const publishPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await SocialMediaPost.findById(id)
      .populate('platforms.accountId');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Post is already published'
      });
    }
    
    // Publish to all platforms
    post.status = 'publishing';
    await post.save();
    
    const results = await socialMediaService.publishPost(post);
    
    // Update post with results
    post.platforms.forEach((platform, index) => {
      if (results[index].success) {
        platform.status = 'published';
        platform.postId = results[index].postId;
        platform.postUrl = results[index].postUrl;
        platform.publishedAt = new Date();
      } else {
        platform.status = 'failed';
        platform.error = results[index].error;
      }
    });
    
    const allPublished = post.platforms.every(p => p.status === 'published');
    const anyPublished = post.platforms.some(p => p.status === 'published');
    
    post.status = allPublished ? 'published' : (anyPublished ? 'published' : 'failed');
    if (allPublished || anyPublished) {
      post.publishedAt = new Date();
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Post published successfully',
      data: post,
      results
    });
    
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish post'
    });
  }
};

// Get post analytics
const getPostAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const analytics = await SocialMediaAnalytics.find({ postId: id })
      .populate('accountId', 'platform accountName');
    
    if (!analytics || analytics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No analytics found for this post'
      });
    }
    
    res.status(200).json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Get post analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Get calendar view data
const getCalendar = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const posts = await SocialMediaPost.find({
      $or: [
        {
          status: 'scheduled',
          scheduledAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          status: 'published',
          publishedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      ]
    })
      .populate('platforms.accountId', 'platform accountName')
      .sort({ scheduledAt: 1, publishedAt: 1 });
    
    res.status(200).json({
      success: true,
      data: posts
    });
    
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data'
    });
  }
};

// Get hashtag suggestions
const getHashtagSuggestions = async (req, res) => {
  try {
    const { query, platform } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    // Get hashtag suggestions based on previous posts
    const posts = await SocialMediaPost.find({
      hashtags: { $exists: true, $ne: [] },
      status: 'published'
    }).select('hashtags analytics');
    
    // Count hashtag usage and performance
    const hashtagStats = {};
    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        const cleanTag = tag.toLowerCase().replace('#', '');
        if (cleanTag.includes(query.toLowerCase())) {
          if (!hashtagStats[cleanTag]) {
            hashtagStats[cleanTag] = {
              tag: `#${cleanTag}`,
              usage: 0,
              totalEngagement: 0
            };
          }
          hashtagStats[cleanTag].usage++;
          hashtagStats[cleanTag].totalEngagement += (post.analytics?.totalEngagement || 0);
        }
      });
    });
    
    // Sort by usage and engagement
    const suggestions = Object.values(hashtagStats)
      .map(stat => ({
        ...stat,
        avgEngagement: stat.usage > 0 ? Math.round(stat.totalEngagement / stat.usage) : 0
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 20);
    
    // Add some trending hashtags (mock for now, can be integrated with real API)
    const trendingHashtags = [
      { tag: '#trending', usage: 0, avgEngagement: 0, trending: true },
      { tag: '#viral', usage: 0, avgEngagement: 0, trending: true },
      { tag: '#newproduct', usage: 0, avgEngagement: 0, trending: true }
    ].filter(t => t.tag.toLowerCase().includes(query.toLowerCase()));
    
    res.status(200).json({
      success: true,
      data: {
        suggestions: [...suggestions, ...trendingHashtags]
      }
    });
    
  } catch (error) {
    console.error('Get hashtag suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hashtag suggestions'
    });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));
    
    const [
      totalPosts,
      scheduledPosts,
      publishedPosts,
      failedPosts,
      analytics
    ] = await Promise.all([
      SocialMediaPost.countDocuments(),
      SocialMediaPost.countDocuments({ status: 'scheduled' }),
      SocialMediaPost.countDocuments({ 
        status: 'published',
        publishedAt: { $gte: dateFrom }
      }),
      SocialMediaPost.countDocuments({ 
        status: 'failed',
        createdAt: { $gte: dateFrom }
      }),
      SocialMediaPost.aggregate([
        {
          $match: {
            status: 'published',
            publishedAt: { $gte: dateFrom }
          }
        },
        {
          $group: {
            _id: null,
            totalReach: { $sum: '$analytics.totalReach' },
            totalEngagement: { $sum: '$analytics.totalEngagement' },
            totalLikes: { $sum: '$analytics.totalLikes' },
            totalComments: { $sum: '$analytics.totalComments' },
            totalShares: { $sum: '$analytics.totalShares' },
            totalClicks: { $sum: '$analytics.totalClicks' }
          }
        }
      ])
    ]);
    
    const stats = analytics[0] || {
      totalReach: 0,
      totalEngagement: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalClicks: 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        posts: {
          total: totalPosts,
          scheduled: scheduledPosts,
          published: publishedPosts,
          failed: failedPosts
        },
        analytics: stats,
        engagementRate: stats.totalReach > 0 
          ? ((stats.totalEngagement / stats.totalReach) * 100).toFixed(2)
          : 0
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  getPostAnalytics,
  getCalendar,
  getHashtagSuggestions,
  getStats
};
