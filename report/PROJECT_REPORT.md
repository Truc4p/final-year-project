# WRENCOS PROJECT REPORT

## 1. Introduction

### 1.1 General Overview

The global beauty and personal care e-commerce market has experienced unprecedented growth, reaching USD 120 billion in 2024 with a projected value exceeding USD 200 billion by 2027, driven by digital-native consumers demanding personalized and immersive shopping experiences (Statista, 2024). However, contemporary e-commerce platforms fail to adequately address the specific requirements of beauty retail, where product evaluation barriers and sensory deficits fundamentally hinder consumer confidence (Nilashi et al., 2019). This project presents Wrencos, an integrated full-stack e-commerce platform specifically engineered for small to medium-sized beauty businesses, combining e-commerce functionality with real-time live streaming commerce, AI-powered product recommendations, comprehensive business management tools and AI-powered dermatology consultation with text and voice chat and skin image analysis to reduce uncertainty and improve guidance into a unified ecosystem.

### 1.2 Problem Statement

Beauty e-commerce presents a dual challenge for businesses and consumers. From the consumer perspective, the inability to physically test products creates substantial trust barriers, resulting in return rates exceeding 40% within the beauty sector (NPD Group, 2023). Dholakia et al. (2010) conceptualize this phenomenon as the "sensory deficit" in online retail—the absence of tactile, olfactory, and visual evaluation opportunities that fundamentally inform beauty product purchasing decisions. From the business perspective, small to medium-sized beauty enterprises struggle with fragmented technology ecosystems, typically requiring five to eight disconnected platforms for e-commerce, marketing, accounting, analytics, and operational management. This fragmentation creates cumulative operational costs of USD 500–3,000 monthly while simultaneously creating data silos that prevent sophisticated analysis and personalization. Jiang et al. (2019) demonstrate that generic recommendation algorithms achieve conversion rates of only 5%, whereas personalized recommendation systems achieve conversion rates of 15–20%, highlighting a critical performance gap for businesses unable to access advanced personalization technologies.

### 1.3 Project Aim

The overarching aim of this project is to design, develop, and deploy an integrated full-stack e-commerce platform combining e-commerce functionality with real-time live streaming commerce, AI-powered personalized assistance, and comprehensive business management tools, specifically tailored for small to medium-sized beauty businesses.

### 1.4 Specific Objectives

Objective 1: To design and implement a RESTful API backend with corresponding database architecture supporting e-commerce, live streaming, AI chat, email marketing, and business management modules, incorporating JWT authentication and role-based access control.

Objective 2: To develop web-based administrative interfaces for business management and customer-facing interfaces for product discovery, shopping, and order management, skin study module on the web frontend, complemented by cross-platform mobile applications: (a) a customer app with an integrated Skin Study module providing AI dermatology consultation (text and voice) and skin image analysis; and (b) an admin app for livestream scheduling and management.

Objective 3: To integrate Google Gemini AI for conversational product recommendations based on customer skin type and concerns, implementing context-aware dialogue systems that maintain conversation history and enable escalation to staff members when appropriate, alongside a comprehensive skin study module available on the web frontend and the customer mobile app that provides AI dermatology consultation (text and voice) and skin image analysis.

Objective 4: To implement WebSocket infrastructure supporting real-time live video streaming with concurrent viewer support, product pinning during streams, real-time chat functionality, and comprehensive viewer analytics.

### 1.5 Scope and Limitations

**Scope (Features Included):** 

| Feature Category | In-Scope Components |
|---|---|
| **E-Commerce** | Product catalog, shopping cart, payment, orders, inventory, categories |
| **Live Streaming** | WebSocket-based video streaming infrastructure, real-time chat, product pinning, viewer analytics |
| **AI Chat** | Google Gemini integration, conversational product recommendations, FAQ management with staff escalation |
| **Skin Study Feature** | AI dermatology expert with text and voice chat, skin image analysis, RAG-based knowledge base with curated dermatology literature, chat history management, multi-language support, real-time audio streaming |
| **Email Marketing** | Campaigns, customer segmentation, email templates, newsletter management, audience targeting |
| **Analytics Dashboards** | Sales metrics, customer insights, product performance |
| **Financial Management** | Cash flow tracking, expense recording, financial reporting, profit analysis |
| **HR Module** | Employee records, document management |
| **Authentication & Security** | JWT tokens, role-based access control (admin/customer roles) |
| **API Documentation** | Swagger/OpenAPI |
| **Multi-Platform Support** | web admin, web customer, iOS/Android mobile customer app, iOS/Android mobile admin app |
| **Browser Compatibility** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Mobile Support** | iOS 14+, Android 10+ |


**In-Scope Features:**

*E-Commerce Module:*
- Complete product catalog with full-text search across name, description, ingredients, benefits, and tags
- Shopping cart with persistent storage and quantity management
- Checkout process with order creation and payment processing
- Order management with status tracking and history
- Inventory management with stock quantity tracking
- Product categorization and filtering by skin type, concerns, and benefits
- Product details including ingredients, usage instructions, and skincare benefits
- Image upload and management for products

*Live Streaming Module:*
- WebSocket-based real-time video streaming infrastructure
- Concurrent viewer support with viewer count tracking
- Real-time chat functionality during streams with message history
- Product pinning during streams with display ordering
- Viewer engagement analytics
- Stream quality options
- Stream recording and archival capabilities
- Stream scheduling and management
- Admin livestream broadcasting from mobile app

*AI Chat Support System:*
- Google Gemini AI integration for conversational responses
- Context-aware dialogue with conversation history management
- Conversational product recommendations based on skin type and concerns
- FAQ management with predefined responses
- Staff escalation workflow for complex queries
- Session management for both authenticated and anonymous users
- Message history persistence

