# 6. Implementation

## 6.1 Development Environment

| Aspect | Details |
|---|---|
| IDE | Visual Studio Code with extensions for debugging and linting, supporting JavaScript, Vue.js, and Python |
| Version Control | Git and GitHub with Issues and Projects for collaborative development tracking |
| Project Management | Trello and GitHub Projects for organizing tasks across multiple teams and modules |
| Runtime | Node.js 16.20.1 with npm for package management |
| Containerization | Docker for consistent development, testing, and production deployments |
| API Documentation and Testing | Swagger UI integrated at /api-docs; Postman for comprehensive endpoint validation and integration testing |
| Logging and Monitoring | Morgan (optional) for HTTP request logging; express-rate-limit for DDoS protection |
| Backend Technology Stack | Express.js, Mongoose, JSON Web Tokens (JWT), Multer, WebSocket (ws), Swagger JSDoc, Swagger UI Express, express-rate-limit, Nodemailer, @google/generative-ai, LangChain, @qdrant/js-client-rest |
| Frontend Technology Stack | Vue 3, Vue Router, Vue i18n, Tailwind CSS, Axios, Chart.js, Vue Chart.js |
| Mobile Applications | React Native with Expo for admin and customer platforms targeting iOS and Android |

### Backend Technology Stack

| Library | Purpose |
|---|---|
| Express.js | Backend web framework used to define routes, middleware, and REST APIs. |
| Mongoose | ODM for MongoDB used to define schemas, validate data, and interact with collections. |
| JSON Web Tokens (jsonwebtoken) | Generates and verifies authentication tokens to secure protected routes. |
| Multer | Handles multipart/form-data for file uploads, such as product images stored under /uploads. |
| WebSocket (ws) | Enables real-time features for livestream state, likes, and interactive events. |
| Swagger JSDoc | Generates OpenAPI specifications from JSDoc comments in routes and controllers. |
| Swagger UI Express | Serves interactive API documentation at /api-docs for exploration and testing. |
| express-rate-limit | Throttles requests to mitigate abuse and help protect against DDoS attacks. |
| Nodemailer | Sends transactional and marketing emails for notifications and campaigns. |
| @google/generative-ai | Integrates Google Gemini models to power AI features such as chat and content generation. |
| LangChain | Orchestrates LLM prompts, tools, and RAG flows to implement advanced AI logic. |
| @qdrant/js-client-rest | Connects to the Qdrant vector database to perform semantic search and retrieval. |

### Frontend Technology Stack

| Library | Purpose |
|---|---|
| Vue 3 | Frontend framework for building the single-page application with the Composition API. |
| Vue Router | Client-side routing and navigation between application views. |
| Vue i18n | Internationalization for runtime language switching and localized content. |
| Tailwind CSS | Utility-first CSS framework for rapid and consistent UI development. |
| Axios | HTTP client used for calling backend APIs and handling responses. |
| Chart.js | Charting library to visualize analytics and performance metrics. |
| Vue Chart.js | Vue wrapper around Chart.js to render charts as Vue components. |



## 6.2 Backend & Frontend Implementation

### Folder Structure and Organizational Logic

The project follows a modular, layered architecture that separates concerns across distinct functional domains. The backend directory is organized hierarchically with dedicated folders for controllers, middleware, models, routes, services, and utilities. This structure enables independent scaling of features and facilitates team collaboration by allowing developers to work on isolated modules without conflicts.

The controllers directory contains eight domain-specific subdirectories: analytics, auth, communication, ecommerce, finance, hr, livestream, marketing, and skin-study. Each controller module handles the business logic for its respective domain, processing incoming requests and coordinating with models and services. The middleware directory houses three critical files: auth.js for JWT verification, optionalAuth.js for conditional authentication, and role.js for role-based access control (RBAC). These middleware components are applied to routes to enforce security policies consistently across the API.

The models directory mirrors the controller structure with corresponding subdirectories, each containing Mongoose schemas that define the data structure and validation rules for MongoDB collections. The core models directory includes foundational schemas used across multiple domains. The routes directory similarly maintains domain-specific organization, with each route file defining endpoints and applying appropriate middleware before delegating to controllers.

The services directory contains reusable business logic components including geminiService.js for Google Generative AI integration, vectorService.js for Qdrant vector database operations supporting retrieval-augmented generation (RAG), emailService.js for SMTP-based email delivery, and ttsService.js for text-to-speech conversion. The utils directory provides utility functions such as performanceMonitor.js for tracking API response times and scoreAnalyzer.js for calculating complex scoring algorithms used in analytics and product recommendations.

