const ApprovalWorkflow = require("../../models/finance/approvalWorkflow");
const Invoice = require("../../models/finance/invoice");
const Bill = require("../../models/finance/bill");
const BusinessExpense = require("../../models/finance/businessExpense");

// @desc    Get all approval workflows
// @route   GET /api/finance/approvals
// @access  Private
exports.getApprovals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      documentType,
      priority,
      assignedToMe
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filterConditions = {};
    
    if (status) filterConditions.status = status;
    if (documentType) filterConditions.documentType = documentType;
    if (priority) filterConditions.priority = priority;
    
    // Filter approvals assigned to current user
    if (assignedToMe === 'true') {
      filterConditions['steps.approver'] = req.user._id;
      filterConditions['steps.status'] = 'pending';
    }

    const approvals = await ApprovalWorkflow.find(filterConditions)
      .populate('requestedBy', 'username email')
      .populate('steps.approver', 'username email')
      .populate('steps.actionBy', 'username email')
      .populate('escalatedTo', 'username email')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalApprovals = await ApprovalWorkflow.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalApprovals / limitNumber);

    res.json({
      success: true,
      approvals,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalApprovals,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error("Error getting approvals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Get single approval workflow
// @route   GET /api/finance/approvals/:id
// @access  Private
exports.getApprovalById = async (req, res) => {
  try {
    const approval = await ApprovalWorkflow.findById(req.params.id)
      .populate('requestedBy', 'username email')
      .populate('steps.approver', 'username email')
      .populate('steps.actionBy', 'username email')
      .populate('escalatedTo', 'username email')
      .populate('history.performedBy', 'username email');

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval workflow not found"
      });
    }

    // Get document details
    let document = null;
    if (approval.documentType === 'invoice') {
      document = await Invoice.findById(approval.documentId);
    } else if (approval.documentType === 'bill') {
      document = await Bill.findById(approval.documentId);
    } else if (approval.documentType === 'expense') {
      document = await BusinessExpense.findById(approval.documentId);
    }

    res.json({
      success: true,
      approval,
      document
    });
  } catch (error) {
    console.error("Error getting approval:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Create approval workflow
// @route   POST /api/finance/approvals
// @access  Private
exports.createApproval = async (req, res) => {
  try {
    const { documentType, documentId, amount, metadata } = req.body;

    // Validate document exists
    let document = null;
    if (documentType === 'invoice') {
      document = await Invoice.findById(documentId);
    } else if (documentType === 'bill') {
      document = await Bill.findById(documentId);
    } else if (documentType === 'expense') {
      document = await BusinessExpense.findById(documentId);
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: `${documentType} not found`
      });
    }

    // Check if approval already exists
    const existingApproval = await ApprovalWorkflow.findOne({
      documentType,
      documentId,
      status: { $in: ['pending', 'in_progress'] }
    });

    if (existingApproval) {
      return res.status(400).json({
        success: false,
        message: "An active approval workflow already exists for this document"
      });
    }

    // Create workflow based on amount threshold
    const approval = ApprovalWorkflow.createWorkflowByThreshold(
      documentType,
      documentId,
      amount || document.totalAmount || document.amount,
      req.user._id,
      metadata
    );

    await approval.save();
    await approval.populate('requestedBy steps.approver');

    res.status(201).json({
      success: true,
      message: "Approval workflow created successfully",
      approval
    });
  } catch (error) {
    console.error("Error creating approval:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Approve current step
// @route   POST /api/finance/approvals/:id/approve
// @access  Private
exports.approveStep = async (req, res) => {
  try {
    const { comments } = req.body;
    const approval = await ApprovalWorkflow.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval workflow not found"
      });
    }

    // Check if user is the current approver
    const currentStep = approval.steps[approval.currentStep];
    if (!currentStep || currentStep.approver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to approve this step"
      });
    }

    await approval.approveStep(req.user._id, comments);
    await approval.populate('requestedBy steps.approver steps.actionBy');

    // If fully approved, update document status
    if (approval.status === 'approved') {
      await updateDocumentStatus(approval.documentType, approval.documentId, 'approved');
    }

    res.json({
      success: true,
      message: "Step approved successfully",
      approval
    });
  } catch (error) {
    console.error("Error approving step:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Reject approval workflow
// @route   POST /api/finance/approvals/:id/reject
// @access  Private
exports.rejectApproval = async (req, res) => {
  try {
    const { comments } = req.body;
    const approval = await ApprovalWorkflow.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval workflow not found"
      });
    }

    // Check if user is the current approver
    const currentStep = approval.steps[approval.currentStep];
    if (!currentStep || currentStep.approver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this approval"
      });
    }

    await approval.rejectStep(req.user._id, comments);
    await approval.populate('requestedBy steps.approver steps.actionBy');

    // Update document status
    await updateDocumentStatus(approval.documentType, approval.documentId, 'rejected');

    res.json({
      success: true,
      message: "Approval rejected",
      approval
    });
  } catch (error) {
    console.error("Error rejecting approval:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Cancel approval workflow
// @route   POST /api/finance/approvals/:id/cancel
// @access  Private
exports.cancelApproval = async (req, res) => {
  try {
    const { reason } = req.body;
    const approval = await ApprovalWorkflow.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval workflow not found"
      });
    }

    // Only requestor or admin can cancel
    if (approval.requestedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this approval"
      });
    }

    await approval.cancel(req.user._id, reason);
    await approval.populate('requestedBy steps.approver');

    res.json({
      success: true,
      message: "Approval cancelled",
      approval
    });
  } catch (error) {
    console.error("Error cancelling approval:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Escalate approval workflow
// @route   POST /api/finance/approvals/:id/escalate
// @access  Private (Admin only)
exports.escalateApproval = async (req, res) => {
  try {
    const { escalatedTo, reason } = req.body;
    const approval = await ApprovalWorkflow.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval workflow not found"
      });
    }

    await approval.escalate(escalatedTo, reason);
    await approval.populate('requestedBy steps.approver escalatedTo');

    res.json({
      success: true,
      message: "Approval escalated successfully",
      approval
    });
  } catch (error) {
    console.error("Error escalating approval:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Get approval statistics
// @route   GET /api/finance/approvals/stats
// @access  Private
exports.getApprovalStats = async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user._id;

    // Pending approvals assigned to user
    const pendingCount = await ApprovalWorkflow.countDocuments({
      'steps.approver': targetUserId,
      'steps.status': 'pending',
      status: { $in: ['pending', 'in_progress'] }
    });

    // Approved by user
    const approvedCount = await ApprovalWorkflow.countDocuments({
      'steps.approver': targetUserId,
      'steps.status': 'approved'
    });

    // Rejected by user
    const rejectedCount = await ApprovalWorkflow.countDocuments({
      'steps.approver': targetUserId,
      'steps.status': 'rejected'
    });

    // Overdue approvals
    const overdueCount = await ApprovalWorkflow.countDocuments({
      'steps.approver': targetUserId,
      'steps.status': 'pending',
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lt: new Date() }
    });

    // Average approval time
    const approvedWorkflows = await ApprovalWorkflow.find({
      'steps.approver': targetUserId,
      'steps.status': 'approved'
    }).select('steps createdAt completedAt');

    let totalApprovalTime = 0;
    let approvalCount = 0;

    approvedWorkflows.forEach(workflow => {
      const userStep = workflow.steps.find(
        s => s.approver.toString() === targetUserId.toString() && s.status === 'approved'
      );
      if (userStep && userStep.approvedAt) {
        totalApprovalTime += (userStep.approvedAt - workflow.createdAt) / (1000 * 60 * 60); // hours
        approvalCount++;
      }
    });

    const avgApprovalTime = approvalCount > 0 ? totalApprovalTime / approvalCount : 0;

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        overdue: overdueCount,
        avgApprovalTimeHours: avgApprovalTime.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error getting approval stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Helper function to update document status
async function updateDocumentStatus(documentType, documentId, status) {
  try {
    if (documentType === 'invoice') {
      await Invoice.findByIdAndUpdate(documentId, { 
        approvalStatus: status,
        status: status === 'approved' ? 'approved' : 'draft'
      });
    } else if (documentType === 'bill') {
      await Bill.findByIdAndUpdate(documentId, { 
        approvalStatus: status,
        status: status === 'approved' ? 'approved' : 'draft'
      });
    } else if (documentType === 'expense') {
      await BusinessExpense.findByIdAndUpdate(documentId, { 
        approvalStatus: status,
        status: status === 'approved' ? 'paid' : 'pending'
      });
    }
  } catch (error) {
    console.error('Error updating document status:', error);
  }
}

// @desc    Reassign approval step
// @route   POST /api/finance/approvals/:id/reassign
// @access  Private (Admin only)
exports.reassignApproval = async (req, res) => {
  try {
    const { stepIndex, newApproverId } = req.body;
    const approval = await ApprovalWorkflow.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval workflow not found"
      });
    }

    if (stepIndex < 0 || stepIndex >= approval.steps.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid step index"
      });
    }

    const oldApproverId = approval.steps[stepIndex].approver;
    approval.steps[stepIndex].approver = newApproverId;

    approval.history.push({
      action: 'reassigned',
      performedBy: req.user._id,
      comments: `Step ${stepIndex} reassigned`,
      previousValue: { approver: oldApproverId },
      newValue: { approver: newApproverId }
    });

    await approval.save();
    await approval.populate('requestedBy steps.approver');

    res.json({
      success: true,
      message: "Approval step reassigned successfully",
      approval
    });
  } catch (error) {
    console.error("Error reassigning approval:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = exports;
