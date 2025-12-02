const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const {
  getGeneralLedger,
  getTrialBalance,
  getJournalEntryById
} = require("../../controllers/finance/generalLedgerController");

// All routes require authentication and admin role
router.use(auth);
router.use(role(["admin"]));

// GET /api/finance/general-ledger
router.get("/", getGeneralLedger);

// GET /api/finance/general-ledger/trial-balance
router.get("/trial-balance", getTrialBalance);

// GET /api/finance/general-ledger/entry/:id
router.get("/entry/:id", getJournalEntryById);

module.exports = router;

