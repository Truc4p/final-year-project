const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
//const morgan = require("morgan"); // Import morgan

const productRoutes = require("./routes/ecommerce/productRoutes");
const categoryRoutes = require("./routes/ecommerce/categoryRoutes");
const authRoutes = require("./routes/auth/authRoutes");
const orderRoutes = require("./routes/ecommerce/orderRoutes");
const userRoutes = require("./routes/auth/userRoutes");
const analyticsRoutes = require("./routes/analytics/analyticsRoutes");
const chatRoutes = require("./routes/communication/chatRoutes");
const cashFlowRoutes = require("./routes/finance/cashFlowRoutes");
const invoiceRoutes = require("./routes/finance/invoiceRoutes");
const billRoutes = require("./routes/finance/billRoutes");
const financialReportRoutes = require("./routes/finance/financialReportRoutes");
const generalLedgerRoutes = require("./routes/finance/generalLedgerRoutes");
const chartOfAccountsRoutes = require("./routes/finance/chartOfAccountsRoutes");
const bankAccountRoutes = require("./routes/finance/bankAccountRoutes");
const emailNotificationRoutes = require("./routes/emailNotificationRoutes");
const customerRoutes = require("./routes/finance/customerRoutes");
const hrRoutes = require("./routes/hr/hrRoutes");
const liveStreamRoutes = require("./routes/livestream/liveStreamRoutes");
const uploadRoutes = require("./routes/core/uploadRoutes");
const paymentRoutes = require("./routes/ecommerce/paymentRoutes");
const newsletterRoutes = require("./routes/marketing/newsletterRoutes");
const emailCampaignRoutes = require("./routes/marketing/emailCampaignRoutes");
const emailTemplateRoutes = require("./routes/marketing/emailTemplateRoutes");
const emailSegmentRoutes = require("./routes/marketing/emailSegmentRoutes");
const aiDermatologyExpertRoutes = require("./routes/skin-study/aiDermatologyExpert");
const { initializeSecrets } = require("./services/secretInitializer");
const emailScheduler = require("./services/emailScheduler");

const connectDB = require("./db");
const path = require("path"); // Import the path module

const app = express();

// Initialize secrets before connecting to database
(async () => {
    try {
        await initializeSecrets();
        connectDB(); // Connect to MongoDB after secrets are initialized
        
        // Load scheduled campaigns into memory (efficient, no polling)
        setTimeout(async () => {
            try {
                await emailScheduler.loadScheduledCampaigns();
            } catch (error) {
                console.error('❌ Failed to load scheduled campaigns:', error);
            }
        }, 3000); // Wait 3 seconds for DB connection to establish
        
    } catch (error) {
        console.error('❌ Failed to start application:', error.message);
        process.exit(1);
    }
})();


// Enable CORS for all origins
app.use(cors());

// Limit each IP to 100 requests per windowMs (e.g., per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(bodyParser.json());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Use morgan to log requests to the console
// app.use(morgan('combined'));

app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/users", userRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/chat", chatRoutes);
app.use("/cashflow", cashFlowRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/bills", billRoutes);
app.use("/financial-reports", financialReportRoutes);
app.use("/api/finance/chart-of-accounts", chartOfAccountsRoutes);
app.use("/api/finance/bank-accounts", bankAccountRoutes);
app.use("/api/finance/email-notifications", emailNotificationRoutes);
app.use("/api/finance/general-ledger", generalLedgerRoutes);
app.use("/customers", customerRoutes);
app.use("/hr", hrRoutes);
app.use("/livestreams", liveStreamRoutes);
app.use("/uploads", uploadRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/email-campaigns", emailCampaignRoutes);
app.use("/email-templates", emailTemplateRoutes);
app.use("/email-segments", emailSegmentRoutes);
app.use("/api/ai-dermatology-expert", aiDermatologyExpertRoutes);

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js API');
});

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Order Management API",
      version: "1.0.0",
      description: "API for managing orders",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/**/*.js"], // Path to the API docs
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;