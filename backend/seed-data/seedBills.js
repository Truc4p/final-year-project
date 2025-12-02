const connectDB = require('../db');
const Bill = require('../models/finance/bill');
const Vendor = require('../models/finance/vendor');
const ChartOfAccounts = require('../models/finance/chartOfAccounts');

/**
 * Seed demo bills
 * Usage:
 *   node seed-data/seedBills.js <adminUserId> [count]
 */
async function seedDemoBills(adminUserId, count = 12) {
  console.log(`🌱 Seeding ${count} demo bill(s)...`);

  // Vendors
  const vendors = await Vendor.find({ status: 'active' }).limit(50);
  if (vendors.length === 0) {
    throw new Error('No vendors found. Please run seed-data/seedVendors.js first.');
  }

  // Accounts Payable
  const ap = await ChartOfAccounts.findOne({ accountCode: '2000' });
  if (!ap) throw new Error('AP account (2000) not found. Seed Chart of Accounts first.');

  // Expense accounts (fallbacks)
  const expenseCodes = ['6200','6300','6400','6500','6700','5000','5100','6800'];
  const expenseAccounts = await ChartOfAccounts.find({ accountType: 'expense', accountCode: { $in: expenseCodes } });
  const expenseMap = new Map(expenseAccounts.map(a => [a.accountCode, a]));
  const expenseList = expenseAccounts;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const today = new Date();

  let created = 0;
  for (let i = 0; i < count; i++) {
    const vendor = pick(vendors);

    // Dates: spread in last 45 days
    const billDate = new Date(today);
    billDate.setDate(today.getDate() - randomInt(0, 45));

    const dueDate = vendor.getPaymentDueDate ? vendor.getPaymentDueDate(billDate) : new Date(billDate.getTime() + 30*86400000);

    // Line items 1-3
    const lineCount = randomInt(1, 3);

    const items = Array.from({ length: lineCount }).map((_, idx) => {
      const qty = randomInt(1, 4);
      const unit = Number((5 + Math.random() * 95).toFixed(2));
      const tax = [0, 5, 10][randomInt(0, 2)];
      const defaultAcc = vendor.expenseAccount;
      const fallbackAcc = expenseList.length ? pick(expenseList)._id : null;
      return {
        lineNumber: idx + 1,
        description: `Expense ${idx + 1} from ${vendor.companyName}`,
        quantity: qty,
        unitCost: unit,
        taxRate: tax,
        expenseAccount: (defaultAcc || fallbackAcc)
      };
    }).filter(li => !!li.expenseAccount);

    if (items.length === 0) continue; // skip if we couldn't pick an account

    const bill = new Bill({
      vendor: vendor._id,
      vendorInvoiceNumber: `V-${Date.now()}-${randomInt(100,999)}`,
      billDate,
      dueDate,
      paymentTerms: vendor.paymentTerms || 'net_30',
      lineItems: items,
      shippingCost: 0,
      adjustments: 0,
      accountsPayableAccount: ap._id,
      notes: 'Seeded demo bill',
      currency: vendor.currency || 'USD',
      createdBy: adminUserId,
      status: 'draft'
    });

    await bill.save();
    created++;
  }

  console.log(`✅ Created ${created} bill(s).`);
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const adminUserId = process.argv[2];
      const countArg = parseInt(process.argv[3], 10);
      const count = Number.isFinite(countArg) ? countArg : 12;

      if (!adminUserId) {
        console.error('❌ Please provide an admin userId');
        console.log('Usage: node seed-data/seedBills.js <adminUserId> [count]');
        process.exit(1);
      }

      await seedDemoBills(adminUserId, count);
      process.exit(0);
    } catch (err) {
      console.error('❌ Seed bills failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedDemoBills };
