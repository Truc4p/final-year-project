const FixedAsset = require('../../models/finance/fixedAsset');

// ==================== ASSET CRUD ====================

// Get all fixed assets
exports.getFixedAssets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      status, 
      department,
      search,
      minValue,
      maxValue,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetNumber: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minValue || maxValue) {
      query.bookValue = {};
      if (minValue) query.bookValue.$gte = parseFloat(minValue);
      if (maxValue) query.bookValue.$lte = parseFloat(maxValue);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const assets = await FixedAsset.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('assetAccount', 'name accountNumber')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await FixedAsset.countDocuments(query);

    res.json({
      success: true,
      data: assets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single fixed asset
exports.getFixedAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assetAccount', 'name accountNumber')
      .populate('depreciationExpenseAccount', 'name accountNumber')
      .populate('accumulatedDepreciationAccount', 'name accountNumber')
      .populate('disposal.approvedBy', 'name email')
      .populate('maintenanceRecords.createdBy', 'name email');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create fixed asset
exports.createFixedAsset = async (req, res) => {
  try {
    const asset = new FixedAsset({
      ...req.body,
      createdBy: req.user._id
    });

    // Generate depreciation schedule if applicable
    if (asset.depreciationMethod && asset.depreciationMethod !== 'none') {
      asset.depreciationSchedule = asset.generateDepreciationSchedule();
    }

    await asset.save();

    res.status(201).json({
      success: true,
      message: 'Fixed asset created successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update fixed asset
exports.updateFixedAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Don't allow updates to disposed assets (except notes)
    if (['disposed', 'sold', 'written_off'].includes(asset.status) && 
        Object.keys(req.body).some(k => !['notes', 'tags', 'documents'].includes(k))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update disposed assets' 
      });
    }

    const updatedAsset = await FixedAsset.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Fixed asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete fixed asset
exports.deleteFixedAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Only allow deletion of draft/inactive assets with no depreciation processed
    if (asset.status === 'active' && asset.accumulatedDepreciation > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete active assets with depreciation. Please dispose instead.' 
      });
    }

    await asset.deleteOne();

    res.json({
      success: true,
      message: 'Fixed asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DEPRECIATION ====================

// Get depreciation schedule for an asset
exports.getDepreciationSchedule = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id)
      .select('assetNumber name depreciationMethod depreciationSchedule acquisitionCost salvageValue bookValue');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({
      success: true,
      data: {
        assetNumber: asset.assetNumber,
        name: asset.name,
        method: asset.depreciationMethod,
        acquisitionCost: asset.acquisitionCost,
        salvageValue: asset.salvageValue,
        currentBookValue: asset.bookValue,
        schedule: asset.depreciationSchedule
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Regenerate depreciation schedule
exports.regenerateDepreciationSchedule = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Check if any depreciation has been processed
    const processedPeriods = asset.depreciationSchedule.filter(s => s.isProcessed);
    if (processedPeriods.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot regenerate schedule after depreciation has been processed' 
      });
    }

    asset.depreciationSchedule = asset.generateDepreciationSchedule();
    await asset.save();

    res.json({
      success: true,
      message: 'Depreciation schedule regenerated',
      data: asset.depreciationSchedule
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process depreciation for a period
exports.processDepreciation = async (req, res) => {
  try {
    const { periodIndex } = req.body;
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only process depreciation for active assets' 
      });
    }

    const period = asset.processDepreciation(periodIndex);
    asset.updatedBy = req.user._id;
    await asset.save();

    res.json({
      success: true,
      message: 'Depreciation processed successfully',
      data: {
        period,
        newBookValue: asset.bookValue,
        accumulatedDepreciation: asset.accumulatedDepreciation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk process depreciation for all assets
exports.bulkProcessDepreciation = async (req, res) => {
  try {
    const { asOfDate } = req.body;
    const targetDate = asOfDate ? new Date(asOfDate) : new Date();
    
    const assets = await FixedAsset.getAssetsDueForDepreciation(targetDate);
    
    const results = {
      processed: 0,
      skipped: 0,
      errors: [],
      totalDepreciation: 0
    };

    for (const asset of assets) {
      try {
        // Find unprocessed periods up to target date
        const unprocessedPeriods = asset.depreciationSchedule.filter(
          s => !s.isProcessed && new Date(s.periodEnd) <= targetDate
        );

        for (const period of unprocessedPeriods) {
          const periodIndex = asset.depreciationSchedule.indexOf(period);
          asset.processDepreciation(periodIndex);
          results.totalDepreciation += period.depreciationAmount;
        }

        if (unprocessedPeriods.length > 0) {
          asset.updatedBy = req.user._id;
          await asset.save();
          results.processed++;
        } else {
          results.skipped++;
        }
      } catch (err) {
        results.errors.push({ assetNumber: asset.assetNumber, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk depreciation completed`,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DISPOSAL ====================

// Dispose an asset
exports.disposeAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (['disposed', 'sold', 'written_off'].includes(asset.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Asset has already been disposed' 
      });
    }

    const disposalData = {
      ...req.body,
      approvedBy: req.user._id
    };

    const disposal = asset.dispose(disposalData);
    asset.updatedBy = req.user._id;
    await asset.save();

    res.json({
      success: true,
      message: 'Asset disposed successfully',
      data: {
        asset: asset.assetNumber,
        disposal,
        finalBookValue: asset.bookValue,
        gainLoss: disposal.gainLoss
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REVALUATION ====================

// Revalue an asset
exports.revalueAsset = async (req, res) => {
  try {
    const { newValue, reason } = req.body;
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only revalue active assets' 
      });
    }

    const revaluation = asset.revalue(newValue, reason, req.user._id);
    asset.updatedBy = req.user._id;
    await asset.save();

    res.json({
      success: true,
      message: 'Asset revalued successfully',
      data: revaluation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MAINTENANCE ====================

// Add maintenance record
exports.addMaintenanceRecord = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const maintenanceRecord = {
      ...req.body,
      createdBy: req.user._id
    };

    asset.maintenanceRecords.push(maintenanceRecord);
    
    // Update next maintenance date if provided
    if (req.body.nextMaintenanceDate) {
      asset.nextMaintenanceDate = req.body.nextMaintenanceDate;
    }

    asset.updatedBy = req.user._id;
    await asset.save();

    res.status(201).json({
      success: true,
      message: 'Maintenance record added successfully',
      data: asset.maintenanceRecords[asset.maintenanceRecords.length - 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get maintenance history
exports.getMaintenanceHistory = async (req, res) => {
  try {
    const asset = await FixedAsset.findById(req.params.id)
      .select('assetNumber name maintenanceRecords nextMaintenanceDate')
      .populate('maintenanceRecords.createdBy', 'name email');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Calculate total maintenance cost
    const totalCost = asset.maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    res.json({
      success: true,
      data: {
        assetNumber: asset.assetNumber,
        name: asset.name,
        nextMaintenanceDate: asset.nextMaintenanceDate,
        totalMaintenanceCost: totalCost,
        records: asset.maintenanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REPORTS & DASHBOARD ====================

// Get fixed assets dashboard
exports.getAssetsDashboard = async (req, res) => {
  try {
    // Summary by category
    const categoryStats = await FixedAsset.getSummaryByCategory();
    
    // Summary by status
    const statusStats = await FixedAsset.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$bookValue' }
        }
      }
    ]);

    // Summary by location
    const locationStats = await FixedAsset.getAssetsByLocation();

    // Totals
    const totals = await FixedAsset.aggregate([
      { $match: { status: { $in: ['active', 'inactive', 'under_maintenance'] } } },
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalCost: { $sum: '$acquisitionCost' },
          totalBookValue: { $sum: '$bookValue' },
          totalAccumulatedDepreciation: { $sum: '$accumulatedDepreciation' }
        }
      }
    ]);

    // Assets due for maintenance
    const maintenanceDue = await FixedAsset.countDocuments({
      status: 'active',
      nextMaintenanceDate: { $lte: new Date() }
    });

    // Fully depreciated assets
    const fullyDepreciated = await FixedAsset.countDocuments({
      status: 'active',
      $expr: { $lte: ['$bookValue', '$salvageValue'] }
    });

    // Recent acquisitions
    const recentAcquisitions = await FixedAsset.find()
      .sort({ acquisitionDate: -1 })
      .limit(5)
      .select('assetNumber name category acquisitionDate acquisitionCost');

    // Recent disposals
    const recentDisposals = await FixedAsset.find({
      status: { $in: ['disposed', 'sold', 'written_off'] }
    })
      .sort({ 'disposal.date': -1 })
      .limit(5)
      .select('assetNumber name disposal');

    res.json({
      success: true,
      data: {
        totals: totals[0] || { totalAssets: 0, totalCost: 0, totalBookValue: 0, totalAccumulatedDepreciation: 0 },
        categoryStats,
        statusStats,
        locationStats,
        maintenanceDue,
        fullyDepreciated,
        recentAcquisitions,
        recentDisposals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Asset register report
exports.getAssetRegister = async (req, res) => {
  try {
    const { category, status, asOfDate, format = 'json' } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const assets = await FixedAsset.find(query)
      .populate('assetAccount', 'name accountNumber')
      .populate('assignedTo', 'name')
      .sort({ category: 1, assetNumber: 1 });

    const registerData = assets.map(asset => ({
      assetNumber: asset.assetNumber,
      name: asset.name,
      category: asset.category,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
      depreciationMethod: asset.depreciationMethod,
      usefulLife: asset.usefulLifeYears,
      salvageValue: asset.salvageValue,
      accumulatedDepreciation: asset.accumulatedDepreciation,
      bookValue: asset.bookValue,
      location: asset.location?.building,
      assignedTo: asset.assignedTo?.name,
      status: asset.status
    }));

    // Calculate totals
    const totals = {
      totalCost: assets.reduce((sum, a) => sum + a.acquisitionCost, 0),
      totalAccumulatedDepreciation: assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0),
      totalBookValue: assets.reduce((sum, a) => sum + a.bookValue, 0)
    };

    res.json({
      success: true,
      data: {
        asOfDate: asOfDate || new Date(),
        assets: registerData,
        totals,
        count: assets.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Depreciation report
exports.getDepreciationReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const query = { status: 'active', depreciationMethod: { $ne: 'none' } };
    if (category) query.category = category;

    const assets = await FixedAsset.find(query)
      .select('assetNumber name category acquisitionCost salvageValue depreciationMethod usefulLifeYears accumulatedDepreciation bookValue depreciationSchedule');

    const reportData = assets.map(asset => {
      // Get depreciation for the period
      let periodDepreciation = 0;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        periodDepreciation = asset.depreciationSchedule
          .filter(s => s.isProcessed && new Date(s.periodEnd) >= start && new Date(s.periodEnd) <= end)
          .reduce((sum, s) => sum + s.depreciationAmount, 0);
      }

      return {
        assetNumber: asset.assetNumber,
        name: asset.name,
        category: asset.category,
        acquisitionCost: asset.acquisitionCost,
        depreciationMethod: asset.depreciationMethod,
        usefulLife: asset.usefulLifeYears,
        salvageValue: asset.salvageValue,
        openingAccumulatedDepreciation: asset.accumulatedDepreciation - periodDepreciation,
        periodDepreciation,
        closingAccumulatedDepreciation: asset.accumulatedDepreciation,
        bookValue: asset.bookValue
      };
    });

    const totals = {
      totalAcquisitionCost: reportData.reduce((sum, a) => sum + a.acquisitionCost, 0),
      totalPeriodDepreciation: reportData.reduce((sum, a) => sum + a.periodDepreciation, 0),
      totalAccumulatedDepreciation: reportData.reduce((sum, a) => sum + a.closingAccumulatedDepreciation, 0),
      totalBookValue: reportData.reduce((sum, a) => sum + a.bookValue, 0)
    };

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        assets: reportData,
        totals,
        count: reportData.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transfer asset
exports.transferAsset = async (req, res) => {
  try {
    const { newLocation, newDepartment, newAssignedTo, reason } = req.body;
    const asset = await FixedAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Store previous values for audit
    const previousLocation = { ...asset.location };
    const previousDepartment = asset.department;
    const previousAssignedTo = asset.assignedTo;

    // Update location/assignment
    if (newLocation) asset.location = newLocation;
    if (newDepartment) asset.department = newDepartment;
    if (newAssignedTo) asset.assignedTo = newAssignedTo;

    asset.updatedBy = req.user._id;
    await asset.save();

    res.json({
      success: true,
      message: 'Asset transferred successfully',
      data: {
        assetNumber: asset.assetNumber,
        previousLocation,
        newLocation: asset.location,
        previousDepartment,
        newDepartment: asset.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
