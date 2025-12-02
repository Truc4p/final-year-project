const Bill = require("../../models/finance/bill");
const Vendor = require("../../models/finance/vendor");
const ChartOfAccounts = require("../../models/finance/chartOfAccounts");

// Create new bill
const createBill = async (req, res) => {
  try {
    const {
      vendor,
      vendorInvoiceNumber,
      billDate,
      dueDate,
      paymentTerms,
      lineItems,
      shippingCost,
      adjustments,
      notes,
      memo,
      tags
    } = req.body;

    const vendorDoc = await Vendor.findById(vendor);
    if (!vendorDoc) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const apAccount = await ChartOfAccounts.findOne({ 
      accountCode: '2000',
      accountType: 'liability',
      accountSubType: 'current_liability'
    });

    if (!apAccount) {
      return res.status(500).json({ message: "Accounts Payable account not configured" });
    }

    const bill = new Bill({
      vendor,
      vendorInvoiceNumber,
      billDate: billDate || new Date(),
      dueDate: dueDate || vendorDoc.getPaymentDueDate(billDate || new Date()),
      paymentTerms: paymentTerms || vendorDoc.paymentTerms,
      lineItems,
      shippingCost: shippingCost || 0,
      adjustments: adjustments || 0,
      accountsPayableAccount: apAccount._id,
      notes,
      memo,
      tags,
      currency: vendorDoc.currency,
      createdBy: (req.user && (req.user._id || req.user.id)),
      status: 'draft'
    });

    await bill.save();
    await bill.populate('vendor lineItems.expenseAccount');

    res.status(201).json({
      message: "Bill created successfully",
      bill
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all bills
const getBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      vendor,
      status,
      startDate,
      endDate,
      overdue
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    
    if (vendor) filter.vendor = vendor;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.billDate = {};
      if (startDate) filter.billDate.$gte = new Date(startDate);
      if (endDate) filter.billDate.$lte = new Date(endDate);
    }

    if (overdue === 'true') {
      filter.status = { $in: ['approved', 'partial', 'overdue'] };
      filter.dueDate = { $lt: new Date() };
    }

    const bills = await Bill.find(filter)
      .populate('vendor', 'vendorNumber companyName contactPerson')
      .populate('lineItems.expenseAccount', 'accountCode accountName')
      .sort({ billDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Bill.countDocuments(filter);

    const summary = await Bill.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$amountDue' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      bills,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1
      },
      summary: summary[0] || { totalAmount: 0, totalPaid: 0, totalDue: 0, count: 0 }
    });
  } catch (error) {
    console.error("Error getting bills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single bill
const getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('vendor')
      .populate('lineItems.expenseAccount')
      .populate('lineItems.product')
      .populate('journalEntry')
      .populate('payments.createdBy', 'username')
      .populate('createdBy', 'username')
      .populate('approvedBy', 'username');

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    console.error("Error getting bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update bill
const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.isPosted) {
      return res.status(400).json({ message: "Cannot update posted bill" });
    }

    const allowedUpdates = [
      'lineItems', 'shippingCost', 'adjustments', 'notes', 'memo', 'tags', 'dueDate', 'vendorInvoiceNumber'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        bill[field] = req.body[field];
      }
    });

    bill.lastModifiedBy = req.user._id;
    await bill.save();
    await bill.populate('vendor lineItems.expenseAccount');

    res.json({
      message: "Bill updated successfully",
      bill
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve bill
const approveBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status !== 'draft' && bill.status !== 'pending_approval') {
      return res.status(400).json({ message: "Bill cannot be approved" });
    }

    bill.status = 'approved';
    bill.approvedBy = req.user._id;
    bill.approvalDate = new Date();
    await bill.save();

    res.json({
      message: "Bill approved successfully",
      bill
    });
  } catch (error) {
    console.error("Error approving bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Post bill to general ledger
const postBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('lineItems.expenseAccount');
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.isPosted) {
      return res.status(400).json({ message: "Bill already posted to general ledger" });
    }

    if (bill.status === 'draft') {
      return res.status(400).json({ message: "Bill must be approved before posting" });
    }

    const journalEntry = await bill.postToGeneralLedger((req.user && (req.user._id || req.user.id)));

    res.json({
      message: "Bill posted to general ledger successfully",
      bill,
      journalEntry
    });
  } catch (error) {
    console.error("Error posting bill:", error);
    const msg = (typeof error?.message === 'string') ? error.message : 'Internal server error';
    if (/already posted/i.test(msg)) {
      return res.status(400).json({ message: "Bill already posted to general ledger" });
    }
    res.status(500).json({ message: msg });
  }
};