*Skin Study Feature:*
- AI dermatology expert with text-based consultation
- Voice chat with automatic speech-to-text transcription
- Skin image analysis with AI-powered assessment
- Real-time audio streaming for voice interactions
- RAG-based knowledge base with curated dermatology literature
- Chat history management with conversation persistence
- Multi-language support with automatic language detection and translation
- Evidence-based recommendations with source citations
- Integration across web and mobile platforms

*Email Marketing Module:*
- Email campaign creation and management
- Email template design and customization
- Customer segmentation based on purchase history and preferences
- Newsletter subscription management
- Subscriber list management with unsubscribe functionality
- Campaign scheduling and automated sending
- Email analytics (open rates, click rates, conversion tracking)
- Audience targeting and personalization

*Analytics Dashboards:*
- Sales metrics and revenue tracking
- Product performance analysis
- Customer insights and behavior analytics
- Order analytics and trends
- Revenue forecasting and analysis
- Viewer analytics for livestreams
- Email campaign performance metrics
- Conversion rate analysis

*Financial Management Module:*
- Cash flow transaction tracking
- Expense recording and categorization
- Financial reporting and statements
- Profit and loss analysis
- Budget tracking and forecasting
- Transaction history and audit trails

*HR Module:*
- Employee record management
- Department and role management
- Employee document management
- Performance tracking capabilities

*Authentication & Authorization:*
- JWT token-based authentication
- Role-based access control (Admin/Customer roles)
- Secure password hashing with bcryptjs
- Token expiration and refresh mechanisms
- Session management

*API & Documentation:*
- RESTful API with endpoints across route modules
- Swagger/OpenAPI documentation with interactive testing
- Comprehensive API error handling and validation
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests

*Multi-Platform Support:*
- Vue.js web application for admin dashboard
- Vue.js web application for customer interface
- React Native mobile app for customers (iOS 14+, Android 10+) with integrated Skin Study
- React Native mobile app for admin livestream management (iOS 14+, Android 10+)
- Responsive design for desktop, tablet, and mobile devices
- Web browser compatibility: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile support: iOS 14+ and Android 10+

*Database & Infrastructure:*
- MongoDB with Mongoose ORM for data persistence
- Qdrant vector database for RAG implementation
- WebSocket infrastructure for real-time communication
- Docker containerization for deployment
- File upload and storage management
- Database indexing for performance optimization

*Additional Features:*
- Internationalization (i18n) support for multiple languages
- Performance monitoring and optimization
- Security measures including CORS, rate limiting, input validation
- Automated task scheduling with node-cron
- QR code generation for orders and products
- Text-to-speech capabilities for accessibility

**Limitations (Features Excluded):** The project explicitly excludes advanced payment gateway integration beyond basic structure, complex logistics integration with third-party fulfillment systems, AR virtual try-on functionality, social commerce feature integration (social media shopping), advanced marketing automation beyond email segmentation, enterprise multi-tenancy support, video processing effects for live streams, subscription business model implementation, real-time inventory sync with external systems, blockchain integration, advanced recommendation engine using collaborative filtering, machine learning-based customer segmentation, video compression and adaptive bitrate streaming, integration with third-party CRM systems, advanced fraud detection systems, and marketplace functionality allowing multiple sellers.

### 1.6 Report Structure

This report proceeds as follows: Section 2 elaborates upon the problem statement and market context; Section 3 presents the proposed development methodology and technological architecture; Sections 4–6 detail the implementation plan, feasibility analysis, and evaluation criteria; and Section 7 concludes with discussion of project outcomes and contributions to both academic and practitioner communities.

---

## 2. Background and Literature Review

### 2.1 Introduction

This chapter establishes the theoretical and practical context for Wrencos through critical examination of existing literature, competing solutions, and technological trends. The purpose is to justify the project's necessity by demonstrating gaps in current market offerings and technological feasibility of the proposed integration. The review focuses on e-commerce platforms and live streaming commerce released within the last decade, with specific emphasis on solutions designed for small to medium-sized beauty businesses. Particular attention addresses how modern technologies enable integration previously requiring enterprise-scale investment. Sources derive from academic databases including Scopus and Web of Science, industry research reports from Gartner and McKinsey, and analysis of current market-leading platforms including Shopify, WooCommerce, and Adobe Commerce, ensuring credibility through triangulation across academic and practitioner perspectives.

### 2.2 Problem Domain Analysis

**Historical Context and Current Trends:** 
E-commerce began with early digital transactions like EDI in the 1970s and expanded with the internet and platforms such as Amazon and eBay (Zwass, 2016). Broadband, smartphones, and digital payments in the 2000s shifted consumers toward mobile and social commerce, where consumers could be influenced by friends and influencers, discover products instantly, and complete a secure purchase within seconds (Gao, Waechter and Bai, 2018). Cloud computing, AI, and data analytics in the 2010s–2020s enabled personalization, efficient logistics, and omnichannel retail, a seamless integration of online, mobile, and physical touchpoints for a unified customer journey (Cakir et al., 2021). Beauty retail historically remained offline-dominant; the COVID-19 pandemic forced digital transformation, compelling brands to innovate online engagement mechanisms (Roggeveen & Srivastava, 2020). Live streaming commerce emerged from China's e-commerce infrastructure, demonstrating 10-15 times higher conversion rates than traditional e-commerce (McKinsey, 2021), with expansion throughout Asia-Pacific markets (Zhang et al., 2020). Global e-commerce reached $5.7 trillion in 2023, with success increasingly driven by interactive, personalized experiences (eMarketer, 2024). In particular, live stream commerce has surged, especially in markets like China, because the interactivity and “social presence” significantly boost purchase intentions (Roseli, Hasan & Sauid, 2023). Meanwhile, artificial intelligence advanced substantially; machine learning technologies now enable personalized recommendation systems addressing sensory deficits in online beauty retail (Nilashi et al., 2019). AI personalization has improved conversion rates by building trust, satisfaction, and loyalty (Hassan, Abdelraouf & El Shihy, 2025). Companies that fail to adapt to these trends may lose competitiveness and miss out on the conversion and retention gains that modern consumers expect.

