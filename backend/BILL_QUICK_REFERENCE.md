# Bill Creation - Quick Reference Card

## 🚀 One-Command Setup

```bash
cd backend
node seed-data/setupBillSystem.js <ADMIN_USER_ID>
```

## 📋 What Gets Created

### Chart of Accounts (34 accounts)
- **Accounts Payable (2000)** - Liability for vendor bills
- **Expense Accounts:**
  - 6200: Utilities Expense
  - 6300: Marketing & Advertising
  - 6400: Office Supplies
  - 6500: Software & Subscriptions
  - 6700: Professional Fees

### Vendors (5 vendors)
1. **Office Supplies Co.** → 6400
2. **Tech Solutions Inc.** → 6500
3. **Utility Services Ltd.** → 6200
4. **Professional Services Group** → 6700
5. **Marketing & Advertising Agency** → 6300

## 🔌 API Endpoints

### Form Data (for UI dropdowns)
```
GET /api/bills/form-data/vendors
GET /api/bills/form-data/expense-accounts
GET /api/bills/form-data/vendor/:vendorId
```

### Bill Management
```
POST   /api/bills                    # Create bill
GET    /api/bills                    # List bills
GET    /api/bills/:id                # Get bill details
PUT    /api/bills/:id                # Update bill
POST   /api/bills/:id/approve        # Approve bill
POST   /api/bills/:id/post           # Post to GL
POST   /api/bills/:id/payments       # Add payment
POST   /api/bills/:id/void           # Void bill
DELETE /api/bills/:id                # Delete draft
GET    /api/bills/aging-report       # Aging report
```

## 📝 Create Bill Example

```javascript
POST /api/bills
Authorization: Bearer <TOKEN>

{
  "vendor": "65a1b2c3d4e5f6g7h8i9j0k1",
  "vendorInvoiceNumber": "INV-2024-001",
  "billDate": "2024-12-02",
  "dueDate": "2024-12-30",
  "paymentTerms": "net_30",
  "lineItems": [
    {
      "lineNumber": 1,
      "description": "Office Supplies",
      "quantity": 1,
      "unitCost": 500,
      "taxRate": 0,
      "expenseAccount": "65a1b2c3d4e5f6g7h8i9j0k2"
    }
  ],
  "shippingCost": 0,
  "adjustments": 0,
  "notes": "Monthly supplies",
  "tags": ["office", "supplies"]
}
```

## 🔄 Bill Status Flow

```
Draft → Pending Approval → Approved → Posted → Paid
                                        ↓
                                      Overdue
                                        ↓
                                      Partial
```

## 💰 Accounting Entries

When bill is posted:
```
Debit:  Expense Account (e.g., 6400)    $500.00
Debit:  Tax Receivable (1400)           $50.00
Credit: Accounts Payable (2000)                  $550.00
```

## 🔍 Verify Setup

```bash
# Check vendors exist
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/api/bills/form-data/vendors

# Check expense accounts exist
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/api/bills/form-data/expense-accounts
```

## 📂 Files Modified/Created

### New Files
- `seed-data/seedVendors.js` - Vendor seeding script
- `seed-data/setupBillSystem.js` - Complete setup script
- `BILL_SETUP_GUIDE.md` - Detailed setup guide
- `BILL_CREATION_SETUP.md` - Implementation summary
- `BILL_QUICK_REFERENCE.md` - This file

### Modified Files
- `controllers/finance/billController.js` - Added 3 new functions
- `routes/finance/billRoutes.js` - Added 3 new routes

## [object Object]

| Issue | Solution |
|-------|----------|
| "Accounts Payable not configured" | Run `seedChartOfAccounts.js` |
| "Vendor not found" | Run `seedVendors.js` |
| 401 Unauthorized | Check JWT token in header |
| No vendors in dropdown | Verify vendors were seeded |
| Expense accounts empty | Check COA was seeded |

## 📚 Documentation Files

1. **BILL_SETUP_GUIDE.md** - Complete setup instructions
2. **BILL_CREATION_SETUP.md** - Implementation details
3. **BILL_QUICK_REFERENCE.md** - This quick reference

## 🎯 Next Steps

1. ✅ Run setup script
2. ✅ Verify endpoints work
3. ✅ Create test bill via API
4. ✅ Integrate with UI
5. ✅ Test bill approval workflow
6. ✅ Test posting to GL
7. ✅ Test payment recording

## 💡 Key Points

- **Vendors** are pre-configured with default expense accounts
- **Chart of Accounts** provides the accounting structure
- **Form Data endpoints** supply data for UI dropdowns
- **Bills** automatically link to Accounts Payable
- **Journal entries** are created when bills are posted

## 🔐 Authentication

All endpoints require:
- Valid JWT token in `Authorization: Bearer <TOKEN>` header
- User must have `admin` role

## 📊 Data Flow

```
UI Form → API Endpoint → Controller → Model → MongoDB
                          ↓
                    Validation
                          ↓
                    Journal Entry (if posted)
                          ↓
                    Response to UI
```

## 🚨 Important Notes

- Bills must be **approved** before posting to GL
- Only **draft** bills can be deleted
- **Posted** bills cannot be edited
- Payments can only be added if bill is not fully paid
- **Void** bills cannot be edited or deleted

## 📞 Support

For detailed information, see:
- `BILL_SETUP_GUIDE.md` - Full setup guide
- `BILL_CREATION_SETUP.md` - Implementation details
- Model files - Schema definitions
- Controller files - Business logic

