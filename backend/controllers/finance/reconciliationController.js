const ReconciliationRule = require('../../models/finance/reconciliationRule');
const ReconciliationBatch = require('../../models/finance/reconciliationBatch');
const Bill = require('../../models/finance/bill');
const Invoice = require('../../models/finance/invoice');
const Payment = require('../../models/finance/paymentBatch');
const JournalEntry = require('../../models/finance/journalEntry');

// ==================== RECONCILIATION RULES ====================

// Get all reconciliation rules
exports.getReconciliationRules = async (req, res) => {
  try {
    const { page = 1, limit = 20, ruleType, sourceType, targetType, isActive } = req.query;
    
    const query = {};
    if (ruleType) query.ruleType = ruleType;
    if (sourceType) query.sourceType = sourceType;
    if (targetType) query.targetType = targetType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const rules = await ReconciliationRule.find(query)
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ReconciliationRule.countDocuments(query);

    res.json({
      success: true,
      data: rules,
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

// Get single reconciliation rule
exports.getReconciliationRule = async (req, res) => {
  try {
    const rule = await ReconciliationRule.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create reconciliation rule
exports.createReconciliationRule = async (req, res) => {
  try {
    const rule = new ReconciliationRule({
      ...req.body,
      createdBy: req.user._id
    });

    await rule.save();

    res.status(201).json({
      success: true,
      message: 'Reconciliation rule created successfully',
      data: rule
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reconciliation rule
exports.updateReconciliationRule = async (req, res) => {
  try {
    const rule = await ReconciliationRule.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({
      success: true,
      message: 'Reconciliation rule updated successfully',
      data: rule
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete reconciliation rule
exports.deleteReconciliationRule = async (req, res) => {
  try {
    const rule = await ReconciliationRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({
      success: true,
      message: 'Reconciliation rule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle rule active status
exports.toggleRuleStatus = async (req, res) => {
  try {
    const rule = await ReconciliationRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    rule.isActive = !rule.isActive;
    rule.updatedBy = req.user._id;
    await rule.save();

    res.json({
      success: true,
      message: `Rule ${rule.isActive ? 'activated' : 'deactivated'} successfully`,
      data: rule
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RECONCILIATION BATCHES ====================

// Get all reconciliation batches
exports.getReconciliationBatches = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      reconciliationType,
      startDate,
      endDate,
      search 
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (reconciliationType) query.reconciliationType = reconciliationType;
    if (startDate || endDate) {
      query['period.startDate'] = {};
      if (startDate) query['period.startDate'].$gte = new Date(startDate);
      if (endDate) query['period.startDate'].$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const batches = await ReconciliationBatch.find(query)
      .populate('createdBy', 'name email')
      .populate('sourceAccount.accountId', 'name accountNumber')
      .select('-matchedItems -unmatchedSource -unmatchedTarget -discrepancies')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ReconciliationBatch.countDocuments(query);

    res.json({
      success: true,
      data: batches,
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

// Get single reconciliation batch with details
exports.getReconciliationBatch = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('processedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('sourceAccount.accountId', 'name accountNumber')
      .populate('targetAccount.accountId', 'name accountNumber')
      .populate('rulesApplied.rule', 'name ruleType');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create reconciliation batch
exports.createReconciliationBatch = async (req, res) => {
  try {
    const batch = new ReconciliationBatch({
      ...req.body,
      createdBy: req.user._id
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: 'Reconciliation batch created successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reconciliation batch
exports.updateReconciliationBatch = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (!['draft', 'in_progress'].includes(batch.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only update draft or in-progress batches' 
      });
    }

    Object.assign(batch, req.body);
    await batch.save();

    res.json({
      success: true,
      message: 'Reconciliation batch updated successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete reconciliation batch
exports.deleteReconciliationBatch = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete completed batches' 
      });
    }

    await batch.deleteOne();

    res.json({
      success: true,
      message: 'Reconciliation batch deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RECONCILIATION PROCESSING ====================

// Load items for reconciliation
exports.loadReconciliationItems = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const { startDate, endDate } = batch.period;
    
    // Load source items based on reconciliation type
    let sourceItems = [];
    let targetItems = [];

    switch (batch.reconciliationType) {
      case 'bank':
        // Source: Bank statements (journal entries with bank account)
        sourceItems = await JournalEntry.find({
          date: { $gte: startDate, $lte: endDate },
          status: 'posted',
          'lines.account': batch.sourceAccount.accountId
        }).select('entryNumber date description lines totalDebit totalCredit');
        
        // Target: Payments
        targetItems = await Payment.find({
          paymentDate: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'paid'] }
        }).select('paymentNumber paymentDate amount reference vendor');
        break;

      case 'accounts_receivable':
        // Source: Invoices
        sourceItems = await Invoice.find({
          invoiceDate: { $gte: startDate, $lte: endDate },
          status: { $in: ['sent', 'paid', 'partial'] }
        }).select('invoiceNumber invoiceDate totalAmount customer status');
        
        // Target: Customer payments (from journal entries)
        targetItems = await JournalEntry.find({
          date: { $gte: startDate, $lte: endDate },
          status: 'posted',
          type: 'receipt'
        }).select('entryNumber date description lines totalDebit totalCredit');
        break;

      case 'accounts_payable':
        // Source: Bills
        sourceItems = await Bill.find({
          billDate: { $gte: startDate, $lte: endDate },
          status: { $in: ['pending', 'paid', 'partial'] }
        }).select('billNumber billDate totalAmount vendor status');
        
        // Target: Vendor payments
        targetItems = await Payment.find({
          paymentDate: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'paid'] },
          paymentType: 'vendor'
        }).select('paymentNumber paymentDate amount reference vendor');
        break;

      default:
        // Custom - load based on configured source/target types
        break;
    }

    // Transform to standard format
    batch.unmatchedSource = sourceItems.map(item => ({
      itemId: item._id,
      itemType: getItemType(item),
      reference: item.invoiceNumber || item.billNumber || item.paymentNumber || item.entryNumber,
      amount: item.totalAmount || item.amount || item.totalDebit,
      date: item.invoiceDate || item.billDate || item.paymentDate || item.date,
      description: item.description || `${item.customer?.name || item.vendor?.name || ''}`
    }));

    batch.unmatchedTarget = targetItems.map(item => ({
      itemId: item._id,
      itemType: getItemType(item),
      reference: item.invoiceNumber || item.billNumber || item.paymentNumber || item.entryNumber,
      amount: item.totalAmount || item.amount || item.totalCredit,
      date: item.invoiceDate || item.billDate || item.paymentDate || item.date,
      description: item.description || `${item.customer?.name || item.vendor?.name || ''}`
    }));

    // Update statistics
    batch.statistics.totalSourceItems = batch.unmatchedSource.length;
    batch.statistics.totalTargetItems = batch.unmatchedTarget.length;
    batch.statistics.totalSourceAmount = batch.unmatchedSource.reduce((sum, i) => sum + (i.amount || 0), 0);
    batch.statistics.totalTargetAmount = batch.unmatchedTarget.reduce((sum, i) => sum + (i.amount || 0), 0);

    batch.status = 'in_progress';
    await batch.save();

    res.json({
      success: true,
      message: 'Items loaded successfully',
      data: {
        sourceCount: batch.unmatchedSource.length,
        targetCount: batch.unmatchedTarget.length,
        sourceAmount: batch.statistics.totalSourceAmount,
        targetAmount: batch.statistics.totalTargetAmount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to determine item type
function getItemType(item) {
  if (item.invoiceNumber) return 'invoice';
  if (item.billNumber) return 'bill';
  if (item.paymentNumber) return 'payment';
  if (item.entryNumber) return 'journal_entry';
  return 'unknown';
}

// Run auto-matching
exports.runAutoMatching = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.status !== 'in_progress') {
      return res.status(400).json({ 
        success: false, 
        message: 'Batch must be in progress to run matching' 
      });
    }

    // Get active rules
    const rules = await ReconciliationRule.find({ isActive: true })
      .sort({ priority: -1 });

    const matchResults = {
      totalMatches: 0,
      ruleResults: []
    };

    // Apply each rule
    for (const rule of rules) {
      let ruleMatches = 0;

      // Create copies to iterate
      const sourceToMatch = [...batch.unmatchedSource];
      const targetToMatch = [...batch.unmatchedTarget];

      for (const sourceItem of sourceToMatch) {
        for (const targetItem of targetToMatch) {
          // Check if items are still unmatched
          const sourceStillUnmatched = batch.unmatchedSource.some(
            u => String(u.itemId) === String(sourceItem.itemId)
          );
          const targetStillUnmatched = batch.unmatchedTarget.some(
            u => String(u.itemId) === String(targetItem.itemId)
          );

          if (!sourceStillUnmatched || !targetStillUnmatched) continue;

          // Check match using rule
          const matchResult = rule.checkMatch(sourceItem, targetItem);

          if (matchResult.isMatch) {
            batch.addMatch(sourceItem, targetItem, rule, matchResult.score, 'auto');
            ruleMatches++;
            matchResults.totalMatches++;

            // Check for discrepancies
            if (Math.abs(sourceItem.amount - targetItem.amount) > 0.01) {
              batch.addDiscrepancy({
                sourceId: sourceItem.itemId,
                sourceType: sourceItem.itemType,
                sourceReference: sourceItem.reference,
                sourceAmount: sourceItem.amount,
                targetId: targetItem.itemId,
                targetType: targetItem.itemType,
                targetReference: targetItem.reference,
                targetAmount: targetItem.amount,
                discrepancyType: 'amount_mismatch',
                amountDifference: sourceItem.amount - targetItem.amount
              });
            }
            break; // Move to next source item
          }
        }
      }

      if (ruleMatches > 0) {
        batch.rulesApplied.push({
          rule: rule._id,
          ruleName: rule.name,
          matchesFound: ruleMatches
        });
        matchResults.ruleResults.push({
          ruleName: rule.name,
          matches: ruleMatches
        });
      }
    }

    batch.processedAt = new Date();
    batch.processedBy = req.user._id;
    batch.updateStatistics();
    await batch.save();

    res.json({
      success: true,
      message: `Auto-matching completed with ${matchResults.totalMatches} matches found`,
      data: matchResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manual match
exports.manualMatch = async (req, res) => {
  try {
    const { sourceItemId, targetItemId, notes } = req.body;
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const sourceItem = batch.unmatchedSource.find(
      u => String(u.itemId) === sourceItemId
    );
    const targetItem = batch.unmatchedTarget.find(
      u => String(u.itemId) === targetItemId
    );

    if (!sourceItem || !targetItem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Source or target item not found in unmatched lists' 
      });
    }

    batch.addMatch(sourceItem, targetItem, null, 100, 'manual');
    
    // Check for amount discrepancy
    if (Math.abs(sourceItem.amount - targetItem.amount) > 0.01) {
      batch.addDiscrepancy({
        sourceId: sourceItem.itemId,
        sourceType: sourceItem.itemType,
        sourceReference: sourceItem.reference,
        sourceAmount: sourceItem.amount,
        targetId: targetItem.itemId,
        targetType: targetItem.itemType,
        targetReference: targetItem.reference,
        targetAmount: targetItem.amount,
        discrepancyType: 'amount_mismatch',
        amountDifference: sourceItem.amount - targetItem.amount
      });
    }

    // Set the last match to confirmed since it's manual
    const lastMatch = batch.matchedItems[batch.matchedItems.length - 1];
    lastMatch.status = 'confirmed';
    lastMatch.confirmedBy = req.user._id;
    lastMatch.confirmedAt = new Date();
    lastMatch.notes = notes;

    batch.updateStatistics();
    await batch.save();

    res.json({
      success: true,
      message: 'Manual match created successfully',
      data: lastMatch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm match
exports.confirmMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    batch.confirmMatch(matchId, req.user._id);
    await batch.save();

    res.json({
      success: true,
      message: 'Match confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject match
exports.rejectMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { notes } = req.body;
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    batch.rejectMatch(matchId, req.user._id, notes);
    await batch.save();

    res.json({
      success: true,
      message: 'Match rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk confirm matches
exports.bulkConfirmMatches = async (req, res) => {
  try {
    const { matchIds } = req.body;
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    let confirmedCount = 0;
    for (const matchId of matchIds) {
      const match = batch.matchedItems.id(matchId);
      if (match && match.status === 'pending') {
        match.status = 'confirmed';
        match.confirmedBy = req.user._id;
        match.confirmedAt = new Date();
        confirmedCount++;
      }
    }

    batch.updateStatistics();
    await batch.save();

    res.json({
      success: true,
      message: `${confirmedCount} matches confirmed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DISCREPANCY MANAGEMENT ====================

// Get discrepancies for a batch
exports.getDiscrepancies = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id)
      .select('discrepancies batchNumber name');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const { status, severity } = req.query;
    let discrepancies = batch.discrepancies;

    if (status) {
      discrepancies = discrepancies.filter(d => d.status === status);
    }
    if (severity) {
      discrepancies = discrepancies.filter(d => d.severity === severity);
    }

    res.json({
      success: true,
      data: discrepancies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve discrepancy
exports.resolveDiscrepancy = async (req, res) => {
  try {
    const { discrepancyId } = req.params;
    const { resolution, notes } = req.body;
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    batch.resolveDiscrepancy(discrepancyId, resolution, notes, req.user._id);
    await batch.save();

    res.json({
      success: true,
      message: 'Discrepancy resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BATCH WORKFLOW ====================

// Submit for review
exports.submitForReview = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.status !== 'in_progress') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only in-progress batches can be submitted for review' 
      });
    }

    // Check if there are pending matches
    const pendingMatches = batch.matchedItems.filter(m => m.status === 'pending').length;
    if (pendingMatches > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Please confirm or reject ${pendingMatches} pending matches before submitting` 
      });
    }

    batch.status = 'pending_review';
    batch.notes = req.body.notes;
    await batch.save();

    res.json({
      success: true,
      message: 'Batch submitted for review successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete reconciliation
exports.completeReconciliation = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.status !== 'pending_review') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only batches pending review can be completed' 
      });
    }

    // Check for unresolved critical discrepancies
    const unresolvedCritical = batch.discrepancies.filter(
      d => d.severity === 'critical' && d.status !== 'resolved'
    ).length;

    if (unresolvedCritical > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Please resolve ${unresolvedCritical} critical discrepancies before completing` 
      });
    }

    batch.status = 'completed';
    batch.completedBy = req.user._id;
    batch.completedAt = new Date();
    batch.reviewedBy = req.user._id;
    batch.reviewedAt = new Date();
    await batch.save();

    res.json({
      success: true,
      message: 'Reconciliation completed successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REPORTS & DASHBOARD ====================

// Get reconciliation dashboard
exports.getReconciliationDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchFilter = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter } 
      : {};

    // Summary by status
    const statusSummary = await ReconciliationBatch.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalMatched: { $sum: '$statistics.matchedItems' },
          totalDiscrepancies: { $sum: '$statistics.discrepancies' }
        }
      }
    ]);

    // Summary by type
    const typeSummary = await ReconciliationBatch.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$reconciliationType',
          count: { $sum: 1 },
          avgMatchRate: { $avg: '$statistics.matchRate' }
        }
      }
    ]);

    // Recent batches
    const recentBatches = await ReconciliationBatch.find(matchFilter)
      .select('batchNumber name status statistics createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Open discrepancies
    const openDiscrepancies = await ReconciliationBatch.aggregate([
      { $match: { ...matchFilter, status: { $ne: 'completed' } } },
      { $unwind: '$discrepancies' },
      { $match: { 'discrepancies.status': { $ne: 'resolved' } } },
      {
        $group: {
          _id: '$discrepancies.severity',
          count: { $sum: 1 },
          totalAmount: { $sum: { $abs: '$discrepancies.amountDifference' } }
        }
      }
    ]);

    // Active rules count
    const activeRulesCount = await ReconciliationRule.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        statusSummary,
        typeSummary,
        recentBatches,
        openDiscrepancies,
        activeRulesCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get suggestions for matching
exports.getMatchSuggestions = async (req, res) => {
  try {
    const batch = await ReconciliationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const rules = await ReconciliationRule.find({ isActive: true }).sort({ priority: -1 });
    const suggestions = [];

    // Find potential matches with lower confidence
    for (const sourceItem of batch.unmatchedSource) {
      for (const targetItem of batch.unmatchedTarget) {
        for (const rule of rules) {
          const matchResult = rule.checkMatch(sourceItem, targetItem);
          
          // Include suggestions with score >= 50 but < minimum required
          if (matchResult.score >= 50 && !matchResult.isMatch) {
            suggestions.push({
              sourceItem,
              targetItem,
              score: matchResult.score,
              ruleName: rule.name,
              matchedFields: matchResult.matchedFields,
              unmatchedFields: matchResult.unmatchedFields
            });
          }
        }
      }
    }

    // Sort by score descending and limit
    suggestions.sort((a, b) => b.score - a.score);
    const topSuggestions = suggestions.slice(0, 20);

    res.json({
      success: true,
      data: topSuggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
