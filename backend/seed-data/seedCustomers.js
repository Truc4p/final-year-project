const mongoose = require('mongoose');
const connectDB = require('../db');
const Customer = require('../models/finance/customer');
const User = require('../models/auth/user');
const ChartOfAccounts = require('../models/finance/chartOfAccounts');

/**
 * Seed demo customers and optionally migrate users with role 'customer' to Customer docs
 * Usage:
 *   node seed-data/seedCustomers.js <adminUserId> [--from-users]
 */
async function seedDemoCustomers(adminUserId) {
  console.log('🌱 Seeding demo customers...');

  // Ensure AR and Revenue accounts exist
  const ar = await ChartOfAccounts.findOne({ accountCode: '1200' });
  const revenue = await ChartOfAccounts.findOne({ accountCode: { $in: ['4100', '4000'] }, accountType: 'revenue' }).sort({ accountCode: 1 });
  if (!ar || !revenue) {
    throw new Error('Required accounts missing (AR 1200 and a revenue account 4000/4100). Seed Chart of Accounts first.');
  }

  const existing = await Customer.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Found ${existing} existing customers. Skipping demo seed.`);
    return;
  }

  const demo = new Customer({
    companyName: 'Acme Corp',
    contactPerson: {
      firstName: 'Taylor',
      lastName: 'Nguyen',
      email: 'taylor.nguyen@example.com',
      phone: '+84 90 000 0000'
    },
    billingAddress: {
      street: '123 Nguyen Trai',
      city: 'Ho Chi Minh City',
      state: 'HCMC',
      zipCode: '700000',
      country: 'Vietnam'
    },
    shippingAddress: { sameAsBilling: true },
    paymentTerms: 'net_30',
    creditLimit: 50000000,
    currency: 'USD',
    accountsReceivableAccount: ar._id,
    revenueAccount: revenue._id,
    createdBy: adminUserId,
    status: 'active'
  });

  await demo.save();
  console.log('✅ Demo customer created:', demo.displayName, demo.customerNumber);
}

async function migrateUsersToCustomers(adminUserId) {
  console.log('🔁 Migrating users with role="customer" to Customer documents...');
  const users = await User.find({ role: 'customer' });
  if (users.length === 0) {
    console.log('ℹ️  No users with role=customer found. Skipping migration.');
    return;
  }

  const ar = await ChartOfAccounts.findOne({ accountCode: '1200' });
  const revenue = await ChartOfAccounts.findOne({ accountCode: { $in: ['4100', '4000'] }, accountType: 'revenue' }).sort({ accountCode: 1 });
  if (!ar || !revenue) {
    throw new Error('Required accounts missing (AR 1200 and a revenue account 4000/4100). Seed Chart of Accounts first.');
  }

  let created = 0;
  for (const u of users) {
    const exists = await Customer.findOne({ userId: u._id });
    if (exists) continue;

    const cust = new Customer({
      companyName: u.username,
      contactPerson: {
        email: u.email || `${u.username}@example.com`
      },
      billingAddress: { country: 'Vietnam' },
      shippingAddress: { sameAsBilling: true },
      paymentTerms: 'net_30',
      currency: 'USD',
      accountsReceivableAccount: ar._id,
      revenueAccount: revenue._id,
      userId: u._id,
      createdBy: adminUserId,
      status: 'active'
    });
    await cust.save();
    created++;
  }
  console.log(`✅ Migrated ${created} user(s) to Customer documents.`);
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const adminUserId = process.argv[2];
      const migrateFlag = process.argv.includes('--from-users');
      if (!adminUserId) {
        console.error('❌ Please provide an admin userId');
        console.log('Usage: node seed-data/seedCustomers.js <adminUserId> [--from-users]');
        process.exit(1);
      }

      await seedDemoCustomers(adminUserId);
      if (migrateFlag) {
        await migrateUsersToCustomers(adminUserId);
      }

      process.exit(0);
    } catch (err) {
      console.error('❌ Seed customers failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedDemoCustomers, migrateUsersToCustomers }; 

