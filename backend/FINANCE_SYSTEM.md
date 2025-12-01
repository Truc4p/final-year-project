# Finance Management System for SMEs

## 🎯 Overview

This finance management system has been upgraded to provide comprehensive accounting and financial management capabilities suitable for Small and Medium Enterprises (SMEs). Built on top of the existing e-commerce platform, it now includes double-entry bookkeeping, accounts receivable/payable management, and professional financial reporting.

## ✅ Implemented Features

### 1. **Accounting Foundation** ✓
- **Chart of Accounts**: Standardized account structure with 5 types (Asset, Liability, Equity, Revenue, Expense)
- **Double-Entry Bookkeeping**: Every transaction recorded as balanced debits and credits
- **General Ledger**: Comprehensive transaction log with fiscal period tracking
- **Journal Entries**: Manual and automated entries with approval workflow

### 2. **Accounts Receivable (AR)** ✓
- **Customer Management**
  - Customer profiles with contact details and billing/shipping addresses
  - Credit limits and payment terms configuration
  - Credit utilization tracking
  - Auto-generated customer numbers (CUST-XXXXX)

- **Invoice Management**
  - Create, edit, and manage customer invoices
  - Line items with products, quantities, pricing, and tax
  - Multiple payment terms (Net 15/30/45/60/90, immediate, custom)
  - Automatic invoice numbering (INV-YYYYMMDD-XXXX)
  - Invoice status tracking (draft, sent, viewed, partial, paid, overdue, void)
  - Automatic journal entry creation upon posting
  
- **Payment Tracking**
  - Record multiple payments per invoice
  - Support for various payment methods
  - Automatic status updates (paid, partial)
  - Payment history and audit trail

- **Aging Reports**
  - AR aging buckets: Current, 1-30, 31-60, 61-90, 90+ days
  - Outstanding balance tracking
  - Days overdue calculation

### 3. **Accounts Payable (AP)** ✓
- **Vendor Management**
  - Vendor profiles with complete contact information
  - Banking details for payments
  - Payment terms and preferred payment methods
  - Auto-generated vendor numbers (VEND-XXXXX)
  - Vendor ratings and performance tracking

- **Bill Management**
  - Create and manage vendor bills/invoices
  - Line items with expense categorization
  - Approval workflow (draft → pending approval → approved)
  - Automatic bill numbering (BILL-YYYYMMDD-XXXX)
  - Bill status tracking (draft, approved, partial, paid, overdue, void)
  - Automatic journal entry creation upon posting

- **Payment Processing**
  - Schedule and record bill payments
  - Multiple payment methods support
  - Payment tracking and history

- **AP Aging Reports**
  - Payable aging buckets
  - Vendor payment due tracking
  - Cash flow planning support

### 4. **Financial Reporting** ✓
- **Income Statement (P&L)**
  - Revenue by account and type
  - Expenses by category
  - Net income calculation
  - Profit margin analysis

- **Balance Sheet**
  - Assets (Current, Fixed, Other)
  - Liabilities (Current, Long-term)
  - Equity accounts
  - Balance verification (Assets = Liabilities + Equity)

- **Trial Balance**
  - All accounts with debit/credit totals
  - Balance verification
  - Period-based reporting

- **Cash Flow Statement** (Indirect Method)
  - Operating activities
  - Investing activities
  - Financing activities
  - Net cash flow tracking

- **Financial Summary Dashboard**
  - Key metrics overview
  - Financial ratios (Current Ratio, Debt-to-Equity, ROA)
  - Period comparisons

## 📊 API Endpoints

### Invoice Management
```
POST   /invoices                    - Create new invoice
GET    /invoices                    - Get all invoices (with filters)
GET    /invoices/:id                - Get single invoice
PUT    /invoices/:id                - Update invoice
POST   /invoices/:id/post           - Post invoice to general ledger
POST   /invoices/:id/payments       - Add payment to invoice
POST   /invoices/:id/void           - Void invoice
DELETE /invoices/:id                - Delete draft invoice
GET    /invoices/aging-report       - Get AR aging report
```

### Bill Management
```
POST   /bills                       - Create new bill
GET    /bills                       - Get all bills (with filters)
GET    /bills/:id                   - Get single bill
PUT    /bills/:id                   - Update bill
POST   /bills/:id/approve           - Approve bill
POST   /bills/:id/post              - Post bill to general ledger
POST   /bills/:id/payments          - Add payment to bill
POST   /bills/:id/void              - Void bill
DELETE /bills/:id                   - Delete draft bill
GET    /bills/aging-report          - Get AP aging report
```

### Financial Reports
```
GET    /financial-reports/income-statement      - Income Statement (P&L)
GET    /financial-reports/balance-sheet         - Balance Sheet
GET    /financial-reports/trial-balance         - Trial Balance
GET    /financial-reports/cash-flow-statement   - Cash Flow Statement
GET    /financial-reports/summary               - Financial Summary
```

## 🗄️ Database Models

### New Models Created:
1. **Customer** - Customer profiles for AR
2. **Vendor** - Vendor profiles for AP
3. **Invoice** - Customer invoices with line items and payments
4. **Bill** - Vendor bills with line items and payments