Business management tools evolved from siloed, function-specific systems (accounting, marketing, analytics, HR) that created operational inefficiencies and cumulative costs for SMEs (Nolan & McFarlan, 2005). Traditional ERP implementations (SAP, Oracle) required USD 1–5 million investment, rendering them inaccessible to SMEs (Markus & Tanis, 2000). Cloud computing and SaaS models transformed this landscape, enabling SMEs to access enterprise-grade functionality at affordable subscription costs (USD 50–500 monthly) (Venkatraman, 2017). However, the 2015–2020 proliferation of specialized platforms (Klaviyo, Mixpanel) recreated fragmentation at SaaS scale, with SMEs managing 5–8 disconnected platforms incurring switching costs and inefficiencies (Forrester, 2023). The 2020–2025 period emphasizes integration and consolidation, driven by COVID-19 remote work adoption and matured AI/ML capabilities for predictive analytics, automated accounting, and customer segmentation (Makridakis et al., 2018; Kokina & Davenport, 2017). Modern platforms (HubSpot, Zoho, Pipedrive) combine e-commerce, CRM, marketing, accounting, and analytics (Gartner, 2024), yet gaps persist: most lack native e-commerce for beauty retail, industry-specific reporting, beauty-specific KPIs, live streaming integration, and robust HR capabilities (McKinsey, 2023).

Dermatological consultation has evolved from traditional in-person visual exams and photographic documentation to technology-supported diagnostic approaches, with precision significantly enhanced by the adoption of digital imaging and dermoscopy (Tschandl et al., 2019). The past decade brought a major shift with teledermatology, enabling remote triage and specialist access via store-and-forward and live video consultations (Giavina-Bianchi et al., 2020; Kovarik et al., 2022). More recently, Artificial Intelligence (AI) and mobile health tools have further transformed care, supporting improved accuracy and scalable access (Finlayson et al., 2021), with deep learning accurately classifying skin cancer (Esteva et al., 2017). The global digital health market, projected to exceed $639 billion by 2026 (Statista, 2024), was accelerated by the COVID-19 pandemic, which saw telehealth consultations increase 38-fold in 2020 (McKinsey, 2023). Dermatology, being visually oriented, is highly suited for this transition, achieving diagnostic accuracy comparable to in-person visits (Dinnes et al., 2018). 

**Key Concepts and Terminology:** E-commerce encompasses digital transaction infrastructure mediated through product catalogs and shopping carts. Live streaming commerce represents synchronous video broadcasting where sellers demonstrate products in real-time while viewers engage through integrated chat and purchasing mechanisms. Sensory deficit (Dholakia et al., 2010) describes the absence of multisensory product evaluation in online retail, particularly acute in beauty retail where texture, scent, and colour matching inform purchasing confidence. AI personalization employs machine learning to recommend products, customize content, and tailor offers (Jiang et al., 2019), substantially improving conversion rates. Business management tools for e-commerce, marketing, accounting, analytics, and operations are software systems that help businesses streamline online sales, automate promotion and financial tasks, monitor performance data, and manage day-to-day processes efficiently.

Teledermatology refers to delivering dermatology consultations remotely through digital communication tools, while real-time diagnostic capability describes a system’s ability to provide immediate clinical assessment during live interactions. AI dermatology classification involves machine learning models that identify skin conditions from images, supported by clinical-grade datasets such as HAM10000 that enable robust training and validation. Differential diagnosis systems use AI to evaluate multiple possible conditions and suggest the most likely one. Fairness evaluation in AI assesses whether these systems perform consistently across demographics, such as different skin tones, to prevent biased outcomes in real-world use.

**Significance and Impact:** The beauty e-commerce market, valued at USD 120 billion in 2024, demonstrates 15% compound annual growth projecting USD 200 billion by 2027 (Statista, 2024). However, growth concentrates among large enterprises; approximately 70% of SMEs utilize five to eight disconnected platforms incurring USD 500–3,000 monthly operational costs (Forrester, 2023). Beauty return rates exceed 40%, substantially higher than general e-commerce averages, indicating inadequate consumer confidence (NPD Group, 2023). Personalized recommendations achieve 15–20% conversion rates versus 5% for generic algorithms (Jiang et al., 2019). Live-streaming commerce remains more mature in Asia-Pacific, representing a growing but under-penetrated opportunity in Western markets: adoption in the U.S. and Europe is accelerating (Luo et al., 2023; Haidar, 2024), and although usage is lower than in China, early adopters in the West cite entertainment and real-time engagement as key motivations (McKinsey, 2023). The gap between accessible but limited platforms and expensive enterprise solutions represents significant market opportunity for integrated mid-market solutions. With dermatological consultation, despite market growth (at $8.9 billion in 2023, Grand View Research, 2024), the traditional model faces limitations like long wait times (Resneck et al., 2021) and geographic barriers. While AI requires careful validation for clinical use (Char et al., 2020), its potential for non-diagnostic, personalized consumer skincare education remains a significant, underexplored opportunity.


### 2.3 Critical Review of Existing Solutions

**Identification of Competitors**

This analysis examines four primary competitors representing distinct market segments within the beauty e-commerce and business management landscape. Shopify represents the dominant general-purpose e-commerce platform utilised by approximately 4.2 million businesses globally (Shopify, 2024). WooCommerce serves as the open-source alternative, powering approximately 42% of all e-commerce websites (W3Techs, 2024). Adobe Commerce (formerly Magento) represents the enterprise-grade solution targeting large retailers with substantial technical resources. Lastly, Sephora's proprietary platform exemplifies a vertically-integrated beauty-specific solution developed by a major incumbent retailer, providing a benchmark for beauty-specific feature engineering and user experience optimisation.

