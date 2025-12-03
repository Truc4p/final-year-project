const BankAccount = require('../../models/finance/bankAccount');
const ChartOfAccounts = require('../../models/finance/chartOfAccounts');
const JournalEntry = require('../../models/finance/journalEntry');

// @desc    Create a new bank account
// @route   POST /api/finance/bank-accounts
// @access  Private
exports.createBankAccount = async (req, res) => {
  try {
    const {
      accountName,
      accountNumber,
      bankName,
      bankBranch,
      bankCountry,
      accountType,
      chartOfAccountsEntry,
      currency,
      isPrimary,
      reconciliationFrequency,
      routingNumber,
      swiftCode,
      ibanCode,
      dailyWithdrawalLimit,
      monthlyTransactionLimit,
      minimumBalance,
      interestRate,
      monthlyMaintenanceFee,
      overdraftFee,
      description,
      tags,
      notes,
      openingBalance,
      openingBalanceDate
    } = req.body;

    // Validate required fields
    if (!accountName || !accountNumber || !bankName || !accountType || !chartOfAccountsEntry) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: accountName, accountNumber, bankName, accountType, chartOfAccountsEntry'
      });
    }

    // Check if account number already exists
    const existingAccount = await BankAccount.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Bank account with this account number already exists'
      });
    }

    // Verify Chart of Accounts entry exists
    const chartAccount = await ChartOfAccounts.findById(chartOfAccountsEntry);
    if (!chartAccount) {
      return res.status(404).json({
        success: false,
        message: 'Chart of Accounts entry not found'
      });
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      await BankAccount.updateMany({}, { isPrimary: false });
    }

    const bankAccount = new BankAccount({
      accountName,
      accountNumber,
      bankName,
      bankBranch,
      bankCountry,
      accountType,
      chartOfAccountsEntry,
      currency: currency || 'USD',
      isPrimary: isPrimary || false,
      reconciliationFrequency: reconciliationFrequency || 'monthly',
      routingNumber,
      swiftCode,
      ibanCode,
      dailyWithdrawalLimit: dailyWithdrawalLimit || 0,
      monthlyTransactionLimit: monthlyTransactionLimit || 0,
      minimumBalance: minimumBalance || 0,
      interestRate: interestRate || 0,
      monthlyMaintenanceFee: monthlyMaintenanceFee || 0,
      overdraftFee: overdraftFee || 0,
      description,
      tags: tags || [],
      notes,
      createdBy: (req.user && (req.user._id || req.user.id))
    });

    await bankAccount.save();

    // Handle optional opening balance by creating an initial transaction
    const opening = Number(openingBalance);
    if (!Number.isNaN(opening) && opening !== 0) {
      const txnType = opening > 0 ? 'deposit' : 'withdrawal';
      const txnDate = openingBalanceDate ? new Date(openingBalanceDate) : new Date();
      await bankAccount.addTransaction({
        transactionDate: txnDate,
        description: 'Opening balance',
        amount: Math.abs(opening),
        transactionType: txnType,
        reference: 'OPENING',
        category: 'opening_balance'
      }, (req.user && (req.user._id || req.user.id)));
    }

    // Reload updated account to return latest balance
    const fresh = await BankAccount.findById(bankAccount._id)
      .populate('chartOfAccountsEntry', 'accountCode accountName');

    res.status(201).json({
      success: true,
      message: 'Bank account created successfully',
      data: fresh
    });
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bank account',
      error: error.message
    });
  }
};

// @desc    Get all bank accounts
// @route   GET /api/finance/bank-accounts
// @access  Private
exports.getBankAccounts = async (req, res) => {
  try {
    const { isActive, bankName, sortBy } = req.query;

    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (bankName) {
      query.bankName = new RegExp(bankName, 'i');
    }

    let sortOption = { isPrimary: -1, accountName: 1 };
    if (sortBy === 'balance') {
      sortOption = { currentBalance: -1 };
    } else if (sortBy === 'recent') {
      sortOption = { createdAt: -1 };
    }

    const accounts = await BankAccount.find(query)
      .populate('chartOfAccountsEntry', 'accountCode accountName')
      .populate('createdBy', 'name email')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank accounts',
      error: error.message
    });
  }
};

// @desc    Get a specific bank account
// @route   GET /api/finance/bank-accounts/:id
// @access  Private
exports.getBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findById(id)
      .populate('chartOfAccountsEntry')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('transactions.createdBy', 'name email')
      .populate('reconciliations.createdBy', 'name email')
      .populate('reconciliations.reconciledBy', 'name email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank account',
      error: error.message
    });
  }
};

