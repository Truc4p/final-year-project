# Wrencos - 20-Minute Demonstration Transcription

## Project Overview (1 minute)

**[SLIDE 1: Title Slide]**

"Good [morning/afternoon]. I'm presenting **Wrencos**, an AI-powered beauty and skincare e-commerce platform developed as a Final Year Project. 

Wrencos is a comprehensive, multi-platform solution that combines traditional e-commerce with cutting-edge AI features. The platform serves both customers and administrators across web and mobile applications.

The key innovation here is the integration of AI dermatology expertise, live streaming capabilities, and intelligent customer support—all designed specifically for the beauty and skincare industry."

---

## Architecture Overview (2 minutes)

**[SLIDE 2: System Architecture Diagram]**

"Let me walk you through the architecture. We have a three-tier system:

**Frontend Layer:**
- A Vue 3 web application for both customers and administrators
- React Native mobile apps for iOS and Android—one for customers, one for admins
- All built with modern frameworks: Vue Router for navigation, Tailwind CSS for styling, and Axios for API communication

**Backend Layer:**
- Node.js with Express.js handling all business logic
- MongoDB Atlas for persistent data storage
- Redis for caching and session management
- Qdrant vector database for semantic search in my RAG system

**External Services:**
- Google Generative AI for AI features
- WebSocket connections for real-time communication
- Agora SDK for live streaming capabilities

The entire system is containerized with Docker and can be deployed to any cloud platform."

---

## Feature 1: E-Commerce Module (3 minutes)

**[SLIDE 3: E-Commerce Dashboard]**

"Let's start with the core e-commerce functionality. 

**For Customers:**
- Browse a curated catalog of skincare and beauty products
- Each product has detailed information: ingredients, suitable skin types, benefits, and specific skin concerns it addresses
- Full-text search across product names, descriptions, and ingredients
- Filter by category, skin type, and concerns
- Add items to cart and proceed to checkout
- Track order history and status

**For Administrators:**
- Complete product management system
- Create, edit, and delete products with rich metadata
- Manage inventory and stock levels
- View all customer orders
- Modify order status and details
- Track sales metrics and trends

**[DEMO INTERACTION]**
Let me show you the product page. Here we can see a moisturizer product with:
- Detailed ingredient list
- Recommended for: Dry and sensitive skin
- Addresses concerns: Dehydration, irritation
- Stock availability
- Add to cart functionality

The shopping cart is persistent—customers can save items and return later. Checkout supports multiple payment methods including VNPAY integration for Vietnamese customers."

---

## Feature 2: AI Dermatology Expert (4 minutes)

**[SLIDE 4: AI Dermatology Expert Interface]**

"This is where Wrencos really stands out. We've integrated an **AI Dermatology Expert** powered by Google Gemini AI.

**Key Capabilities:**

1. **Text-Based Consultation**
   - Customers can ask skincare questions in natural language
   - The AI provides evidence-based recommendations
   - All responses are cited from dermatology knowledge bases
   - Supports multiple languages with automatic detection

2. **Image Analysis**
   - Upload skin photos for AI analysis
   - The system analyzes skin condition, texture, and concerns
   - Provides personalized product recommendations
   - Identifies potential skin issues and suggests treatments

3. **Audio Input**
   - Voice-based queries with automatic transcription
   - Perfect for customers who prefer speaking
   - Transcription uses Google's speech-to-text API
   - Responses are also available in audio format via text-to-speech

4. **RAG Integration (Retrieval-Augmented Generation)**
   - The system retrieves relevant information from my knowledge base
   - Combines retrieved context with AI generation
   - Ensures recommendations are grounded in actual dermatology knowledge
   - Uses Qdrant vector database for semantic search

**[DEMO INTERACTION]**
Let me show you a text consultation:
- Customer asks: 'I have oily skin with acne. What products should I use?'
- The AI analyzes the query, retrieves relevant knowledge about acne treatment
- Provides a comprehensive response 
- The response is cited with sources

Now let's try image analysis:
- Upload a photo of skin
- The AI analyzes: skin type, texture, visible concerns
- Identifies: oiliness level, acne severity, sensitivity
- Recommends: specific products, treatment routine, when to see a dermatologist
- All analysis happens in real-time with high accuracy

