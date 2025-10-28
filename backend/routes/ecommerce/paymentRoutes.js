const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const paymentController = require("../../controllers/ecommerce/paymentController");

// Create VNPay payment URL
router.post("/vnpay/create", auth, role(["customer"]), paymentController.createVnpayPayment);

// VNPay return URL (GET)
router.get("/vnpay/return", paymentController.vnpReturn);

// VNPay IPN URL (GET for sandbox convenience)
router.get("/vnpay/ipn", paymentController.vnpIpn);

module.exports = router;


