# Bill Creation Setup Checklist

## [object Object]

- [ ] Backend server is running
- [ ] MongoDB is connected and accessible
- [ ] You have an admin user ID (from User collection)
- [ ] Node.js and npm are installed
- [ ] You're in the `backend` directory

## 🚀 Setup Steps

### Step 1: Get Your Admin User ID

```bash
# Connect to MongoDB and find your admin user
# Option 1: Using MongoDB CLI
mongo
> use wrencos  # or your database name
> db.users.findOne({ role: "admin" })
> # Copy the _id value

# Option 2: Check your auth response when you logged in
# The user ID should be in the JWT token or response
```

**Your Admin User ID:** `_________________________________`

### Step 2: Run Setup Script

```bash
cd backend
node seed-data/setupBillSystem.js <YOUR_ADMIN_USER_ID>
```

**Example:**
```bash
node seed-data/setupBillSystem.js 65a1b2c3d4e5f6g7h8i9j0k1
```

- [ ] Setup script runs without errors
- [ ] Chart of Accounts seeded successfully
- [ ] Vendors seeded successfully
- [ ] Verification passes

### Step 3: Verify Setup in Database

```bash
# Connect to MongoDB
mongo

# Check Chart of Accounts
> db.chartofaccounts.countDocuments()
# Should return: 34

# Check Vendors
> db.vendors.countDocuments()
# Should return: 5

# Check Accounts Payable exists
> db.chartofaccounts.findOne({ accountCode: "2000" })
# Should return the AP account

# Check vendors have accounts
> db.vendors.findOne({}).pretty()
# Should show expenseAccount and accountsPayableAccount populated
```

- [ ] Chart of Accounts count = 34
- [ ] Vendors count = 5
- [ ] Accounts Payable account exists
- [ ] Vendors have account references

### Step 4: Test API Endpoints

#### 4a. Get Vendors

```bash
curl -X GET \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  http://localhost:5000/api/bills/form-data/vendors
```

**Expected Response:**
```json
[
  {
    "_id": "...",
    "vendorNumber": "VEND-00001",
    "companyName": "Office Supplies Co.",
    "expenseAccount": {
      "_id": "...",
      "accountCode": "6400",
      "accountName": "Office Supplies"
    }
  },
  ...
]
```

- [ ] Response returns 5 vendors
- [ ] Each vendor has expenseAccount populated
- [ ] Status code is 200

#### 4b. Get Expense Accounts

```bash
curl -X GET \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  http://localhost:5000/api/bills/form-data/expense-accounts
```

**Expected Response:**
```json
[
  {
    "_id": "...",
    "accountCode": "5000",
    "accountName": "Cost of Goods Sold",
    "accountSubType": "cost_of_goods_sold"
  },
  ...
]
```

- [ ] Response returns expense accounts
- [ ] Accounts are sorted by code
- [ ] Status code is 200

#### 4c. Get Vendor Details

```bash
# First, get a vendor ID from the vendors list above
curl -X GET \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  http://localhost:5000/api/bills/form-data/vendor/<VENDOR_ID>
```

**Expected Response:**
```json
{
  "_id": "...",
  "vendorNumber": "VEND-00001",
  "companyName": "Office Supplies Co.",
  "contactPerson": {...},
  "expenseAccount": {...},
  "accountsPayableAccount": {...}
}
```

- [ ] Response returns vendor with all details
- [ ] Both account references are populated
- [ ] Status code is 200

### Step 5: Create Test Bill

```bash
# Get a vendor ID and expense account ID from previous tests
curl -X POST \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "<VENDOR_ID>",
    "vendorInvoiceNumber": "TEST-001",
    "billDate": "2024-12-02",
    "dueDate": "2024-12-30",
    "lineItems": [
      {
        "lineNumber": 1,
        "description": "Test Item",
        "quantity": 1,
        "unitCost": 100,
        "taxRate": 0,
        "expenseAccount": "<EXPENSE_ACCOUNT_ID>"
      }
    ],
    "shippingCost": 0,
    "adjustments": 0,
    "notes": "Test bill"
  }' \
  http://localhost:5000/api/bills
```

**Expected Response:**
```json
{
  "message": "Bill created successfully",
  "bill": {
    "_id": "...",
    "billNumber": "BILL-20241202-0001",
    "vendor": {...},
    "totalAmount": 100,
    "status": "draft"
  }
}
```

