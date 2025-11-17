# Wrencos - Full-Stack E-Commerce Platform

## Executive Summary

Wrencos is a comprehensive full-stack e-commerce platform specifically designed for the beauty and skincare industry. This innovative platform integrates cutting-edge technologies including live streaming commerce, AI-powered customer assistance, and complete business management tools to address the unique challenges faced by beauty businesses and their customers. Built as a Final Year Project, Wrencos demonstrates modern software development practices, advanced system architecture, and practical solutions to real-world e-commerce challenges.

The platform serves two primary user groups: small to medium-sized beauty businesses seeking an integrated management solution, and beauty product consumers looking for personalized shopping experiences with expert guidance. By combining e-commerce functionality with interactive features like live streaming and AI chat, Wrencos bridges the gap between traditional online shopping and the personalized experience of physical stores.

## Project Vision and Objectives

The primary objective of Wrencos is to revolutionize the beauty e-commerce experience by addressing critical pain points in the industry. Traditional e-commerce platforms fail to provide the sensory experience crucial for beauty products, offer generic recommendations that ignore individual skin types and concerns, and force businesses to juggle multiple disconnected platforms for different operational needs.

Wrencos tackles these challenges by providing an all-in-one solution that combines:
- Complete e-commerce functionality with AI-enhanced product recommendations
- Real-time live streaming for product demonstrations and customer engagement
- Intelligent chat assistance powered by Google Gemini AI
- Comprehensive email marketing with advanced segmentation
- Integrated business management including finance tracking and HR management
- Multi-platform accessibility through web and mobile applications

## Technology Stack Overview

### Backend Architecture

The backend is built on **Node.js** with the **Express.js** framework, chosen for its event-driven, non-blocking I/O architecture that efficiently handles concurrent connections—essential for features like live streaming and real-time chat. The JavaScript-everywhere approach enables code reuse and reduces context switching between frontend and backend development.

**MongoDB** serves as the primary database, selected for its flexible document-oriented data model that accommodates the platform's evolving requirements without requiring downtime-inducing schema migrations. MongoDB Atlas provides cloud-hosted database services with automated backups, monitoring, and horizontal scaling capabilities. The JSON-like document structure maps naturally to JavaScript objects, accelerating development and reducing impedance mismatch.

Authentication and authorization utilize **JWT (JSON Web Tokens)**, providing stateless, scalable authentication suitable for distributed systems. Role-based access control distinguishes between admin and customer capabilities, with bcrypt password hashing ensuring security. Access tokens expire after one hour while refresh tokens remain valid for seven days, balancing security with user convenience.

**WebSocket** technology powers real-time communications, enabling bidirectional, low-latency messaging essential for live streaming chat, customer support interactions, and real-time notifications. The implementation uses the lightweight `ws` library, managing separate connection pools for customers and administrators to optimize message routing and system resources.

**Google Gemini AI** integration provides state-of-the-art conversational AI capabilities for customer support and product recommendations. The API-based approach eliminates infrastructure overhead while providing sophisticated natural language understanding, context retention across conversation turns, and the ability to generate personalized beauty advice based on individual skin types and concerns.

Additional backend technologies include **Swagger/OpenAPI** for comprehensive API documentation, **Multer** for file upload handling, **Nodemailer** for email services, and **express-rate-limit** for API protection against abuse.

### Frontend Architecture

The web application employs **Vue.js 3** with the **Composition API**, offering an optimal balance of developer productivity and application performance. Vue's progressive framework approach allows building everything from simple interfaces to complex single-page applications. The Composition API enables better code organization through composable functions, improving reusability and testability compared to the Options API.

**Vite** serves as the build tool, providing lightning-fast hot module replacement during development and optimized production builds. Unlike traditional bundlers, Vite leverages native ES modules in development for instant server start and extremely fast updates.

**Tailwind CSS** implements the styling layer using a utility-first approach that accelerates UI development while maintaining design consistency. Rather than writing custom CSS, developers compose interfaces using predefined utility classes. Tailwind's configuration system enables easy customization of design tokens (colors, spacing, typography), and its PurgeCSS integration removes unused styles, resulting in tiny production CSS bundles typically under 10KB.

**Vue Router** handles client-side routing, enabling smooth navigation without page reloads. **Pinia** (or Vuex) manages application state, particularly for user authentication, shopping cart, and real-time data from WebSocket connections. **Chart.js** with **vue-chartjs** provides interactive data visualizations for analytics dashboards.

**Vue I18n** enables internationalization, allowing the platform to support multiple languages and locales. While the initial implementation focuses on English, the architecture supports easy addition of translations for global expansion.

### Mobile Application

The customer mobile application uses **React Native** with **Expo**, enabling cross-platform development for iOS and Android from a single JavaScript codebase. This approach reduces development time and maintenance costs by approximately 50% compared to native development while maintaining near-native performance.

**React Navigation** provides native-like navigation patterns with stack and tab navigators. **AsyncStorage** enables local data persistence for offline capabilities and cart management. **Axios** handles HTTP communications with the backend API, while the React Context API manages application state.