**Comparison Matrix**

| Feature / Aspect | Shopify | WooCommerce | Adobe Commerce | Sephora Platform | Wrencos (Proposed) |
|---|---|---|---|---|---|
| **Target Audience** | SMEs to mid-market retailers | Technical SMEs and developers | Enterprise retailers | Beauty consumers (premium focus) | SME beauty retailers and beauty consumers |
| **Core Technology** | Proprietary SaaS cloud platform | WordPress plugin (open-source) | Enterprise Java-based system | Proprietary web + mobile platform | Node.js/Vue.js/React Native full-stack |
| **E-Commerce Functionality** | Comprehensive product catalog, cart, checkout | Full e-commerce suite | Advanced inventory, multi-channel | Luxury product focus | Complete e-commerce with beauty-specific attributes |
| **Live Streaming Commerce** | Third-party integrations only | Requires plugins | Limited native support | Integrated livestream shopping | Native WebSocket-based livestream; admin can broadcast via web and mobile; customers can view on web and mobile |
| **AI Personalization** | Third-party apps (Klaviyo, Kenshoo) | Plugin-based solutions | Limited native AI | Proprietary recommendation engine | Native Google Gemini integration |
| **Business Management Tools** | Accounting, analytics, basic HR | Requires multiple plugins | Integrated ERP capabilities | Limited business tools | Integrated accounting, HR, analytics, email marketing |
| **Dermatology/Skincare Consultation** | None | None | None | Sephora Virtual Artist (makeup only) | AI dermatology expert with text, voice, image analysis, and live chat; RAG over curated dermatology literature/textbooks with citations |
| **Multi-Platform Support** | Web only | Web only | Web only | Web + iOS/Android mobile | Web (admin/customer) + iOS/Android mobile (customer/admin) |
| **Implementation Cost** | USD 29–299/month SaaS | USD 0–500/month (hosting + plugins) | USD 100,000–500,000+ | Proprietary (not available) | Affordable cloud deployment |
| **Technical Barrier to Entry** | Low (no coding required) | High (requires WordPress/PHP knowledge) | Very high (requires enterprise IT) | N/A (consumer-facing only) | Low to medium (managed cloud deployment) |
| **Customization Flexibility** | Limited (app ecosystem) | High (open-source) | Very high (enterprise customization) | None (proprietary) | High (open-source architecture) |
| **Strengths** | Ease of use, extensive app ecosystem, global payment support | Complete control, no vendor lock-in, cost-effective | Scalability, advanced features, multi-channel orchestration | Luxury brand positioning, integrated beauty expertise, mobile-first UX | Integrated beauty-specific features, native livestream, dermatology consultation, unified business management |
| **Weaknesses** | Fragmented ecosystem (5–8 apps needed), limited livestream, no AI dermatology, high cumulative costs for SMEs | Requires technical expertise, fragmented plugin ecosystem, poor user experience for non-technical users, no native livestream | Prohibitive cost excludes SMEs, steep learning curve, overkill for small retailers | Not accessible to independent retailers, proprietary ecosystem, limited to Sephora products | Early-stage platform, smaller ecosystem than incumbents, requires validation in market |

**Written Analysis**

The comparison matrix reveals a critical market segmentation failure: no existing solution adequately serves the SME beauty retailer segment with integrated functionality at accessible pricing. Shopify dominates the SME market through exceptional ease-of-use and comprehensive app ecosystem; however, this accessibility comes at a cumulative cost burden. Whilst Shopify's base subscription begins at USD 29 monthly, achieving feature parity with Wrencos requires supplementary applications: Klaviyo for email marketing (USD 20–1,250 monthly depending on subscriber count), Kenshoo or Nosto for AI personalization (USD 500–5,000 monthly), Twitch or YouTube integration for livestreaming (requiring external platform management), and third-party accounting tools such as Xero or QuickBooks (USD 15–50 monthly). This fragmentation results in cumulative monthly costs of USD 600–7,000, creating substantial switching costs and operational complexity through disconnected data systems (Forrester, 2023). Critically, Shopify provides no native dermatology consultation capability, leaving beauty retailers unable to address the sensory deficit challenge through personalized skincare guidance.

WooCommerce offers technical flexibility and cost advantages through open-source architecture; however, this flexibility imposes substantial implementation barriers. WooCommerce requires WordPress hosting, PHP development expertise, and manual integration of numerous plugins to achieve basic functionality (Alkhayat et al., 2021). Non-technical business owners face prohibitive learning curves; even basic customization requires developer engagement, incurring USD 50–150 hourly consulting costs. The plugin ecosystem, whilst extensive, exhibits quality inconsistency and compatibility fragmentation; plugins frequently conflict, creating maintenance burdens and security vulnerabilities (Gartner, 2024). Livestreaming integration requires custom development or unreliable third-party plugins, and AI personalization remains unavailable without substantial custom development investment. For SME beauty retailers lacking technical resources, WooCommerce's theoretical flexibility becomes practically inaccessible.

Adobe Commerce represents the opposite extreme: comprehensive functionality and enterprise-grade scalability at implementation costs exceeding USD 100,000–500,000 (BuiltWith, 2024). This investment magnitude renders Adobe Commerce economically inaccessible to the SME segment; a business generating USD 500,000 annual revenue cannot justify six-figure platform investment. Adobe Commerce's architecture, whilst powerful, introduces complexity inappropriate for small teams; the platform requires dedicated IT staff, specialized training, and ongoing professional services engagement. The value proposition—multi-channel orchestration, advanced inventory management, sophisticated analytics—addresses enterprise requirements but overspecifies SME needs. Consequently, Adobe Commerce captures only large retailers, leaving the SME segment underserved.

