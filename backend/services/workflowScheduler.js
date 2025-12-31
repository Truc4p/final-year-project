const schedule = require('node-schedule');
const WorkflowExecution = require('../models/marketing/workflowExecution');
const { executeWorkflow } = require('../controllers/marketing/workflowExecutionController');

class WorkflowScheduler {
  constructor() {
    this.jobs = new Map();
    this.init();
  }

  init() {
    // Check for pending executions every minute
    this.mainJob = schedule.scheduleJob('*/1 * * * *', () => {
      this.processScheduledExecutions();
    });
    
    console.log('📅 Workflow scheduler initialized');
  }

  async processScheduledExecutions() {
    try {
      const now = new Date();
      
      // Find executions that are ready to continue
      const executions = await WorkflowExecution.find({
        status: 'waiting',
        nextExecutionAt: { $lte: now }
      }).limit(50);
      
      console.log(`📋 Processing ${executions.length} scheduled workflow executions`);
      
      for (const execution of executions) {
        try {
          // Update status
          execution.status = 'active';
          await execution.save();
          
          // Continue execution
          await executeWorkflow(execution._id);
          
        } catch (error) {
          console.error(`Error processing execution ${execution._id}:`, error);
          execution.status = 'failed';
          execution.lastError = error.message;
          await execution.save();
        }
      }
    } catch (error) {
      console.error('Workflow scheduler error:', error);
    }
  }

  stop() {
    if (this.mainJob) {
      this.mainJob.cancel();
    }
    this.jobs.forEach(job => job.cancel());
    this.jobs.clear();
    console.log('⏹️  Workflow scheduler stopped');
  }
}

module.exports = new WorkflowScheduler();
