const Workflow = require('../../models/marketing/workflow');

// Get all workflows
exports.getWorkflows = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    
    const workflows = await Workflow.find(query)
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Workflow.countDocuments(query);
    
    res.json({
      success: true,
      data: workflows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single workflow
exports.getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create workflow
exports.createWorkflow = async (req, res) => {
  try {
    const workflowData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Validate nodes
    if (!workflowData.nodes || workflowData.nodes.length === 0) {
      return res.status(400).json({ success: false, message: 'Workflow must have at least one node' });
    }
    
    // Validate entry node exists
    const entryNodeExists = workflowData.nodes.some(n => n.id === workflowData.entryNode);
    if (!entryNodeExists) {
      return res.status(400).json({ success: false, message: 'Entry node not found in workflow nodes' });
    }
    
    const workflow = new Workflow(workflowData);
    await workflow.save();
    
    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update workflow
exports.updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    // If workflow is active and structure is changing, create new version
    if (workflow.status === 'active' && req.body.nodes) {
      workflow.version += 1;
    }
    
    Object.assign(workflow, req.body);
    await workflow.save();
    
    res.json({
      success: true,
      message: 'Workflow updated successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete workflow
exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    // Check if workflow has active executions
    const WorkflowExecution = require('../../models/marketing/workflowExecution');
    const activeExecutions = await WorkflowExecution.countDocuments({
      workflow: req.params.id,
      status: { $in: ['active', 'waiting'] }
    });
    
    if (activeExecutions > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete workflow with ${activeExecutions} active execution(s). Please pause or cancel them first.`
      });
    }
    
    await workflow.deleteOne();
    
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Activate workflow
exports.activateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    workflow.status = 'active';
    workflow.lastActivatedAt = new Date();
    await workflow.save();
    
    res.json({
      success: true,
      message: 'Workflow activated successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Activate workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Pause workflow
exports.pauseWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    workflow.status = 'paused';
    workflow.lastPausedAt = new Date();
    await workflow.save();
    
    res.json({
      success: true,
      message: 'Workflow paused successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Pause workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get workflow analytics
exports.getWorkflowAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const workflow = await Workflow.findById(id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    const WorkflowExecution = require('../../models/marketing/workflowExecution');
    
    // Build date filter
    const dateFilter = { workflow: workflow._id };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get execution stats
    const executions = await WorkflowExecution.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: { $subtract: ['$completedAt', '$startedAt'] } }
        }
      }
    ]);
    
    // Get timeline data
    const timeline = await WorkflowExecution.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          entered: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          goalsReached: {
            $sum: { $cond: ['$goalReached', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get node performance
    const nodePerformance = [];
    for (const node of workflow.nodes) {
      const stats = await WorkflowExecution.aggregate([
        { $match: dateFilter },
        { $unwind: '$logs' },
        { $match: { 'logs.nodeId': node.id } },
        {
          $group: {
            _id: '$logs.status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      nodePerformance.push({
        nodeId: node.id,
        nodeName: node.type,
        stats
      });
    }
    
    res.json({
      success: true,
      data: {
        overview: workflow.analytics,
        executions,
        timeline,
        nodePerformance
      }
    });
  } catch (error) {
    console.error('Get workflow analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Duplicate workflow
exports.duplicateWorkflow = async (req, res) => {
  try {
    const original = await Workflow.findById(req.params.id);
    
    if (!original) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    const duplicate = new Workflow({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      status: 'draft',
      createdBy: req.user.id,
      analytics: {
        totalEntered: 0,
        totalCompleted: 0,
        totalActive: 0,
        totalGoalsReached: 0,
        conversionRate: 0,
        averageCompletionTime: 0,
        totalRevenue: 0
      },
      lastActivatedAt: undefined,
      lastPausedAt: undefined
    });
    
    await duplicate.save();
    
    res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      data: duplicate
    });
  } catch (error) {
    console.error('Duplicate workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