The frontend source directory is organized into logical sections: pages containing full-page Vue components, components containing reusable UI components, layout containing wrapper components for consistent page structure, router containing Vue Router configuration and route definitions, services containing API client functions, stores containing Pinia or Vuex state management, and utils containing helper functions. The assets directory houses Tailwind CSS configuration, custom stylesheets, and global design tokens. The i18n.js file configures Vue i18n for multi-language support, enabling the application to serve users in different locales.

### Meaningful Code Sample: Backend Product Creation with Media Handling

The following code sample demonstrates a core backend function that exemplifies the layered architecture and data handling patterns used throughout the project:

```javascript
// backend/controllers/ecommerce/productController.js
const Product = require("../../models/ecommerce/product");
const fs = require("fs");
const path = require("path");

// Utility function to delete old image file during updates
const deleteImageFile = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '../', imagePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error('Error deleting old image file:', err);
      } else {
        console.log('Old image file deleted successfully:', imagePath);
      }
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Extract scalar and array fields from multipart/form-data request
    const { 
      name, 
      categoryId, 
      price, 
      description, 
      stockQuantity,
      ingredients,
      skinType,
      benefits,
      tags,
      usage,
      skinConcerns
    } = req.body;

    // Multer middleware provides uploaded file path
    const image = req.file ? req.file.path : null;

    // Normalize array fields that arrive as JSON strings from form data
    const parsedIngredients  = ingredients   ? JSON.parse(ingredients)   : [];
    const parsedSkinType     = skinType      ? JSON.parse(skinType)      : [];
    const parsedBenefits     = benefits      ? JSON.parse(benefits)      : [];
    const parsedTags         = tags          ? JSON.parse(tags)          : [];
    const parsedSkinConcerns = skinConcerns  ? JSON.parse(skinConcerns)  : [];

    // Create new Product document with normalized data
    const product = new Product({
      name,
      category: categoryId,
      price,
      description,
      stockQuantity,
      image,  // Stored path; served via Express static middleware
      ingredients:  parsedIngredients,
      skinType:     parsedSkinType,
      benefits:     parsedBenefits,
      tags:         parsedTags,
      usage,
      skinConcerns: parsedSkinConcerns
    });

    // Persist to MongoDB and populate category reference
    const saved = await product.save();
    await saved.populate('category');
    
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};
```

This function demonstrates several architectural patterns: separation of concerns through dedicated utility functions, proper error handling with try-catch blocks, normalization of form data into structured arrays, and integration with Mongoose for data persistence. The Multer middleware handles file uploads transparently, and Express static middleware serves uploaded files from the /uploads directory, creating a seamless media handling pipeline.

### Frontend Component Architecture

The frontend follows Vue 3 Composition API patterns with component-based organization. Each page component manages its own state, lifecycle, and API interactions through services. The router configuration in src/router/index.js defines lazy-loaded routes to optimize bundle size and initial load time. The i18n configuration enables dynamic language switching without page reloads, supporting multiple locales through JSON translation files.

### API Organization and Integration

The backend API is organized into logical modules accessible through distinct route prefixes: /products and /categories for e-commerce, /auth and /users for authentication, /orders and /payments for order management, /livestreams for real-time streaming, /chat for communication, /analytics for business intelligence, /newsletter and /email-campaigns for marketing, /hr for human resources, /cashflow for financial management, and /api/ai-dermatology-expert for specialized AI features. Each module implements consistent error handling, validation, and response formatting. The server.js initialization file sets up the Express application, connects to MongoDB, initializes the WebSocket manager for real-time features, and performs cleanup operations on startup to ensure data consistency.

## 6.3 Database Implementation

### MongoDB Atlas and Mongoose Integration

The physical database was implemented using MongoDB Atlas, a fully managed cloud database service providing high availability, automated backups, and global distribution capabilities. The connection is established through Mongoose, an Object Data Modeling (ODM) library that provides schema validation, middleware hooks, and query building utilities. The db.js file contains the connection logic, establishing a secure connection to the MongoDB cluster using connection strings with authentication credentials.

### Schema Design and Collection Structure

The database schema reflects the modular architecture of the application, with collections organized by functional domain. The ecommerce module includes Product, Category, Order, and Payment collections. The auth module contains User and Session collections with password hashing and token management. The livestream module includes LiveStream, StreamComment, and StreamLike collections for real-time interaction tracking. The communication module contains Chat and Message collections for user messaging. The marketing module includes Newsletter, EmailCampaign, EmailTemplate, and EmailSegment collections for campaign management. The finance module contains CashFlow records for financial tracking. The hr module includes Employee, Department, and Leave records. The skin-study module contains DermatologyRecord and SkinAnalysis collections for specialized analysis features.

