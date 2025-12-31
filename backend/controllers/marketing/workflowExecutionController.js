const WorkflowExecution = require('../../models/marketing/workflowExecution');
const Workflow = require('../../models/marketing/workflow');

// Get all executions
exports.getExecutions = async (req, res) => {
  try {
    const { workflowId, customerId, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (workflowId) query.workflow = workflowId;
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    
    const executions = await WorkflowExecution.find(query)
      .populate('workflow', 'name category')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await WorkflowExecution.countDocuments(query);
    
    res.json({
      success: true,
      data: executions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get executions error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single execution
exports.getExecution = async (req, res) => {
  try {
    const execution = await WorkflowExecution.findById(req.params.id)
      .populate('workflow')
      .populate('customer', 'name email');
    
    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution not found' });
    }
    
    res.json({ success: true, data: execution });
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Trigger workflow (manual or event-based)
exports.triggerWorkflow = async (req, res) => {
  try {
    const { workflowId, customerId, triggerType, triggerData, context } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    if (workflow.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Workflow is not active' });
    }
    
    // Check if customer already in workflow
    if (!workflow.settings.allowReEntry) {
      const existing = await WorkflowExecution.findOne({
        workflow: workflowId,
        customer: customerId,
        status: { $in: ['active', 'waiting'] }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Customer already in this workflow'
        });
      }
    }
    
    // Check execution limit
    if (workflow.settings.maxExecutionsPerCustomer > 0) {
      const executionCount = await WorkflowExecution.countDocuments({
        workflow: workflowId,
        customer: customerId
      });
      
      if (executionCount >= workflow.settings.maxExecutionsPerCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Customer has reached maximum executions for this workflow'
        });
      }
    }
    
    // Create execution
    const execution = new WorkflowExecution({
      workflow: workflowId,
      customer: customerId,
      triggerType,
      triggerData: triggerData || {},
      context: context || {},
      currentNode: workflow.entryNode,
      status: 'active'
    });
    
    await execution.save();
    
    // Update workflow analytics
    workflow.analytics.totalEntered += 1;
    workflow.analytics.totalActive += 1;
    await workflow.save();
    
    // Start execution asynchronously
    setImmediate(() => {
      executeWorkflow(execution._id).catch(err => {
        console.error('Workflow execution error:', err);
      });
    });
    
    res.status(201).json({
      success: true,
      message: 'Workflow triggered successfully',
      data: execution
    });
  } catch (error) {
    console.error('Trigger workflow error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Cancel execution
exports.cancelExecution = async (req, res) => {
  try {
    const execution = await WorkflowExecution.findById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution not found' });
    }
    
    if (execution.status !== 'active' && execution.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Cannot cancel completed or failed execution' });
    }
    
    execution.status = 'cancelled';
    execution.completedAt = new Date();
    await execution.save();
    
    // Update workflow analytics
    const workflow = await Workflow.findById(execution.workflow);
    if (workflow) {
      workflow.analytics.totalActive -= 1;
      await workflow.save();
    }
    
    res.json({
      success: true,
      message: 'Execution cancelled successfully',
      data: execution
    });
  } catch (error) {
    console.error('Cancel execution error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Retry failed execution
exports.retryExecution = async (req, res) => {
  try {
    const execution = await WorkflowExecution.findById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution not found' });
    }
    
    if (execution.status !== 'failed') {
      return res.status(400).json({ success: false, message: 'Can only retry failed executions' });
    }
    
    execution.status = 'active';
    execution.errorCount = 0;
    execution.lastError = null;
    await execution.save();
    
    // Restart execution
    setImmediate(() => {
      executeWorkflow(execution._id).catch(err => {
        console.error('Workflow execution error:', err);
      });
    });
    
    res.json({
      success: true,
      message: 'Execution retry started',
      data: execution
    });
  } catch (error) {
    console.error('Retry execution error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Core workflow execution logic
async function executeWorkflow(executionId) {
  const execution = await WorkflowExecution.findById(executionId)
    .populate('workflow')
    .populate('customer');
  
  if (!execution || execution.status !== 'active') {
    return;
  }
  
  const workflow = execution.workflow;
  let currentNode = workflow.nodes.find(n => n.id === execution.currentNode);
  
  while (currentNode && execution.status === 'active') {
    try {
      // Log node entry
      execution.logs.push({
        nodeId: currentNode.id,
        nodeName: currentNode.type,
        nodeType: currentNode.type,
        status: 'pending',
        executedAt: new Date()
      });
      await execution.save();
      
      // Execute node based on type
      const result = await executeNode(currentNode, execution);
      
      // Update log
      const log = execution.logs[execution.logs.length - 1];
      log.status = result.success ? 'completed' : 'failed';
      log.completedAt = new Date();
      log.error = result.error;
      log.metadata = result.metadata;
      
      if (!result.success) {
        execution.errorCount += 1;
        execution.lastError = result.error;
        
        if (execution.errorCount >= 3) {
          execution.status = 'failed';
          break;
        }
      }
      
      // Determine next node
      if (currentNode.type === 'end' || !currentNode.nextNodes || currentNode.nextNodes.length === 0) {
        execution.status = 'completed';
        execution.completedAt = new Date();
        workflow.analytics.totalCompleted += 1;
        workflow.analytics.totalActive -= 1;
        break;
      } else if (currentNode.type === 'delay') {
        // Schedule next execution
        execution.status = 'waiting';
        execution.nextExecutionAt = calculateDelayTime(currentNode);
        execution.currentNode = currentNode.nextNodes[0].nodeId;
        break;
      } else if (currentNode.type === 'condition') {
        // Evaluate condition to determine next node
        const nextNodeInfo = evaluateCondition(currentNode, execution.context, result.conditionResult);
        currentNode = workflow.nodes.find(n => n.id === nextNodeInfo.nodeId);
        execution.currentNode = nextNodeInfo.nodeId;
      } else {
        // Move to next node
        execution.currentNode = currentNode.nextNodes[0].nodeId;
        currentNode = workflow.nodes.find(n => n.id === execution.currentNode);
      }
      
      await execution.save();
      await workflow.save();
      
    } catch (error) {
      console.error('Node execution error:', error);
      execution.status = 'failed';
      execution.lastError = error.message;
      break;
    }
  }
  
  await execution.save();
  await workflow.save();
}

// Execute individual node
async function executeNode(node, execution) {
  switch (node.type) {
    case 'trigger':
      return { success: true };
      
    case 'action':
      return await executeAction(node, execution);
      
    case 'condition':
      return await evaluateConditionNode(node, execution);
      
    case 'delay':
      return { success: true };
      
    case 'end':
      return { success: true };
      
    default:
      return { success: false, error: 'Unknown node type' };
  }
}

// Execute action node
async function executeAction(node, execution) {
  try {
    // Mock implementation - integrate with actual services
    console.log(`Executing action: ${node.actionType} for customer ${execution.customer._id}`);
    
    // Simulate email/SMS/push sending
    return {
      success: true,
      metadata: {
        actionType: node.actionType,
        timestamp: new Date()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Evaluate condition node
async function evaluateConditionNode(node, execution) {
  try {
    // Evaluate rules
    let result = true;
    for (const rule of node.conditionRules) {
      const value = execution.context[rule.field] || execution.customer[rule.field];
      result = result && evaluateRule(value, rule.operator, rule.value);
    }
    
    return {
      success: true,
      conditionResult: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Evaluate single rule
function evaluateRule(value, operator, compareValue) {
  switch (operator) {
    case 'equals':
      return value == compareValue;
    case 'not_equals':
      return value != compareValue;
    case 'greater_than':
      return value > compareValue;
    case 'less_than':
      return value < compareValue;
    case 'contains':
      return value && value.toString().includes(compareValue);
    case 'exists':
      return value !== null && value !== undefined;
    case 'not_exists':
      return value === null || value === undefined;
    default:
      return false;
  }
}

// Evaluate condition to get next node
function evaluateCondition(node, context, conditionResult) {
  const nextNode = node.nextNodes.find(n => n.condition === (conditionResult ? 'true' : 'false'));
  return nextNode || node.nextNodes[0];
}

// Calculate delay time
function calculateDelayTime(node) {
  const now = new Date();
  const duration = node.delayDuration;
  const unit = node.delayUnit;
  
  switch (unit) {
    case 'minutes':
      return new Date(now.getTime() + duration * 60 * 1000);
    case 'hours':
      return new Date(now.getTime() + duration * 60 * 60 * 1000);
    case 'days':
      return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    case 'weeks':
      return new Date(now.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}

module.exports.executeWorkflow = executeWorkflow;
