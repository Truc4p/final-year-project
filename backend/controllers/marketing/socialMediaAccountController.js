const SocialMediaAccount = require('../../models/marketing/socialMediaAccount');
const socialMediaService = require('../../services/socialMediaService');

// Get all connected accounts
const getAccounts = async (req, res) => {
  try {
    const { platform, isActive } = req.query;
    
    const query = {};
    
    if (platform && platform !== 'all') {
      query.platform = platform;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const accounts = await SocialMediaAccount.find(query)
      .populate('connectedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: accounts
    });
    
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    });
  }
};

// Connect new account
const connectAccount = async (req, res) => {
  try {
    const { platform, accessToken, accountId, accountName, profilePicture } = req.body;
    
    if (!platform || !accessToken || !accountId || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Platform, access token, account ID, and account name are required'
      });
    }
    
    // Check if account already exists
    const existingAccount = await SocialMediaAccount.findOne({
      platform,
      accountId
    });
    
    if (existingAccount) {
      // Update existing account
      existingAccount.accessToken = accessToken;
      existingAccount.isActive = true;
      existingAccount.lastSyncedAt = new Date();
      
      if (profilePicture) {
        existingAccount.profilePicture = profilePicture;
      }
      
      await existingAccount.save();
      
      return res.status(200).json({
        success: true,
        message: 'Account reconnected successfully',
        data: existingAccount
      });
    }
    
    // Create new account
    const account = new SocialMediaAccount({
      platform,
      accessToken,
      accountId,
      accountName,
      profilePicture,
      connectedBy: req.user.id,
      lastSyncedAt: new Date()
    });
    
    await account.save();
    await account.populate('connectedBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Account connected successfully',
      data: account
    });
    
  } catch (error) {
    console.error('Connect account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect account'
    });
  }
};

// Disconnect account
const disconnectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    account.isActive = false;
    await account.save();
    
    res.status(200).json({
      success: true,
      message: 'Account disconnected successfully'
    });
    
  } catch (error) {
    console.error('Disconnect account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect account'
    });
  }
};

// Sync account data (followers, etc.)
const syncAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    if (!account.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }
    
    // Sync account data from platform
    const syncedData = await socialMediaService.syncAccountData(account);
    
    account.followers = syncedData.followers;
    account.lastSyncedAt = new Date();
    await account.save();
    
    res.status(200).json({
      success: true,
      message: 'Account synced successfully',
      data: account
    });
    
  } catch (error) {
    console.error('Sync account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync account'
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    await account.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

module.exports = {
  getAccounts,
  connectAccount,
  disconnectAccount,
  syncAccount,
  deleteAccount
};
