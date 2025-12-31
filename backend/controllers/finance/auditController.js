const AuditLog = require('../../models/finance/auditLog');
const ComplianceReport = require('../../models/finance/complianceReport');
const { Parser } = require('json2csv');

// ==================== AUDIT LOGS ====================

// Get all audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user,
      entityType,
      entityId,
      action,
      status,
      startDate,
      endDate,
      search,
      complianceFlag
    } = req.query;

    const query = {};

    if (user) query.user = user;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (action) query.action = action;
    if (status) query.status = status;
    if (complianceFlag) query.complianceFlags = complianceFlag;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { errorMessage: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single audit log
exports.getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('user', 'name email');
    
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get entity audit trail
exports.getEntityTrail = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const trail = await AuditLog.getEntityTrail(entityType, entityId, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({ success: true, data: trail });
  } catch (error) {
    console.error('Error fetching entity trail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100, skip = 0 } = req.query;

    const activity = await AuditLog.getUserActivity(userId, {
      startDate,
      endDate,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({ success: true, data: activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get compliance-flagged logs
exports.getComplianceLogs = async (req, res) => {
  try {
    const { flags, startDate, endDate, limit = 100, skip = 0 } = req.query;
    
    const flagsArray = flags ? (Array.isArray(flags) ? flags : [flags]) : [];

    const logs = await AuditLog.getComplianceLogs(flagsArray, {
      startDate,
      endDate,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching compliance logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit statistics
exports.getAuditStatistics = async (req, res) => {
  try {
    const { startDate, endDate, user, entityType, action } = req.query;

    const stats = await AuditLog.getStatistics({
      startDate,
      endDate,
      user,
      entityType,
      action
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export audit logs
exports.exportAuditLogs = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, entityType, action, user } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (user) query.user = user;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      const fields = [
        { label: 'Timestamp', value: 'createdAt' },
        { label: 'User', value: row => row.user?.name || row.user?.email || 'Unknown' },
        { label: 'Action', value: 'action' },
        { label: 'Entity Type', value: 'entityType' },
        { label: 'Entity ID', value: 'entityId' },
        { label: 'Description', value: 'description' },
        { label: 'Status', value: 'status' },
        { label: 'IP Address', value: 'ipAddress' }
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(logs);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.json`);
      res.json(logs);
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Archive old logs
exports.archiveOldLogs = async (req, res) => {
  try {
    const { daysToKeep = 365 } = req.body;

    const deletedCount = await AuditLog.archiveOldLogs(parseInt(daysToKeep));

    res.json({
      success: true,
      message: `Archived ${deletedCount} old audit logs`,
      deletedCount
    });
  } catch (error) {
    console.error('Error archiving logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COMPLIANCE REPORTS ====================

// Get all compliance reports
exports.getComplianceReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      reportType,
      status,
      complianceStatus,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    if (reportType) query.reportType = reportType;
    if (status) query.status = status;
    if (complianceStatus) query.complianceStatus = complianceStatus;

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reportNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await ComplianceReport.countDocuments(query);
    const reports = await ComplianceReport.find(query)
      .populate('generatedBy reviewedBy approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching compliance reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single compliance report
exports.getComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id)
      .populate('generatedBy reviewedBy approvedBy', 'name email')
      .populate('criteria.users', 'name email');
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching compliance report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create compliance report
exports.createComplianceReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      generatedBy: req.user._id
    };

    // Generate findings based on criteria
    if (req.body.generateFindings) {
      const findings = await generateFindings(req.body);
      reportData.findings = findings;
    }

    const report = new ComplianceReport(reportData);
    await report.save();

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'create',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Created compliance report: ${report.title}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating compliance report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update compliance report
exports.updateComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    if (!['draft', 'pending_review'].includes(report.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update report in current status'
      });
    }

    Object.assign(report, req.body);
    await report.save();

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'update',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Updated compliance report: ${report.reportNumber}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating compliance report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete compliance report
exports.deleteComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    if (report.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft reports can be deleted'
      });
    }

    await report.deleteOne();

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'delete',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Deleted compliance report: ${report.reportNumber}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting compliance report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit report for review
exports.submitForReview = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    await report.submitForReview();

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'update',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Submitted compliance report for review: ${report.reportNumber}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Review report
exports.reviewReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    await report.review(req.user._id, req.body.notes);

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'approve',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Reviewed compliance report: ${report.reportNumber}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error reviewing report:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Approve report
exports.approveReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    await report.approve(req.user._id, req.body.notes);

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'approve',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Approved compliance report: ${report.reportNumber}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error approving report:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Archive report
exports.archiveReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Compliance report not found' });
    }

    await report.archive(req.user._id, req.body.notes);

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'archive',
      entityType: 'ComplianceReport',
      entityId: report._id,
      description: `Archived compliance report: ${report.reportNumber}`,
      complianceFlags: ['user_action'],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error archiving report:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get compliance dashboard stats
exports.getComplianceDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [
      reportStats,
      complianceStatusStats,
      recentReports,
      criticalFindings
    ] = await Promise.all([
      // Report type distribution
      ComplianceReport.aggregate([
        { $match: match },
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Compliance status distribution
      ComplianceReport.aggregate([
        { $match: match },
        { $group: { _id: '$complianceStatus', count: { $sum: 1 } } }
      ]),

      // Recent reports
      ComplianceReport.find(match)
        .populate('generatedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),

      // Critical findings count
      ComplianceReport.countDocuments({
        ...match,
        'findings.criticalIssues': { $gt: 0 }
      })
    ]);

    res.json({
      success: true,
      data: {
        reportTypes: reportStats,
        complianceStatuses: complianceStatusStats,
        recentReports,
        criticalFindings,
        totalReports: await ComplianceReport.countDocuments(match)
      }
    });
  } catch (error) {
    console.error('Error fetching compliance dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate findings
async function generateFindings(criteria) {
  const findings = {
    totalRecords: 0,
    criticalIssues: 0,
    warnings: 0,
    passed: 0,
    details: []
  };

  // Query audit logs based on criteria
  const query = {};
  if (criteria.startDate) query.createdAt = { $gte: new Date(criteria.startDate) };
  if (criteria.endDate) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = new Date(criteria.endDate);
  }
  if (criteria.criteria?.entityTypes?.length) {
    query.entityType = { $in: criteria.criteria.entityTypes };
  }
  if (criteria.criteria?.actions?.length) {
    query.action = { $in: criteria.criteria.actions };
  }

  const logs = await AuditLog.find(query).limit(10000);
  findings.totalRecords = logs.length;

  // Analyze logs for issues
  const failedActions = logs.filter(log => log.status === 'failure');
  findings.criticalIssues = failedActions.length;

  const flaggedLogs = logs.filter(log => 
    log.complianceFlags?.includes('security_event') || 
    log.complianceFlags?.includes('sensitive_data')
  );
  findings.warnings = flaggedLogs.length;

  findings.passed = findings.totalRecords - findings.criticalIssues - findings.warnings;

  // Add issue details
  if (failedActions.length > 0) {
    findings.details.push({
      severity: 'critical',
      category: 'Failed Actions',
      issue: `${failedActions.length} failed actions detected`,
      description: 'Multiple actions failed during the reporting period',
      recommendation: 'Review failed actions and implement corrective measures',
      affectedRecords: failedActions.slice(0, 10).map(log => ({
        id: log._id,
        action: log.action,
        error: log.errorMessage
      }))
    });
  }

  return findings;
}
