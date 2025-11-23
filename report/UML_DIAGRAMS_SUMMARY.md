# UML Diagrams Summary - Wrencos System Design

## Overview
This document summarizes the 10 comprehensive UML diagrams added to **Section 5.4 - Detailed Design Diagrams** of the System Design and Architecture report.

---

## Diagrams Added

### 1. **Class Diagram – Core Domain Model**
- **Location:** Section 5.4, Diagram 1
- **Purpose:** Represents the core domain entities and their relationships
- **Key Entities:** User, Product, Order, LiveStream, ChatConversation, EmailCampaign, Employee, BusinessExpense, CashFlowTransaction, FAQ
- **Relationships:** Shows one-to-many relationships between entities, establishing clear ownership and data flow patterns
- **Explanation:** The User class is central, acting as the primary actor across all services. Products are referenced in Orders and LiveStreams. Orders generate financial transactions, while LiveStreams facilitate real-time customer engagement.

---

### 2. **Use Case Diagram – Customer and Admin Interactions**
- **Location:** Section 5.4, Diagram 2
- **Purpose:** Illustrates primary interactions between Customers, Admins, and the System
- **Customer Use Cases (10):** Browse Products, View Product Details, Add to Cart, Checkout & Pay, Track Order, Chat with AI, Escalate to Staff, View Recommendations, Attend Livestream, Subscribe Newsletter
- **Admin Use Cases (8):** Manage Products, View Analytics, Create Livestream, Manage Orders, Respond to Chat, Create Campaign, Manage Staff, View Finance Reports
- **System Support:** AI recommendations, analytics aggregation, financial calculations
- **Explanation:** Establishes the scope of functionality and key user interactions across the platform.

---

### 3. **Activity Diagram – Customer Purchase Flow**
- **Location:** Section 5.4, Diagram 3
- **Purpose:** Models the complete customer purchase flow from product discovery to order fulfillment
- **Flow Steps:**
  1. Browse Products → View Details
  2. Decision: Interested? → Add to Cart
  3. Decision: Continue Shopping? → Back to Browse or Proceed to Checkout
  4. Enter Shipping Address → Select Payment Method → Review Order
  5. Decision: Confirm Order? → Process Payment via VNPay
  6. Decision: Payment Successful? → Create Order → Send Email → Display Tracking
  7. Alternative: Payment Failed → Retry or Cancel
- **Explanation:** Captures decision points and alternative paths, representing the complete customer journey with error handling.

---

### 4. **Sequence Diagram – AI Chat with Product Recommendation**
- **Location:** Section 5.4, Diagram 4
- **Purpose:** Illustrates the AI-powered chat interaction flow
- **Participants:** Customer, Web/Mobile App, REST API Gateway, Communication Service, Google Gemini API, Product Database, MongoDB
- **Flow:**
  1. Customer sends message → App → API Gateway (JWT verification)
  2. Communication Service queries FAQ and Product databases simultaneously
  3. Context + Message sent to Google Gemini API
  4. Gemini generates intelligent response with recommendations
  5. Conversation persisted to MongoDB
  6. Response returned to customer with AI recommendations
- **Explanation:** Shows seamless integration between FAQ lookup, product search, AI processing, and conversation persistence.

---

### 5. **Sequence Diagram – Livestream with Product Pinning and Purchase**
- **Location:** Section 5.4, Diagram 5
- **Purpose:** Demonstrates the complete livestream experience with product pinning and purchase integration
- **Participants:** Admin, Admin Dashboard, API Gateway, Livestream Service, WebSocket Server, Customer, Customer App, E-Commerce Service, MongoDB
- **Flow:**
  1. Admin creates livestream → API Gateway → Livestream Service → MongoDB
  2. Admin starts broadcasting → WebSocket connection
  3. Customer joins livestream → Receives video feed via WebSocket
  4. Admin pins product → Broadcast to customers via WebSocket
  5. Customer adds pinned product to cart → Checkout → Order creation
  6. Admin views stream analytics
- **Explanation:** Shows seamless integration between livestream broadcasting, real-time notifications, and e-commerce transactions.

---

### 6. **Sequence Diagram – Email Campaign Creation and Delivery**
- **Location:** Section 5.4, Diagram 6
- **Purpose:** Illustrates the complete email marketing campaign lifecycle
- **Participants:** Admin, Admin Dashboard, API Gateway, Marketing Service, Email Service, SMTP Server, MongoDB, Customer, Customer Email
- **Flow:**
  1. Admin creates campaign → Select template → Define target segment
  2. Marketing Service queries subscriber database
  3. Campaign scheduled/sent → Email Service retrieves subscriber list
  4. SMTP delivers emails to each recipient
  5. System tracks engagement: opens, clicks, unsubscribes
  6. Admin views comprehensive campaign performance metrics
- **Explanation:** Demonstrates integration between marketing, email delivery, and analytics services.

---

