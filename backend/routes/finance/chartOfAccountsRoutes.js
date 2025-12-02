const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getAccountTree,
} = require("../../controllers/finance/chartOfAccountsController");

// All routes require authentication and admin role
router.use(auth);
router.use(role(["admin"]));

// List & tree
router.get("/", getAccounts);
router.get("/tree", getAccountTree);

// CRUD
router.post("/", createAccount);
router.get("/:id", getAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

module.exports = router;