The system is multilingual—if a customer asks in Vietnamese, it responds in Vietnamese. If they ask in German, they get German responses."

---

## Feature 3: Live Streaming (3 minutes)

**[SLIDE 5: Live Stream Management]**

"Wrencos includes a **Live Streaming Platform** for real-time product demonstrations and customer engagement.

**Admin Features:**
- Create live streams
- Broadcast in multiple quality settings
- Pin products during streams for direct sales
- Monitor real-time viewer count and engagement
- Access stream analytics after broadcast
- Automatic recording and archival

**Customer Features:**
- Watch live streams in real-time
- Real-time chat with other viewers and the host
- Like and react to content
- Add to cart pinned products
- Access recorded streams on-demand

**Real-Time Technology:**
- WebSocket connections for instant updates
- Viewer count updates in real-time
- Chat messages broadcast to all viewers
- Like counter updates instantly
- Seamless viewer join/leave tracking

**[DEMO INTERACTION]**
Let me show you the live stream interface:
- Admin dashboard shows: 'Stream Title: Summer Skincare Routine'
- Current viewers: 1,247 people watching live
- Pinned products: Sunscreen SPF 50, Hydrating Serum, Moisturizer
- Chat shows real-time messages from viewers
- Admin can respond to questions, demonstrate products, and drive sales
- Viewers can click on pinned products to add them to cart

---

## Feature 4: AI Chat Support (2 minutes)

**[SLIDE 6: Chat Support System]**

"My **AI Chat Support** system provides intelligent customer service 24/7.

**How It Works:**
1. Customer initiates a chat (no login required)
2. AI analyzes the query and searches the knowledge base
3. Provides an intelligent response with relevant information
4. If the customer needs human help, they can escalate to a staff member
5. Staff can take over the conversation seamlessly

**Features:**
- **FAQ Integration**: Common questions are answered instantly
- **RAG Context**: The AI retrieves relevant information from my knowledge base
- **Staff Escalation**: Seamless handoff to human support
- **Session Management**: Maintains conversation context
- **Multi-language Support**: Automatic language detection

**[DEMO INTERACTION]**
Customer asks: 'How do I use the vitamin C serum?'
- AI searches knowledge base for vitamin C serum usage
- Retrieves: Product information, usage instructions, benefits
- Responds: 'Apply 2-3 drops to clean skin in the morning. Wait 1 minute before applying moisturizer. Use SPF 30+ during the day.'
- Provides: Link to product page, related products, when to see a dermatologist if needed

If customer asks: 'I'm having an allergic reaction'
- AI recognizes urgency
- Provides: Immediate first aid advice
- getUrgentCareWarning with Disclaimers and safety if user's message has urgentCareKeywords like 'pain', 'severe', 'infection',...

---

## Feature 5: Email Marketing (1.5 minutes)

**[SLIDE 7: Email Marketing Dashboard]**

"The **Email Marketing Module** helps admins engage customers through targeted campaigns.

**Capabilities:**
- **Template Management**: Create and manage email templates
- **Campaign Creation**: Design campaigns with drag-and-drop editor
- **Segmentation**: Target customers by:
  - Purchase history
  - Skin type preferences
  - Product interests
  - Engagement level
- **Scheduling**: Schedule campaigns for optimal send times
- **Analytics**: Track open rates, click rates, conversions
- **Newsletter**: Manage subscriber lists and preferences

**[DEMO INTERACTION]**
Creating a campaign:
- Title: 'Summer Skincare Sale'
- Segment: Customers who purchased moisturizers in the past 6 months
- Template: Professional email with product images
- Content: Personalized recommendations based on past purchases
- Schedule: Send Tuesday at 10 AM
- Track: Monitor opens, clicks, and conversions in real-time"

---

## Feature 6: Analytics Dashboard (1.5 minutes)

**[SLIDE 8: Analytics Dashboard]**

"The **Analytics Dashboard** provides comprehensive business insights.

**Metrics Tracked:**
- **Sales Analytics**: Revenue trends, top products, sales by category
- **Product Analytics**: Best sellers, inventory levels, product performance
- **Customer Analytics**: New customers, repeat customers, customer lifetime value
- **Order Analytics**: Order volume, average order value, order status distribution

**Visualizations:**
- Line charts for trends over time
- Bar charts for comparisons
- Pie charts for distribution
- Real-time metrics with auto-refresh

