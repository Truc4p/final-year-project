#!/usr/bin/env node
/**
 * Post all draft invoices and bills to the General Ledger
 * - Invoices: directly post all with status !== 'void' and not posted
 * - Bills: if draft/pending_approval -> approve; then post if not posted and not void
 *
 * Usage: node scripts/postAllAccounting.js <adminUserId>
 */

const connectDB = require('../db');
// Ensure models are registered with Mongoose before use
require('../models/finance/chartOfAccounts');
require('../models/finance/generalLedger');
require('../models/finance/journalEntry');
const Invoice = require('../models/finance/invoice');
const Bill = require('../models/finance/bill');

async function postAll(adminUserId) {
  const results = {
    invoices: { considered: 0, posted: 0, errors: 0 },
    bills: { approved: 0, posted: 0, errors: 0 }
  };

  // Invoices
  const invoices = await Invoice.find({ isPosted: { $ne: true }, status: { $nin: ['void', 'cancelled'] } });
  for (const inv of invoices) {
    try {
      results.invoices.considered += 1;
      const je = await inv.postToGeneralLedger(adminUserId);
      if (je && inv.isPosted) results.invoices.posted += 1;
    } catch (e) {
      results.invoices.errors += 1;
      console.error(`❌ Failed to post invoice ${inv.invoiceNumber || inv._id}:`, e.message);
    }
  }

  // Bills
  const bills = await Bill.find({ isPosted: { $ne: true }, status: { $nin: ['void', 'cancelled'] } });
  for (const bill of bills) {
    try {
      // Approve if needed
      if (bill.status === 'draft' || bill.status === 'pending_approval') {
        bill.status = 'approved';
        bill.approvedBy = adminUserId;
        bill.approvalDate = new Date();
        await bill.save();
        results.bills.approved += 1;
      }
      const je = await bill.postToGeneralLedger(adminUserId);
      if (je && bill.isPosted) results.bills.posted += 1;
    } catch (e) {
      results.bills.errors += 1;
      console.error(`❌ Failed to post bill ${bill.billNumber || bill._id}:`, e.message);
    }
  }

  return results;
}

(async () => {
  try {
    await connectDB();
    const adminUserId = process.argv[2];
    if (!adminUserId) {
      console.error('❌ Please provide admin user id');
      console.log('Usage: node scripts/postAllAccounting.js <adminUserId>');
      process.exit(1);
    }

    console.log('📘 Posting all invoices and bills to the General Ledger...');
    const res = await postAll(adminUserId);
    console.log('\n✅ Done. Summary:');
    console.log(`   Invoices: considered=${res.invoices.considered}, posted=${res.invoices.posted}, errors=${res.invoices.errors}`);
    console.log(`   Bills:    approved=${res.bills.approved}, posted=${res.bills.posted}, errors=${res.bills.errors}`);
    console.log('\n💡 Refresh the Chart of Accounts page to see updated balances.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Batch posting failed:', err);
    process.exit(1);
  }
})();