Expo simplifies the development workflow by providing managed services for common requirements like camera access (for live streaming participation), image picking, push notifications, and over-the-air updates that enable deploying fixes without app store review processes.

## Core Features and Modules

### E-Commerce Foundation

The platform provides complete e-commerce functionality including product catalog management with categories and subcategories, advanced search with filters for price, skin type, and concerns, shopping cart with session persistence, and comprehensive order management. Administrators can manage products through intuitive CRUD interfaces, while customers enjoy seamless browsing, searching, and purchasing experiences.

The product schema extends beyond basic e-commerce fields to include beauty-specific attributes: ingredients lists, suitable skin types (oily, dry, combination, sensitive, normal), skin concerns addressed (acne, aging, dark spots, wrinkles, dryness), product benefits, and usage instructions. These AI-enhanced fields enable sophisticated product recommendations and personalized shopping experiences.

Inventory management tracks stock levels in real-time, preventing overselling and alerting administrators to low stock situations. The order management system supports multiple statuses (pending, processing, shipping, delivered, cancelled) with both cash-on-delivery and online payment options.

### Live Streaming Commerce

Live streaming represents one of Wrencos's most innovative features, enabling businesses to demonstrate products in real-time, answer customer questions, and create engaging shopping experiences. The implementation supports video streaming from admin interfaces to customer web and mobile applications with minimal latency (under 5 seconds).

During live streams, administrators can pin products that appear alongside the video, allowing viewers to instantly view details or add items to their cart without leaving the stream. Real-time chat enables bidirectional communication between the streamer and audience, fostering community and addressing questions immediately.

The system tracks comprehensive analytics including concurrent viewer counts, peak viewers, total views, engagement metrics, and likes. Viewers can like streams, with the system preventing duplicate likes through unique identifier tracking (user IDs for authenticated users, session IDs for anonymous viewers). The WebSocket architecture broadcasts updates to all connected clients in real-time, ensuring synchronized experiences.

Streams can be recorded for later playback, extending their value beyond the live event. The recording functionality captures both video content and chat history, providing comprehensive records of each session.

### AI-Powered Chat Assistant

The AI chat system leverages Google Gemini AI to provide intelligent, contextual customer support and product recommendations. Unlike traditional rule-based chatbots, Gemini's advanced language models understand nuanced queries, maintain conversation context, and generate natural, helpful responses.

When customers ask questions about skin concerns or product recommendations, the AI analyzes the query, references the product database to find matches based on skin type and concerns, and provides personalized suggestions with links to specific products. The system searches products using MongoDB text indexes on names, descriptions, ingredients, and benefits, ensuring relevant recommendations.

A FAQ management system allows administrators to create frequently asked questions that the AI references when answering common queries, ensuring consistent, accurate responses. For complex situations beyond AI capabilities, customers can escalate conversations to human staff members. The system notifies administrators via WebSocket of escalation requests, enabling prompt responses.

All conversations are saved to the database, allowing customers to review past interactions and enabling administrators to analyze common questions and improve service. The conversation history maintains role distinction (user vs. assistant) and tracks message types (text, AI, staff, predefined).

### Email Marketing System

The comprehensive email marketing module enables businesses to nurture customer relationships, promote products, and drive sales through targeted campaigns. Administrators can create campaigns with custom subjects, HTML content, and plain text alternatives. A template management system allows creating reusable email designs with dynamic variables (subscriber name, company name, product links).

Subscriber management includes web-based newsletter signup forms, preference management (new products, promotions, newsletters), and automatic unsubscribe handling with unique tokens. The segmentation engine enables targeting specific subscriber groups based on subscription date, source, preferences, and engagement history.

Campaign analytics track essential metrics: emails sent, delivered, bounced, opened (unique and total), clicked, and unsubscribe rates. These insights enable data-driven optimization of subject lines, content, and sending times. The system calculates derived metrics like open rate and click-through rate automatically.

The implementation uses Nodemailer for email delivery via SMTP, configured with Gmail for the development environment but easily adaptable to services like SendGrid or Amazon SES for production scale.

### Business Analytics Dashboard

The analytics module transforms raw data into actionable insights through interactive dashboards and reports. Sales analytics display total revenue, order count, average order value, and trends over customizable date ranges. Product performance metrics identify top sellers and underperforming items, informing inventory and marketing decisions.

Customer analytics provide insights into new versus returning customers, customer lifetime value, and purchasing patterns. Email campaign analytics integrate with the marketing module to show campaign performance and subscriber engagement trends.

Chart.js visualizations present data through line graphs for revenue trends, bar charts for product comparisons, and pie charts for category distributions. The implementation uses Vue's reactivity system to update charts dynamically as data changes.

### Financial Management

The finance module helps businesses track cash flow, manage expenses, and maintain financial health. Cash flow tracking records all income and expenses with categories, descriptions, dates, and payment methods. The system calculates real-time balance based on transaction history.

