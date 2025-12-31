const PaymentBatch = require('../../models/finance/paymentBatch');
const ScheduledPayment = require('../../models/finance/scheduledPayment');
const Invoice = require('../../models/finance/invoice');
const Bill = require('../../models/finance/bill');
const BusinessExpense = require('../../models/finance/businessExpense');
const TaxLiability = require('../../models/finance/taxLiability');
const ApprovalWorkflow = require('../../models/finance/approvalWorkflow');

// Payment Batch Controllers

exports.getPaymentBatches = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate,
      search,
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { batchNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await PaymentBatch.countDocuments(query);
    
    const batches = await PaymentBatch.find(query)
      .populate('bankAccount', 'accountName accountNumber')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
    console.error('Get payment batches error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment batches', 
      error: error.message 
    });
  }
};

exports.getPaymentBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findById(req.params.id)
      .populate('bankAccount')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('approvalWorkflow');

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment batch not found' 
      });
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get payment batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment batch', 
      error: error.message 
    });
  }
};

exports.createPaymentBatch = async (req, res) => {
  try {
    const batchNumber = await PaymentBatch.generateBatchNumber();
    
    const batchData = {
      ...req.body,
      batchNumber,
      createdBy: req.user._id
    };

    // Set document model for each item
    batchData.items = batchData.items.map(item => {
      const modelMap = {
        invoice: 'Invoice',
        bill: 'Bill',
        expense: 'BusinessExpense',
        tax_liability: 'TaxLiability'
      };
      return {
        ...item,
        documentModel: modelMap[item.documentType]
      };
    });

    const batch = new PaymentBatch(batchData);
    await batch.save();

    // Create approval workflow if required
    if (batch.approvalRequired && batch.totalAmount >= 1000) {
      const workflow = await ApprovalWorkflow.createWorkflowByThreshold(
        batch.totalAmount,
        'payment_batch',
        batch._id,
        req.user._id
      );
      
      batch.approvalWorkflow = workflow._id;
      await batch.save();
    }

    await batch.populate('bankAccount');
    await batch.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Payment batch created successfully',
      data: batch
    });
  } catch (error) {
    console.error('Create payment batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating payment batch', 
      error: error.message 
    });
  }
};

exports.updatePaymentBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment batch not found' 
      });
    }

    // Prevent updates if already processing or completed
    if (batch.status === 'processing' || batch.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a batch that is processing or completed'
      });
    }

    Object.assign(batch, req.body);
    await batch.save();

    await batch.populate('bankAccount');
    await batch.populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Payment batch updated successfully',
      data: batch
    });
  } catch (error) {
    console.error('Update payment batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating payment batch', 
      error: error.message 
    });
  }
};

exports.deletePaymentBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment batch not found' 
      });
    }

    // Prevent deletion if already processing or completed
    if (batch.status === 'processing' || batch.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a batch that is processing or completed'
      });
    }

    await batch.deleteOne();

    res.json({
      success: true,
      message: 'Payment batch deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting payment batch', 
      error: error.message 
    });
  }
};

exports.approveBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment batch not found' 
      });
    }

    await batch.approve(req.user._id);
    await batch.populate('approvedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Payment batch approved successfully',
      data: batch
    });
  } catch (error) {
    console.error('Approve batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving payment batch', 
      error: error.message 
    });
  }
};

exports.processBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment batch not found' 
      });
    }

    await batch.process();

    // Process each item
    for (const item of batch.items) {
      try {
        item.status = 'processing';
        
        // Simulate payment processing (in real app, integrate with payment gateway)
        // For now, mark as completed
        item.status = 'completed';
        item.processedAt = new Date();
        item.transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
      } catch (err) {
        item.status = 'failed';
        item.failureReason = err.message;
      }
    }

    await batch.save();
    await batch.complete();

    res.json({
      success: true,
      message: 'Payment batch processed successfully',
      data: batch
    });
  } catch (error) {
    console.error('Process batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error processing payment batch', 
      error: error.message 
    });
  }
};