### Vector Database Integration

Qdrant, a vector database optimized for similarity search and retrieval-augmented generation (RAG), was deployed using Docker Compose as defined in docker-compose.qdrant.yml. The vectorService.js module provides an abstraction layer for vector operations, enabling semantic search capabilities across product descriptions, customer reviews, and knowledge base content. This integration supports advanced features such as AI-powered product recommendations and intelligent customer support through RAG-enhanced chatbots.

### Data Initialization and Seeding

The backend includes seed scripts under the seed-data directory that populate the database with initial content. The seedChatData.js script initializes chat templates and conversation starters, while seedEmailTemplates.js populates email campaign templates. These scripts ensure that the application has essential data available immediately after deployment, reducing setup time and providing a consistent baseline for testing and demonstration.

## 6.4 Deployment

### Containerization Strategy

The application was containerized using Docker to ensure consistency across development, staging, and production environments. The backend Dockerfile specifies Node.js 16.20.1 as the base image, installs dependencies from package.json, copies application code, exposes port 3000, and executes npm start as the entry point. The frontend includes a separate Dockerfile that builds the Vue application using npm run build and serves the static dist directory through a lightweight HTTP server. The Qdrant vector database is orchestrated through docker-compose.qdrant.yml, defining the service configuration, port mappings, and persistent volume mounts.

### Local Development Deployment

For local development, the backend is deployed by building the Docker image with docker build -t wrencos-backend ./backend and running it with docker run -p 3000:3000 --env-file .env wrencos-backend, exposing the API on localhost:3000. The Qdrant service is started with docker compose -f backend/docker-compose.qdrant.yml up -d, making the vector database available on localhost:6333. The frontend development server is launched with npm run dev in the frontend directory, providing hot module reloading for rapid iteration during development.

### Production Deployment

For production deployment, the application can be deployed to cloud platforms such as Render, Railway, AWS EC2, or Heroku. The deployment process involves pushing the Docker images to a container registry, configuring environment variables including PORT, GEMINI_API_KEY, JWT_SECRET, SMTP credentials, and MongoDB connection strings, and deploying the containers through the platform's orchestration system. HTTPS is enforced through a reverse proxy such as Nginx or the platform's built-in SSL termination. Database backups are configured through MongoDB Atlas's automated backup feature with point-in-time recovery capabilities. The WebSocket connection is maintained through the reverse proxy's WebSocket upgrade support, enabling real-time features in production.

### Environment Configuration

The application uses environment variables defined in .env files for configuration management. Critical variables include GEMINI_API_KEY for AI features, JWT_SECRET for token signing, MONGODB_URI for database connection, SMTP credentials for email services, and QDRANT_URL for vector database access. The server.js file includes startup checks that warn if critical variables such as GEMINI_API_KEY are not configured, allowing graceful degradation of optional features while maintaining core functionality.

## 6.5 Project Management

### Task Tracking and Collaboration

Project management was conducted through GitHub Projects and Trello boards, providing visibility into task status, priority, and assignment. The task tracking system organized work into columns representing workflow stages: Backlog for future work, In Progress for active development, Review for code review and testing, and Done for completed features. Each task card included acceptance criteria, estimated effort, assigned team members, and linked pull requests or commits. This structured approach ensured that all team members understood priorities and dependencies, reducing context-switching overhead and improving delivery predictability.

### Version Control and Commit History

The project maintained a comprehensive commit history on GitHub demonstrating consistent, incremental development. Feature branches were created for each major feature (e.g., feature/ecommerce, feature/livestream, feature/ai-dermatology) and merged into the main branch through pull requests after code review. Commit messages followed a consistent format describing the changes made, enabling easy navigation of project history and identification of when specific features were introduced. The commit graph shows regular activity across multiple team members, indicating active collaboration and distributed development effort. Hotfix branches were created for production issues, ensuring rapid resolution without disrupting ongoing feature development.

### Documentation and Knowledge Management

Technical documentation was maintained in Markdown files within the report directory, including requirements analysis, system design, and implementation details. API documentation was automatically generated through Swagger JSDoc and served through the Swagger UI, ensuring that API specifications remained synchronized with implementation. Database schema documentation was maintained through Mongoose schema definitions with inline comments explaining field purposes and constraints. This multi-layered documentation approach ensured that knowledge was captured at the appropriate level of abstraction, from high-level architecture decisions to low-level implementation details.