Sephora's proprietary platform exemplifies beauty-specific feature engineering and omnichannel user experience design; the platform integrates web and mobile interfaces (iOS/Android) with Sephora Virtual Artist for makeup visualization, personalized product recommendations, and seamless shopping across channels. Sephora serves general beauty consumers with premium brand curation, offering comprehensive e-commerce functionality and sophisticated recommendation engines. However, Sephora's platform remains proprietary and inaccessible to independent retailers; the platform exclusively serves Sephora's corporate ecosystem and cannot be licensed or deployed by external businesses. Critically, Sephora provides no business management tools (accounting, HR, analytics) for retailers, as it operates as a consumer-facing platform only. This vertical integration, whilst enabling superior user experience optimization and beauty expertise, creates a closed ecosystem preventing SME adoption. Independent beauty retailers cannot access Sephora's technological capabilities or business management infrastructure, creating a competitive disadvantage relative to Sephora's direct-to-consumer operations.

Wrencos directly addresses these identified gaps through deliberate architectural choices for two audiences: SME beauty retailers (admin) and beauty consumers (customer). Unlike Shopify's fragmented ecosystem approach, Wrencos integrates e-commerce, livestreaming, AI personalization, business management, and an AI dermatology consultation into a unified platform, reducing cumulative subscription costs and eliminating data fragmentation. Unlike WooCommerce's technical complexity, Wrencos provides managed cloud deployment with intuitive interfaces accessible to non-technical business owners, reducing implementation barriers. Unlike Adobe Commerce's enterprise focus, Wrencos targets the SME segment with affordable pricing and feature scope appropriate to small team capacity. Unlike Sephora's proprietary consumer ecosystem, Wrencos operates as an open, accessible platform enabling independent beauty retailers to compete through technology previously available only to large enterprises.

Wrencos further differentiates on beauty-specific intelligence and omnichannel reach. Its AI dermatology expert supports text and real-time voice chat (gTTS supports 100+ languages with auto-detection), image-based skin analysis, grounded in curated dermatology literature via retrieval-augmented generation with cited sources—customers can ask any skincare or dermatology question and receive evidence-based guidance. For livestream commerce, admins can broadcast from both web and the mobile admin app, and consumers can view and purchase from both web and the customer mobile app, with product pinning and real-time chat. This positioning fills the identified market gap: integrated functionality, SME-appropriate accessibility, dual-sided value (retailer and consumer), beauty-specific feature engineering, and affordable pricing that collectively address platform fragmentation and unlock personalization-driven engagement previously inaccessible to small retailers.

### 2.4 Critical Review of Enabling Technologies and Methodologies

**Frontend Framework Selection:** Frontend architecture decisions balance developer productivity, performance, and ecosystem maturity. Vue.js was selected over React despite React's larger ecosystem dominance. React emphasizes component-based architecture with advanced state management capabilities; however, React's steep learning curve and verbose syntax create accessibility barriers for smaller development teams (Haitz et al., 2023). Vue.js provides lower barriers to entry through intuitive template syntax and progressive enhancement capabilities (Biørn-Hansen et al., 2018). For Wrencos's beauty-focused UI requirements—product filters, real-time cart updates, complex recommendation displays—Vue.js's Composition API provides superior code organization through composable functions without the complexity of React's hooks paradigm, reducing development time and cognitive overhead (Majchrzak et al., 2020). Vue-router handles navigation between customer and admin interfaces; Axios manages API communication; Chart.js provides dashboard visualizations; Vue-i18n enables multi-language support.

**Backend Technology Justification:** Node.js with Express.js was selected for backend development over Python alternatives (Django/Flask) based on event-driven architecture suitability and development velocity. Python frameworks excel at rapid prototyping but impose architectural constraints for real-time systems; Node.js's non-blocking I/O model naturally accommodates concurrent WebSocket connections essential for live streaming and real-time notifications without explicit threading management (Tilkov & Vinoski, 2010). Node.js demonstrates substantial performance advantages for I/O-heavy operations; Netflix achieved 70% startup time reduction through Node.js adoption (Netflix Tech Blog, 2023), demonstrating scalability for systems managing multiple concurrent connections. Express.js provides minimal middleware abstraction enabling rapid API endpoint development whilst maintaining full control over real-time communication infrastructure, critical for custom WebSocket implementation. Express middleware components—body-parser, cors, express-rate-limit, express-validator, morgan, multer—handle cross-cutting concerns without framework-imposed patterns.

**Database Architecture:** MongoDB was selected over relational databases (PostgreSQL, MySQL) based on schema flexibility requirements. While relational databases ensure ACID compliance and enforce data integrity through structured schemas, Wrencos's iterative development approach requires rapid data model evolution without downtime-inducing migrations (Abadi & Stonebraker, 2009). MongoDB's document-oriented model accommodates flexible beauty product attributes (varied ingredient lists, multiple skin concerns, customizable recommendations) without schema rigidity. Mongoose ORM provides schema validation and type safety whilst enabling schema flexibility. Product data exhibits semi-structured characteristics; beauty items require diverse attributes—some products include allergen information whilst others emphasize natural ingredients, requiring schema flexibility unavailable in relational systems. MongoDB enables rapid schema changes supporting product catalog evolution throughout 10-month development without deployment disruptions. Document-oriented storage aligns with application object models (Product, User, Order, LiveStream, ChatMessage, AnalyticsData objects directly map to MongoDB documents), reducing impedance mismatch and facilitating rapid prototyping. Complementing MongoDB, Wrencos employs a vector database (Qdrant) for the AI dermatology expert to store dense embeddings of curated dermatology literature and guidance, enabling retrieval-augmented generation (RAG) with citation-backed, semantically relevant responses at interactive latencies. This polyglot persistence separates the system of record (MongoDB) from the similarity search layer (Qdrant), which uses approximate nearest neighbour indexing (e.g., HNSW; Malkov & Yashunin, 2018) and vector search libraries such as Qdrant (Johnson, Douze & Jégou, 2017) to achieve efficient top-k retrieval (Lewis et al., 2020; Karpukhin et al., 2020).