// Add payment to bill
const addPayment = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: "Bill is already paid" });
    }

    const { amount, paymentMethod, reference, paymentDate, bankAccount, notes } = req.body;

    if (amount > bill.amountDue) {
      return res.status(400).json({ message: "Payment amount exceeds amount due" });
    }

    await bill.addPayment({
      amount,
      paymentMethod,
      reference,
      paymentDate: paymentDate || new Date(),
      bankAccount,
      notes
    }, req.user._id);

    res.json({
      message: "Payment added successfully",
      bill
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get aging report for bills
const getAgingReport = async (req, res) => {
  try {
    const today = new Date();
    
    const bills = await Bill.find({
      status: { $nin: ['paid', 'cancelled', 'void'] },
      amountDue: { $gt: 0 }
    }).populate('vendor', 'vendorNumber companyName');

    const agingBuckets = {
      current: { amount: 0, count: 0, bills: [] },
      '1-30': { amount: 0, count: 0, bills: [] },
      '31-60': { amount: 0, count: 0, bills: [] },
      '61-90': { amount: 0, count: 0, bills: [] },
      '90+': { amount: 0, count: 0, bills: [] }
    };

    bills.forEach(bill => {
      const bucket = bill.agingBucket;
      agingBuckets[bucket].amount += bill.amountDue;
      agingBuckets[bucket].count++;
      agingBuckets[bucket].bills.push({
        _id: bill._id,
        billNumber: bill.billNumber,
        vendor: bill.vendor,
        billDate: bill.billDate,
        dueDate: bill.dueDate,
        totalAmount: bill.totalAmount,
        amountDue: bill.amountDue,
        daysOverdue: bill.daysOverdue
      });
    });

    const totalOutstanding = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);

    res.json({
      agingBuckets,
      totalOutstanding,
      totalBills: bills.length,
      reportDate: today
    });
  } catch (error) {
    console.error("Error generating aging report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete bill
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status !== 'draft') {
      return res.status(400).json({ message: "Can only delete draft bills. Void posted bills instead." });
    }

    await Bill.findByIdAndDelete(req.params.id);

    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Void bill
const voidBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === 'void') {
      return res.status(400).json({ message: "Bill is already void" });
    }

    if (bill.payments.length > 0) {
      return res.status(400).json({ message: "Cannot void bill with payments." });
    }

    bill.status = 'void';
    bill.lastModifiedBy = req.user._id;
    await bill.save();

    res.json({
      message: "Bill voided successfully",
      bill
    });
  } catch (error) {
    console.error("Error voiding bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all vendors for bill creation dropdown
const getVendors = async (req, res) => {
  try {
    const { status = 'active', search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } },
        { vendorNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(filter)
      .select('_id vendorNumber companyName contactPerson paymentTerms currency expenseAccount accountsPayableAccount')
      .populate('expenseAccount', 'accountCode accountName')
      .populate('accountsPayableAccount', 'accountCode accountName')
      .sort({ companyName: 1 });

    res.json(vendors);
  } catch (error) {
    console.error("Error getting vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get expense accounts for bill line items
const getExpenseAccounts = async (req, res) => {
  try {
    const expenseAccounts = await ChartOfAccounts.find({
      accountType: 'expense',
      isActive: true
    })
      .select('_id accountCode accountName accountSubType')
      .sort({ accountCode: 1 });

    res.json(expenseAccounts);
  } catch (error) {
    console.error("Error getting expense accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get vendor details including default accounts
const getVendorDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId)
      .populate('expenseAccount', 'accountCode accountName')
      .populate('accountsPayableAccount', 'accountCode accountName');

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    console.error("Error getting vendor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBill,
  getBills,
  getBill,
  updateBill,
  approveBill,
  postBill,
  addPayment,
  getAgingReport,
  deleteBill,
  voidBill,
  getVendors,
  getExpenseAccounts,
  getVendorDetails
};