// @desc    Update a bank account
// @route   PUT /api/finance/bank-accounts/:id
// @access  Private
exports.updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating certain fields
    delete updateData.accountNumber;
    delete updateData.transactions;
    delete updateData.reconciliations;
    delete updateData.currentBalance;

    // If setting as primary, unset other primary accounts
    if (updateData.isPrimary) {
      await BankAccount.updateMany({ _id: { $ne: id } }, { isPrimary: false });
    }

    const account = await BankAccount.findByIdAndUpdate(
      id,
      { ...updateData, lastModifiedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('chartOfAccountsEntry');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank account',
      error: error.message
    });
  }
};

// @desc    Delete a bank account
// @route   DELETE /api/finance/bank-accounts/:id
// @access  Private
exports.deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Check if account has transactions
    if (account.transactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bank account with existing transactions. Mark as inactive instead.'
      });
    }

    await BankAccount.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bank account',
      error: error.message
    });
  }
};

// @desc    Add a transaction to bank account
// @route   POST /api/finance/bank-accounts/:id/transactions
// @access  Private
exports.addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      transactionDate,
      description,
      amount,
      transactionType,
      reference,
      category,
      linkedDocument,
      notes,
      attachments
    } = req.body;

    // Validate required fields
    if (!transactionDate || !description || !amount || !transactionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionDate, description, amount, transactionType'
      });
    }

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const transaction = await account.addTransaction({
      transactionDate,
      description,
      amount,
      transactionType,
      reference,
      category,
      linkedDocument,
      notes,
      attachments: attachments || []
    }, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding transaction',
      error: error.message
    });
  }
};

// @desc    Get transactions for a bank account
// @route   GET /api/finance/bank-accounts/:id/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, isReconciled } = req.query;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    let transactions = account.transactions;

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date();

      transactions = transactions.filter(t =>
        t.transactionDate >= start && t.transactionDate <= end
      );
    }

    // Filter by reconciliation status
    if (isReconciled !== undefined) {
      transactions = transactions.filter(t =>
        t.isReconciled === (isReconciled === 'true')
      );
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get unreconciled transactions
// @route   GET /api/finance/bank-accounts/:id/unreconciled
// @access  Private
exports.getUnreconciledTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const unreconciledTransactions = account.getUnreconciledTransactions();

    res.status(200).json({
      success: true,
      count: unreconciledTransactions.length,
      data: unreconciledTransactions
    });
  } catch (error) {
    console.error('Error fetching unreconciled transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unreconciled transactions',
      error: error.message
    });
  }
};


// @desc    Reconcile a transaction
// @route   PUT /api/finance/bank-accounts/:id/transactions/:transactionId/reconcile
// @access  Private
exports.reconcileTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    const { reconciliationId } = req.body;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const transaction = await account.reconcileTransaction(transactionId, reconciliationId);

    res.status(200).json({
      success: true,
      message: 'Transaction reconciled successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error reconciling transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error reconciling transaction',
      error: error.message
    });
  }
};

// @desc    Delete a transaction from a bank account and adjust balance
// @route   DELETE /api/finance/bank-accounts/:id/transactions/:transactionId
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;

    const account = await BankAccount.findById(id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    const txn = account.transactions.id(transactionId);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Reverse the effect of the transaction on currentBalance
    const amt = Number(txn.amount) || 0;
    if (txn.transactionType === 'deposit' || txn.transactionType === 'interest') {
      account.currentBalance -= amt;
    } else {
      account.currentBalance += amt;
    }

    // Remove subdocument (Mongoose v6/7): use pull instead of remove on subdoc
    account.transactions.pull(transactionId);
    account.lastBalanceUpdate = new Date();
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      removedTransactionId: transactionId,
      newBalance: account.currentBalance
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: 'Error deleting transaction', error: error.message });
  }
};

// @desc    Create a bank reconciliation
// @route   POST /api/finance/bank-accounts/:id/reconciliations
// @access  Private
exports.createReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      statementStartDate,
      statementEndDate,
      statementBalance,
      bookBalance,
      deposits,
      withdrawals,
      outstandingChecks,
      depositInTransit,
      bankFees,
      interestEarned,
      notes
    } = req.body;

    // Validate required fields
    if (!statementStartDate || !statementEndDate || statementBalance === undefined || bookBalance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: statementStartDate, statementEndDate, statementBalance, bookBalance'
      });
    }

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const reconciliation = await account.createReconciliation({
      statementStartDate,
      statementEndDate,
      statementBalance,
      bookBalance,
      deposits: deposits || 0,
      withdrawals: withdrawals || 0,
      outstandingChecks: outstandingChecks || [],
      depositInTransit: depositInTransit || [],
      bankFees: bankFees || 0,
      interestEarned: interestEarned || 0,
      notes
    }, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Reconciliation created successfully',
      data: reconciliation
    });
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reconciliation',
      error: error.message
    });
  }
};

