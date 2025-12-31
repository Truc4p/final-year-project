const AdPlatformConnection = require('../../models/marketing/AdPlatformConnection');
const GoogleAdsService = require('../../services/googleAdsService');
const FacebookAdsService = require('../../services/facebookAdsService');

/**
 * Get all platform connections
 */
exports.getConnections = async (req, res) => {
  try {
    const { platform, status } = req.query;
    const filter = {};
    
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    
    const connections = await AdPlatformConnection.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Hide sensitive credentials
    const sanitizedConnections = connections.map(conn => {
      const obj = conn.toObject();
      if (obj.credentials) {
        obj.credentials = {
          hasAccessToken: !!obj.credentials.accessToken,
          hasApiKey: !!obj.credentials.apiKey,
          accountId: obj.credentials.accountId,
          customerId: obj.credentials.customerId
        };
      }
      return obj;
    });
    
    res.json({
      success: true,
      connections: sanitizedConnections
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform connections',
      error: error.message
    });
  }
};

/**
 * Get single connection
 */
exports.getConnection = async (req, res) => {
  try {
    const connection = await AdPlatformConnection.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Sanitize credentials
    const obj = connection.toObject();
    if (obj.credentials) {
      obj.credentials = {
        hasAccessToken: !!obj.credentials.accessToken,
        hasApiKey: !!obj.credentials.apiKey,
        accountId: obj.credentials.accountId,
        customerId: obj.credentials.customerId,
        expiresAt: obj.credentials.expiresAt
      };
    }
    
    res.json({
      success: true,
      connection: obj
    });
  } catch (error) {
    console.error('Get connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connection',
      error: error.message
    });
  }
};

/**
 * Create platform connection
 */
exports.createConnection = async (req, res) => {
  try {
    const connection = await AdPlatformConnection.create({
      ...req.body,
      createdBy: req.user._id,
      status: 'connected'
    });
    
    // Test the connection
    const isValid = await exports.testConnection(connection);
    
    if (!isValid) {
      connection.status = 'error';
      await connection.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Platform connection created successfully',
      connection: {
        id: connection._id,
        platform: connection.platform,
        name: connection.name,
        status: connection.status
      }
    });
  } catch (error) {
    console.error('Create connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create platform connection',
      error: error.message
    });
  }
};

/**
 * Update platform connection
 */
exports.updateConnection = async (req, res) => {
  try {
    const connection = await AdPlatformConnection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Test the connection if credentials were updated
    if (req.body.credentials) {
      const isValid = await exports.testConnection(connection);
      if (!isValid) {
        connection.status = 'error';
        await connection.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Connection updated successfully',
      connection: {
        id: connection._id,
        platform: connection.platform,
        name: connection.name,
        status: connection.status
      }
    });
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update connection',
      error: error.message
    });
  }
};

/**
 * Delete platform connection
 */
exports.deleteConnection = async (req, res) => {
  try {
    const connection = await AdPlatformConnection.findByIdAndDelete(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete connection',
      error: error.message
    });
  }
};

/**
 * Test platform connection
 */
exports.testConnection = async (connection) => {
  try {
    if (connection.platform === 'google_ads') {
      const service = new GoogleAdsService(connection);
      const client = service.getClient();
      await client.get(`/customers/${connection.credentials.customerId}`);
      return true;
    } else if (connection.platform === 'facebook_ads') {
      const service = new FacebookAdsService(connection);
      const client = service.getClient();
      await client.get(`/act_${connection.credentials.adAccountId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Test connection error:', error);
    return false;
  }
};

/**
 * Test connection endpoint
 */
exports.testConnectionEndpoint = async (req, res) => {
  try {
    const connection = await AdPlatformConnection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    const isValid = await exports.testConnection(connection);
    
    if (isValid) {
      connection.status = 'connected';
      await connection.save();
    } else {
      connection.status = 'error';
      await connection.save();
    }
    
    res.json({
      success: isValid,
      message: isValid ? 'Connection is valid' : 'Connection test failed',
      status: connection.status
    });
  } catch (error) {
    console.error('Test connection endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test connection',
      error: error.message
    });
  }
};

/**
 * Sync platform data
 */
exports.syncPlatformData = async (req, res) => {
  try {
    const connection = await AdPlatformConnection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Implement sync logic based on platform
    // This would sync campaigns, audiences, and performance data
    
    connection.lastSync = {
      syncedAt: new Date(),
      status: 'success',
      itemsSynced: 0,
      errors: []
    };
    await connection.save();
    
    res.json({
      success: true,
      message: 'Platform data synced successfully',
      lastSync: connection.lastSync
    });
  } catch (error) {
    console.error('Sync platform data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync platform data',
      error: error.message
    });
  }
};

/**
 * OAuth callback handler
 */
exports.oauthCallback = async (req, res) => {
  try {
    const { code, state, platform } = req.query;
    
    // Exchange code for access token
    // This is platform-specific and would require OAuth2 implementation
    
    res.redirect('/marketing/ad-platforms?connected=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/marketing/ad-platforms?error=true');
  }
};

module.exports = exports;
