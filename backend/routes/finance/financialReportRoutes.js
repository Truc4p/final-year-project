const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const {
  getIncomeStatement,
  getBalanceSheet,
  getTrialBalance,
  getCashFlowStatement,
  getFinancialSummary
} = require("../../controllers/finance/financialReportController");

// All routes require authentication and admin role
router.use(auth);
router.use(role(["admin"]));

// Financial report routes
router.get("/income-statement", getIncomeStatement);
router.get("/balance-sheet", getBalanceSheet);
router.get("/trial-balance", getTrialBalance);
router.get("/cash-flow-statement", getCashFlowStatement);
router.get("/summary", getFinancialSummary);

module.exports = router;
