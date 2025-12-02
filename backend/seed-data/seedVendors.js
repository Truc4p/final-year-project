const Vendor = require("../models/finance/vendor");
const ChartOfAccounts = require("../models/finance/chartOfAccounts");
const mongoose = require("mongoose");

/**
 * Seed script to initialize Vendors with default accounts
 * Run this after seeding Chart of Accounts
 */

const standardVendors = [
  {
    companyName: "Office Supplies Co.",
    contactPerson: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@officesupplies.com",
      phone: "+1-555-0101",
      mobile: "+1-555-0102"
    },
    billingAddress: {
      street: "123 Supply Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    paymentTerms: "net_30",
    paymentMethod: "bank_transfer",
    bankDetails: {
      bankName: "First National Bank",
      accountNumber: "****1234",
      routingNumber: "021000021"
    },
    taxId: "12-3456789",
    currency: "USD",
    vendorType: "supplier",
    categories: ["office_supplies", "stationery"],
    status: "active",
    isPreferredVendor: true,
    rating: 4.5,
    notes: "Reliable vendor with good pricing. Offers volume discounts.",
    tags: ["office", "supplies", "preferred"]
  },
  {
    companyName: "Tech Solutions Inc.",
    contactPerson: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@techsolutions.com",
      phone: "+1-555-0201",
      mobile: "+1-555-0202"
    },
    billingAddress: {
      street: "456 Tech Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA"
    },
    paymentTerms: "net_45",
    paymentMethod: "bank_transfer",
    bankDetails: {
      bankName: "Silicon Valley Bank",
      accountNumber: "****5678",
      routingNumber: "121000248"
    },
    taxId: "98-7654321",
    currency: "USD",
    vendorType: "service_provider",
    categories: ["software", "it_services", "subscriptions"],
    status: "active",
    isPreferredVendor: true,
    rating: 4.8,
    notes: "Premium IT service provider. Excellent support.",
    tags: ["technology", "software", "support"]
  },
  {
    companyName: "Utility Services Ltd.",
    contactPerson: {
      firstName: "Mike",
      lastName: "Davis",
      email: "billing@utilityservices.com",
      phone: "+1-555-0301",
      mobile: "+1-555-0302"
    },
    billingAddress: {
      street: "789 Power Lane",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    paymentTerms: "net_15",
    paymentMethod: "bank_transfer",
    bankDetails: {
      bankName: "Midwest Bank",
      accountNumber: "****9012",
      routingNumber: "071000013"
    },
    taxId: "45-6789012",
    currency: "USD",
    vendorType: "utility",
    categories: ["utilities", "electricity", "water"],
    status: "active",
    isPreferredVendor: false,
    rating: 4.0,
    notes: "Standard utility provider. Auto-billing available.",
    tags: ["utilities", "recurring"]
  },
  {
    companyName: "Professional Services Group",
    contactPerson: {
      firstName: "Emily",
      lastName: "Wilson",
      email: "contact@profservices.com",
      phone: "+1-555-0401",
      mobile: "+1-555-0402"
    },
    billingAddress: {
      street: "321 Business Blvd",
      city: "Boston",
      state: "MA",
      zipCode: "02101",
      country: "USA"
    },
    paymentTerms: "net_60",
    paymentMethod: "check",
    bankDetails: {
      bankName: "Boston Trust Bank",
      accountNumber: "****3456",
      routingNumber: "011000015"
    },
    taxId: "23-4567890",
    currency: "USD",
    vendorType: "contractor",
    categories: ["consulting", "accounting", "legal"],
    status: "active",
    isPreferredVendor: false,
    rating: 4.3,
    notes: "Accounting and legal consulting. Flexible engagement terms.",
    tags: ["professional", "consulting", "accounting"]
  },
  {
    companyName: "Marketing & Advertising Agency",
    contactPerson: {
      firstName: "David",
      lastName: "Brown",
      email: "david@marketingagency.com",
      phone: "+1-555-0501",
      mobile: "+1-555-0502"
    },
    billingAddress: {
      street: "654 Creative Drive",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA"
    },
    paymentTerms: "net_30",
    paymentMethod: "bank_transfer",
    bankDetails: {
      bankName: "LA Commerce Bank",
      accountNumber: "****7890",
      routingNumber: "121000248"
    },
    taxId: "67-8901234",
    currency: "USD",
    vendorType: "service_provider",
    categories: ["marketing", "advertising", "creative"],
    status: "active",
    isPreferredVendor: true,
    rating: 4.6,
    notes: "Creative agency with strong portfolio. Responsive team.",
    tags: ["marketing", "advertising", "creative"]
  }
];

