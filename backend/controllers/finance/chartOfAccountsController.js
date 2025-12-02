const ChartOfAccounts = require("../../models/finance/chartOfAccounts");

// Create new account
const createAccount = async (req, res) => {
  try {
    const data = req.body;

    // Basic validations
    if (!data.accountCode || !data.accountName || !data.accountType || !data.accountSubType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Prevent duplicates by code
    const existing = await ChartOfAccounts.findOne({ accountCode: data.accountCode });
    if (existing) {
      return res.status(409).json({ message: "Account code already exists" });
    }

    // Derive normal balance from accountType to satisfy schema requirement
    const normalBalance = ['asset', 'expense'].includes(data.accountType) ? 'debit' : 'credit';

    const account = new ChartOfAccounts({
      ...data,
      normalBalance,
      createdBy: req.user?._id,
      isActive: data.isActive !== undefined ? data.isActive : true,
      allowManualEntry: data.allowManualEntry !== undefined ? data.allowManualEntry : true,
    });

    await account.save();
    res.status(201).json({ message: "Account created successfully", account });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get list of accounts with filters and pagination
const getAccounts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 200,
      accountType,
      isActive,
      search,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
    if (search) {
      filter.$or = [
        { accountCode: new RegExp(search, 'i') },
        { accountName: new RegExp(search, 'i') },
      ];
    }

    const accounts = await ChartOfAccounts.find(filter)
      .sort({ accountCode: 1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await ChartOfAccounts.countDocuments(filter);

    res.json({
      accounts,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1,
      }
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single account
const getAccount = async (req, res) => {
  try {
    const account = await ChartOfAccounts.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update account
const updateAccount = async (req, res) => {
  try {
    const update = req.body;
    update.lastModifiedBy = req.user?._id;

    const account = await ChartOfAccounts.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!account) return res.status(404).json({ message: "Account not found" });

    res.json({ message: "Account updated successfully", account });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const account = await ChartOfAccounts.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Use schema pre-remove checks by calling remove()
    await account.remove();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(400).json({ message: error.message || "Failed to delete account" });
  }
};

// Get account tree (optional)
const getAccountTree = async (req, res) => {
  try {
    const { accountType } = req.query;
    const tree = await ChartOfAccounts.getAccountTree(accountType || undefined);
    res.json({ tree });
  } catch (error) {
    console.error("Error fetching account tree:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getAccountTree,
};

