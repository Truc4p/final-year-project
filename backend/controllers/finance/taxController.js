const TaxRate = require('../../models/finance/taxRate');
const TaxLiability = require('../../models/finance/taxLiability');
const Invoice = require('../../models/finance/invoice');
const Bill = require('../../models/finance/bill');
const BusinessExpense = require('../../models/finance/businessExpense');

// Tax Rate Controllers

exports.getTaxRates = async (req, res) => {
  try {
    const { 
      type, 
      country, 
      state, 
      region, 
      isActive, 
      search,
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};
    
    if (type) query.type = type;
    if (country) query.country = country;
    if (state) query.state = state;
    if (region) query.region = region;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { authority: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await TaxRate.countDocuments(query);
    
    const taxRates = await TaxRate.find(query)
      .populate('accountCode', 'code name')
      .populate('createdBy', 'firstName lastName email')
      .sort({ type: 1, country: 1, state: 1, rate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: taxRates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tax rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tax rates', 
      error: error.message 
    });
  }
};

exports.getTaxRate = async (req, res) => {
  try {
    const taxRate = await TaxRate.findById(req.params.id)
      .populate('accountCode')
      .populate('createdBy', 'firstName lastName email');

    if (!taxRate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax rate not found' 
      });
    }

    res.json({
      success: true,
      data: taxRate
    });
  } catch (error) {
    console.error('Get tax rate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tax rate', 
      error: error.message 
    });
  }
};

exports.createTaxRate = async (req, res) => {
  try {
    const taxRateData = {
      ...req.body,
      createdBy: req.user._id
    };

    const taxRate = new TaxRate(taxRateData);
    await taxRate.save();

    await taxRate.populate('accountCode');
    await taxRate.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Tax rate created successfully',
      data: taxRate
    });
  } catch (error) {
    console.error('Create tax rate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating tax rate', 
      error: error.message 
    });
  }
};

exports.updateTaxRate = async (req, res) => {
  try {
    const taxRate = await TaxRate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('accountCode')
      .populate('createdBy', 'firstName lastName email');

    if (!taxRate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax rate not found' 
      });
    }

    res.json({
      success: true,
      message: 'Tax rate updated successfully',
      data: taxRate
    });
  } catch (error) {
    console.error('Update tax rate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating tax rate', 
      error: error.message 
    });
  }
};

exports.deleteTaxRate = async (req, res) => {
  try {
    // Check if tax rate is used in any liabilities
    const liabilityCount = await TaxLiability.countDocuments({ 
      taxRate: req.params.id 
    });

    if (liabilityCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tax rate. It is used in ${liabilityCount} tax liability record(s).`
      });
    }

    const taxRate = await TaxRate.findByIdAndDelete(req.params.id);

    if (!taxRate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax rate not found' 
      });
    }

    res.json({
      success: true,
      message: 'Tax rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete tax rate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting tax rate', 
      error: error.message 
    });
  }
};

exports.getApplicableRates = async (req, res) => {
  try {
    const { type, country, state, region, category, date } = req.query;

    const taxRates = await TaxRate.getApplicableRates({
      type,
      country,
      state,
      region,
      category,
      date: date ? new Date(date) : new Date()
    });

    res.json({
      success: true,
      data: taxRates
    });
  } catch (error) {
    console.error('Get applicable rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applicable tax rates', 
      error: error.message 
    });
  }
};

// Tax Liability Controllers

exports.getTaxLiabilities = async (req, res) => {
  try {
    const { 
      status, 
      period,
      startDate,
      endDate,
      taxRateId,
      overdue,
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (period) query.period = period;
    if (taxRateId) query.taxRate = taxRateId;
    
    if (startDate || endDate) {
      query.periodStart = {};
      if (startDate) query.periodStart.$gte = new Date(startDate);
      if (endDate) query.periodStart.$lte = new Date(endDate);
    }
    
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.balance = { $gt: 0 };
      query.status = { $in: ['calculated', 'filed', 'overdue'] };
    }

    const skip = (page - 1) * limit;
    const total = await TaxLiability.countDocuments(query);
    
    const liabilities = await TaxLiability.find(query)
      .populate('taxRate')
      .populate('createdBy', 'firstName lastName email')
      .populate('filedBy', 'firstName lastName email')
      .sort({ periodEnd: -1, dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: liabilities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tax liabilities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tax liabilities', 
      error: error.message 
    });
  }
};

exports.getTaxLiability = async (req, res) => {
  try {
    const liability = await TaxLiability.findById(req.params.id)
      .populate('taxRate')
      .populate('createdBy', 'firstName lastName email')
      .populate('filedBy', 'firstName lastName email')
      .populate('transactions');

    if (!liability) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax liability not found' 
      });
    }

    res.json({
      success: true,
      data: liability
    });
  } catch (error) {
    console.error('Get tax liability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tax liability', 
      error: error.message 
    });
  }
};

exports.createTaxLiability = async (req, res) => {
  try {
    const liabilityData = {
      ...req.body,
      createdBy: req.user._id
    };

    const liability = new TaxLiability(liabilityData);
    await liability.save();

    await liability.populate('taxRate');
    await liability.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Tax liability created successfully',
      data: liability
    });
  } catch (error) {
    console.error('Create tax liability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating tax liability', 
      error: error.message 
    });
  }
};

exports.updateTaxLiability = async (req, res) => {
  try {
    const liability = await TaxLiability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('taxRate')
      .populate('createdBy', 'firstName lastName email')
      .populate('filedBy', 'firstName lastName email');

    if (!liability) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax liability not found' 
      });
    }

    res.json({
      success: true,
      message: 'Tax liability updated successfully',
      data: liability
    });
  } catch (error) {
    console.error('Update tax liability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating tax liability', 
      error: error.message 
    });
  }
};

exports.deleteTaxLiability = async (req, res) => {
  try {
    const liability = await TaxLiability.findById(req.params.id);

    if (!liability) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax liability not found' 
      });
    }

    // Prevent deletion if already filed or paid
    if (liability.status === 'filed' || liability.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ${liability.status} tax liability. Please void it instead.`
      });
    }

    await liability.deleteOne();

    res.json({
      success: true,
      message: 'Tax liability deleted successfully'
    });
  } catch (error) {
    console.error('Delete tax liability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting tax liability', 
      error: error.message 
    });
  }
};

