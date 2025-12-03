/**
 * Email Notification Routes
 * Handles bank transaction email parsing and syncing
 */

const express = require('express');
const router = express.Router();
const EmailNotificationService = require('../services/emailNotificationService');
const BankAccount = require('../models/BankAccount');
const Transaction = require('../models/Transaction');
const EmailConnection = require('../models/EmailConnection');
const auth = require('../middleware/auth');

/**
 * Test email connection
 * POST /api/finance/email-notifications/test
 */
router.post('/test', auth, async (req, res) => {
  try {
    const { provider, email, password, imapServer, imapPort } = req.body;

    if (!provider || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: provider, email, password'
      });
    }

    const result = await EmailNotificationService.testConnection({
      provider,
      email,
      password,
      imapServer,
      imapPort
    });

    res.json(result);
  } catch (error) {
    console.error('Email test error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Connect email account
 * POST /api/finance/email-notifications/connect
 */
router.post('/connect', auth, async (req, res) => {
  try {
    const {
      provider,
      bankName,
      email,
      password,
      imapServer,
      imapPort,
      bankAccountId,
      autoSync
    } = req.body;

    if (!provider || !email || !password || !bankAccountId) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Verify bank account exists
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Save email connection
    let emailConnection = await EmailConnection.findOne({
      userId: req.user.id,
      bankAccountId
    });

    if (!emailConnection) {
      emailConnection = new EmailConnection({
        userId: req.user.id,
        bankAccountId,
        provider,
        bankName,
        email,
        // Encrypt password in production!
        password: Buffer.from(password).toString('base64'),
        imapServer,
        imapPort,
        autoSync,
        lastSyncDate: null
      });
    } else {
      emailConnection.provider = provider;
      emailConnection.bankName = bankName;
      emailConnection.email = email;
      emailConnection.password = Buffer.from(password).toString('base64');
      emailConnection.imapServer = imapServer;
      emailConnection.imapPort = imapPort;
      emailConnection.autoSync = autoSync;
    }

    await emailConnection.save();

    res.json({
      success: true,
      message: 'Email account connected successfully',
      emailConnection: {
        id: emailConnection._id,
        email: emailConnection.email,
        bankName: emailConnection.bankName,
        autoSync: emailConnection.autoSync
      }
    });
  } catch (error) {
    console.error('Email connect error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Disconnect email account
 * POST /api/finance/email-notifications/disconnect/:accountId
 */
router.post('/disconnect/:accountId', auth, async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await EmailConnection.findOneAndDelete({
      userId: req.user.id,
      bankAccountId: accountId
    });

    if (!result) {
      return res.status(404).json({ error: 'Email connection not found' });
    }

    res.json({
      success: true,
      message: 'Email account disconnected'
    });
  } catch (error) {
    console.error('Email disconnect error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get connected email accounts
 * GET /api/finance/email-notifications/accounts
 */
router.get('/accounts', auth, async (req, res) => {
  try {
    const emailConnections = await EmailConnection.find({
      userId: req.user.id
    }).select('-password');

    res.json({
      data: emailConnections,
      count: emailConnections.length
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Sync transactions from email
 * POST /api/finance/email-notifications/sync/:bankAccountId
 */
router.post('/sync/:bankAccountId', auth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;

    // Find email connection
    const emailConnection = await EmailConnection.findOne({
      userId: req.user.id,
      bankAccountId
    });

    if (!emailConnection) {
      return res.status(404).json({
        error: 'Email connection not found for this account'
      });
    }

    // Verify bank account exists
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Fetch transactions from email
    const config = {
      provider: emailConnection.provider,
      email: emailConnection.email,
      password: Buffer.from(emailConnection.password, 'base64').toString(),
      imapServer: emailConnection.imapServer,
      imapPort: emailConnection.imapPort
    };

    const transactions = await EmailNotificationService.fetchBankTransactions(
      config,
      emailConnection.bankName,
      50
    );

    // Save transactions to database
    let savedCount = 0;
    for (const txn of transactions) {
      // Check if transaction already exists (avoid duplicates)
      const existingTxn = await Transaction.findOne({
        bankAccountId,
        amount: txn.amount,
        date: txn.date,
        type: txn.type,
        source: 'email'
      });

      if (!existingTxn) {
        const transaction = new Transaction({
          bankAccountId,
          amount: txn.amount,
          date: txn.date,
          type: txn.type,
          description: txn.description,
          status: txn.status,
          source: txn.source,
          accountNumber: txn.accountNumber,
          rawData: txn.rawEmail
        });

        await transaction.save();
        savedCount++;

        // Update bank account balance
        if (txn.type === 'deposit') {
          bankAccount.currentBalance += txn.amount;
        } else {
          bankAccount.currentBalance -= txn.amount;
        }
      }
    }

    // Update last sync date
    emailConnection.lastSyncDate = new Date();
    await emailConnection.save();

    // Save updated balance
    await bankAccount.save();

    res.json({
      success: true,
      message: `Synced ${savedCount} new transactions`,
      transactionsSynced: savedCount,
      totalTransactionsFound: transactions.length,
      newBalance: bankAccount.currentBalance
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(400).json({
      error: error.message,
      message: 'Sync completed with errors. Check logs for details.'
    });
  }
});

/**
 * Get parsed transactions from emails
 * GET /api/finance/email-notifications/transactions/:bankAccountId
 */
router.get('/transactions/:bankAccountId', auth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const transactions = await Transaction.find({
      bankAccountId,
      source: 'email'
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments({
      bankAccountId,
      source: 'email'
    });

    res.json({
      data: transactions,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