**Mobile Development Approach:** React Native with Expo was selected for cross-platform delivery, reducing native effort by approximately 50% versus separate iOS/Android builds (Gartner, 2023). React Native enables single JavaScript codebase targeting iOS 14+ and Android 10+ platforms, critical for solo developer resource constraints whilst maintaining platform-specific performance and user experience expectations. Expo simplifies development environment setup, eliminates native compilation requirements, and provides rapid testing through over-the-air updates, substantially accelerating development velocity (Kieras, 2020). React Navigation provides industry-standard navigation patterns (stack, tab, drawer); AsyncStorage persists auth tokens, preferences and chat sessions; react-native-render-html renders formatted AI responses. For livestream commerce, the admin mobile app uses react-native-agora with live broadcasting profile and Broadcaster role, front-camera preview, and secure token issuance from the backend; customers use react-native-agora Viewer to join as Audience with backend-issued tokens, ensuring consistent web/mobile parity. For the Skin Study feature, the customer app records audio via expo-av and sends it to the backend for Gemini transcription; AI responses are spoken aloud using expo-av audio playback of MP3 generated by a backend TTS service (gTTS/node-gtts) with automatic language detection and support for 100+ languages, streamed sentence-by-sentence for fast perceived latency. Text chat and live voice chat share the same REST endpoints (/api/ai-dermatology-expert/chat, /transcribe, /text-to-speech), enabling synchronized multimodal interaction across devices.

**Development Methodology:** Agile development was selected over Waterfall methodology based on requirement volatility and stakeholder feedback incorporation. Beauty e-commerce requirements exhibit substantial uncertainty regarding AI personalisation effectiveness, user experience preferences, and live streaming engagement patterns. Waterfall methodology's upfront planning and sequential phase execution prevents requirement adjustment once implementation commences; Agile's iterative two-week sprints enable requirement refinement through working prototype evaluation, testing, and stakeholder feedback (Beck et al., 2001; Abrahamsson et al., 2009). Agile practices—continuous integration through daily commits, automated testing frameworks, sprint-based delivery increments—enable early risk identification and course correction, essential for novel technology integration (live streaming, Gemini AI, WebSocket real-time systems) where technical challenges frequently emerge during implementation rather than planning phases.

### 2.5 Summary and Identification of the Research Gap

**Synthesis of Findings:** The market analysis and literature collectively indicate a sustained shift toward interactive, personalised, omnichannel commerce in beauty, alongside persistent SME operational fragmentation and consumer trust barriers. Live-stream commerce delivers substantially higher engagement than conventional e-commerce (McKinsey, 2021), machine learning enables effective personalisation (Nilashi et al., 2019), AI personalisation materially lifts conversion (Jiang et al., 2019), WebSocket infrastructure supports real-time streaming (Luo et al., 2023), and cloud-native architectures enable cost-effective scalability (Netflix Tech Blog, 2023). The competitive review shows that Shopify relies on a fragmented app stack with cumulative costs, WooCommerce imposes technical burden, Adobe Commerce is priced and engineered for enterprises, and Sephora’s platform is proprietary and consumer-facing. The technology review confirms feasibility: a Node/Express stack with WebSockets/Agora supports real-time livestreaming, Vue enables rapid multi-surface UIs, MongoDB provides schema flexibility for rich beauty attributes, and a Qdrant vector database with Gemini embeddings enables RAG-backed dermatology guidance; React Native apps deliver admin broadcasting and consumer viewing, while backend gTTS provides multilingual speech for AI responses, aligning with Wrencos’s dual audience of SME beauty retailers and beauty consumers.

**Explicit Statement of the Research Gap:** In summary, the literature and competitive review identify a clear gap: there is no single, SME-accessible platform that unifies full e-commerce, native live-stream commerce across web and mobile, AI dermatology consultation with text, voice with multilingual speech and image analysis grounded in cited dermatology literature via retrieval-augmented generation, and integrated business management (ecommerce, analytics, accounting, HR, email marketing) in one coherent, modern stack. Existing tools are either fragmented and cumulatively costly (Shopify) (Forrester, 2023), technically burdensome for non-technical owners (WooCommerce) (Alkhayat et al., 2021), enterprise-priced and over-specified (Adobe Commerce) (BuiltWith, 2024), or proprietary consumer platforms that are inaccessible to independent retailers (Sephora). This gap represents a market inefficiency: customers demand integrated solutions whilst supply remains fragmented, imposing cumulative switching costs, workflow inefficiencies, and missed opportunity for personalisation-driven conversion improvements.

**Project Positioning:** Therefore, Wrencos will fill this gap by delivering an integrated, SME‑oriented, cross‑platform ecosystem that serves both SME beauty retailers and beauty consumers. The platform delivers three distinct value propositions: operational consolidation reducing platform fragmentation and associated costs; personalisation-driven engagement leveraging AI and live streaming to address beauty retail's sensory deficit challenge; AI dermatology expert accessibility through intuitive interfaces, and affordable pricing enabling technical adoption without expert consultation. The architecture combines a Node.js/Express real‑time backend with WebSockets and Agora for native livestream commerce; Vue web apps for admin and customer; React Native mobile apps for admin and customer; Google Gemini AI for context-aware product recommendations based on skin type and concerns; MongoDB for operational data; and a Qdrant vector database with Gemini embeddings powering an AI dermatology expert that supports text and real‑time voice chat, image analysis, and citation‑backed guidance via RAG. Built‑in business management (ecommerce, analytics, accounting, HR, email marketing) and backend gTTS for multilingual speech output reduce fragmentation and total cost of ownership while improving accessibility. This design provides integrated functionality, beauty‑specific intelligence, and omnichannel reach in a modern, user‑friendly package aligned with the needs and constraints of SMEs.


---

## References

