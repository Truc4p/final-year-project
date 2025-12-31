const ReferralCode = require('../../models/marketing/referralCode');
const ReferralProgram = require('../../models/marketing/referralProgram');
const Customer = require('../../models/finance/customer');

// Get all referral codes
exports.getCodes = async (req, res) => {
  try {
    const { programId, customerId, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (programId) query.program = programId;
    if (customerId) query.referrer = customerId;
    if (status) query.status = status;
    
    const codes = await ReferralCode.find(query)
      .populate('program', 'name status')
      .populate('referrer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ReferralCode.countDocuments(query);
    
    res.json({
      success: true,
      data: codes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get codes error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Generate referral code for customer
exports.generateCode = async (req, res) => {
  try {
    const { programId, customerId, usageLimit, expiresAt } = req.body;
    
    // Validate program
    const program = await ReferralProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    if (program.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Program is not active' });
    }
    
    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    // Check if customer already has a code for this program
    const existingCode = await ReferralCode.findOne({
      program: programId,
      referrer: customerId,
      status: 'active'
    });
    
    if (existingCode) {
      return res.json({
        success: true,
        message: 'Customer already has an active code',
        data: existingCode
      });
    }
    
    // Generate unique code
    const code = await ReferralCode.generateCode(customerId);
    
    // Create referral link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const link = `${baseUrl}/refer/${code}`;
    
    // Create referral code
    const referralCode = new ReferralCode({
      code,
      link,
      program: programId,
      referrer: customerId,
      usageLimit: usageLimit || 0,
      expiresAt: expiresAt || null
    });
    
    await referralCode.save();
    
    res.status(201).json({
      success: true,
      message: 'Referral code generated successfully',
      data: referralCode
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get code by code string
exports.getCodeByString = async (req, res) => {
  try {
    const { code } = req.params;
    
    const referralCode = await ReferralCode.findOne({ code: code.toUpperCase() })
      .populate('program')
      .populate('referrer', 'name email');
    
    if (!referralCode) {
      return res.status(404).json({ success: false, message: 'Referral code not found' });
    }
    
    // Check if valid
    if (!referralCode.isValid()) {
      return res.status(400).json({ success: false, message: 'Referral code is invalid or expired' });
    }
    
    // Increment clicks
    referralCode.analytics.clicks += 1;
    referralCode.lastUsedAt = new Date();
    await referralCode.save();
    
    res.json({
      success: true,
      data: referralCode
    });
  } catch (error) {
    console.error('Get code by string error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update code
exports.updateCode = async (req, res) => {
  try {
    const { status, usageLimit, expiresAt } = req.body;
    
    const code = await ReferralCode.findByIdAndUpdate(
      req.params.id,
      { status, usageLimit, expiresAt },
      { new: true, runValidators: true }
    );
    
    if (!code) {
      return res.status(404).json({ success: false, message: 'Code not found' });
    }
    
    res.json({
      success: true,
      message: 'Code updated successfully',
      data: code
    });
  } catch (error) {
    console.error('Update code error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete code
exports.deleteCode = async (req, res) => {
  try {
    const code = await ReferralCode.findByIdAndDelete(req.params.id);
    
    if (!code) {
      return res.status(404).json({ success: false, message: 'Code not found' });
    }
    
    res.json({
      success: true,
      message: 'Code deleted successfully'
    });
  } catch (error) {
    console.error('Delete code error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get code analytics
exports.getCodeAnalytics = async (req, res) => {
  try {
    const code = await ReferralCode.findById(req.params.id)
      .populate('program', 'name')
      .populate('referrer', 'name email');
    
    if (!code) {
      return res.status(404).json({ success: false, message: 'Code not found' });
    }
    
    // Get referrals using this code
    const Referral = require('../../models/marketing/referral');
    const referrals = await Referral.find({ referralCode: code._id })
      .populate('referee', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: {
        code,
        referrals
      }
    });
  } catch (error) {
    console.error('Get code analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
