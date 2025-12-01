const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const {
  createBill,
  getBills,
  getBill,
  updateBill,
  approveBill,
  postBill,
  addPayment,
  getAgingReport,
  deleteBill,
  voidBill
} = require("../../controllers/finance/billController");

// All routes require authentication and admin role
router.use(auth);
router.use(role(["admin"]));

// Bill routes
router.post("/", createBill);
router.get("/", getBills);
router.get("/aging-report", getAgingReport);
router.get("/:id", getBill);
router.put("/:id", updateBill);
router.post("/:id/approve", approveBill);
router.post("/:id/post", postBill);
router.post("/:id/payments", addPayment);
router.post("/:id/void", voidBill);
router.delete("/:id", deleteBill);

module.exports = router;