exports.cancelBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment batch not found' 
      });
    }

    await batch.cancel();

    res.json({
      success: true,
      message: 'Payment batch cancelled successfully',
      data: batch
    });
  } catch (error) {
    console.error('Cancel batch error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error cancelling payment batch', 
      error: error.message 
    });
  }
};

// Scheduled Payment Controllers

exports.getScheduledPayments = async (req, res) => {
  try {
    const { 
      status, 
      frequency,
      startDate,
      endDate,
      overdue,
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (frequency) query.frequency = frequency;
    
    if (startDate || endDate) {
      query.nextPaymentDate = {};
      if (startDate) query.nextPaymentDate.$gte = new Date(startDate);
      if (endDate) query.nextPaymentDate.$lte = new Date(endDate);
    }
    
    if (overdue === 'true') {
      query.status = 'active';
      query.nextPaymentDate = { $lt: new Date() };
    }

    const skip = (page - 1) * limit;
    const total = await ScheduledPayment.countDocuments(query);
    
    const payments = await ScheduledPayment.find(query)
      .populate('bankAccount', 'accountName accountNumber')
      .populate('createdBy', 'firstName lastName email')
      .sort({ nextPaymentDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get scheduled payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching scheduled payments', 
      error: error.message 
    });
  }
};

exports.getScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findById(req.params.id)
      .populate('bankAccount')
      .populate('documentId')
      .populate('createdBy', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching scheduled payment', 
      error: error.message 
    });
  }
};

exports.createScheduledPayment = async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Set document model if documentType is provided
    if (paymentData.documentType && paymentData.documentId) {
      const modelMap = {
        invoice: 'Invoice',
        bill: 'Bill',
        expense: 'BusinessExpense',
        tax_liability: 'TaxLiability'
      };
      paymentData.documentModel = modelMap[paymentData.documentType];
    }

    const payment = new ScheduledPayment(paymentData);
    await payment.save();

    await payment.populate('bankAccount');
    await payment.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Scheduled payment created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Create scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating scheduled payment', 
      error: error.message 
    });
  }
};

exports.updateScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('bankAccount')
      .populate('createdBy', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Scheduled payment updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Update scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating scheduled payment', 
      error: error.message 
    });
  }
};

exports.deleteScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Scheduled payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting scheduled payment', 
      error: error.message 
    });
  }
};

exports.pauseScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    await payment.pause();

    res.json({
      success: true,
      message: 'Scheduled payment paused successfully',
      data: payment
    });
  } catch (error) {
    console.error('Pause scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error pausing scheduled payment', 
      error: error.message 
    });
  }
};

exports.resumeScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    await payment.resume();

    res.json({
      success: true,
      message: 'Scheduled payment resumed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Resume scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error resuming scheduled payment', 
      error: error.message 
    });
  }
};

exports.cancelScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    await payment.cancel();

    res.json({
      success: true,
      message: 'Scheduled payment cancelled successfully',
      data: payment
    });
  } catch (error) {
    console.error('Cancel scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error cancelling scheduled payment', 
      error: error.message 
    });
  }
};

exports.executeScheduledPayment = async (req, res) => {
  try {
    const payment = await ScheduledPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled payment not found' 
      });
    }

    await payment.execute();

    res.json({
      success: true,
      message: 'Scheduled payment executed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Execute scheduled payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error executing scheduled payment', 
      error: error.message 
    });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    // Batch stats
    const batchStats = await PaymentBatch.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Scheduled payment stats
    const scheduledStats = await ScheduledPayment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Due scheduled payments (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingCount = await ScheduledPayment.countDocuments({
      status: 'active',
      nextPaymentDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    });

    // Overdue scheduled payments
    const overdueCount = await ScheduledPayment.countDocuments({
      status: 'active',
      nextPaymentDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        batches: batchStats,
        scheduled: scheduledStats,
        upcomingCount,
        overdueCount
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment stats', 
      error: error.message 
    });
  }
};