Alkhayat, G., Metwally, R. M., & Al-Dhanhani, S. (2021). The effect of social commerce on customer satisfaction and loyalty: The role of trust and user experience. *SAGE Open*, 11(1), 21582440211014396.

BuiltWith. (2024). Content management system market share. Available at: https://trends.builtwith.com/cms

Forrester. (2023). State of technology adoption for SMB retailers. Cambridge, MA: Forrester Research.

Gartner. (2024). Magic Quadrant for e-commerce platforms. Stamford, CT: Gartner Inc.

Shopify. (2024). Shopify global merchant count. Available at: https://www.shopify.com

W3Techs. (2024). Usage statistics of WordPress. Available at: https://w3techs.com/technologies/details/cm-wordpress

Kokina, J. and Davenport, T.H. (2017) 'The emergence of artificial intelligence: How automation is changing accounting', Journal of Emerging Technologies in Accounting, 14(1), pp. 115–122.

Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2018) 'Statistical and machine learning forecasting methods: Concerns and ways forward', PLOS ONE, 13(3), e0194889.

Markus, M.L. and Tanis, C. (2000) 'The enterprise system experience—from adoption to success', in Zmud, R.W. (ed.) Framing the domains of IT research: Glimpsing the future through the past. Cincinnati: Pinnaflex Educational Resources, pp. 173–207.

McKinsey (2023) 'The state of AI in 2023: Generative AI and the future of work'. New York: McKinsey & Company.

Nolan, R.L. and McFarlan, F.W. (2005) 'Information technology and the board of directors', Harvard Business Review, 83(10), pp. 96–106.

Venkatraman, N. (2017) 'The digital business imperative: Embrace change and thrive', Harvard Business Review Press.

Gao, L., Waechter, K.A. and Bai, X. (2018) ‘Understanding consumers’ continuance intention towards mobile purchase’, International Journal of Information Management, 41, pp. 1–13.

Zwass, V. (2016) ‘Electronic commerce: Structures and issues’, International Journal of Electronic Commerce, 20(1), pp. 3–10.

Cakir, E., Yildirim, S. & Celik, C., 2021. Omnichannel retailing: Integration of offline and online channels for sustainable competitive advantage. International Journal of Retail & Distribution Management, 49(5), pp.657–677.

eMarketer (2024) 'Global e-commerce sales 2024: Worldwide data & statistics'. Available at: https://www.emarketer.com (Accessed: 16 November 2024).

Roseli, M., Hasan, R. & Sauid, S., 2023. The effect of live-stream commerce on purchase intention: Moderating role of social presence. Sustainability, 15(4), 3571. 

Finlayson, S.G. et al. (2021) ‘The dermatologist’s perspective on artificial intelligence in dermatology’, JAMA Dermatology, 157(1), pp. 84–91.

Giavina-Bianchi, M. et al. (2020) ‘Teledermatology reduces dermatology referrals and improves access to specialists’, Journal of the American Academy of Dermatology, 83(1), pp. 159–161.

Kovarik, C.L. et al. (2022) ‘Teledermatology: A review of reliability and applications’, Current Dermatology Reports, 11, pp. 1–10.

Tschandl, P. et al. (2019) ‘Expert-level diagnosis of non-pigmented skin cancer by combined convolutional neural networks’, Nature Medicine, 25(5), pp. 845–851.

Char, D.S., Shah, N.H. and Magnus, D. (2020) 'Implementing machine learning in health care—addressing the problems', JAMA Internal Medicine, 180(4), pp. 524-525.

Dinnes, J., Deeks, J.J., Chuang, L.H., Matin, R., Thomson, D.R., Wong, K.Y., Aldridge, L., Cameron, E., Chen, T., Humanick, R. and Takwoingi, Y. (2018) 'Dermoscopy, tape stripping, optical coherence tomography and other noninvasive diagnostic techniques for melanoma of the skin: A systematic review and meta-analysis', British Journal of Dermatology, 179(1), pp. 48-69.

Esteva, A., Kuprel, B., Novoa, R.A., Ko, J., Swetter, S.M., Blau, H.M. and Thrun, S. (2017) 'Dermatologist-level classification of skin cancer with deep neural networks', Nature Medicine, 23(12), pp. 1301-1309.

Grand View Research (2024) 'Teledermatology market size, share & trends analysis report by application, by end-use, by region, and segment forecasts, 2024-2030'. Available at: https://www.grandviewresearch.com (Accessed: 16 November 2024).

McKinsey (2023) 'Telehealth: A quarter-trillion-dollar post-COVID legacy'. Available at: https://www.mckinsey.com (Accessed: 16 November 2024).

Resneck, J.S., Asnath, C., Abuabara, K., Aucott, J., Austin, M., Basu, T., Bindman, A.B., Butler, D.C., Chernyshov, P.V., Cox, R. and Curiel-Lewandrowski, C. (2021) 'Dermatology care access updated recommendations', Journal of the American Academy of Dermatology, 84(4), pp. 1015-1025.

Statista (2024) 'Digital health market worldwide'. Available at: https://www.statista.com (Accessed: 16 November 2024).

Daneshjou, R., Vodrahalli, K., Novoa, R., Jenkins, M., Rotemberg, V. and Zou, J. (2022) 'Disparities in dermatology AI performance on a diverse, real-world dataset', Science Advances, 8(34), eabq6147. doi:10.1126/sciadv.abq6147.

Federman, D. G., Concato, J., & Kirsner, R. S. (2003). Comparison of dermatologic diagnoses by primary care practitioners and dermatologists: A meta-analytic review. *Journal of the American Academy of Dermatology*, 49(4), 498–506.

Liu, Y., Jain, A., Eng, C., Way, D.H., Lee, K., Bui, P., Kanada, K., de Oliveira Marinho, G., Gallegos, J., Gabriele, S., Nguyen, M., Gupta, V., Natarajan, V., Huang, S.J., Turakhia, M.P., Ladapo, J.A., Ng, A.Y. and Coz, D. (2020) 'A deep learning system for differential diagnosis of skin diseases', Nature Medicine, 26(6), pp. 900–908. doi:10.1038/s41591-020-0842-3.