**[DEMO INTERACTION]**
Dashboard shows:
- Total Revenue This Month: $45,230
- Total Orders: 1,247
- Average Order Value: $36.28
- Top Product: Vitamin C Serum (342 units sold)
- Customer Retention Rate: 68%
- Live Stream Engagement: 12,450 total viewers this month"

---

## Feature 7: Mobile Applications (1.5 minutes)

**[SLIDE 9: Mobile Apps]**

"Wrencos includes **React Native mobile applications** for both customers and administrators.

**Customer App Features:**
- Browse products with full search and filtering
- View product details with high-resolution images
- Shopping cart and checkout
- Order tracking and history
- Access to AI dermatology expert
- Watch live streams
- Real-time chat support
- Account management

**Admin App Features:**
- Monitor live streams
- Respond to customer chats

**Technology:**
- Built with React Native and Expo
- Cross-platform: iOS and Android
- Agora SDK for live streaming
- AsyncStorage for local data
- Axios for API communication
- Push notifications for real-time alerts

The apps are fully functional and can be deployed to the App Store and Google Play."

---

## Feature 8: HR & Finance Management (1 minute)

**[SLIDE 10: HR & Finance Modules]**

"Beyond e-commerce, Wrencos includes **HR and Finance Management** modules for business operations.

**HR Module:**
- Employee records and profiles
- Department management
- Payroll information
- Performance tracking
- Leave management

**Finance Module:**
- Cash flow tracking
- Business expense management
- Financial reporting
- Budget analysis
- Revenue and cost tracking

These modules help businesses manage their operations efficiently alongside their e-commerce activities."

---

## Technical Highlights (1 minute)

**[SLIDE 11: Technical Stack]**

"Let me highlight the technical excellence of this project:

**Backend:**
- Node.js with Express.js for high-performance APIs
- MongoDB Atlas for scalable data storage
- Qdrant vector database for AI-powered search
- Redis for caching and session management
- WebSocket for real-time communication
- Google Generative AI integration

**Frontend:**
- Vue 3 with Vite for fast development and builds
- Tailwind CSS for responsive design
- Vue Router for client-side routing
- Axios for API communication
- Chart.js for data visualization

**Mobile:**
- React Native with Expo for cross-platform development
- Native performance with JavaScript
- Agora SDK for live streaming

**DevOps:**
- Docker containerization
- Docker Compose for local development
- Cloud-ready architecture
- Swagger API documentation

**Security:**
- JWT authentication
- Password hashing with bcryptjs
- CORS configuration
- Rate limiting
- Input validation
- Environment variable management"

---

## Key Innovations (1 minute)

**[SLIDE 12: Key Innovations]**

"What makes Wrencos unique:

1. **AI Dermatology Expert**: First-of-its-kind integration of professional dermatology knowledge with AI
   - Evidence-based responses
   - Image analysis for skin conditions
   - Multi-language support
   - Citation system for transparency

2. **Live Streaming with E-Commerce Integration**: Real-time product demonstrations with instant purchasing
   - Pinned products during streams
   - Real-time engagement metrics
   - Automatic recording and archival

3. **RAG-Powered Chat**: Intelligent customer support grounded in actual knowledge
   - Semantic search for relevant information
   - Multi-language support

4. **Comprehensive Platform**: Not just e-commerce, but a complete business management system
   - HR management
   - Finance tracking
   - Email marketing
   - Analytics

5. **Multi-Platform**: Consistent experience across web and mobile
   - Vue 3 web app
   - React Native mobile apps
   - Responsive design
   - Real-time synchronization"

---

## Performance & Scalability (30 seconds)

**[SLIDE 13: Performance Features]**

"The system is built for scale:

- **Database Indexing**: Optimized queries on frequently accessed fields
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient data loading with pagination
- **Vector Search**: Qdrant for fast semantic search
- **Compression**: Gzip compression for API responses
- **Rate Limiting**: Protection against abuse
- **Performance Monitoring**: Real-time tracking of system performance

The architecture can handle thousands of concurrent users and millions of products."

---

## Security Features (30 seconds)

**[SLIDE 14: Security]**

