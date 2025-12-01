const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  postInvoice,
  addPayment,
  getAgingReport,
  deleteInvoice,
  voidInvoice
} = require("../../controllers/finance/invoiceController");

// All routes require authentication and admin role
router.use(auth);
router.use(role(["admin"]));

// Invoice routes
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/aging-report", getAgingReport);
router.get("/:id", getInvoice);
router.put("/:id", updateInvoice);
router.post("/:id/post", postInvoice);
router.post("/:id/payments", addPayment);
router.post("/:id/void", voidInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;
