const ChartOfAccounts = require("../models/finance/chartOfAccounts");
const mongoose = require("mongoose");

/**
 * Seed script to initialize Chart of Accounts with standard accounts for SME
 * Run this once to set up the basic account structure
 */

const standardAccounts = [
  // ASSETS (1000-1999)
  // Current Assets (1000-1499)
  {
    accountCode: "1000",
    accountName: "Cash",
    accountType: "asset",
    accountSubType: "current_asset",
    normalBalance: "debit",
    isSystemAccount: true,
    bankAccount: true,
    reconcilable: true,
    reportCategory: "cash_and_equivalents",
    description: "Cash on hand and in bank accounts"
  },
  {
    accountCode: "1100",
    accountName: "Petty Cash",
    accountType: "asset",
    accountSubType: "current_asset",
    normalBalance: "debit",
    reportCategory: "cash_and_equivalents",
    description: "Small amounts of cash for minor expenses"
  },
  {
    accountCode: "1200",
    accountName: "Accounts Receivable",
    accountType: "asset",
    accountSubType: "current_asset",
    normalBalance: "debit",
    isSystemAccount: true,
    reportCategory: "accounts_receivable",
    description: "Money owed by customers"
  },
  {
    accountCode: "1300",
    accountName: "Inventory",
    accountType: "asset",
    accountSubType: "current_asset",
    normalBalance: "debit",
    reportCategory: "inventory",
    description: "Products available for sale"
  },
  {
    accountCode: "1400",
    accountName: "Tax Receivable",
    accountType: "asset",
    accountSubType: "current_asset",
    normalBalance: "debit",
    taxRelevant: true,
    description: "Tax credits and receivables"
  },
  
  // Fixed Assets (1500-1899)
  {
    accountCode: "1500",
    accountName: "Property & Equipment",
    accountType: "asset",
    accountSubType: "fixed_asset",
    normalBalance: "debit",
    reportCategory: "property_plant_equipment",
    description: "Long-term physical assets"
  },
  {
    accountCode: "1600",
    accountName: "Accumulated Depreciation",
    accountType: "asset",
    accountSubType: "fixed_asset",
    normalBalance: "credit",
    reportCategory: "property_plant_equipment",
    description: "Contra-asset for depreciation"
  },
  
  // LIABILITIES (2000-2999)
  // Current Liabilities (2000-2499)
  {
    accountCode: "2000",
    accountName: "Accounts Payable",
    accountType: "liability",
    accountSubType: "current_liability",
    normalBalance: "credit",
    isSystemAccount: true,
    reportCategory: "accounts_payable",
    description: "Money owed to vendors"
  },
  {
    accountCode: "2100",
    accountName: "Sales Tax Payable",
    accountType: "liability",
    accountSubType: "current_liability",
    normalBalance: "credit",
    taxRelevant: true,
    description: "Sales tax collected from customers"
  },
  {
    accountCode: "2200",
    accountName: "Payroll Liabilities",
    accountType: "liability",
    accountSubType: "current_liability",
    normalBalance: "credit",
    description: "Employee wages and withholdings payable"
  },
  
  // Long-term Liabilities (2500-2999)
  {
    accountCode: "2500",
    accountName: "Loans Payable",
    accountType: "liability",
    accountSubType: "long_term_liability",
    normalBalance: "credit",
    description: "Long-term debt obligations"
  },
  
  // EQUITY (3000-3999)
  {
    accountCode: "3000",
    accountName: "Owner's Equity",
    accountType: "equity",
    accountSubType: "owner_equity",
    normalBalance: "credit",
    isSystemAccount: true,
    reportCategory: "owner_capital",
    description: "Owner's investment in the business"
  },
  {
    accountCode: "3100",
    accountName: "Retained Earnings",
    accountType: "equity",
    accountSubType: "retained_earnings",
    normalBalance: "credit",
    isSystemAccount: true,
    reportCategory: "retained_earnings",
    description: "Accumulated profits/losses"
  },
  {
    accountCode: "3200",
    accountName: "Owner's Draw",
    accountType: "equity",
    accountSubType: "owner_equity",
    normalBalance: "debit",
    description: "Owner withdrawals from business"
  },
  
  // REVENUE (4000-4999)
  {
    accountCode: "4000",
    accountName: "Product Sales Revenue",
    accountType: "revenue",
    accountSubType: "operating_revenue",
    normalBalance: "credit",
    reportCategory: "sales_revenue",
    description: "Revenue from product sales"
  },
  {
    accountCode: "4100",
    accountName: "Service Revenue",
    accountType: "revenue",
    accountSubType: "operating_revenue",
    normalBalance: "credit",
    reportCategory: "service_revenue",
    description: "Revenue from services"
  },
  {
    accountCode: "4200",
    accountName: "Shipping Revenue",
    accountType: "revenue",
    accountSubType: "operating_revenue",
    normalBalance: "credit",
    description: "Shipping fees collected"
  },
  {
    accountCode: "4900",
    accountName: "Other Income",
    accountType: "revenue",
    accountSubType: "other_revenue",
    normalBalance: "credit",
    reportCategory: "other_income_expense",
    description: "Miscellaneous income"
  },
  
  // EXPENSES (5000-9999)
  // Cost of Goods Sold (5000-5999)
  {
    accountCode: "5000",
    accountName: "Cost of Goods Sold",
    accountType: "expense",
    accountSubType: "cost_of_goods_sold",
    normalBalance: "debit",
    reportCategory: "cost_of_sales",
    description: "Direct costs of products sold"
  },
  {
    accountCode: "5100",
    accountName: "Shipping Costs",
    accountType: "expense",
    accountSubType: "cost_of_goods_sold",
    normalBalance: "debit",
    reportCategory: "cost_of_sales",
    description: "Costs to ship products to customers"
  },
  
  // Operating Expenses (6000-8999)
  {
    accountCode: "6000",
    accountName: "Payroll Expense",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "payroll_expense",
    description: "Employee salaries and wages"
  },
  {
    accountCode: "6100",
    accountName: "Rent Expense",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "rent_expense",
    description: "Office and facility rent"
  },
  {
    accountCode: "6200",
    accountName: "Utilities Expense",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "utilities_expense",
    description: "Electricity, water, internet, etc."
  },
  {
    accountCode: "6300",
    accountName: "Marketing & Advertising",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "marketing_expense",
    description: "Marketing and advertising costs"
  },
  {
    accountCode: "6400",
    accountName: "Office Supplies",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Office supplies and materials"
  },
  {
    accountCode: "6500",
    accountName: "Software & Subscriptions",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Software licenses and subscriptions"
  },
  {
    accountCode: "6600",
    accountName: "Insurance Expense",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Business insurance premiums"
  },
  {
    accountCode: "6700",
    accountName: "Professional Fees",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Legal, accounting, consulting fees"
  },
  {
    accountCode: "6800",
    accountName: "Bank Fees",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Bank charges and transaction fees"
  },
  {
    accountCode: "6900",
    accountName: "Depreciation Expense",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Depreciation of fixed assets"
  },
  {
    accountCode: "8000",
    accountName: "Travel & Entertainment",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Business travel and meals"
  },
  {
    accountCode: "8100",
    accountName: "Training & Development",
    accountType: "expense",
    accountSubType: "operating_expense",
    normalBalance: "debit",
    reportCategory: "admin_expense",
    description: "Employee training and development"
  },
  
  // Other Expenses (9000-9999)
  {
    accountCode: "9000",
    accountName: "Interest Expense",
    accountType: "expense",
    accountSubType: "other_expense",
    normalBalance: "debit",
    reportCategory: "other_income_expense",
    description: "Interest on loans and credit"
  },
  {
    accountCode: "9100",
    accountName: "Miscellaneous Expense",
    accountType: "expense",
    accountSubType: "other_expense",
    normalBalance: "debit",
    reportCategory: "other_income_expense",
    description: "Other miscellaneous expenses"
  }
];

