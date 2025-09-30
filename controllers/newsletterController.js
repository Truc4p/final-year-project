const NewsletterSubscription = require('../models/newsletterSubscription');

// Subscribe to newsletter
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

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
        await existingSubscription.save();
        
        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter!',
          data: {
            email: existingSubscription.email,
            subscriptionDate: existingSubscription.subscriptionDate
          }
        });
      }
    }

    // Create new subscription
    const subscriptionData = {
      email,
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

// Get all active subscriptions (admin only)
const getActiveSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const subscriptions = await NewsletterSubscription.find(query)
      .select('email subscriptionDate source preferences')
      .sort({ subscriptionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NewsletterSubscription.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
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

module.exports = {
  subscribe,
  unsubscribe,
  getActiveSubscriptions,
  getSubscriptionStats,
  updatePreferences
};