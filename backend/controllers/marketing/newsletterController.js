const NewsletterSubscription = require('../../models/marketing/newsletterSubscription');

// Subscribe to newsletter
const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscription = await NewsletterSubscription.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(409).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate existing subscription
        existingSubscription.isActive = true;
        existingSubscription.subscriptionDate = new Date();
        existingSubscription.unsubscribedDate = null;
        if (name) {
          existingSubscription.name = name;
        }
        await existingSubscription.save();
        
        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter!',
          data: {
            email: existingSubscription.email,
            name: existingSubscription.name,
            subscriptionDate: existingSubscription.subscriptionDate
          }
        });
      }
    }

    // Create new subscription
    const subscriptionData = {
      email,
      name: name || null,
      source: 'public_page',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // If user is logged in, associate with user
    if (req.user && req.user.id) {
      subscriptionData.userId = req.user.id;
    }

    const newSubscription = new NewsletterSubscription(subscriptionData);
    await newSubscription.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: {
        email: newSubscription.email,
        subscriptionDate: newSubscription.subscriptionDate,
        unsubscribeToken: newSubscription.unsubscribeToken
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
};

// Unsubscribe from newsletter
const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Unsubscribe token is required'
      });
    }

    const subscription = await NewsletterSubscription.findOne({ 
      unsubscribeToken: token,
      isActive: true 
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired unsubscribe link'
      });
    }

    await subscription.unsubscribe();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: {
        email: subscription.email,
        unsubscribedDate: subscription.unsubscribedDate
      }
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
};

// Unsubscribe from newsletter by email (for backward compatibility)
const unsubscribeByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscription = await NewsletterSubscription.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this email address'
      });
    }

    await subscription.unsubscribe();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: {
        email: subscription.email,
        unsubscribedDate: subscription.unsubscribedDate
      }
    });

  } catch (error) {
    console.error('Newsletter unsubscribe by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
};

// Get all active subscriptions (admin only) with enhanced filtering
const getActiveSubscriptions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      source,
      dateFrom,
      dateTo,
      sortBy = 'subscriptionDate',
      sortOrder = 'desc',
      preferences
    } = req.query;
    
    const query = {}; // Remove the isActive: true filter to show all subscribers
    
    // Search by email
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }
    
    // Filter by source
    if (source && source !== 'all') {
      query.source = source;
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      query.subscriptionDate = {};
      if (dateFrom) {
        query.subscriptionDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.subscriptionDate.$lte = new Date(dateTo);
      }
    }
    
    // Filter by preferences
    if (preferences) {
      try {
        const prefObj = JSON.parse(preferences);
        Object.keys(prefObj).forEach(key => {
          if (prefObj[key] !== undefined) {
            query[`preferences.${key}`] = prefObj[key];
          }
        });
      } catch (e) {
        // Ignore invalid preference JSON
      }
    }
    
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortDirection };

    const subscriptions = await NewsletterSubscription.find(query)
      .select('email subscriptionDate source preferences ipAddress userId isActive')
      .populate('userId', 'username email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NewsletterSubscription.countDocuments(query);

    // Get additional stats
    const sourceStats = await NewsletterSubscription.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        sourceStats
      }
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
};

// Get subscription statistics (admin only)
const getSubscriptionStats = async (req, res) => {
  try {
    const stats = await NewsletterSubscription.getStats();
    
    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubscriptions = await NewsletterSubscription.countDocuments({
      subscriptionDate: { $gte: thirtyDaysAgo },
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats[0],
        recentSubscriptions
      }
    });

  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription statistics'
    });
  }
};

