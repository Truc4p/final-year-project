const GeneralLedger = require("../models/finance/generalLedger");
const ChartOfAccounts = require("../models/finance/chartOfAccounts");
const JournalEntry = require("../models/finance/journalEntry");

class FinancialReportService {
  /**
   * Generate Income Statement (Profit & Loss)
   */
  static async generateIncomeStatement(startDate, endDate) {
    try {
      // Get all revenue accounts
      const revenueAccounts = await ChartOfAccounts.find({
        accountType: 'revenue',
        isActive: true
      });

      // Get all expense accounts
      const expenseAccounts = await ChartOfAccounts.find({
        accountType: 'expense',
        isActive: true
      });

      // Calculate revenue
      const revenueData = await this._calculateAccountBalances(
        revenueAccounts.map(a => a._id),
        startDate,
        endDate
      );

      // Calculate expenses
      const expenseData = await this._calculateAccountBalances(
        expenseAccounts.map(a => a._id),
        startDate,
        endDate
      );

      // Calculate totals
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.balance, 0);
      const totalExpenses = expenseData.reduce((sum, item) => sum + item.balance, 0);
      const netIncome = totalRevenue - totalExpenses;

      // Group by sub-types
      const revenueByType = this._groupBySubType(revenueData);
      const expensesByType = this._groupBySubType(expenseData);

      return {
        period: {
          startDate,
          endDate
        },
        revenue: {
          items: revenueData,
          byType: revenueByType,
          total: totalRevenue
        },
        expenses: {
          items: expenseData,
          byType: expensesByType,
          total: totalExpenses
        },
        netIncome,
        profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
      };
    } catch (error) {
      console.error("Error generating income statement:", error);
      throw error;
    }
  }

  /**
   * Generate Balance Sheet
   */
  static async generateBalanceSheet(asOfDate = new Date()) {
    try {
      // Get accounts by type
      const assetAccounts = await ChartOfAccounts.find({
        accountType: 'asset',
        isActive: true
      });

      const liabilityAccounts = await ChartOfAccounts.find({
        accountType: 'liability',
        isActive: true
      });

      const equityAccounts = await ChartOfAccounts.find({
        accountType: 'equity',
        isActive: true
      });

      // Calculate balances as of date
      const assetData = await this._calculateAccountBalances(
        assetAccounts.map(a => a._id),
        null,
        asOfDate
      );

      const liabilityData = await this._calculateAccountBalances(
        liabilityAccounts.map(a => a._id),
        null,
        asOfDate
      );

      const equityData = await this._calculateAccountBalances(
        equityAccounts.map(a => a._id),
        null,
        asOfDate
      );

      // Calculate totals
      const totalAssets = assetData.reduce((sum, item) => sum + item.balance, 0);
      const totalLiabilities = liabilityData.reduce((sum, item) => sum + item.balance, 0);
      const totalEquity = equityData.reduce((sum, item) => sum + item.balance, 0);

      // Group by sub-types
      const assetsByType = this._groupBySubType(assetData);
      const liabilitiesByType = this._groupBySubType(liabilityData);
      const equityByType = this._groupBySubType(equityData);

      return {
        asOfDate,
        assets: {
          items: assetData,
          byType: assetsByType,
          total: totalAssets
        },
        liabilities: {
          items: liabilityData,
          byType: liabilitiesByType,
          total: totalLiabilities
        },
        equity: {
          items: equityData,
          byType: equityByType,
          total: totalEquity
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      };
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      throw error;
    }
  }

  /**
   * Generate Trial Balance
   */
  static async generateTrialBalance(startDate, endDate) {
    try {
      const accounts = await ChartOfAccounts.find({ isActive: true });
      
      const trialBalanceData = [];
      let totalDebits = 0;
      let totalCredits = 0;

      for (const account of accounts) {
        const ledgerEntries = await GeneralLedger.find({
          account: account._id,
          entryDate: {
            $gte: startDate,
            $lte: endDate
          }
        });

        const debitSum = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
        const creditSum = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

        // Calculate balance based on normal balance type
        let balance;
        if (account.normalBalance === 'debit') {
          balance = debitSum - creditSum;
        } else {
          balance = creditSum - debitSum;
        }

        if (debitSum > 0 || creditSum > 0) {
          trialBalanceData.push({
            accountCode: account.accountCode,
            accountName: account.accountName,
            accountType: account.accountType,
            normalBalance: account.normalBalance,
            debit: debitSum,
            credit: creditSum,
            balance
          });

          totalDebits += debitSum;
          totalCredits += creditSum;
        }
      }

      return {
        period: { startDate, endDate },
        accounts: trialBalanceData,
        totals: {
          debits: totalDebits,
          credits: totalCredits,
          difference: Math.abs(totalDebits - totalCredits)
        },
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
      };
    } catch (error) {
      console.error("Error generating trial balance:", error);
      throw error;
    }
  }

  /**
   * Generate Cash Flow Statement (Indirect Method)
   */
  static async generateCashFlowStatement(startDate, endDate) {
    try {
      // Get net income from income statement
      const incomeStatement = await this.generateIncomeStatement(startDate, endDate);
      const netIncome = incomeStatement.netIncome;

      // Get changes in working capital accounts
      const operatingActivities = await this._calculateOperatingActivities(startDate, endDate, netIncome);
      const investingActivities = await this._calculateInvestingActivities(startDate, endDate);
      const financingActivities = await this._calculateFinancingActivities(startDate, endDate);

      const netCashFlow = operatingActivities.total + investingActivities.total + financingActivities.total;

      // Get beginning and ending cash balances
      const cashAccounts = await ChartOfAccounts.find({
        accountType: 'asset',
        reportCategory: 'cash_and_equivalents',
        isActive: true
      });

      const beginningCash = await this._getCashBalance(cashAccounts, startDate);
      const endingCash = await this._getCashBalance(cashAccounts, endDate);

      return {
        period: { startDate, endDate },
        operatingActivities,
        investingActivities,
        financingActivities,
        netCashFlow,
        beginningCash,
        endingCash,
        netChange: netCashFlow // Use sum of activities instead of balance difference
      };
    } catch (error) {
      console.error("Error generating cash flow statement:", error);
      throw error;
    }
  }

  /**
   * Helper: Calculate account balances for a period
   */
  static async _calculateAccountBalances(accountIds, startDate, endDate) {
    const results = [];

    for (const accountId of accountIds) {
      const account = await ChartOfAccounts.findById(accountId);
      if (!account) continue;

      const query = { account: accountId };
      if (startDate) query.entryDate = { $gte: startDate };
      if (endDate) {
        query.entryDate = query.entryDate || {};
        query.entryDate.$lte = endDate;
      }

      const ledgerEntries = await GeneralLedger.find(query);

      const debitSum = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
      const creditSum = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

      let balance;
      if (account.normalBalance === 'debit') {
        balance = debitSum - creditSum;
      } else {
        balance = creditSum - debitSum;
      }

      if (Math.abs(balance) > 0.01) {
        results.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountType: account.accountType,
          accountSubType: account.accountSubType,
          balance
        });
      }
    }

    return results;
  }

  /**
   * Helper: Group accounts by sub-type
   */
  static _groupBySubType(accountData) {
    const grouped = {};
    
    accountData.forEach(item => {
      const subType = item.accountSubType;
      if (!grouped[subType]) {
        grouped[subType] = {
          accounts: [],
          total: 0
        };
      }
      grouped[subType].accounts.push(item);
      grouped[subType].total += item.balance;
    });

    return grouped;
  }

  /**
   * Helper: Calculate operating activities for cash flow
   */
  static async _calculateOperatingActivities(startDate, endDate, netIncome) {
    const items = [
      { description: netIncome >= 0 ? 'Net Income' : 'Net Loss', amount: netIncome }
    ];

    // Get depreciation and amortization (add back non-cash expenses)
    const depreciationAccounts = await ChartOfAccounts.find({
      accountType: 'expense',
      accountName: { $regex: /depreciation|amortization/i },
      isActive: true
    });

    for (const account of depreciationAccounts) {
      const entries = await GeneralLedger.find({
        account: account._id,
        entryDate: { $gte: startDate, $lte: endDate }
      });
      const amount = entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
      if (Math.abs(amount) > 0.01) {
        items.push({ 
          description: `Depreciation and Amortization`, 
          amount: Math.abs(amount)
        });
      }
    }

    // Calculate changes in current assets (excluding cash)
    const currentAssets = await ChartOfAccounts.find({
      accountType: 'asset',
      accountSubType: { $in: ['accounts_receivable', 'inventory', 'prepaid_expenses'] },
      isActive: true
    });

    for (const account of currentAssets) {
      const startBalance = await this._getAccountBalanceAtDate(account._id, startDate);
      const endBalance = await this._getAccountBalanceAtDate(account._id, endDate);
      const change = endBalance - startBalance;
      
      if (Math.abs(change) > 0.01) {
        items.push({ 
          description: `${change > 0 ? 'Increase' : 'Decrease'} in ${account.accountName}`, 
          amount: -change // Increase in assets uses cash
        });
      }
    }

    // Calculate changes in current liabilities
    const currentLiabilities = await ChartOfAccounts.find({
      accountType: 'liability',
      accountSubType: { $in: ['accounts_payable', 'accrued_expenses', 'unearned_revenue'] },
      isActive: true
    });

    for (const account of currentLiabilities) {
      const startBalance = await this._getAccountBalanceAtDate(account._id, startDate);
      const endBalance = await this._getAccountBalanceAtDate(account._id, endDate);
      const change = endBalance - startBalance;
      
      if (Math.abs(change) > 0.01) {
        items.push({ 
          description: `${change > 0 ? 'Increase' : 'Decrease'} in ${account.accountName}`, 
          amount: change // Increase in liabilities provides cash
        });
      }
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    return { items, total };
  }

  /**
   * Helper: Calculate investing activities
   */
  static async _calculateInvestingActivities(startDate, endDate) {
    const items = [];

    // Get fixed asset accounts
    const fixedAssetAccounts = await ChartOfAccounts.find({
      accountType: 'asset',
      accountSubType: { $in: ['property_plant_equipment', 'intangible_assets', 'long_term_investments'] },
      isActive: true
    });

    for (const account of fixedAssetAccounts) {
      const startBalance = await this._getAccountBalanceAtDate(account._id, startDate);
      const endBalance = await this._getAccountBalanceAtDate(account._id, endDate);
      const change = endBalance - startBalance;
      
      if (Math.abs(change) > 0.01) {
        if (change > 0) {
          items.push({ 
            description: `Purchase of ${account.accountName}`, 
            amount: -Math.abs(change) // Purchase uses cash
          });
        } else {
          items.push({ 
            description: `Sale of ${account.accountName}`, 
            amount: Math.abs(change) // Sale provides cash
          });
        }
      }
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    return { items, total };
  }

  /**
   * Helper: Calculate financing activities
   */
  static async _calculateFinancingActivities(startDate, endDate) {
    const items = [];

    // Get long-term debt accounts
    const debtAccounts = await ChartOfAccounts.find({
      accountType: 'liability',
      accountSubType: { $in: ['long_term_debt', 'bonds_payable', 'notes_payable'] },
      isActive: true
    });

    for (const account of debtAccounts) {
      const startBalance = await this._getAccountBalanceAtDate(account._id, startDate);
      const endBalance = await this._getAccountBalanceAtDate(account._id, endDate);
      const change = endBalance - startBalance;
      
      if (Math.abs(change) > 0.01) {
        if (change > 0) {
          items.push({ 
            description: `Proceeds from ${account.accountName}`, 
            amount: Math.abs(change) // Borrowing provides cash
          });
        } else {
          items.push({ 
            description: `Repayment of ${account.accountName}`, 
            amount: -Math.abs(change) // Repayment uses cash
          });
        }
      }
    }

    // Get equity accounts
    const equityAccounts = await ChartOfAccounts.find({
      accountType: 'equity',
      accountSubType: { $in: ['common_stock', 'preferred_stock', 'additional_paid_in_capital'] },
      isActive: true
    });

    for (const account of equityAccounts) {
      const startBalance = await this._getAccountBalanceAtDate(account._id, startDate);
      const endBalance = await this._getAccountBalanceAtDate(account._id, endDate);
      const change = endBalance - startBalance;
      
      if (Math.abs(change) > 0.01) {
        if (change > 0) {
          items.push({ 
            description: `Issuance of Stock`, 
            amount: Math.abs(change) // Stock issuance provides cash
          });
        } else {
          items.push({ 
            description: `Stock Repurchase`, 
            amount: -Math.abs(change) // Buyback uses cash
          });
        }
      }
    }

    // Get dividends
    const dividendAccounts = await ChartOfAccounts.find({
      accountType: 'equity',
      accountName: { $regex: /dividend/i },
      isActive: true
    });

    for (const account of dividendAccounts) {
      const entries = await GeneralLedger.find({
        account: account._id,
        entryDate: { $gte: startDate, $lte: endDate }
      });
      const amount = entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
      if (Math.abs(amount) > 0.01) {
        items.push({ 
          description: `Dividends Paid`, 
          amount: -Math.abs(amount) // Dividends use cash
        });
      }
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    return { items, total };
  }

  /**
   * Helper: Get account balance at a specific date
   */
  static async _getAccountBalanceAtDate(accountId, asOfDate) {
    const account = await ChartOfAccounts.findById(accountId);
    if (!account) return 0;

    const entries = await GeneralLedger.find({
      account: accountId,
      entryDate: { $lte: asOfDate }
    });

    const debitSum = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const creditSum = entries.reduce((sum, entry) => sum + entry.credit, 0);

    if (account.normalBalance === 'debit') {
      return debitSum - creditSum;
    } else {
      return creditSum - debitSum;
    }
  }

  /**
   * Helper: Get cash balance at a specific date
   */
  static async _getCashBalance(cashAccounts, asOfDate) {
    let totalCash = 0;

    for (const account of cashAccounts) {
      const balance = await GeneralLedger.getAccountBalance(account._id, asOfDate);
      totalCash += balance;
    }

    return totalCash;
  }
}

module.exports = FinancialReportService;