### 7. **Component Diagram – Service Architecture**
- **Location:** Section 5.4, Diagram 7
- **Purpose:** Illustrates the layered architecture of the Wrencos platform
- **Layers:**
  - **Client Layer:** Web Portal (Vue.js 3), Mobile App (React Native), Admin Dashboard (Vue.js 3)
  - **API Gateway Layer:** REST API Gateway (Express.js) with routing, auth middleware, CORS, rate limiting
  - **Backend Services Layer:** 8 independent services (Auth, E-Commerce, Livestream, Communication, Marketing, Analytics, Finance, HR)
  - **Data Layer:** MongoDB Atlas
  - **External Services:** Google Gemini API, VNPay API, SMTP Server, WebSocket Server
- **Explanation:** Ensures separation of concerns, scalability, and maintainability through clear layering.

---

### 8. **State Diagram – Order Lifecycle**
- **Location:** Section 5.4, Diagram 8
- **Purpose:** Models the complete lifecycle of an order from creation to completion or cancellation
- **States:**
  - **Initial:** Pending (customer creates order)
  - **Processing:** Payment Verified → Processing → Packed
  - **Fulfillment:** Shipped → InTransit → Delivered
  - **Exceptions:** Delayed (with resolution or return option), Returned, Cancelled
  - **Final:** Completed, Refunded, Cancelled
- **Transitions:** Shows all possible state transitions with triggers (e.g., "Payment Verified", "Warehouse Ships", "Delivery Issue")
- **Explanation:** Captures all possible order states and transitions, enabling robust order management and customer communication.

---

### 9. **Deployment Diagram – Infrastructure Architecture**
- **Location:** Section 5.4, Diagram 9
- **Purpose:** Illustrates the cloud infrastructure architecture for the Wrencos platform
- **Components:**
  - **Frontend Hosting:** Web Server (Vue.js SPA), Mobile App (React Native)
  - **Backend Hosting:** API Server (Node.js/Express), WebSocket Server (Node.js ws)
  - **Database Tier:** MongoDB Atlas (managed, replicated), Vector Database (Qdrant)
  - **Storage Services:** Object Storage (AWS S3/GCP), CDN (CloudFront)
  - **External Services:** Google Gemini, VNPay, SMTP, Agora SDK
  - **Monitoring:** CloudWatch, Log Aggregation
- **Explanation:** Ensures scalability, reliability, and high availability for the platform.

---

### 10. **Data Flow Diagram – Customer Purchase to Analytics**
- **Location:** Section 5.4, Diagram 10
- **Purpose:** Traces the complete flow of data from customer purchase through to analytics reporting
- **Flow:**
  1. Customer browses → Web/Mobile App
  2. Checkout → API Gateway → E-Commerce Service
  3. Payment processing → VNPay Gateway
  4. Order creation → Order Collection
  5. Email confirmation → Email Service → SMTP → Email Collection
  6. Data aggregation → Analytics Service → Analytics Collection
  7. Admin dashboard queries → Display metrics
- **Explanation:** Illustrates the complete data pipeline from transaction to insight.

---

## Key Features of the UML Diagrams

### Comprehensive Coverage
- **10 different diagram types** covering all aspects of system design
- **Multiple perspectives:** Domain model, use cases, activities, sequences, components, states, deployment, and data flow
- **All services represented:** Auth, E-Commerce, Livestream, Communication, Marketing, Analytics, Finance, HR

### Clear Explanations
- **Each diagram includes a detailed explanation** describing:
  - Purpose and scope
  - Key participants/entities
  - Main flows and interactions
  - Relationships and dependencies

### Mermaid Format
- **All diagrams use Mermaid syntax** for easy rendering in Markdown
- **Compatible with GitHub, GitLab, and other platforms** that support Mermaid
- **Easy to maintain and update** as the system evolves

### Alignment with Architecture
- **Diagrams reflect actual system design** based on codebase analysis
- **Shows integration points** between services
- **Demonstrates data flow** through the system
- **Illustrates real-time communication** via WebSocket
- **Captures external service integrations** (Google Gemini, VNPay, SMTP)

---

## How to Use These Diagrams

### For Documentation
- Include in technical documentation
- Share with stakeholders for system understanding
- Use in presentations and design reviews

### For Development
- Reference during implementation
- Use as a guide for API design
- Help new team members understand the system

### For Maintenance
- Update diagrams when system changes
- Use as a basis for refactoring discussions
- Document architectural decisions

---

## File Location
All diagrams are located in:
```
/Users/phamthanhtruc/Documents/uni/FYP-c1682/wrencos/report/SECTION_5_SYSTEM_DESIGN_ARCHITECTURE.md
```

Section: **5.4 Detailed Design Diagrams**

---

## Next Steps
1. Review diagrams in the context of the full report
2. Validate diagrams against actual implementation
3. Update diagrams as system evolves
4. Consider adding additional diagrams for specific services if needed
5. Generate visual representations from Mermaid diagrams for presentations

---

**Document Created:** 2025-11-23
**Status:** Complete - All 10 UML diagrams added with explanations

