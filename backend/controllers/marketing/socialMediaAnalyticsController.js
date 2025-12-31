const SocialMediaAnalytics = require('../../models/marketing/socialMediaAnalytics');
const SocialMediaPost = require('../../models/marketing/socialMediaPost');
const socialMediaService = require('../../services/socialMediaService');

// Get analytics for a specific post
const getPostAnalytics = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const analytics = await SocialMediaAnalytics.find({ postId })
      .populate('accountId', 'platform accountName')
      .sort({ recordedAt: -1 });
    
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
      message: 'Failed to fetch post analytics'
    });
  }
};

// Get overall analytics
const getOverallAnalytics = async (req, res) => {
  try {
    const { days = 30, platform } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));
    
    const matchQuery = {
      recordedAt: { $gte: dateFrom }
    };
    
    if (platform && platform !== 'all') {
      matchQuery.platform = platform;
    }
    
    const analytics = await SocialMediaAnalytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalReach: { $sum: '$metrics.reach' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' },
          totalSaves: { $sum: '$metrics.saves' },
          totalLinkClicks: { $sum: '$metrics.linkClicks' },
          totalVideoViews: { $sum: '$metrics.videoViews' },
          avgEngagementRate: { $avg: '$metrics.engagementRate' },
          avgClickThroughRate: { $avg: '$metrics.clickThroughRate' },
          postCount: { $sum: 1 }
        }
      }
    ]);
    
    // Get platform breakdown
    const platformBreakdown = await SocialMediaAnalytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$platform',
          reach: { $sum: '$metrics.reach' },
          engagement: { $sum: { $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'] } },
          posts: { $sum: 1 }
        }
      }
    ]);
    
    // Get top performing posts
    const topPosts = await SocialMediaPost.find({
      status: 'published',
      publishedAt: { $gte: dateFrom }
    })
      .sort({ 'analytics.totalEngagement': -1 })
      .limit(10)
      .populate('platforms.accountId', 'platform accountName');
    
    const data = analytics[0] || {
      totalReach: 0,
      totalImpressions: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
      totalLinkClicks: 0,
      totalVideoViews: 0,
      avgEngagementRate: 0,
      avgClickThroughRate: 0,
      postCount: 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        overall: data,
        platformBreakdown,
        topPosts
      }
    });
    
  } catch (error) {
    console.error('Get overall analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Sync analytics from platforms
const syncAnalytics = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await SocialMediaPost.findById(postId)
      .populate('platforms.accountId');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Can only sync analytics for published posts'
      });
    }
    
    // Sync analytics from each platform
    const analyticsData = await socialMediaService.syncPostAnalytics(post);
    
    // Update post analytics summary
    let totalReach = 0;
    let totalEngagement = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalClicks = 0;
    
    analyticsData.forEach(data => {
      totalReach += data.metrics.reach || 0;
      totalEngagement += (data.metrics.likes + data.metrics.comments + data.metrics.shares) || 0;
      totalLikes += data.metrics.likes || 0;
      totalComments += data.metrics.comments || 0;
      totalShares += data.metrics.shares || 0;
      totalClicks += data.metrics.linkClicks || 0;
    });
    
    post.analytics = {
      totalReach,
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      totalClicks
    };
    
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Analytics synced successfully',
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Sync analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync analytics'
    });
  }
};

// Get comments for moderation
const getComments = async (req, res) => {
  try {
    const { postId, platform, sentiment, replied } = req.query;
    
    const query = {};
    
    if (postId) {
      query.postId = postId;
    }
    
    if (platform && platform !== 'all') {
      query.platform = platform;
    }
    
    const analytics = await SocialMediaAnalytics.find(query)
      .populate('postId', 'title content')
      .populate('accountId', 'platform accountName');
    
    // Flatten comments from all analytics
    let allComments = [];
    analytics.forEach(analytic => {
      if (analytic.comments && analytic.comments.length > 0) {
        analytic.comments.forEach(comment => {
          allComments.push({
            ...comment.toObject(),
            postId: analytic.postId,
            platform: analytic.platform,
            accountId: analytic.accountId,
            analyticsId: analytic._id
          });
        });
      }
    });
    
    // Filter comments
    if (sentiment) {
      allComments = allComments.filter(c => c.sentiment === sentiment);
    }
    
    if (replied !== undefined) {
      allComments = allComments.filter(c => c.replied === (replied === 'true'));
    }
    
    // Sort by timestamp
    allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.status(200).json({
      success: true,
      data: allComments
    });
    
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Reply to comment
const replyToComment = async (req, res) => {
  try {
    const { analyticsId, commentId } = req.params;
    const { replyText } = req.body;
    
    if (!replyText) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }
    
    const analytics = await SocialMediaAnalytics.findById(analyticsId)
      .populate('accountId');
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }
    
    const comment = analytics.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Reply to comment via platform API
    await socialMediaService.replyToComment(
      analytics.platform,
      analytics.accountId,
      comment.commentId,
      replyText
    );
    
    comment.replied = true;
    await analytics.save();
    
    res.status(200).json({
      success: true,
      message: 'Reply sent successfully'
    });
    
  } catch (error) {
    console.error('Reply to comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reply to comment'
    });
  }
};

// Hide/unhide comment
const toggleCommentVisibility = async (req, res) => {
  try {
    const { analyticsId, commentId } = req.params;
    const { hidden } = req.body;
    
    const analytics = await SocialMediaAnalytics.findById(analyticsId)
      .populate('accountId');
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }
    
    const comment = analytics.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Hide/unhide comment via platform API
    await socialMediaService.toggleCommentVisibility(
      analytics.platform,
      analytics.accountId,
      comment.commentId,
      hidden
    );
    
    comment.hidden = hidden;
    await analytics.save();
    
    res.status(200).json({
      success: true,
      message: `Comment ${hidden ? 'hidden' : 'unhidden'} successfully`
    });
    
  } catch (error) {
    console.error('Toggle comment visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment visibility'
    });
  }
};

module.exports = {
  getPostAnalytics,
  getOverallAnalytics,
  syncAnalytics,
  getComments,
  replyToComment,
  toggleCommentVisibility
};