async function seedVendors(userId) {
  try {
    console.log("🌱 Starting Vendors seeding...");
    
    // Check if vendors already exist
    const existingCount = await Vendor.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing vendors. Skipping seed.`);
      console.log("💡 To re-seed, first delete all vendors from Vendor collection.");
      return;
    }

    // Get default accounts
    const apAccount = await ChartOfAccounts.findOne({ 
      accountCode: '2000',
      accountName: 'Accounts Payable'
    });

    if (!apAccount) {
      throw new Error("Accounts Payable account (2000) not found. Please seed Chart of Accounts first.");
    }

    // Get expense accounts for different vendor types
    const expenseAccounts = {
      office_supplies: await ChartOfAccounts.findOne({ accountCode: '6400' }), // Office Supplies
      it_services: await ChartOfAccounts.findOne({ accountCode: '6500' }), // Software & Subscriptions
      utilities: await ChartOfAccounts.findOne({ accountCode: '6200' }), // Utilities
      consulting: await ChartOfAccounts.findOne({ accountCode: '6700' }), // Professional Fees
      marketing: await ChartOfAccounts.findOne({ accountCode: '6300' }) // Marketing & Advertising
    };

    // Verify all expense accounts exist
    const missingAccounts = Object.entries(expenseAccounts)
      .filter(([_, account]) => !account)
      .map(([key, _]) => key);

    if (missingAccounts.length > 0) {
      throw new Error(`Missing expense accounts: ${missingAccounts.join(', ')}. Please seed Chart of Accounts first.`);
    }

    // Map vendors to their default expense accounts
    const vendorsWithAccounts = standardVendors.map((vendor, index) => {
      let expenseAccountId;
      
      if (vendor.categories.includes('office_supplies')) {
        expenseAccountId = expenseAccounts.office_supplies._id;
      } else if (vendor.categories.includes('software') || vendor.categories.includes('it_services')) {
        expenseAccountId = expenseAccounts.it_services._id;
      } else if (vendor.categories.includes('utilities')) {
        expenseAccountId = expenseAccounts.utilities._id;
      } else if (vendor.categories.includes('consulting') || vendor.categories.includes('accounting')) {
        expenseAccountId = expenseAccounts.consulting._id;
      } else if (vendor.categories.includes('marketing') || vendor.categories.includes('advertising')) {
        expenseAccountId = expenseAccounts.marketing._id;
      } else {
        expenseAccountId = expenseAccounts.office_supplies._id; // Default
      }

      return {
        ...vendor,
        accountsPayableAccount: apAccount._id,
        expenseAccount: expenseAccountId,
        createdBy: userId,
        isActive: true
      };
    });

    // Generate vendor numbers and insert
    const vendorsWithNumbers = await Promise.all(
      vendorsWithAccounts.map(async (vendor, index) => {
        if (!vendor.vendorNumber) {
          // Generate unique vendor number based on index
          const number = String(index + 1).padStart(5, '0');
          vendor.vendorNumber = `VEND-${number}`;
        }
        return vendor;
      })
    );

    // Insert all vendors
    const result = await Vendor.insertMany(vendorsWithNumbers);
    
    console.log(`✅ Successfully created ${result.length} vendors`);
    console.log("\n📋 Vendors Created:");
    result.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.companyName} (${vendor.vendorType})`);
    });
    
    console.log("\n💰 Account Mappings:");
    console.log(`   - Accounts Payable: ${apAccount.accountName} (${apAccount.accountCode})`);
    console.log(`   - Office Supplies: ${expenseAccounts.office_supplies.accountName} (${expenseAccounts.office_supplies.accountCode})`);
    console.log(`   - IT Services: ${expenseAccounts.it_services.accountName} (${expenseAccounts.it_services.accountCode})`);
    console.log(`   - Utilities: ${expenseAccounts.utilities.accountName} (${expenseAccounts.utilities.accountCode})`);
    console.log(`   - Professional Fees: ${expenseAccounts.consulting.accountName} (${expenseAccounts.consulting.accountCode})`);
    console.log(`   - Marketing: ${expenseAccounts.marketing.accountName} (${expenseAccounts.marketing.accountCode})`);
    
    console.log("\n🎉 Vendors setup complete!");
    console.log("\n✨ Next Steps:");
    console.log("   1. Vendors are now available for bill creation");
    console.log("   2. Each vendor has default expense accounts configured");
    console.log("   3. You can now create bills from the UI");
    
  } catch (error) {
    console.error("❌ Error seeding vendors:", error.message);
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
        console.log("Usage: node seedVendors.js <userId>");
        process.exit(1);
      }

      await seedVendors(userId);
      process.exit(0);
    } catch (error) {
      console.error("Failed to seed:", error);
      process.exit(1);
    }
  })();
}

module.exports = { seedVendors, standardVendors };

