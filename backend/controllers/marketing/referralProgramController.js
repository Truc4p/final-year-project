const ReferralProgram = require('../../models/marketing/referralProgram');
const ReferralCode = require('../../models/marketing/referralCode');
const Referral = require('../../models/marketing/referral');
const ReferralReward = require('../../models/marketing/referralReward');

// Get all programs
exports.getPrograms = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const programs = await ReferralProgram.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ReferralProgram.countDocuments(query);
    
    res.json({
      success: true,
      data: programs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single program
exports.getProgram = async (req, res) => {
  try {
    const program = await ReferralProgram.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('referrerRewards.productId', 'name price')
      .populate('refereeRewards.productId', 'name price');
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({ success: true, data: program });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create program
exports.createProgram = async (req, res) => {
  try {
    const programData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const program = new ReferralProgram(programData);
    await program.save();
    
    res.status(201).json({
      success: true,
      message: 'Referral program created successfully',
      data: program
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update program
exports.updateProgram = async (req, res) => {
  try {
    const program = await ReferralProgram.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await ReferralProgram.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get program analytics
exports.getProgramAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const program = await ReferralProgram.findById(id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get referral statistics
    const referralStats = await Referral.aggregate([
      { $match: { program: program._id, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$orderAmount' }
        }
      }
    ]);
    
    // Get top referrers
    const topReferrers = await Referral.aggregate([
      { $match: { program: program._id, status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: '$referrer',
          referralCount: { $sum: 1 },
          totalRevenue: { $sum: '$orderAmount' }
        }
      },
      { $sort: { referralCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' }
    ]);
    
    // Get rewards distributed
    const rewardStats = await ReferralReward.aggregate([
      { $match: { program: program._id, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$rewardValue' }
        }
      }
    ]);
    
    // Get timeline data (daily referrals)
    const timeline = await Referral.aggregate([
      { $match: { program: program._id, ...dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          referrals: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          revenue: { $sum: '$orderAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        program: program.analytics,
        referralStats,
        topReferrers,
        rewardStats,
        timeline
      }
    });
  } catch (error) {
    console.error('Get program analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { programId, limit = 50, timeframe = 'all' } = req.query;
    
    const query = { status: 'completed' };
    if (programId) query.program = programId;
    
    // Add timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        query.completedAt = { $gte: startDate };
      }
    }
    
    const leaderboard = await Referral.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$referrer',
          referralCount: { $sum: 1 },
          totalRevenue: { $sum: '$orderAmount' },
          lastReferralDate: { $max: '$completedAt' }
        }
      },
      { $sort: { referralCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $lookup: {
          from: 'referralcodes',
          let: { referrerId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$referrer', '$$referrerId'] } } },
            { $limit: 1 }
          ],
          as: 'code'
        }
      },
      { $unwind: { path: '$code', preserveNullAndEmptyArrays: true } }
    ]);
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