// Update subscription preferences
const updatePreferences = async (req, res) => {
  try {
    const { token } = req.params;
    const { preferences } = req.body;

    const subscription = await NewsletterSubscription.findOne({ 
      unsubscribeToken: token,
      isActive: true 
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (preferences) {
      subscription.preferences = { ...subscription.preferences, ...preferences };
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: subscription.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

// Get single subscription details (admin only)
const getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await NewsletterSubscription.findById(id)
      .populate('userId', 'username email role');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
    
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
};

// Update subscription (admin only)
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences, isActive } = req.body;
    
    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const subscription = await NewsletterSubscription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
    
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
};

// Bulk operations on subscriptions (admin only)
const bulkUpdateSubscriptions = async (req, res) => {
  try {
    const { operation, subscriptionIds, updateData } = req.body;
    
    if (!operation || !subscriptionIds || !Array.isArray(subscriptionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation data'
      });
    }
    
    let result;
    
    switch (operation) {
      case 'activate':
        result = await NewsletterSubscription.updateMany(
          { _id: { $in: subscriptionIds } },
          { isActive: true }
        );
        break;
        
      case 'deactivate':
        result = await NewsletterSubscription.updateMany(
          { _id: { $in: subscriptionIds } },
          { isActive: false, unsubscribedDate: new Date() }
        );
        break;
        
      case 'updatePreferences':
        if (!updateData || !updateData.preferences) {
          return res.status(400).json({
            success: false,
            message: 'Preferences data required'
          });
        }
        result = await NewsletterSubscription.updateMany(
          { _id: { $in: subscriptionIds } },
          { preferences: updateData.preferences }
        );
        break;
        
      case 'delete':
        result = await NewsletterSubscription.deleteMany(
          { _id: { $in: subscriptionIds } }
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        operation
      }
    });
    
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
};

// Export subscriptions to CSV (admin only)
const exportSubscriptions = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.query;
    
    const query = { isActive: true };
    
    // Apply filters similar to getActiveSubscriptions
    if (filters.source) query.source = filters.source;
    if (filters.dateFrom || filters.dateTo) {
      query.subscriptionDate = {};
      if (filters.dateFrom) query.subscriptionDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.subscriptionDate.$lte = new Date(filters.dateTo);
    }
    
    const subscriptions = await NewsletterSubscription.find(query)
      .select('email subscriptionDate source preferences')
      .sort({ subscriptionDate: -1 });
    
    if (format === 'csv') {
      const csvHeader = 'Email,Subscription Date,Source,New Products,Promotions,Newsletter\n';
      const csvRows = subscriptions.map(sub => {
        return [
          sub.email,
          sub.subscriptionDate.toISOString().split('T')[0],
          sub.source,
          sub.preferences.newProducts,
          sub.preferences.promotions,
          sub.preferences.newsletter
        ].join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=newsletter_subscriptions.csv');
      res.send(csvContent);
    } else {
      res.status(200).json({
        success: true,
        data: subscriptions
      });
    }
    
  } catch (error) {
    console.error('Export subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export subscriptions'
    });
  }
};

// Get subscription analytics and insights (admin only)
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let dateFrom;
    
    switch (timeframe) {
      case '7d':
        dateFrom = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        dateFrom = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        dateFrom = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        dateFrom = new Date(now.setDate(now.getDate() - 30));
    }
    
    // Subscription growth over time
    const growthData = await NewsletterSubscription.aggregate([
      {
        $match: {
          subscriptionDate: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$subscriptionDate'
            }
          },
          newSubscriptions: { $sum: 1 },
          unsubscriptions: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isActive', false] },
                  { $gte: ['$unsubscribedDate', dateFrom] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Source breakdown
    const sourceBreakdown = await NewsletterSubscription.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Preferences breakdown
    const preferencesBreakdown = await NewsletterSubscription.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          newProducts: { $sum: { $cond: ['$preferences.newProducts', 1, 0] } },
          promotions: { $sum: { $cond: ['$preferences.promotions', 1, 0] } },
          newsletter: { $sum: { $cond: ['$preferences.newsletter', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        timeframe,
        growthData,
        sourceBreakdown,
        preferencesBreakdown: preferencesBreakdown[0] || {
          newProducts: 0,
          promotions: 0,
          newsletter: 0,
          total: 0
        }
      }
    });
    
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics'
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  unsubscribeByEmail,
  getActiveSubscriptions,
  getSubscription,
  updateSubscription,
  bulkUpdateSubscriptions,
  exportSubscriptions,
  getSubscriptionAnalytics,
  getSubscriptionStats,
  updatePreferences
};