// @desc    Get reconciliations for a bank account
// @route   GET /api/finance/bank-accounts/:id/reconciliations
// @access  Private
exports.getReconciliations = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    let reconciliations = account.reconciliations;

    if (status) {
      reconciliations = reconciliations.filter(r => r.status === status);
    }

    res.status(200).json({
      success: true,
      count: reconciliations.length,
      data: reconciliations
    });
  } catch (error) {
    console.error('Error fetching reconciliations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reconciliations',
      error: error.message
    });
  }
};

// @desc    Complete a reconciliation
// @route   PUT /api/finance/bank-accounts/:id/reconciliations/:reconciliationId/complete
// @access  Private
exports.completeReconciliation = async (req, res) => {
  try {
    const { id, reconciliationId } = req.params;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const reconciliation = await account.completeReconciliation(reconciliationId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Reconciliation completed successfully',
      data: reconciliation
    });
  } catch (error) {
    console.error('Error completing reconciliation:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing reconciliation',
      error: error.message
    });
  }
};

// @desc    Get balance at specific date
// @route   GET /api/finance/bank-accounts/:id/balance-at-date
// @access  Private
exports.getBalanceAtDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const balance = account.getBalanceAtDate(new Date(date));

    res.status(200).json({
      success: true,
      data: {
        date: new Date(date),
        balance
      }
    });
  } catch (error) {
    console.error('Error fetching balance at date:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance at date',
      error: error.message
    });
  }
};

// @desc    Post transaction to general ledger
// @route   POST /api/finance/bank-accounts/:id/transactions/:transactionId/post
// @access  Private
exports.postTransactionToGeneralLedger = async (req, res) => {
  try {
    const { id, transactionId } = req.params;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const journalEntry = await account.postTransactionToGeneralLedger(transactionId, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Transaction posted to general ledger successfully',
      data: journalEntry
    });
  } catch (error) {
    console.error('Error posting transaction to general ledger:', error);
    res.status(500).json({
      success: false,
      message: 'Error posting transaction to general ledger',
      error: error.message
    });
  }
};

// @desc    Get accounts needing reconciliation
// @route   GET /api/finance/bank-accounts/needs-reconciliation
// @access  Private
exports.getAccountsNeedingReconciliation = async (req, res) => {
  try {
    const accounts = await BankAccount.getAccountsNeedingReconciliation()
      .populate('chartOfAccountsEntry', 'accountCode accountName');

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching accounts needing reconciliation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accounts needing reconciliation',
      error: error.message
    });
  }
};

// @desc    Get primary bank account
// @route   GET /api/finance/bank-accounts/primary
// @access  Private
exports.getPrimaryAccount = async (req, res) => {
  try {
    const account = await BankAccount.getPrimaryAccount()
      .populate('chartOfAccountsEntry');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'No primary bank account found'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error fetching primary account:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching primary account',
      error: error.message
    });
  }
};

// @desc    Get bank account summary
// @route   GET /api/finance/bank-accounts/:id/summary
// @access  Private
exports.getBankAccountSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const unreconciledTransactions = account.getUnreconciledTransactions();
    const lastReconciliation = account.reconciliations.length > 0
      ? account.reconciliations[account.reconciliations.length - 1]
      : null;

    const summary = {
      accountName: account.accountName,
      displayAccountNumber: account.displayAccountNumber,
      bankDisplay: account.bankDisplay,
      currentBalance: account.currentBalance,
      lastBalanceUpdate: account.lastBalanceUpdate,
      totalTransactions: account.transactions.length,
      unreconciledCount: unreconciledTransactions.length,
      unreconciledBalance: account.unreconciledBalance,
      lastReconciliation: lastReconciliation ? {
        date: lastReconciliation.reconciliationDate,
        status: lastReconciliation.status,
        difference: lastReconciliation.difference
      } : null,
      nextReconciliationDue: account.nextReconciliationDue,
      isPrimary: account.isPrimary,
      isActive: account.isActive
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching bank account summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank account summary',
      error: error.message
    });
  }
};

