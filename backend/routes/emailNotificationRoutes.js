/**
 * Email Notification Routes
 * Handles bank transaction email parsing and syncing
 */

const express = require('express');
const router = express.Router();
const EmailNotificationService = require('../services/emailNotificationService');
const BankAccount = require('../models/finance/bankAccount');
const EmailConnection = require('../models/EmailConnection');
const auth = require('../middleware/auth');

/**
 * Test email connection
 * POST /api/finance/email-notifications/test
 */
router.post('/test', auth, async (req, res) => {
  try {
    const { provider, email, password, imapServer, imapPort } = req.body;

    if (!email || !password) {
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
    const detail = error?.message || '';
    let friendly = detail;
    if (/not authenticated|invalid credentials|login failed/i.test(detail)) {
      friendly = 'IMAP authentication failed. Please verify your email and password/app password. For Gmail, enable IMAP in settings and use a 16‑character App Password (not your normal password).';
    }
    res.status(400).json({ message: friendly });
  }
});

/**
 * Connect email account
 * POST /api/finance/email-notifications/connect
 */
router.post('/connect', auth, async (req, res) => {
  try {
    const {
      bankName,
      email,
      password,
      imapServer,
      imapPort,
      bankAccountId,
      autoSync
    } = req.body;
    const provider = 'gmail';

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
    const { fullHistory, sinceDate, from, subject, limit } = req.query;

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

    const options = {
      allHistory: fullHistory === 'true',
      sinceDate,
      from,
      subject
    };
    const max = parseInt(limit || '500', 10);

    const parsedTxns = await EmailNotificationService.fetchBankTransactions(
      config,
      emailConnection.bankName,
      max,
      options
    );

    // Save transactions to embedded array on BankAccount, avoid duplicates
    let savedCount = 0;
    const dayStr = (d) => {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0,10);
    };

    for (const txn of parsedTxns) {
      const txnDateStr = dayStr(txn.date);
      const txnTypeStr = txn.type === 'deposit' ? 'deposit' : 'withdrawal';
      const txnDesc = (txn.description || '').toLowerCase();
      const txnAmt = Number(Math.abs(txn.amount));

      const exists = bankAccount.transactions.some(t => {
        const tDateStr = dayStr(t.transactionDate);
        const dateMatch = txnDateStr && tDateStr ? (tDateStr === txnDateStr) : false;
        const amountMatch = Number(t.amount) === txnAmt;
        const typeMatch = t.transactionType === txnTypeStr;
        const descMatch = (t.description || '').toLowerCase() === txnDesc;
        // Consider duplicate if (date+amount+type) match OR (amount+type+desc) match
        return (dateMatch && amountMatch && typeMatch) || (amountMatch && typeMatch && descMatch);
      });
      if (exists) continue;

      const safeDate = txnDateStr ? new Date(txn.date) : new Date();
      const transactionData = {
        transactionDate: safeDate,
        description: txn.description || `${emailConnection.bankName} Transaction`,
        amount: txnAmt,
        transactionType: txnTypeStr,
        reference: txn.rawEmail?.subject
      };

      await bankAccount.addTransaction(transactionData, req.user.id);
      savedCount++;
    }

    // Update last sync date
    emailConnection.lastSyncDate = new Date();
    await emailConnection.save();

    res.json({
      success: true,
      message: `Synced ${savedCount} new transactions`,
      transactionsSynced: savedCount,
      totalTransactionsFound: parsedTxns.length,
      newBalance: bankAccount.currentBalance
    });
  } catch (error) {
    console.error('Sync error:', error);
    const detail = error?.message || '';
    let friendly = detail;
    if (/not authenticated|invalid credentials|login failed/i.test(detail)) {
      friendly = 'IMAP authentication failed. Please verify your email and password/app password. For Gmail, enable IMAP in settings and use a 16‑character App Password (not your normal password).';
    } else if (/ENOTFOUND|getaddrinfo|ECONNREFUSED|timed out/i.test(detail)) {
      friendly = 'Unable to connect to the IMAP server. Please check IMAP server/port, TLS, and network connectivity.';
    }
    res.status(400).json({
      message: friendly,
      detail: 'Sync completed with errors. Check logs for details.'
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