### Existing Models (Enhanced):
1. **ChartOfAccounts** - Account structure
2. **GeneralLedger** - Transaction ledger
3. **JournalEntry** - Journal entries with double-entry validation

## 🔐 Security & Access Control

All finance routes are protected with:
- Authentication middleware (JWT)
- Role-based access control (Admin only)
- Audit trails (createdBy, lastModifiedBy fields)

## 💼 Business Workflows

### Invoice Workflow
1. Create invoice (draft status)
2. Add line items with products/services
3. Post to general ledger (creates journal entry)
4. Send to customer (sent status)
5. Record payments as received
6. Auto-status update to paid when fully paid

### Bill Workflow
1. Create bill from vendor invoice (draft)
2. Add expense line items
3. Submit for approval (pending_approval)
4. Approve bill (approved)
5. Post to general ledger (creates journal entry)
6. Schedule/record payment
7. Auto-status update when paid

## 🎨 Key Features

### Automatic Journal Entries
- Invoices automatically create AR journal entries (Debit AR, Credit Revenue)
- Bills automatically create AP journal entries (Debit Expense, Credit AP)
- Payments create corresponding journal entries
- All entries maintain double-entry balance

### Intelligent Calculations
- Automatic total calculations for line items
- Tax calculations per line item
- Discount calculations
- Running balance tracking
- Aging bucket classification

### Data Validation
- Balance verification on journal entries
- Credit limit checks for customers
- Payment amount validation
- Status-based operation restrictions

## 📈 Financial Ratios Calculated

1. **Current Ratio**: Current Assets / Current Liabilities
2. **Debt-to-Equity Ratio**: Total Debt / Total Equity
3. **Return on Assets (ROA)**: Net Income / Total Assets
4. **Profit Margin**: Net Income / Revenue

## 🚀 Next Steps for Full SME Platform

### Priority Enhancements:
1. **Bank Reconciliation** - Match bank transactions with ledger entries
2. **Budget Management** - Create and track budgets vs actuals
3. **Tax Management** - Sales tax/VAT tracking and reporting
4. **Fixed Assets** - Asset register and depreciation
5. **Multi-Currency** - Foreign exchange support
6. **Recurring Invoices/Bills** - Automated recurring transactions
7. **Payment Reminders** - Automated email reminders for overdue invoices
8. **Purchase Orders** - PO creation and tracking
9. **Expense Claims** - Employee expense management
10. **Project Accounting** - Job costing and project profitability

### Advanced Features:
- Multi-entity support (multiple companies)
- Consolidated reporting
- Approval workflows with multiple approvers
- Document management and attachment support
- Integration with payment gateways
- Bank feed integration
- Automated bank reconciliation
- Advanced analytics and forecasting
- Mobile app integration

## 📝 Usage Examples

### Creating an Invoice
```javascript
POST /invoices
{
  "customer": "customer_id",
  "invoiceDate": "2025-12-01",
  "lineItems": [
    {
      "lineNumber": 1,
      "description": "Product A",
      "product": "product_id",
      "quantity": 2,
      "unitPrice": 100,
      "taxRate": 10,
      "revenueAccount": "revenue_account_id"
    }
  ],
  "paymentTerms": "net_30"
}
```

### Recording a Payment
```javascript
POST /invoices/:id/payments
{
  "amount": 220,
  "paymentMethod": "bank_transfer",
  "reference": "TRANS-12345",
  "paymentDate": "2025-12-15",
  "bankAccount": "bank_account_id"
}
```

### Getting Financial Reports
```javascript
// Income Statement
GET /financial-reports/income-statement?startDate=2025-01-01&endDate=2025-12-31

// Balance Sheet
GET /financial-reports/balance-sheet?asOfDate=2025-12-31

// Financial Summary
GET /financial-reports/summary?startDate=2025-01-01&endDate=2025-12-31
```

## 🎯 Integration with E-Commerce

The finance system seamlessly integrates with your existing e-commerce platform:
- Orders automatically create invoices
- Product sales link to revenue accounts
- Customer data syncs between systems
- Inventory costs track to COGS accounts

## 📚 Documentation

Each model includes:
- Comprehensive field validation
- Virtual fields for calculated values
- Instance methods for common operations
- Static methods for data generation
- Pre-save hooks for automation
- Indexes for query performance

## 🔧 Configuration

Required Chart of Accounts setup:
- **1200** - Accounts Receivable (Asset)
- **2000** - Accounts Payable (Liability)
- **2100** - Sales Tax Payable (Liability)
- **1400** - Tax Receivable (Asset)
- Revenue accounts per product/service
- Expense accounts per category

## 💡 Best Practices

1. Always post invoices/bills to create journal entries
2. Use aging reports for cash flow management
3. Reconcile accounts regularly
4. Review trial balance for accuracy
5. Generate financial reports monthly/quarterly
6. Maintain proper approval workflows
7. Keep detailed notes on transactions
8. Attach supporting documents

---

**Built with:** Node.js, Express, MongoDB, Mongoose

**Authentication:** JWT with role-based access control

**Status:** Production-ready for SME finance management
