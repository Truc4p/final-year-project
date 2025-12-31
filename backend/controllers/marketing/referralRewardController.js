const ReferralReward = require('../../models/marketing/referralReward');
const Customer = require('../../models/finance/customer');
const crypto = require('crypto');

// Get rewards
exports.getRewards = async (req, res) => {
  try {
    const { customerId, status, programId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (programId) query.program = programId;
    
    const rewards = await ReferralReward.find(query)
      .populate('program', 'name')
      .populate('customer', 'name email')
      .populate('referral')
      .populate('product', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ReferralReward.countDocuments(query);
    
    res.json({
      success: true,
      data: rewards,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Distribute reward (approve and send)
exports.distributeReward = async (req, res) => {
  try {
    const reward = await ReferralReward.findById(req.params.id)
      .populate('customer')
      .populate('program');
    
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }
    
    if (reward.status !== 'approved' && reward.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Reward cannot be distributed' });
    }
    
    // Generate discount code if needed
    if (reward.rewardType === 'discount' && !reward.discountCode) {
      reward.discountCode = `REF${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }
    
    // Set credit amount if credit reward
    if (reward.rewardType === 'credit') {
      reward.creditAmount = reward.rewardValue;
    }
    
    // Set expiry (30 days from now)
    if (!reward.expiresAt) {
      reward.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    reward.status = 'distributed';
    reward.distributedAt = new Date();
    
    await reward.save();
    
    // Send notification (implement email/SMS service)
    // await sendRewardNotification(reward);
    
    res.json({
      success: true,
      message: 'Reward distributed successfully',
      data: reward
    });
  } catch (error) {
    console.error('Distribute reward error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Cancel reward
exports.cancelReward = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const reward = await ReferralReward.findById(req.params.id);
    
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }
    
    if (reward.status === 'used') {
      return res.status(400).json({ success: false, message: 'Cannot cancel used reward' });
    }
    
    reward.status = 'cancelled';
    reward.notes = reason || 'Cancelled by admin';
    
    await reward.save();
    
    res.json({
      success: true,
      message: 'Reward cancelled successfully',
      data: reward
    });
  } catch (error) {
    console.error('Cancel reward error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get customer rewards (for customer portal)
exports.getCustomerRewards = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const rewards = await ReferralReward.find({
      customer: customerId,
      status: { $in: ['distributed', 'approved'] }
    })
      .populate('program', 'name')
      .populate('product', 'name price imageUrl')
      .sort({ createdAt: -1 });
    
    // Separate by status
    const available = rewards.filter(r => r.isValid());
    const used = rewards.filter(r => r.status === 'used');
    const expired = rewards.filter(r => r.expiresAt && r.expiresAt < new Date() && r.status !== 'used');
    
    res.json({
      success: true,
      data: {
        available,
        used,
        expired,
        totalValue: available.reduce((sum, r) => sum + r.rewardValue, 0)
      }
    });
  } catch (error) {
    console.error('Get customer rewards error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
