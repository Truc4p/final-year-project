const express = require("express");
const router = express.Router();
const budgetController = require("../../controllers/finance/budgetController");
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");

// All routes require authentication
router.use(auth);

// Get all budgets (accessible by all authenticated users)
router.get("/", budgetController.getBudgets);

// Get single budget
router.get("/:id", budgetController.getBudgetById);

// Get budget analysis
router.get("/:id/analysis", budgetController.getBudgetAnalysis);

// Compare budgets
router.get("/compare", budgetController.compareBudgets);

// Create budget (admin only)
router.post("/", role(["admin"]), budgetController.createBudget);

// Update budget (admin only)
router.put("/:id", role(["admin"]), budgetController.updateBudget);

// Delete budget (admin only)
router.delete("/:id", role(["admin"]), budgetController.deleteBudget);

// Approve budget (admin only)
router.post("/:id/approve", role(["admin"]), budgetController.approveBudget);

// Update actuals
router.post("/:id/update-actuals", budgetController.updateActuals);

// Duplicate budget
router.post("/:id/duplicate", role(["admin"]), budgetController.duplicateBudget);

// Close budget (admin only)
router.post("/:id/close", role(["admin"]), budgetController.closeBudget);

module.exports = router;
