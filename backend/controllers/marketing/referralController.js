const Referral = require('../../models/marketing/referral');
const ReferralCode = require('../../models/marketing/referralCode');
const ReferralReward = require('../../models/marketing/referralReward');
const ReferralProgram = require('../../models/marketing/referralProgram');
const Customer = require('../../models/finance/customer');

// Get all referrals
exports.getReferrals = async (req, res) => {
  try {
    const { programId, customerId, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (programId) query.program = programId;
    if (customerId) {
      query.$or = [{ referrer: customerId }, { referee: customerId }];
    }
    if (status) query.status = status;
    
    const referrals = await Referral.find(query)
      .populate('program', 'name')
      .populate('referrer', 'name email')
      .populate('referee', 'name email')
      .populate('referralCode', 'code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Referral.countDocuments(query);
    
    res.json({
      success: true,
      data: referrals,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Track referral click
exports.trackClick = async (req, res) => {
  try {
    const { code, metadata } = req.body;
    
    // Find referral code
    const referralCode = await ReferralCode.findOne({ code: code.toUpperCase() })
      .populate('program');
    
    if (!referralCode) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }
    
    if (!referralCode.isValid()) {
      return res.status(400).json({ success: false, message: 'Referral code is expired or inactive' });
    }
    
    res.json({
      success: true,
      message: 'Click tracked',
      data: {
        program: referralCode.program,
        referralCode: referralCode._id,
        referrer: referralCode.referrer
      }
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create referral (when referee signs up/purchases)
exports.createReferral = async (req, res) => {
  try {
    const { referralCodeId, refereeId, orderId, orderAmount, metadata } = req.body;
    
    // Validate referral code
    const referralCode = await ReferralCode.findById(referralCodeId)
      .populate('program');
    
    if (!referralCode || !referralCode.isValid()) {
      return res.status(400).json({ success: false, message: 'Invalid referral code' });
    }
    
    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referralCode: referralCodeId,
      referee: refereeId
    });
    
    if (existingReferral) {
      return res.status(400).json({ success: false, message: 'Referral already exists' });
    }
    
    // Create referral
    const referral = new Referral({
      program: referralCode.program._id,
      referralCode: referralCodeId,
      referrer: referralCode.referrer,
      referee: refereeId,
      signed_up: true,
      signedUpAt: new Date(),
      purchased: !!orderId,
      purchasedAt: orderId ? new Date() : null,
      order: orderId || null,
      orderAmount: orderAmount || 0,
      metadata: metadata || {},
      status: orderId ? 'completed' : 'pending'
    });
    
    await referral.save();
    
    // Update referral code analytics
    referralCode.analytics.referrals += 1;
    referralCode.usageCount += 1;
    referralCode.lastUsedAt = new Date();
    
    if (orderId) {
      referralCode.analytics.successfulReferrals += 1;
      referralCode.analytics.totalRevenue += orderAmount || 0;
    }
    
    await referralCode.save();
    
    // Update program analytics
    const program = referralCode.program;
    program.analytics.totalReferrals += 1;
    if (orderId) {
      program.analytics.successfulReferrals += 1;
      program.analytics.totalRevenueGenerated += orderAmount || 0;
    }
    await program.save();
    
    // Distribute rewards if purchase is made
    if (orderId && orderAmount >= program.requirements.minimumPurchaseAmount) {
      await distributeRewards(referral, program);
    }
    
    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: referral
    });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update referral (e.g., when purchase is made)
exports.updateReferral = async (req, res) => {
  try {
    const { orderId, orderAmount } = req.body;
    
    const referral = await Referral.findById(req.params.id)
      .populate('program');
    
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    
    if (referral.purchased) {
      return res.status(400).json({ success: false, message: 'Referral already completed' });
    }
    
    // Update referral
    referral.purchased = true;
    referral.purchasedAt = new Date();
    referral.order = orderId;
    referral.orderAmount = orderAmount;
    referral.status = 'completed';
    referral.completedAt = new Date();
    
    await referral.save();
    
    // Update analytics
    const referralCode = await ReferralCode.findById(referral.referralCode);
    if (referralCode) {
      referralCode.analytics.successfulReferrals += 1;
      referralCode.analytics.totalRevenue += orderAmount;
      await referralCode.save();
    }
    
    const program = referral.program;
    program.analytics.successfulReferrals += 1;
    program.analytics.totalRevenueGenerated += orderAmount;
    await program.save();
    
    // Distribute rewards
    if (orderAmount >= program.requirements.minimumPurchaseAmount) {
      await distributeRewards(referral, program);
    }
    
    res.json({
      success: true,
      message: 'Referral updated successfully',
      data: referral
    });
  } catch (error) {
    console.error('Update referral error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Helper function to distribute rewards
async function distributeRewards(referral, program) {
  try {
    const rewards = [];
    
    // Referrer reward
    if (program.referrerRewards.enabled) {
      const referrerReward = new ReferralReward({
        program: program._id,
        referral: referral._id,
        customer: referral.referrer,
        recipientType: 'referrer',
        rewardType: program.referrerRewards.rewardType,
        rewardValue: program.referrerRewards.rewardValue,
        rewardUnit: program.referrerRewards.rewardUnit,
        product: program.referrerRewards.productId,
        status: 'approved',
        description: program.referrerRewards.description
      });
      
      await referrerReward.save();
      rewards.push(referrerReward);
      referral.referrerReward = referrerReward._id;
    }
    
    // Referee reward
    if (program.refereeRewards.enabled) {
      const refereeReward = new ReferralReward({
        program: program._id,
        referral: referral._id,
        customer: referral.referee,
        recipientType: 'referee',
        rewardType: program.refereeRewards.rewardType,
        rewardValue: program.refereeRewards.rewardValue,
        rewardUnit: program.refereeRewards.rewardUnit,
        product: program.refereeRewards.productId,
        status: 'approved',
        description: program.refereeRewards.description
      });
      
      await refereeReward.save();
      rewards.push(refereeReward);
      referral.refereeReward = refereeReward._id;
    }
    
    await referral.save();
    
    // Update program analytics
    program.analytics.totalRewardsGiven += rewards.length;
    await program.save();
    
    return rewards;
  } catch (error) {
    console.error('Distribute rewards error:', error);
    throw error;
  }
}

module.exports.distributeRewards = distributeRewards;