- [ ] Bill created successfully
- [ ] Bill has a unique billNumber
- [ ] Status is "draft"
- [ ] totalAmount is correct

### Step 6: Verify Bill in Database

```bash
mongo
> db.bills.findOne().pretty()
# Should show your test bill
```

- [ ] Test bill exists in database
- [ ] Bill is linked to vendor
- [ ] Bill is linked to accounts

## ✅ Completion Checklist

### Database Setup
- [ ] Chart of Accounts: 34 accounts created
- [ ] Vendors: 5 vendors created
- [ ] Accounts Payable (2000) exists
- [ ] Expense accounts (6200, 6300, 6400, 6500, 6700) exist
- [ ] Vendors linked to correct accounts

### API Endpoints
- [ ] GET /api/bills/form-data/vendors - Working
- [ ] GET /api/bills/form-data/expense-accounts - Working
- [ ] GET /api/bills/form-data/vendor/:vendorId - Working
- [ ] POST /api/bills - Working
- [ ] GET /api/bills - Working
- [ ] GET /api/bills/:id - Working

### Data Integrity
- [ ] Vendors have expenseAccount references
- [ ] Vendors have accountsPayableAccount references
- [ ] Bills link to vendors correctly
- [ ] Bills link to accounts correctly

### Documentation
- [ ] BILL_SETUP_GUIDE.md - Read
- [ ] BILL_CREATION_SETUP.md - Read
- [ ] BILL_QUICK_REFERENCE.md - Read
- [ ] This checklist - Completed

## 🎯 Next Steps

### For Frontend Integration
1. [ ] Create bill creation form component
2. [ ] Fetch vendors from `/api/bills/form-data/vendors`
3. [ ] Fetch expense accounts from `/api/bills/form-data/expense-accounts`
4. [ ] When vendor selected, fetch details from `/api/bills/form-data/vendor/:vendorId`
5. [ ] Pre-fill vendor's default expense account
6. [ ] Allow adding multiple line items
7. [ ] POST to `/api/bills` to create bill

### For Bill Management
1. [ ] Create bill list view
2. [ ] Implement bill approval workflow
3. [ ] Add bill posting to GL
4. [ ] Create payment recording form
5. [ ] Generate aging reports
6. [ ] Add bill search and filters

### For Accounting Integration
1. [ ] Verify journal entries created when bills posted
2. [ ] Check GL balances after posting
3. [ ] Reconcile AP account
4. [ ] Generate financial reports

## 🆘 Troubleshooting

### Issue: "Accounts Payable account not configured"
```bash
# Solution: Verify account exists
mongo
> db.chartofaccounts.findOne({ accountCode: "2000" })
# If not found, re-run seedChartOfAccounts.js
```

### Issue: "Vendor not found"
```bash
# Solution: Verify vendors exist
mongo
> db.vendors.countDocuments()
# If 0, re-run seedVendors.js
```

### Issue: 401 Unauthorized on API calls
```bash
# Solution: Check JWT token
# Make sure you're using a valid token from login
# Token should be in Authorization: Bearer <TOKEN> header
```

### Issue: No vendors in dropdown
```bash
# Solution: Check vendor status
mongo
> db.vendors.find({ status: "active" }).count()
# Should return 5
```

### Issue: Expense accounts empty
```bash
# Solution: Verify COA seeding
mongo
> db.chartofaccounts.find({ accountType: "expense" }).count()
# Should return 16
```

## 📞 Support

If you encounter issues:

1. **Check logs:** Look at backend console for error messages
2. **Verify database:** Connect to MongoDB and check data
3. **Test endpoints:** Use curl or Postman to test API
4. **Review documentation:** See BILL_SETUP_GUIDE.md for details
5. **Check authentication:** Ensure valid JWT token

## 📝 Notes

**Setup Date:** _______________

**Admin User ID:** _______________

**Test Bill ID:** _______________

**Issues Encountered:** 
```
_________________________________________________________________

_________________________________________________________________
```

**Resolution:**
```
_________________________________________________________________

_________________________________________________________________
```

## ✨ Success!

Once all checkboxes are marked, your bill creation system is ready for:
- ✅ Creating bills from UI
- ✅ Managing vendors
- ✅ Posting to general ledger
- ✅ Recording payments
- ✅ Generating reports

**Congratulations! [object Object]

