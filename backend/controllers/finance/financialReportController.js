const FinancialReportService = require("../../services/financialReportService");

// Get Income Statement (P&L)
const getIncomeStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const report = await FinancialReportService.generateIncomeStatement(
      start,
      end
    );

    res.json(report);
  } catch (error) {
    console.error("Error generating income statement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Balance Sheet
const getBalanceSheet = async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const date = asOfDate ? new Date(asOfDate) : new Date();

    const report = await FinancialReportService.generateBalanceSheet(date);

    res.json(report);
  } catch (error) {
    console.error("Error generating balance sheet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Trial Balance
const getTrialBalance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    const report = await FinancialReportService.generateTrialBalance(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(report);
  } catch (error) {
    console.error("Error generating trial balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Cash Flow Statement
const getCashFlowStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    const report = await FinancialReportService.generateCashFlowStatement(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(report);
  } catch (error) {
    console.error("Error generating cash flow statement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get financial summary (overview of all key metrics)
const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate all reports in parallel
    const [incomeStatement, balanceSheet, cashFlow] = await Promise.all([
      FinancialReportService.generateIncomeStatement(start, end),
      FinancialReportService.generateBalanceSheet(end),
      FinancialReportService.generateCashFlowStatement(start, end)
    ]);

    // Calculate key financial ratios
    const currentRatio = balanceSheet.assets.byType?.current_asset?.total / 
                        (balanceSheet.liabilities.byType?.current_liability?.total || 1);
    
    const debtToEquity = balanceSheet.liabilities.total / 
                        (balanceSheet.equity.total || 1);
    
    const returnOnAssets = (incomeStatement.netIncome / balanceSheet.assets.total) * 100;

    res.json({
      period: { startDate: start, endDate: end },
      incomeStatement: {
        revenue: incomeStatement.revenue.total,
        expenses: incomeStatement.expenses.total,
        netIncome: incomeStatement.netIncome,
        profitMargin: incomeStatement.profitMargin
      },
      balanceSheet: {
        totalAssets: balanceSheet.assets.total,
        totalLiabilities: balanceSheet.liabilities.total,
        totalEquity: balanceSheet.equity.total,
        isBalanced: balanceSheet.isBalanced
      },
      cashFlow: {
        operatingCashFlow: cashFlow.operatingActivities.total,
        investingCashFlow: cashFlow.investingActivities.total,
        financingCashFlow: cashFlow.financingActivities.total,
        netCashFlow: cashFlow.netCashFlow,
        endingCash: cashFlow.endingCash
      },
      ratios: {
        currentRatio: currentRatio || 0,
        debtToEquityRatio: debtToEquity || 0,
        returnOnAssets: returnOnAssets || 0,
        profitMargin: incomeStatement.profitMargin
      }
    });
  } catch (error) {
    console.error("Error generating financial summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getIncomeStatement,
  getBalanceSheet,
  getTrialBalance,
  getCashFlowStatement,
  getFinancialSummary
};
