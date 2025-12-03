# Quick Reference: Duplicate Index Fix

## What Was Fixed
Removed 7 redundant index definitions from Mongoose schemas that were causing duplicate index warnings.

## The Issue
```
[MONGOOSE] Warning: Duplicate schema index on {"invoiceNumber":1} found
```

## Why It Happened
```javascript
// ❌ WRONG - Creates duplicate index
invoiceNumber: {
  type: String,
  unique: true  // ← Creates index automatically
}
InvoiceSchema.index({ invoiceNumber: 1 });  // ← Redundant!

// ✅ CORRECT - No duplicate
invoiceNumber: {
  type: String,
  unique: true  // ← Only this is needed
}
// No explicit .index() call needed
```

## Files Changed
| File | Field Removed | Reason |
|------|---------------|--------|
| invoice.js | invoiceNumber | unique: true |
| customer.js | customerNumber | unique: true |
| chartOfAccounts.js | accountCode | unique: true |
| bill.js | billNumber | unique: true |
| vendor.js | vendorNumber | unique: true |
| journalEntry.js | entryNumber | unique: true |
| bankAccount.js | accountNumber | unique: true |

## Result
✅ All 7 Mongoose warnings eliminated  
✅ No functional changes  
✅ Cleaner server logs  

## How to Verify
```bash
cd backend
npm start
# Should see no duplicate index warnings
```

## Key Takeaway
**In Mongoose: `unique: true` automatically creates an index, so don't call `.index()` on the same field.**

