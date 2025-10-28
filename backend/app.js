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
const hrRoutes = require("./routes/hr/hrRoutes");
const liveStreamRoutes = require("./routes/livestream/liveStreamRoutes");
const uploadRoutes = require("./routes/core/uploadRoutes");
const paymentRoutes = require("./routes/ecommerce/paymentRoutes");
const newsletterRoutes = require("./routes/marketing/newsletterRoutes");
const emailCampaignRoutes = require("./routes/marketing/emailCampaignRoutes");
const emailTemplateRoutes = require("./routes/marketing/emailTemplateRoutes");
const emailSegmentRoutes = require("./routes/marketing/emailSegmentRoutes");

const connectDB = require("./db");
const path = require("path"); // Import the path module

const app = express();

connectDB(); // Connect to MongoDB


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
app.use("/hr", hrRoutes);
app.use("/livestreams", liveStreamRoutes);
app.use("/uploads", uploadRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/email-campaigns", emailCampaignRoutes);
app.use("/email-templates", emailTemplateRoutes);
app.use("/email-segments", emailSegmentRoutes);

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