Business expense management provides detailed tracking with categories (rent, utilities, salaries, marketing, supplies, equipment, software, travel), vendor information, invoice numbers, due dates, and payment status. Recurring expense support automates tracking of regular costs like subscriptions and rent.

Financial reports generate profit/loss statements for specified periods, break down expenses by category, and provide exportable summaries for accounting purposes. The dashboard displays key metrics including total income, total expenses, net profit, and profit margins.

### Human Resources Management

The HR module manages employee records including personal information, positions, departments, hire dates, salaries, and employment status (active, inactive, terminated). Document management enables uploading and securely storing employee files like contracts, certifications, and performance reviews.

Employee search and filtering capabilities help locate records by name, department, or position. The system maintains creation and update timestamps for audit purposes and compliance.

## System Architecture and Design

Wrencos employs a three-tier architecture separating presentation (frontend/mobile), business logic (backend API), and data storage (MongoDB). This separation enables independent scaling, technology updates, and testing of each layer.

The RESTful API design follows industry standards using HTTP methods (GET, POST, PUT, DELETE) for CRUD operations, resource-based URLs, and stateless request handling. Comprehensive API documentation via Swagger enables clear contracts between frontend and backend teams and facilitates testing and integration.

WebSocket connections operate alongside the REST API, handling real-time features while HTTP endpoints manage traditional request-response operations. This hybrid approach leverages each protocol's strengths: REST for stateless operations with caching and WebSocket for low-latency bidirectional communication.

The MongoDB schema design balances normalization and denormalization, using references for relationships requiring data integrity (user to orders, product to categories) and embedding for tightly coupled data (order products, live stream chat messages). Indexes optimize frequently queried fields, with text indexes enabling full-text search and compound indexes supporting complex queries.

Security measures include password hashing with bcrypt (salt factor 10), JWT token signing and verification, role-based access control on all endpoints, input validation and sanitization to prevent injection attacks, HTTPS/TLS encryption for data in transit, and rate limiting to prevent abuse (1000 requests per 15 minutes per IP).

## Development Methodology

The project follows Agile development principles with iterative 2-week sprints, each delivering working software increments. This approach enables flexibility in responding to changing requirements, early identification and resolution of issues, and continuous stakeholder feedback.

Version control uses Git with GitHub, employing feature branching for new functionality and pull requests for code review. Commit messages follow conventional commit standards for clarity and automated changelog generation.

The development process emphasizes continuous integration with frequent commits, regular testing, and rapid iteration. While adapted for solo development, Agile practices like sprint planning, retrospectives, and user story mapping guide progress and ensure alignment with project objectives.

## Challenges and Solutions

Several technical challenges emerged during development. Real-time synchronization of viewer counts and likes during live streams required careful WebSocket state management and database coordination. The solution involved in-memory state tracking with periodic database persistence, reducing database load while maintaining accuracy.

AI integration presented challenges around API rate limits, response consistency, and fallback handling. Implementation includes request caching for common queries, graceful degradation when API limits are reached, and comprehensive error handling.

Cross-platform mobile development required addressing device-specific differences in camera access, network handling, and UI rendering. Expo's managed workflow simplified many challenges, while careful testing across iOS and Android ensured consistent experiences.

Database query optimization for large datasets involved strategic index creation, aggregation pipeline optimization for analytics queries, and pagination implementation for all list endpoints.

## Future Enhancements

Planned enhancements include augmented reality virtual try-on using device cameras, advanced machine learning for personalized product recommendations based on purchase history and browsing behavior, integration with payment gateways (Stripe, PayPal) for online transactions, social media integration for product sharing and social commerce, automated marketing campaigns triggered by user behavior, multi-currency and multi-language support for international expansion, and advanced inventory forecasting using historical sales data.

## Conclusion

Wrencos demonstrates the successful integration of modern technologies to solve real-world problems in beauty e-commerce. The platform combines robust e-commerce functionality with innovative features like live streaming and AI assistance, providing value to both businesses and customers. The project showcases proficiency in full-stack development, system architecture, API design, database modeling, real-time communications, AI integration, and professional software development practices.

By addressing the unique challenges of beauty e-commerce through technology, Wrencos represents not just an academic exercise but a viable solution for the growing beauty e-commerce market. The comprehensive documentation, clean architecture, and modern technology stack position the platform for continued development and potential real-world deployment.

## Technologies Summary

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, WebSocket (ws), Google Gemini AI, Nodemailer, Multer, Bcrypt, Swagger/OpenAPI

**Frontend:** Vue.js 3, Composition API, Vite, Vue Router, Pinia/Vuex, Tailwind CSS, Chart.js, Vue-chartjs, Vue I18n, Axios

**Mobile:** React Native, Expo, React Navigation, AsyncStorage, Axios

**Infrastructure:** MongoDB Atlas, Git/GitHub, HTTPS/TLS, Rate Limiting

**Development Tools:** npm, Postman (API testing), VS Code, Chrome DevTools

The project represents approximately 6 months of development effort, encompassing research, design, implementation, testing, and documentation phases, culminating in a comprehensive platform ready for demonstration and potential deployment.
