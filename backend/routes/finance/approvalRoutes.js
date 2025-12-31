const express = require("express");
const router = express.Router();
const approvalController = require("../../controllers/finance/approvalController");
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");

// All routes require authentication
router.use(auth);

// Get all approvals
router.get("/", approvalController.getApprovals);

// Get approval statistics
router.get("/stats", approvalController.getApprovalStats);

// Get single approval
router.get("/:id", approvalController.getApprovalById);

// Create approval workflow
router.post("/", approvalController.createApproval);

// Approve current step
router.post("/:id/approve", approvalController.approveStep);

// Reject approval
router.post("/:id/reject", approvalController.rejectApproval);

// Cancel approval
router.post("/:id/cancel", approvalController.cancelApproval);

// Escalate approval (admin only)
router.post("/:id/escalate", role(["admin"]), approvalController.escalateApproval);

// Reassign approval step (admin only)
router.post("/:id/reassign", role(["admin"]), approvalController.reassignApproval);

module.exports = router;
