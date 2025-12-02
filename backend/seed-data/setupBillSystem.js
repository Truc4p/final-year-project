#!/usr/bin/env node

/**
 * Complete Bill System Setup Script
 * 
 * This script sets up the entire bill creation system by:
 * 1. Seeding Chart of Accounts
 * 2. Seeding Vendors
 * 3. Verifying all data
 * 
 * Usage: node setupBillSystem.js <ADMIN_USER_ID>
 */

const mongoose = require("mongoose");
const connectDB = require("../db");
const { seedChartOfAccounts } = require("./seedChartOfAccounts");
const { seedVendors } = require("./seedVendors");

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function verifySetup(userId) {
  try {
    logSection("Verifying Setup");

    const ChartOfAccounts = require("../models/finance/chartOfAccounts");
    const Vendor = require("../models/finance/vendor");

    // Check Chart of Accounts
    const coaCount = await ChartOfAccounts.countDocuments();
    if (coaCount === 0) {
      logError("No Chart of Accounts found!");
      return false;
    }
    logSuccess(`Chart of Accounts: ${coaCount} accounts`);

    // Check key accounts
    const apAccount = await ChartOfAccounts.findOne({ accountCode: '2000' });
    if (!apAccount) {
      logError("Accounts Payable account (2000) not found!");
      return false;
    }
    logSuccess(`Accounts Payable account found: ${apAccount.accountName}`);

    // Check expense accounts
    const expenseAccounts = await ChartOfAccounts.countDocuments({ accountType: 'expense' });
    logSuccess(`Expense accounts: ${expenseAccounts}`);

    // Check Vendors
    const vendorCount = await Vendor.countDocuments();
    if (vendorCount === 0) {
      logError("No vendors found!");
      return false;
    }
    logSuccess(`Vendors: ${vendorCount} vendors`);

    // List vendors
    const vendors = await Vendor.find().select('companyName vendorType status');
    logInfo("\nVendors created:");
    vendors.forEach((vendor, index) => {
      log(`   ${index + 1}. ${vendor.companyName} (${vendor.vendorType}) - ${vendor.status}`, 'blue');
    });

    return true;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    logSection("Bill System Setup");

    // Get user ID from command line
    const userId = process.argv[2];
    if (!userId) {
      logError("Please provide a user ID as argument");
      log("Usage: node setupBillSystem.js <ADMIN_USER_ID>\n", 'yellow');
      process.exit(1);
    }

    logInfo(`Using User ID: ${userId}\n`);

    // Connect to database
    logInfo("Connecting to MongoDB...");
    await connectDB();
    logSuccess("Connected to MongoDB\n");

    // Seed Chart of Accounts
    logSection("Step 1: Seeding Chart of Accounts");
    await seedChartOfAccounts(userId);

    // Seed Vendors
    logSection("Step 2: Seeding Vendors");
    await seedVendors(userId);

    // Verify setup
    const verified = await verifySetup(userId);

    if (verified) {
      logSection("Setup Complete!");
      logSuccess("Bill system is ready to use!");
      
      log("\n📋 Next Steps:", 'bright');
      log("   1. Start your backend server", 'blue');
      log("   2. Navigate to the Bills section in your UI", 'blue');
      log("   3. Create a new bill by selecting a vendor", 'blue');
      log("   4. Add line items with expense accounts", 'blue');
      log("   5. Save and approve the bill", 'blue');
      log("   6. Post to general ledger to create journal entries\n", 'blue');

      log("📚 API Endpoints:", 'bright');
      log("   GET  /api/bills/form-data/vendors", 'blue');
      log("   GET  /api/bills/form-data/expense-accounts", 'blue');
      log("   GET  /api/bills/form-data/vendor/:vendorId", 'blue');
      log("   POST /api/bills", 'blue');
      log("   GET  /api/bills", 'blue');
      log("   GET  /api/bills/:id\n", 'blue');

      log("📖 For more information, see BILL_SETUP_GUIDE.md\n", 'bright');
    } else {
      logError("Setup verification failed!");
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run setup
main();

