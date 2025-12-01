const Invoice = require("../../models/finance/invoice");
const Customer = require("../../models/finance/customer");
const ChartOfAccounts = require("../../models/finance/chartOfAccounts");

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const {
      customer,
      invoiceDate,
      dueDate,
      paymentTerms,
      lineItems,
      shippingCost,
      adjustments,
      notes,
      terms,
      memo,
      tags
    } = req.body;

    // Validate customer
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get default AR account
    const arAccount = await ChartOfAccounts.findOne({ 
      accountCode: '1200',
      accountType: 'asset',
      accountSubType: 'current_asset'
    });

    if (!arAccount) {
      return res.status(500).json({ message: "Accounts Receivable account not configured" });
    }

    // Create invoice
    const invoice = new Invoice({
      customer,
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || customerDoc.getPaymentDueDate(invoiceDate || new Date()),
      paymentTerms: paymentTerms || customerDoc.paymentTerms,
      lineItems,
      shippingCost: shippingCost || 0,
      adjustments: adjustments || 0,
      accountsReceivableAccount: arAccount._id,
      notes,
      terms,
      memo,
      tags,
      currency: customerDoc.currency,
      createdBy: req.user._id,
      status: 'draft'
    });

    await invoice.save();
    await invoice.populate('customer lineItems.revenueAccount');

    res.status(201).json({
      message: "Invoice created successfully",
      invoice
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all invoices with filters
const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      customer,
      status,
      startDate,
      endDate,
      overdue
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    
    if (customer) filter.customer = customer;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    if (overdue === 'true') {
      filter.status = { $in: ['sent', 'partial', 'overdue'] };
      filter.dueDate = { $lt: new Date() };
    }

    const invoices = await Invoice.find(filter)
      .populate('customer', 'customerNumber displayName companyName contactPerson')
      .populate('lineItems.revenueAccount', 'accountCode accountName')
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Invoice.countDocuments(filter);

    // Calculate summary
    const summary = await Invoice.aggregate([
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
      invoices,
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
    console.error("Error getting invoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single invoice
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('lineItems.revenueAccount')
      .populate('lineItems.product')
      .populate('journalEntry')
      .populate('payments.createdBy', 'username')
      .populate('createdBy', 'username');

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Error getting invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.isPosted) {
      return res.status(400).json({ message: "Cannot update posted invoice" });
    }

    const allowedUpdates = [
      'lineItems', 'shippingCost', 'adjustments', 'notes', 'terms', 'memo', 'tags', 'dueDate'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    invoice.lastModifiedBy = req.user._id;
    await invoice.save();
    await invoice.populate('customer lineItems.revenueAccount');

    res.json({
      message: "Invoice updated successfully",
      invoice
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Post invoice to general ledger
const postInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('lineItems.revenueAccount');
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === 'draft') {
      invoice.status = 'sent';
      invoice.sentDate = new Date();
    }

    const journalEntry = await invoice.postToGeneralLedger(req.user._id);

    res.json({
      message: "Invoice posted to general ledger successfully",
      invoice,
      journalEntry
    });
  } catch (error) {
    console.error("Error posting invoice:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Add payment to invoice
const addPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: "Invoice is already paid" });
    }

    const { amount, paymentMethod, reference, paymentDate, bankAccount, notes } = req.body;

    if (amount > invoice.amountDue) {
      return res.status(400).json({ message: "Payment amount exceeds amount due" });
    }

    await invoice.addPayment({
      amount,
      paymentMethod,
      reference,
      paymentDate: paymentDate || new Date(),
      bankAccount,
      notes
    }, req.user._id);

    res.json({
      message: "Payment added successfully",
      invoice
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get aging report
const getAgingReport = async (req, res) => {
  try {
    const today = new Date();
    
    const invoices = await Invoice.find({
      status: { $nin: ['paid', 'cancelled', 'void'] },
      amountDue: { $gt: 0 }
    }).populate('customer', 'customerNumber displayName companyName');

    const agingBuckets = {
      current: { amount: 0, count: 0, invoices: [] },
      '1-30': { amount: 0, count: 0, invoices: [] },
      '31-60': { amount: 0, count: 0, invoices: [] },
      '61-90': { amount: 0, count: 0, invoices: [] },
      '90+': { amount: 0, count: 0, invoices: [] }
    };

    invoices.forEach(invoice => {
      const bucket = invoice.agingBucket;
      agingBuckets[bucket].amount += invoice.amountDue;
      agingBuckets[bucket].count++;
      agingBuckets[bucket].invoices.push({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        amountDue: invoice.amountDue,
        daysOverdue: invoice.daysOverdue
      });
    });

    const totalOutstanding = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);

    res.json({
      agingBuckets,
      totalOutstanding,
      totalInvoices: invoices.length,
      reportDate: today
    });
  } catch (error) {
    console.error("Error generating aging report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete invoice (only drafts)
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({ message: "Can only delete draft invoices. Void posted invoices instead." });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Void invoice
const voidInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === 'void') {
      return res.status(400).json({ message: "Invoice is already void" });
    }

    if (invoice.payments.length > 0) {
      return res.status(400).json({ message: "Cannot void invoice with payments. Refund payments first." });
    }

    invoice.status = 'void';
    invoice.lastModifiedBy = req.user._id;
    await invoice.save();

    res.json({
      message: "Invoice voided successfully",
      invoice
    });
  } catch (error) {
    console.error("Error voiding invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  postInvoice,
  addPayment,
  getAgingReport,
  deleteInvoice,
  voidInvoice
};
