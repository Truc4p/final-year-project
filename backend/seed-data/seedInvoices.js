const mongoose = require('mongoose');
const connectDB = require('../db');
const Invoice = require('../models/finance/invoice');
const Customer = require('../models/finance/customer');
const ChartOfAccounts = require('../models/finance/chartOfAccounts');

/**
 * Seed demo invoices
 * Usage:
 *   node seed-data/seedInvoices.js <adminUserId> [count]
 */
async function seedDemoInvoices(adminUserId, count = 10) {
  console.log(`🌱 Seeding ${count} demo invoice(s)...`);

  // Ensure at least one customer exists
  let customer = await Customer.findOne();
  if (!customer) {
    throw new Error('No customers found. Please run seed-data/seedCustomers.js first.');
  }

  // Required accounts
  const ar = await ChartOfAccounts.findOne({ accountCode: '1200' });
  const revenue = await ChartOfAccounts.findOne({ accountCode: { $in: ['4100', '4000'] }, accountType: 'revenue' }).sort({ accountCode: 1 });

  if (!ar || !revenue) {
    throw new Error('Required accounts missing (AR 1200 and revenue 4000/4100). Seed Chart of Accounts first.');
  }

  const today = new Date();
  let created = 0;
  for (let i = 0; i < count; i++) {
    const invoiceDate = new Date(today);
    // spread dates over last 60 days
    invoiceDate.setDate(today.getDate() - Math.floor(Math.random() * 60));

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + 30);

    const lineCount = 1 + Math.floor(Math.random() * 3);
    const lineItems = Array.from({ length: lineCount }).map((_, idx) => {
      const qty = 1 + Math.floor(Math.random() * 5);
      const price = Number((10 + Math.random() * 90).toFixed(2));
      const tax = [0, 5, 10][Math.floor(Math.random() * 3)];
      return {
        lineNumber: idx + 1,
        description: `Service ${idx + 1}`,
        quantity: qty,
        unitPrice: price,
        taxRate: tax,
        revenueAccount: revenue._id
      };
    });

    const inv = new Invoice({
      customer: customer._id,
      invoiceDate,
      dueDate,
      paymentTerms: 'net_30',
      lineItems,
      shippingCost: 0,
      adjustments: 0,
      accountsReceivableAccount: ar._id,
      notes: 'Seeded demo invoice',
      currency: customer.currency || 'USD',
      createdBy: adminUserId,
      status: 'draft'
    });

    await inv.save();
    created++;
  }

  console.log(`✅ Created ${created} invoice(s).`);
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const adminUserId = process.argv[2];
      const countArg = parseInt(process.argv[3], 10);
      const count = Number.isFinite(countArg) ? countArg : 10;

      if (!adminUserId) {
        console.error('❌ Please provide an admin userId');
        console.log('Usage: node seed-data/seedInvoices.js <adminUserId> [count]');
        process.exit(1);
      }

      await seedDemoInvoices(adminUserId, count);
      process.exit(0);
    } catch (err) {
      console.error('❌ Seed invoices failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedDemoInvoices };
