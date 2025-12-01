const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GeneralLedgerSchema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true,
    index: true
  },
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry',
    required: true,
    index: true
  },
  entryDate: {
    type: Date,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  runningBalance: {
    type: Number,
    default: 0
    // Running balance for the account
  },
  fiscalPeriod: {
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    quarter: { type: Number, required: true, min: 1, max: 4 }
  },
  isReconciled: {
    type: Boolean,
    default: false
  },
  reconciledDate: {
    type: Date
  },
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
GeneralLedgerSchema.index({ account: 1, entryDate: -1 });
GeneralLedgerSchema.index({ account: 1, 'fiscalPeriod.year': 1, 'fiscalPeriod.month': 1 });
GeneralLedgerSchema.index({ entryDate: -1, account: 1 });
GeneralLedgerSchema.index({ 'fiscalPeriod.year': 1, 'fiscalPeriod.month': 1 });

// Virtual for amount (showing debit as positive, credit as negative)
GeneralLedgerSchema.virtual('amount').get(function() {
  return this.debit - this.credit;
});

// Static method to get account balance
GeneralLedgerSchema.statics.getAccountBalance = async function(accountId, asOfDate = null) {
  const query = { account: accountId };
  if (asOfDate) {
    query.entryDate = { $lte: asOfDate };
  }
  
  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' }
      }
    }
  ]);
  
  if (result.length === 0) return 0;
  
  const { totalDebit, totalCredit } = result[0];
  
  // Get account to determine normal balance
  const ChartOfAccounts = mongoose.model('ChartOfAccounts');
  const account = await ChartOfAccounts.findById(accountId);
  
  if (!account) return 0;
  
  // Return balance based on normal balance type
  if (account.normalBalance === 'debit') {
    return totalDebit - totalCredit;
  } else {
    return totalCredit - totalDebit;
  }
};

// Static method to get account transactions with running balance
GeneralLedgerSchema.statics.getAccountTransactions = async function(accountId, startDate = null, endDate = null) {
  const query = { account: accountId };
  
  if (startDate || endDate) {
    query.entryDate = {};
    if (startDate) query.entryDate.$gte = new Date(startDate);
    if (endDate) query.entryDate.$lte = new Date(endDate);
  }
  
  const transactions = await this.find(query)
    .populate('journalEntry', 'entryNumber entryType reference')
    .populate('account', 'accountCode accountName normalBalance')
    .sort({ entryDate: 1, createdAt: 1 });
  
  // Calculate running balance
  let balance = 0;
  const transactionsWithBalance = transactions.map(txn => {
    const txnObj = txn.toObject();
    
    if (txn.account.normalBalance === 'debit') {
      balance += (txn.debit - txn.credit);
    } else {
      balance += (txn.credit - txn.debit);
    }
    
    txnObj.runningBalance = balance;
    return txnObj;
  });
  
  return transactionsWithBalance;
};

// Static method to get trial balance
GeneralLedgerSchema.statics.getTrialBalance = async function(asOfDate = null) {
  const ChartOfAccounts = mongoose.model('ChartOfAccounts');
  
  const query = {};
  if (asOfDate) {
    query.entryDate = { $lte: new Date(asOfDate) };
  }
  
  // Get all account balances
  const balances = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$account',
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' }
      }
    }
  ]);
  
  // Get account details and calculate balances
  const trialBalance = await Promise.all(
    balances.map(async (bal) => {
      const account = await ChartOfAccounts.findById(bal._id);
      if (!account) return null;
      
      let debitBalance = 0;
      let creditBalance = 0;
      
      if (account.normalBalance === 'debit') {
        const balance = bal.totalDebit - bal.totalCredit;
        if (balance >= 0) {
          debitBalance = balance;
        } else {
          creditBalance = Math.abs(balance);
        }
      } else {
        const balance = bal.totalCredit - bal.totalDebit;
        if (balance >= 0) {
          creditBalance = balance;
        } else {
          debitBalance = Math.abs(balance);
        }
      }
      
      return {
        account: account.toObject(),
        debitBalance,
        creditBalance
      };
    })
  );
  
  // Filter out null entries and calculate totals
  const validBalances = trialBalance.filter(b => b !== null);
  const totalDebits = validBalances.reduce((sum, b) => sum + b.debitBalance, 0);
  const totalCredits = validBalances.reduce((sum, b) => sum + b.creditBalance, 0);
  
  return {
    asOfDate: asOfDate || new Date(),
    accounts: validBalances,
    totalDebits,
    totalCredits,
    isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
  };
};

// Static method to get account activity for a period
GeneralLedgerSchema.statics.getAccountActivity = async function(accountId, year, month = null) {
  const query = {
    account: accountId,
    'fiscalPeriod.year': year
  };
  
  if (month) {
    query['fiscalPeriod.month'] = month;
  }
  
  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' },
        transactionCount: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalDebit: 0,
      totalCredit: 0,
      netActivity: 0,
      transactionCount: 0
    };
  }
  
  const { totalDebit, totalCredit, transactionCount } = result[0];
  
  return {
    totalDebit,
    totalCredit,
    netActivity: totalDebit - totalCredit,
    transactionCount
  };
};

// Ensure virtual fields are serialized
GeneralLedgerSchema.set('toJSON', { virtuals: true });
GeneralLedgerSchema.set('toObject', { virtuals: true });

const GeneralLedger = mongoose.model("GeneralLedger", GeneralLedgerSchema);
module.exports = GeneralLedger;
