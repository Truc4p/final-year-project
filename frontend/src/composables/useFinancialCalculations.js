/**
 * Composable for Financial Calculations
 * Provides reusable financial calculation logic across the application
 */

import { ref, computed } from 'vue';

export const useFinancialCalculations = () => {
  /**
   * Format currency value
   * @param {number} value - The value to format
   * @param {string} currency - Currency code (default: 'USD')
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (value, currency = 'USD') => {
    if (typeof value !== 'number') return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  /**
   * Format number without currency
   * @param {number} value - The value to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (value) => {
    if (typeof value !== 'number') return '0.00';
    
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  /**
   * Calculate percentage change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number} Percentage change
   */
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  /**
   * Calculate gross profit
   * @param {number} revenue - Total revenue
   * @param {number} cogs - Cost of goods sold
   * @returns {number} Gross profit
   */
  const calculateGrossProfit = (revenue, cogs) => {
    return revenue - cogs;
  };

  /**
   * Calculate gross profit margin
   * @param {number} grossProfit - Gross profit
   * @param {number} revenue - Total revenue
   * @returns {number} Gross profit margin percentage
   */
  const calculateGrossProfitMargin = (grossProfit, revenue) => {
    if (revenue === 0) return 0;
    return (grossProfit / revenue) * 100;
  };

  /**
   * Calculate operating profit
   * @param {number} grossProfit - Gross profit
   * @param {number} operatingExpenses - Operating expenses
   * @returns {number} Operating profit
   */
  const calculateOperatingProfit = (grossProfit, operatingExpenses) => {
    return grossProfit - operatingExpenses;
  };

  /**
   * Calculate operating profit margin
   * @param {number} operatingProfit - Operating profit
   * @param {number} revenue - Total revenue
   * @returns {number} Operating profit margin percentage
   */
  const calculateOperatingProfitMargin = (operatingProfit, revenue) => {
    if (revenue === 0) return 0;
    return (operatingProfit / revenue) * 100;
  };

  /**
   * Calculate net profit margin
   * @param {number} netIncome - Net income
   * @param {number} revenue - Total revenue
   * @returns {number} Net profit margin percentage
   */
  const calculateNetProfitMargin = (netIncome, revenue) => {
    if (revenue === 0) return 0;
    return (netIncome / revenue) * 100;
  };

  /**
   * Calculate current ratio
   * @param {number} currentAssets - Current assets
   * @param {number} currentLiabilities - Current liabilities
   * @returns {number} Current ratio
   */
  const calculateCurrentRatio = (currentAssets, currentLiabilities) => {
    if (currentLiabilities === 0) return 0;
    return currentAssets / currentLiabilities;
  };

  /**
   * Calculate quick ratio (Acid test)
   * @param {number} currentAssets - Current assets
   * @param {number} inventory - Inventory
   * @param {number} currentLiabilities - Current liabilities
   * @returns {number} Quick ratio
   */
  const calculateQuickRatio = (currentAssets, inventory, currentLiabilities) => {
    if (currentLiabilities === 0) return 0;
    return (currentAssets - inventory) / currentLiabilities;
  };

  /**
   * Calculate debt-to-equity ratio
   * @param {number} totalLiabilities - Total liabilities
   * @param {number} totalEquity - Total equity
   * @returns {number} Debt-to-equity ratio
   */
  const calculateDebtToEquityRatio = (totalLiabilities, totalEquity) => {
    if (totalEquity === 0) return 0;
    return totalLiabilities / totalEquity;
  };

  /**
   * Calculate return on assets (ROA)
   * @param {number} netIncome - Net income
   * @param {number} totalAssets - Total assets
   * @returns {number} ROA percentage
   */
  const calculateROA = (netIncome, totalAssets) => {
    if (totalAssets === 0) return 0;
    return (netIncome / totalAssets) * 100;
  };

  /**
   * Calculate return on equity (ROE)
   * @param {number} netIncome - Net income
   * @param {number} totalEquity - Total equity
   * @returns {number} ROE percentage
   */
  const calculateROE = (netIncome, totalEquity) => {
    if (totalEquity === 0) return 0;
    return (netIncome / totalEquity) * 100;
  };

  /**
   * Calculate asset turnover ratio
   * @param {number} revenue - Total revenue
   * @param {number} totalAssets - Total assets
   * @returns {number} Asset turnover ratio
   */
  const calculateAssetTurnoverRatio = (revenue, totalAssets) => {
    if (totalAssets === 0) return 0;
    return revenue / totalAssets;
  };

  /**
   * Calculate inventory turnover ratio
   * @param {number} cogs - Cost of goods sold
   * @param {number} averageInventory - Average inventory
   * @returns {number} Inventory turnover ratio
   */
  const calculateInventoryTurnoverRatio = (cogs, averageInventory) => {
    if (averageInventory === 0) return 0;
    return cogs / averageInventory;
  };

  /**
   * Calculate days inventory outstanding (DIO)
   * @param {number} inventoryTurnover - Inventory turnover ratio
   * @returns {number} Days inventory outstanding
   */
  const calculateDaysInventoryOutstanding = (inventoryTurnover) => {
    if (inventoryTurnover === 0) return 0;
    return 365 / inventoryTurnover;
  };

  /**
   * Calculate accounts receivable turnover
   * @param {number} revenue - Total revenue
   * @param {number} averageAccountsReceivable - Average accounts receivable
   * @returns {number} Accounts receivable turnover
   */
  const calculateAccountsReceivableTurnover = (revenue, averageAccountsReceivable) => {
    if (averageAccountsReceivable === 0) return 0;
    return revenue / averageAccountsReceivable;
  };

  /**
   * Calculate days sales outstanding (DSO)
   * @param {number} arTurnover - Accounts receivable turnover
   * @returns {number} Days sales outstanding
   */
  const calculateDaysSalesOutstanding = (arTurnover) => {
    if (arTurnover === 0) return 0;
    return 365 / arTurnover;
  };

  /**
   * Calculate cash conversion cycle
   * @param {number} dio - Days inventory outstanding
   * @param {number} dso - Days sales outstanding
   * @param {number} dpo - Days payable outstanding
   * @returns {number} Cash conversion cycle
   */
  const calculateCashConversionCycle = (dio, dso, dpo) => {
    return dio + dso - dpo;
  };

  /**
   * Calculate break-even point
   * @param {number} fixedCosts - Fixed costs
   * @param {number} contributionMarginRatio - Contribution margin ratio
   * @returns {number} Break-even point in sales
   */
  const calculateBreakEvenPoint = (fixedCosts, contributionMarginRatio) => {
    if (contributionMarginRatio === 0) return 0;
    return fixedCosts / contributionMarginRatio;
  };

  /**
   * Calculate contribution margin
   * @param {number} revenue - Total revenue
   * @param {number} variableCosts - Variable costs
   * @returns {number} Contribution margin
   */
  const calculateContributionMargin = (revenue, variableCosts) => {
    return revenue - variableCosts;
  };

  /**
   * Calculate contribution margin ratio
   * @param {number} contributionMargin - Contribution margin
   * @param {number} revenue - Total revenue
   * @returns {number} Contribution margin ratio
   */
  const calculateContributionMarginRatio = (contributionMargin, revenue) => {
    if (revenue === 0) return 0;
    return contributionMargin / revenue;
  };

  /**
   * Get date range based on period
   * @param {string} period - Period type (current_month, current_quarter, etc.)
   * @returns {object} Object with startDate and endDate
   */
  const getDateRange = (period) => {
    const today = new Date();
    let startDate, endDate;

    switch (period) {
      case 'current_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'current_quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = today;
        break;
      case 'current_year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last_quarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        startDate = new Date(today.getFullYear(), lastQuarter * 3, 1);
        endDate = new Date(today.getFullYear(), lastQuarter * 3 + 3, 0);
        break;
      case 'last_year':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
    }

    return { startDate, endDate };
  };

  /**
   * Format date to YYYY-MM-DD
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  const formatDateToISO = (date) => {
    if (!(date instanceof Date)) return '';
    return date.toISOString().split('T')[0];
  };

  /**
   * Calculate average of array
   * @param {array} values - Array of numbers
   * @returns {number} Average value
   */
  const calculateAverage = (values) => {
    if (!Array.isArray(values) || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  /**
   * Calculate sum of array
   * @param {array} values - Array of numbers
   * @returns {number} Sum value
   */
  const calculateSum = (values) => {
    if (!Array.isArray(values)) return 0;
    return values.reduce((sum, val) => sum + val, 0);
  };

  /**
   * Get financial health status
   * @param {number} currentRatio - Current ratio
   * @param {number} debtToEquity - Debt to equity ratio
   * @param {number} netProfitMargin - Net profit margin
   * @returns {object} Health status with color and message
   */
  const getFinancialHealthStatus = (currentRatio, debtToEquity, netProfitMargin) => {
    let score = 0;
    let status = 'Poor';
    let color = 'red';

    // Current ratio check (ideal: 1.5-3.0)
    if (currentRatio >= 1.5 && currentRatio <= 3.0) score += 1;
    else if (currentRatio > 1.0) score += 0.5;

    // Debt to equity check (ideal: < 2.0)
    if (debtToEquity < 2.0) score += 1;
    else if (debtToEquity < 3.0) score += 0.5;

    // Net profit margin check (ideal: > 10%)
    if (netProfitMargin > 10) score += 1;
    else if (netProfitMargin > 5) score += 0.5;

    if (score >= 2.5) {
      status = 'Excellent';
      color = 'green';
    } else if (score >= 1.5) {
      status = 'Good';
      color = 'blue';
    } else if (score >= 0.5) {
      status = 'Fair';
      color = 'yellow';
    }

    return { status, color, score };
  };

  return {
    formatCurrency,
    formatNumber,
    calculatePercentageChange,
    calculateGrossProfit,
    calculateGrossProfitMargin,
    calculateOperatingProfit,
    calculateOperatingProfitMargin,
    calculateNetProfitMargin,
    calculateCurrentRatio,
    calculateQuickRatio,
    calculateDebtToEquityRatio,
    calculateROA,
    calculateROE,
    calculateAssetTurnoverRatio,
    calculateInventoryTurnoverRatio,
    calculateDaysInventoryOutstanding,
    calculateAccountsReceivableTurnover,
    calculateDaysSalesOutstanding,
    calculateCashConversionCycle,
    calculateBreakEvenPoint,
    calculateContributionMargin,
    calculateContributionMarginRatio,
    getDateRange,
    formatDateToISO,
    calculateAverage,
    calculateSum,
    getFinancialHealthStatus
  };
};

export default useFinancialCalculations;