Tschandl, P., Rosendahl, C. and Kittler, H. (2018) 'The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions', Scientific Data, 5, 180161. doi:10.1038/sdata.2018.161.

Warshaw, E. M., Hillman, Y. J., Greer, N. L., Hagel, E. M., MacDonald, R., Herrera, V., & Wilt, T. J. (2011). Teledermatology for diagnosis and management of skin conditions: A systematic review. *Journal of the American Academy of Dermatology*, 64(4), 759–772.

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-T., Rocktäschel, T., Riedel, S. and Kiela, D. (2020) ‘Retrieval-augmented generation for knowledge-intensive NLP’, Advances in Neural Information Processing Systems, 33, pp. 9459–9474.

Karpukhin, V., Oguz, B., Min, S., Lewis, P., Wu, L., Edunov, S., Chen, D. and Yih, W.-T. (2020) 'Dense passage retrieval for open-domain question answering', Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 6769–6781.

Johnson, J., Douze, M. and Jégou, H. (2017) 'Billion-scale similarity search with GPUs', arXiv preprint arXiv:1702.08734.

Malkov, Y.A. and Yashunin, D.A. (2018) 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs', IEEE Transactions on Pattern Analysis and Machine Intelligence, 42(4), pp. 824–836.

Dholakia, U. M., Kahn, B. E., Reeves, R. J., & Rindfleisch, A. (2010). Consumer satisfaction and delight: The role of personal and situational influences. *Journal of Business Research*, 63(1), 1–9.

Forrester. (2023). State of technology adoption for SMB retailers. Cambridge, MA: Forrester Research.

Alkhayat, G., Metwally, R. M., & Al-Dhanhani, S. (2021). The effect of social commerce on customer satisfaction and loyalty: The role of trust and user experience. *SAGE Open*, 11(1), 21582440211014396.

BuiltWith. (2024). Content management system market share. Available at: https://trends.builtwith.com/cms

Jiang, Z., Jain, S., Song, H. & Song, Y. (2019). Information asymmetry, disclosure and the cost of equity capital around earnings announcements. *Journal of Contemporary Accounting & Economics*, 15(3), 100137.

Luo, X., Lim, W. M., Cheah, J.-H., Lim, X.-J. & Dwivedi, Y. K. (2023). Live streaming commerce: A review and research agenda. *Journal of Computer Information Systems*, 63(2), 1–18. doi: 10.1080/08874417.2023.2290574

McKinsey. (2021). How to win in live shopping. New York: McKinsey & Company.

McKinsey. (2023). Ready for prime time? The state of live commerce. New York: McKinsey & Company.

Nilashi, M., Ibrahim, O., Bagherifard, K., Alizadeh, A., & Samad, S. (2019). Recommendation system for tourism using machine learning and sentiment analysis. *Journal of Computing in Civil Engineering*, 33(2), 04019003.

NPD Group. (2023). U.S. beauty returns analysis. Port Washington, NY: NPD Group.

Roggeveen, A. L., & Srivastava, J. (2020). Marketing lessons from COVID-19. *Journal of the Academy of Marketing Science*, 48, 539–544.

Statista. (2024). Global beauty and personal care market size. Hamburg: Statista GmbH.

Zhang, X., Gao, S., Guo, H., & Liu, G. (2020). Understanding the acceptance of mobile payment in the Chinese market: An empirical study. *Information Systems Frontiers*, 22(2), 247–261.

Luo, X., Lim, W. M., Cheah, J.-H., Lim, X.-J. & Dwivedi, Y. K. (2023). Live streaming commerce: A review and research agenda. *Journal of Computer Information Systems*, 63(2), 1–18. doi: 10.1080/08874417.2023.2290574

Haidar, M. (2024) Challenges and Opportunities of Live Stream Selling. [online] Available at: (DIVA portal)

Abadi, D., & Stonebraker, M. (2009). The virtues of column stores for databases. *IEEE Data Engineering Bulletin*, 32(2), 1–8.

Abrahamsson, P., Salo, O., Ronkainen, J., & Warsta, J. (2009). Agile software development methods: Review and analysis. *VTT Publications*, 478, 1–112.

Beck, K., Beedle, M., Van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). Manifesto for agile software development. Available at: http://agilemanifesto.org

Gartner. (2023). Magic Quadrant for mobile app development platforms. Stamford, CT: Gartner Inc.

Haitz, S., Goedicke, M., & Sripada, V. (2023). JavaScript framework comparison: Evaluating React, Vue, and Angular for enterprise applications. *Journal of Software Engineering Research and Development*, 11(1), 1–15.

Kieras, D. (2020). React Native versus native development: A performance and usability analysis. *Mobile Information Systems*, 2020, 1–18.

Majchrzak, T. A., Biørn-Hansen, A., & Grønli, T.-M. (2020). Comprehensive analysis of adaptive web applications: Old problems, new challenges, and emerging solutions. *Mobile Information Systems*, 2020, 1–26.

Netflix Tech Blog. (2023). Netflix's journey with Node.js. Available at: https://netflixtechblog.com

Biørn-Hansen, A., Grønli, T.-M., & Gsinlatham, G. (2018). Progressive web apps: The definitive guide to web application development. *Multimedia Tools and Applications*, 77(24), 32357–32391.

Tilkov, S., & Vinoski, S. (2010). Node.js: Using JavaScript to build high-performance network programs. *IEEE Internet Computing*, 14(6), 80–83.

You, E. (2019). Vue.js 3 composition API and TypeScript: Improving code organization and type safety in large-scale applications. *O'Reilly Media*, 1–45.



---

**Word Count:  words**