"Security is built into every layer:

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Cross-Origin Resource Sharing configured
- **Input Validation**: Express-validator for sanitization
- **Helmet**: Security headers middleware
- **Environment Variables**: Sensitive data protected
- **Role-Based Access Control**: Admin vs. Customer permissions

All data is encrypted in transit and at rest."

---

## Deployment & Future (30 seconds)

**[SLIDE 15: Deployment & Future]**

"**Current Status:**
- Fully functional and tested
- Docker containerized
- Ready for cloud deployment
- Comprehensive API documentation

**Future Enhancements:**
- Advanced recommendation engine with machine learning
- Automated customer segmentation
- Video processing optimization
- Mobile push notifications
- Multi-currency support
- Inventory management system
- Loyalty program
- Integration with more payment gateways

The platform is designed to be extensible and can easily accommodate new features."

---

## Live Demo Walkthrough (2-3 minutes)

**[SLIDE 16: Live Demo]**

"Now let me show you the platform in action. I'll walk through a typical customer journey:

**Step 1: Browse Products**
- Navigate to the product catalog
- Search for 'vitamin C serum'
- Filter by skin type: 'Oily'
- View product details with ingredients and reviews

**Step 2: Use AI Dermatology Expert**
- Ask: 'I have oily skin with acne. What should I use?'
- AI analyzes and provides recommendations
- Recommends the vitamin C serum we just viewed
- Explains why it's suitable for oily, acne-prone skin

**Step 3: Add to Cart and Checkout**
- Add recommended product to cart
- Proceed to checkout
- Enter shipping address
- Select payment method
- Complete purchase

**Step 4: Watch Live Stream**
- Navigate to live streams
- Join an active stream
- See pinned products
- Add products to cart from the stream
- Chat with other viewers

**Step 5: Check Order Status**
- View order in account dashboard
- Track shipping status
- Access order history

**Admin Side:**
- View all orders and customer information
- Manage products and inventory
- Create and schedule email campaigns
- Monitor analytics and metrics
- Manage live streams"

---

## Conclusion (30 seconds)

**[SLIDE 17: Conclusion]**

"Wrencos represents a complete, production-ready solution for the beauty and skincare e-commerce industry. It combines:

- **Traditional E-Commerce Excellence**: Products, orders, payments
- **AI Innovation**: Dermatology expertise, intelligent chat, recommendations
- **Real-Time Engagement**: Live streaming, chat, notifications
- **Business Intelligence**: Analytics, finance, HR management
- **Multi-Platform Support**: Web and mobile applications
- **Enterprise-Grade Security**: Authentication, encryption, access control

The platform is scalable, secure, and ready for deployment. It can serve thousands of customers while providing administrators with powerful tools to manage their business.

Thank you for your attention. I'm happy to answer any questions."

---

## Q&A Section (Remaining time)

**Anticipated Questions:**

**Q: How does the AI dermatology expert work?**
A: It uses Google Gemini AI combined with a knowledge base of dermatology information. When a customer asks a question or uploads an image, the system retrieves relevant information from the knowledge base and uses AI to generate evidence-based recommendations. All responses are cited from dermatology sources.

**Q: Can the system handle high traffic?**
A: Yes. The architecture is designed for scale with database indexing, caching, pagination, and load balancing. It can handle thousands of concurrent users.

**Q: How is customer data protected?**
A: We use JWT authentication, password hashing, CORS, input validation, and environment variables for sensitive data. All data is encrypted in transit and at rest.

**Q: Can the platform be customized?**
A: Absolutely. The codebase is well-structured and documented. New features can be added to controllers, models, and routes. The system is designed to be extensible.

**Q: What about payment processing?**
A: The system integrates with VNPAY for Vietnamese customers and can be extended to support other payment gateways like Stripe, PayPal, etc.

**Q: How are live streams recorded?**
A: Streams are automatically recorded and archived. Customers can access recorded streams on-demand, creating a library of product demonstrations.

**Q: Is the mobile app native or cross-platform?**
A: It's cross-platform using React Native with Expo. This allows us to maintain a single codebase for both iOS and Android while providing native performance.

**Q: How does the RAG system work?**
A: RAG (Retrieval-Augmented Generation) works by:
1. Converting customer queries into embeddings
2. Searching the vector database for similar content
3. Retrieving relevant information
4. Passing that context to the AI
5. Generating responses grounded in actual knowledge