exports.calculateTaxLiability = async (req, res) => {
  try {
    const { taxRateId, periodStart, periodEnd } = req.body;

    const taxRate = await TaxRate.findById(taxRateId);
    if (!taxRate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax rate not found' 
      });
    }

    // Fetch relevant transactions based on tax type
    let taxableAmount = 0;
    const transactions = [];

    const dateQuery = {
      createdAt: {
        $gte: new Date(periodStart),
        $lte: new Date(periodEnd)
      }
    };

    if (taxRate.type === 'sales') {
      const invoices = await Invoice.find({
        ...dateQuery,
        status: { $in: ['paid', 'partial'] }
      });
      
      taxableAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
      transactions.push(...invoices.map(inv => inv._id));
    } else if (taxRate.type === 'purchase') {
      const bills = await Bill.find({
        ...dateQuery,
        status: { $in: ['paid', 'partial'] }
      });
      
      taxableAmount = bills.reduce((sum, bill) => sum + bill.total, 0);
      transactions.push(...bills.map(bill => bill._id));
    }

    const taxAmount = taxRate.calculateTax(taxableAmount);

    res.json({
      success: true,
      data: {
        taxRate: taxRate.name,
        taxableAmount,
        taxAmount,
        rate: taxRate.rate,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    console.error('Calculate tax liability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating tax liability', 
      error: error.message 
    });
  }
};

exports.fileTaxLiability = async (req, res) => {
  try {
    const liability = await TaxLiability.findById(req.params.id);

    if (!liability) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax liability not found' 
      });
    }

    if (liability.status === 'filed' || liability.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: `Tax liability is already ${liability.status}`
      });
    }

    liability.status = 'filed';
    liability.filedDate = new Date();
    liability.filedBy = req.user._id;

    await liability.save();
    await liability.populate('taxRate');
    await liability.populate('filedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Tax liability filed successfully',
      data: liability
    });
  } catch (error) {
    console.error('File tax liability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error filing tax liability', 
      error: error.message 
    });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const liability = await TaxLiability.findById(req.params.id);

    if (!liability) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax liability not found' 
      });
    }

    await liability.addPayment(req.body);
    await liability.populate('taxRate');

    res.json({
      success: true,
      message: 'Payment added successfully',
      data: liability
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding payment', 
      error: error.message 
    });
  }
};

exports.calculatePenalties = async (req, res) => {
  try {
    const liability = await TaxLiability.findById(req.params.id);

    if (!liability) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax liability not found' 
      });
    }

    await liability.calculatePenalties(req.body.penaltyRate);
    await liability.populate('taxRate');

    res.json({
      success: true,
      message: 'Penalties calculated successfully',
      data: liability
    });
  } catch (error) {
    console.error('Calculate penalties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating penalties', 
      error: error.message 
    });
  }
};

exports.getTaxSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const summary = await TaxLiability.getSummaryByPeriod(startDate, endDate);

    // Get overdue count
    const overdueCount = await TaxLiability.countDocuments({
      status: 'overdue',
      dueDate: { $lt: new Date() }
    });

    // Get upcoming due (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingCount = await TaxLiability.countDocuments({
      status: { $in: ['calculated', 'filed'] },
      dueDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    });

    res.json({
      success: true,
      data: {
        summary,
        overdueCount,
        upcomingCount
      }
    });
  } catch (error) {
    console.error('Get tax summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tax summary', 
      error: error.message 
    });
  }
};

exports.getOverdueLiabilities = async (req, res) => {
  try {
    const liabilities = await TaxLiability.getOverdue();

    res.json({
      success: true,
      data: liabilities
    });
  } catch (error) {
    console.error('Get overdue liabilities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching overdue liabilities', 
      error: error.message 
    });
  }
};
