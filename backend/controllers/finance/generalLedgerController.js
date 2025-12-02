const GeneralLedger = require("../../models/finance/generalLedger");
const JournalEntry = require("../../models/finance/journalEntry");
const ChartOfAccounts = require("../../models/finance/chartOfAccounts");

// GET /api/finance/general-ledger
// Returns flattened ledger lines with totals
const getGeneralLedger = async (req, res) => {
  try {
    const { search = "", account, dateFrom, dateTo, entryNumber } = req.query;

    const match = {};
    if (dateFrom || dateTo) {
      match.entryDate = {};
      if (dateFrom) match.entryDate.$gte = new Date(dateFrom);
      if (dateTo) match.entryDate.$lte = new Date(dateTo);
    }

    // Base query
    let query = GeneralLedger.find(match)
      .populate('account', 'accountCode accountName')
      .populate('journalEntry', 'entryNumber status entryDate description')
      .sort({ entryDate: -1, _id: -1 });

    const rows = await query.exec();

    // Filter in-memory for search/accountCode/entryNumber (since search spans multiple fields)
    const filtered = rows.filter((r) => {
      const accCode = r.account?.accountCode || '';
      const accName = r.account?.accountName || '';
      const jeNum = r.journalEntry?.entryNumber || '';
      const desc = r.description || '';

      const accountOk = account ? (accCode.includes(account) || accName.toLowerCase().includes(String(account).toLowerCase())) : true;

      const entryOk = entryNumber ? jeNum.includes(entryNumber) : true;

      const s = String(search).toLowerCase().trim();
      const searchOk = s ? (
        jeNum.toLowerCase().includes(s) ||
        accCode.toLowerCase().includes(s) ||
        accName.toLowerCase().includes(s) ||
        desc.toLowerCase().includes(s)
      ) : true;

      return accountOk && entryOk && searchOk;
    });

    const entries = filtered.map((r) => ({
      id: r._id,
      entryNumber: r.journalEntry?.entryNumber || '',
      date: r.entryDate,
      account: `${r.account?.accountCode || ''} - ${r.account?.accountName || ''}`.trim(),
      description: r.description,
      debit: r.debit || 0,
      credit: r.credit || 0,
      status: r.journalEntry?.status || 'posted'
    }));

    const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
    const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

    res.json({ entries, totals: { totalDebit, totalCredit } });
  } catch (err) {
    console.error('Error fetching general ledger:', err);
    res.status(500).json({ message: 'Failed to fetch general ledger', error: err.message });
  }
};

// GET /api/finance/general-ledger/trial-balance
const getTrialBalance = async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const result = await GeneralLedger.getTrialBalance(asOfDate || undefined);
    const accounts = result.accounts.map((a) => ({
      id: a.account._id,
      name: `${a.account.accountCode} - ${a.account.accountName}`,
      debit: a.debitBalance,
      credit: a.creditBalance
    }));
    res.json({
      asOfDate: result.asOfDate,
      accounts,
      totalDebits: result.totalDebits,
      totalCredits: result.totalCredits,
      isBalanced: result.isBalanced
    });
  } catch (err) {
    console.error('Error fetching trial balance:', err);
    res.status(500).json({ message: 'Failed to fetch trial balance', error: err.message });
  }
};

// GET /api/finance/general-ledger/entry/:id
const getJournalEntryById = async (req, res) => {
  try {
    const je = await JournalEntry.findById(req.params.id).populate('lines.account', 'accountCode accountName');
    if (!je) return res.status(404).json({ message: 'Journal entry not found' });
    res.json(je);
  } catch (err) {
    console.error('Error fetching journal entry:', err);
    res.status(500).json({ message: 'Failed to fetch journal entry', error: err.message });
  }
};

module.exports = {
  getGeneralLedger,
  getTrialBalance,
  getJournalEntryById
};