**Q: Can customers use the platform without an account?**
A: Yes. The chat support system allows anonymous users. However, to make purchases, customers need to create an account.

**Q: What about multi-language support?**
A: The system automatically detects the language of customer input and responds in the same language. The AI dermatology expert supports all major languages.

---

## Demo Talking Points Summary

| Feature | Key Points | Demo Time |
|---------|-----------|-----------|
| E-Commerce | Products, cart, checkout, orders | 30 sec |
| AI Dermatology | Text, image, audio input; RAG integration | 1 min |
| Live Streaming | Real-time broadcast, pinned products, chat | 30 sec |
| Chat Support | AI responses, escalation, FAQ | 20 sec |
| Email Marketing | Campaigns, segmentation, analytics | 20 sec |
| Analytics | Sales, products, customers, engagement | 20 sec |
| Mobile Apps | Cross-platform, feature parity | 20 sec |

---

## Slide Deck Outline

1. **Title Slide** - Wrencos: AI-Powered Beauty E-Commerce
2. **System Architecture** - Three-tier architecture diagram
3. **E-Commerce Dashboard** - Product browsing, cart, orders
4. **AI Dermatology Expert** - Text, image, audio consultation
5. **Live Streaming** - Real-time broadcast and engagement
6. **Chat Support** - AI-powered customer service
7. **Email Marketing** - Campaign management and analytics
8. **Analytics Dashboard** - Business metrics and insights
9. **Mobile Applications** - Customer and admin apps
10. **HR & Finance** - Business management modules
11. **Technical Stack** - Technologies used
12. **Key Innovations** - What makes Wrencos unique
13. **Performance Features** - Scalability and optimization
14. **Security** - Data protection and authentication
15. **Deployment & Future** - Current status and roadmap
16. **Live Demo** - Interactive walkthrough
17. **Conclusion** - Summary and call to action

---

## Timing Breakdown

- **Introduction**: 1 minute
- **Architecture**: 2 minutes
- **E-Commerce**: 3 minutes
- **AI Dermatology**: 4 minutes
- **Live Streaming**: 3 minutes
- **Chat Support**: 2 minutes
- **Email Marketing**: 1.5 minutes
- **Analytics**: 1.5 minutes
- **Mobile Apps**: 1.5 minutes
- **HR & Finance**: 1 minute
- **Technical Highlights**: 1 minute
- **Key Innovations**: 1 minute
- **Performance & Security**: 1 minute
- **Deployment & Future**: 30 seconds
- **Live Demo**: 2-3 minutes
- **Conclusion**: 30 seconds
- **Q&A**: Remaining time

**Total**: 20 minutes (plus Q&A)

---

## Notes for Presenter

1. **Pacing**: Speak clearly and maintain steady pace. Don't rush through technical details.

2. **Eye Contact**: Look at the audience, not the slides.

3. **Enthusiasm**: Show genuine excitement about the project's innovations, especially the AI features.

4. **Live Demo**: Have the system running and tested before the presentation. Have backup screenshots if there are connectivity issues.

5. **Audience Engagement**: Ask rhetorical questions to keep audience engaged. Pause for effect after key points.

6. **Technical Depth**: Adjust technical details based on audience knowledge level. Simplify for non-technical audiences.

7. **Backup Plan**: Have printed slides and a USB with the presentation in case of technical issues.

8. **Practice**: Rehearse the demo multiple times to ensure smooth execution.

9. **Timing**: Use a timer to keep track of time. Adjust content if running over.

10. **Closing**: End with a strong call to action and invitation for questions.

---

## Key Messages to Reinforce

1. **Comprehensive Solution**: Wrencos is not just e-commerce; it's a complete platform for beauty businesses.

2. **AI Innovation**: The AI dermatology expert is a unique feature that sets Wrencos apart from competitors.

3. **Real-Time Engagement**: Live streaming with integrated e-commerce creates new revenue opportunities.

4. **User-Friendly**: The platform is intuitive for both customers and administrators.

5. **Scalable & Secure**: Built with enterprise-grade technology and security practices.

6. **Multi-Platform**: Consistent experience across web and mobile.

7. **Future-Ready**: Designed for extensibility and can accommodate new features.

---

**End of Demonstration Transcription**