async function seedChartOfAccounts(userId) {
  try {
    console.log("🌱 Starting Chart of Accounts seeding...");
    
    // Check if accounts already exist
    const existingCount = await ChartOfAccounts.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing accounts. Skipping seed.`);
      console.log("💡 To re-seed, first delete all accounts from ChartOfAccounts collection.");
      return;
    }

    // Insert all accounts
    const accountsWithUser = standardAccounts.map(account => ({
      ...account,
      createdBy: userId,
      isActive: true,
      allowManualEntry: true,
      currentBalance: 0
    }));

    const result = await ChartOfAccounts.insertMany(accountsWithUser);
    
    console.log(`✅ Successfully created ${result.length} accounts`);
    console.log("\n📊 Account Summary:");
    console.log("   - Assets: 7 accounts");
    console.log("   - Liabilities: 4 accounts");
    console.log("   - Equity: 3 accounts");
    console.log("   - Revenue: 4 accounts");
    console.log("   - Expenses: 16 accounts");
    console.log("\n🎉 Chart of Accounts setup complete!");
    
  } catch (error) {
    console.error("❌ Error seeding Chart of Accounts:", error);
    throw error;
  }
}

// If running directly
if (require.main === module) {
  const connectDB = require("../db");
  
  (async () => {
    try {
      await connectDB();
      
      // You need to provide a valid user ID (admin user)
      const userId = process.argv[2];
      if (!userId) {
        console.error("❌ Please provide a user ID as argument");
        console.log("Usage: node seedChartOfAccounts.js <userId>");
        process.exit(1);
      }

      await seedChartOfAccounts(userId);
      process.exit(0);
    } catch (error) {
      console.error("Failed to seed:", error);
      process.exit(1);
    }
  })();
}

module.exports = { seedChartOfAccounts, standardAccounts };
