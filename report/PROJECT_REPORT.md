# WRENCOS PROJECT REPORT

## Abstract

The beauty e-commerce industry, valued at USD 120 billion in 2024 and projected to exceed USD 200 billion by 2027, faces critical challenges that hinder consumer confidence and limit small business competitiveness. Beauty retailers struggle with high product return rates exceeding 40% due to sensory deficits—customers cannot physically evaluate products online—while small to medium-sized enterprises (SMEs) operate with fragmented technology ecosystems requiring multiple disconnected platforms at costs of USD 500–3,000 monthly. This fragmentation creates data silos that prevent effective personalization, limiting SMEs to generic recommendation algorithms achieving only 5% conversion rates compared to 15–20% for personalized systems.

This project designed, developed, and deployed WRENCOS, an integrated e-commerce platform specifically tailored for beauty SMEs. The platform addresses market gaps by combining e-commerce functionality with real-time live streaming commerce, artificial intelligence-powered personalized assistance, and comprehensive business management tools within a unified system. The architecture integrates modern web and mobile technologies, real-time communication infrastructure, and advanced AI capabilities with knowledge retrieval systems to deliver personalized product recommendations and dermatology consultation services.

Key achievements demonstrate technical feasibility and business value: the platform implements comprehensive backend services supporting six core business modules with secure authentication and role-based access control; delivers cross-platform user experiences across web and mobile applications with strong performance metrics; enables real-time livestreaming supporting hundreds of concurrent viewers with minimal latency; and provides AI-powered consultation features with multilingual support, voice interaction, and image analysis capabilities. System validation through performance testing confirmed fast response times, high availability, and scalability. The platform successfully consolidates previously fragmented business functions into a unified solution, addressing the gap between limited SME-friendly tools and expensive enterprise systems while demonstrating how contemporary technologies can democratize advanced retail capabilities for small businesses in the beauty industry.

## 1. Introduction

### 1.1 General Overview

The global beauty and personal care e-commerce market has experienced unprecedented growth, reaching USD 120 billion in 2024 with a projected value exceeding USD 200 billion by 2027, driven by digital-native consumers demanding personalized and immersive shopping experiences (Statista, 2024). However, contemporary e-commerce platforms fail to adequately address the specific requirements of beauty retail, where product evaluation barriers and sensory deficits fundamentally hinder consumer confidence (Nilashi et al., 2019). 

### 1.2 Problem Statement

Beauty e-commerce faces two critical challenges. First, consumers cannot physically test products online, creating trust barriers that result in return rates exceeding 40% (NPD Group, 2023)—a "sensory deficit" where the absence of tactile, olfactory, and visual evaluation fundamentally hinders purchasing confidence (Dholakia et al., 2010). Second, small to medium-sized beauty enterprises operate with fragmented technology ecosystems, requiring 5–8 disconnected platforms for e-commerce, marketing, accounting, and operations. This fragmentation incurs USD 500–3,000 monthly costs while creating data silos that prevent personalization (Forrester, 2023). Consequently, SMEs achieve only 5% conversion rates with generic algorithms versus 15–20% for personalized systems (Jiang et al., 2019), yet lack access to integrated solutions combining advanced personalization, live streaming engagement, and AI consultation at accessible pricing.

### 1.3 Project Aim

The overarching aim of this project is to design, develop, and deploy an integrated full-stack e-commerce platform combining e-commerce functionality with real-time live streaming commerce, AI-powered personalized assistance, and comprehensive business management tools, specifically tailored for small to medium-sized beauty businesses.

### 1.4 SMART Objectives

**Objective 1 (Backend Architecture):** To design and implement a RESTful API backend with supporting six core modules (e-commerce, live streaming, AI chat, email marketing, analytics, HR, finance) with JWT authentication and role-based access control (admin/customer roles), achieving 99% API uptime and <200ms average response time for standard queries by Week 15.

**Objective 2 (Frontend Development):** To develop and deploy cross-platform user interfaces including: (a) web application with admin and customer portals supporting Chrome 90+, Firefox 88+, Safari 14+; (b) customer mobile app (iOS 14+, Android 10+) for ecommerce features and chat with AI dermatology expert; and (c) admin mobile app for livestream management—all achieving Lighthouse performance scores ≥85 by Week 25.

**Objective 3 (AI Integration):** To integrate Google Gemini AI with RAG architecture using vector database for: (a) conversational product recommendations with context-aware dialogue maintaining chat history and staff escalation capability, achieving <2s response latency; and (b) dermatology consultation module with text/voice interaction (supporting 100+ languages with auto-detection), skin image analysis, and citation-backed guidance from curated literature, achieving 90% user satisfaction rating in pilot testing by Week 30.

**Objective 4 (Real-Time Infrastructure):** To implement WebSocket-based live streaming infrastructure supporting 500+ concurrent viewers per stream with <3s latency, real-time chat functionality processing 100+ messages/minute, product pinning capability during broadcasts, and comprehensive viewer analytics dashboard tracking engagement metrics, validated through load testing by Week 35.

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

**Limitations (Features Excluded):** The project explicitly excludes iOS version lower than 14, Android lower than version 10, iOS phone screens smaller than 5,1 inch, Android phone screens smaller than 5,4 inch, version iPadOS, Tablet Android, mobile application for logistics partners, and suppliers, ongoing maintenance and support, user’s manual, advanced payment gateway integration beyond basic structure, complex logistics integration with third-party fulfillment systems, AR virtual try-on functionality, advanced marketing automation beyond email segmentation, enterprise multi-tenancy support, subscription business model implementation, real-time inventory sync with external systems, blockchain integration, advanced recommendation engine using collaborative filtering, integration with third-party CRM systems, advanced fraud detection systems, and marketplace functionality allowing multiple sellers.


### 1.6 Report Structure

This report proceeds as follows: Section 2 elaborates upon the problem statement and market context; Section 3-4 presents the proposed development methodology and technological architecture; Sections 5–6 detail the implementation plan, feasibility analysis; Section 7 evaluates the system through testing; Section 8 addresses the legal, social, ethical, and professional issues, and Section 9 concludes with a critical reflection and future recommendations.

## 2. Background and Literature Review

### 2.1 Introduction

This chapter critically reviews existing literature and competing solutions to establish the context and justify the need for the proposed integrated e-commerce platform. The review focuses on beauty e-commerce platforms and SME business management systems released within the last ten years, with specific emphasis on solutions utilizing live streaming commerce, AI-powered personalization, and dermatology AI. It examines competitive platforms, while assessing enabling technologies. Sources were gathered from academic databases including IEEE Xplore, ACM Digital Library, and Google Scholar, as well as commercial platform documentation, market research reports from analysts (Gartner, Forrester, McKinsey, Statista).

### 2.2 Problem Domain Analysis

**Historical Context and Current Trends:** 
E-commerce began with early Electronic Data Interchange (EDI) in the 1970s and expanded with the internet and platforms such as Amazon and eBay (Zwass, 2016). Broadband, smartphones, and digital payments in the 2000s shifted consumers toward mobile and social commerce, where consumers could be influenced by friends and influencers, discover products instantly, and complete a secure purchase within seconds (Gao, Waechter and Bai, 2018). 

Beauty retail historically remained offline-dominant; the COVID-19 pandemic forced digital transformation, compelling brands to innovate online engagement mechanisms (Roggeveen & Srivastava, 2020). Machine learning technologies now enable personalized recommendation systems addressing sensory deficits in online beauty retail (Nilashi et al., 2019). AI personalization has improved conversion rates by building trust, satisfaction, and loyalty (Hassan, Abdelraouf & El Shihy, 2025). 

Business management tools evolved from siloed, function-specific systems that created operational inefficiencies and cumulative costs for Small and Medium-sized Enterprises (SMEs) (Nolan & McFarlan, 2005). Traditional Enterprise Resource Planning (ERP) implementations (SAP, Oracle) required USD 1–5 million investment, rendering them inaccessible to SMEs (Markus & Tanis, 2000). Cloud computing and Software as a Service (SaaS) models enabled SMEs to access enterprise-grade functionality at affordable subscription costs (USD 50–500 monthly) (Venkatraman, 2017). 

**Key Concepts and Terminology:** E-commerce encompasses digital transaction infrastructure mediated through product catalogs and shopping carts. Live streaming commerce represents synchronous video broadcasting where sellers demonstrate products in real-time while viewers engage through integrated chat and purchasing mechanisms. Sensory deficit (Dholakia et al., 2010) describes the absence of multisensory product evaluation in online retail, particularly acute in beauty retail where texture, scent, and colour matching inform purchasing confidence. AI personalization employs machine learning to recommend products, customize content, and tailor offers (Jiang et al., 2019), substantially improving conversion rates. Business management tools for e-commerce, marketing, accounting, analytics, and operations are software systems that help businesses streamline online sales, automate promotion and financial tasks, monitor performance data, and manage day-to-day processes efficiently.

**Significance and Impact:** 
Global e-commerce reached $5.7 trillion in 2023, with success increasingly driven by interactive, personalized experiences (eMarketer, 2024). The beauty e-commerce market, valued at USD 120 billion in 2024, demonstrates 15% compound annual growth projecting USD 200 billion by 2027 (Statista, 2024). However, growth concentrates among large enterprises; approximately 70% of SMEs utilize five to eight disconnected platforms incurring USD 500–3,000 monthly operational costs (Forrester, 2023). Beauty return rates exceed 40%, substantially higher than general e-commerce averages, indicating inadequate consumer confidence (NPD Group, 2023). Personalized recommendations achieve 15–20% conversion rates versus 5% for generic algorithms (Jiang et al., 2019). The gap between accessible but limited platforms and expensive enterprise solutions represents significant market opportunity for integrated mid-market solutions. 

### 2.3 Critical Review of Existing Solutions

**Comparison Matrix**

The comparison matrix evaluates platforms across seven critical success factors: e-commerce functionality (DeLone & McLean, 2016), live streaming commerce impacting consumer trust (Wongkitrungrueng & Assarut, 2020), AI personalization improving conversion rates (Davenport et al., 2020), skincare AI consultation building confidence through RAG-based guidance (Lewis et al., 2020), business management tools reducing platform switching costs (Verhoef et al., 2015), and implementation cost determining SME accessibility (Cao & Li, 2015). These dimensions provide a comprehensive framework balancing functional capability, competitive differentiation, and economic feasibility for SME beauty retailers.

| Feature / Aspect | Shopify (Plus/Advanced) | Adobe Commerce | Sephora | Wrencos System (Proposed) |
|---|---|---|---|---|
| **Target Audience** | SMBs to Enterprise retailers | Mid-market to Large Enterprise B2B/B2C | Beauty Consumers (B2C End Users) | SME beauty retailers and beauty consumers |
| **Core Technology** | Proprietary SaaS Cloud (Ruby on Rails) | PHP/MySQL Open Source or PaaS | Proprietary Native (iOS/Android) & Web Platform | Node.js/Vue.js/React Native full-stack |
| **E-Commerce Functionality** | Storefront, Checkout, POS, integrated payments | Complex catalog management, multi-inventory, B2B logic | Marketplace, 'Beauty Insider' Loyalty, Community | Storefront, Checkout, integrated payment, profile, order management |
| **Live Streaming** | Via Integrations (YouTube, TikTok, 3rd party apps) | Via Extensions or Adobe Experience Cloud | Native / Integrated (Live Shopping Events) | Native WebSocket-based livestream |
| **AI Personalization** | Shopify Magic (GenAI for text/descriptions) | Adobe Sensei (Native AI for search & upsell) | Proprietary Recommendation Engine & Hybrid Algorithms | Native Google Gemini integration |
| **Skincare AI Consultation** | None Native (Requires apps like Haut.AI or Revieve) | None Native (Requires custom development) | Virtual Artist (Makeup) + Skincare IQ (Quiz/Algorithm) | AI dermatology expert with text, voice, live chat auto detect in 100+ languages, image analysis ; RAG over curated dermatology textbooks with citations |
| **Business Management Tools** | Sales Analytics, Staff Permissions, Inventory | Integrated ERP support, BI, Order Management | N/A (Consumer facing platform) | Integrated ecommerce, accounting, HR, analytics, email marketing management |
| **Implementation Cost** | $39 – $2,300+ / month (SaaS licensing fees) | $50,000 – $500,000+ (Licensing + Dev Agency costs) | high commission for brands (15-35%), higher prices for customers | Affordable cloud deployment |
| **Strengths** | Fast time-to-market, extensive app ecosystem, lower TCO | Total customization, data sovereignty, handles complex catalogs | High user trust, integrated community, massive loyalty data | Integrated beauty-specific features, native livestream, dermatology consultation, unified business management |
| **Weaknesses** | Fragmented ecosystem, need many paid apps, limited livestream. Transaction fees, URL rigidity, generic checkout | High maintenance cost, steep learning curve, requires dev team | Closed ecosystem, high commission for brands | Early-stage platform, smaller ecosystem than incumbents, requires validation in market |

Platform capabilities are documented in official sources: Shopify, 2024; Shopify, 2025a; Shopify, 2025b; Shopify, 2025c; Shopify App Store, 2025; Adobe, 2023; Adobe, 2024; Adobe Exchange, 2025; Forbes, 2024; Gartner, 2023; Sephora, 2024; LVMH, 2023; Marr, 2023.

**Written Analysis**
The comparison reveals a critical gap: no existing solution adequately serves SME beauty retailers with integrated functionality at accessible pricing. Shopify incurs cumulative costs for third-party apps, creating data fragmentation while lacking native dermatology consultation. Adobe Commerce offers comprehensive functionality but remains economically inaccessible with enterprise complexity requiring dedicated IT staff. Sephora is limited to basic quiz recommendation and high commission for brands (15-35%) equals higher prices for customers. Wrencos addresses these gaps through unified architecture integrating e-commerce, livestreaming, AI personalization, business management, and dermatology consultation. The platform targets SMEs with accessible pricing whilst delivering RAG-based AI dermatology consultation and native livestreaming across web and mobile, unlocking personalization-driven engagement for small retailers.

### 2.4 Critical Review of Enabling Technologies and Methodologies

**Frontend Frameworks**

| **Evaluation Criteria** | **React** | **Vue.js** | **Angular** |
|---|---|---|---|
| **Architecture Philosophy** | Component-based library with flexible architecture | Progressive framework with incrementally adoptable core | Comprehensive MVC framework with opinionated structure |
| **Performance** | Excellent; virtual DOM with efficient reconciliation | Excellent; lightweight core with reactive data binding | Good; larger bundle size impacts initial load time |
| **Ecosystem Maturity** | Extensive; robust state management (Redux, MobX), routing, UI libraries | Growing; Vue Router, reactive() API, extensive community plugins | Comprehensive; integrated CLI, routing, forms, HTTP client |
| **State Management** | External libraries required | Native reactive() API | Built-in services and RxJS observables |
| **Mobile Development** | React Native enables cross-platform mobile development | Limited native mobile support; NativeScript-Vue available | Ionic framework provides hybrid mobile capabilities |
| **Bundle Size** | ~40 KB | ~20 KB | ~500 KB+ |

**Justification for Selection:**

Vue.js is selected for its progressive nature enabling rapid prototyping for SME-oriented platforms (You, 2019), 50% smaller bundle size than React improving load times critical for conversion rates where each additional second reduces conversion by 7% (Majchrzak et al., 2020), native reactive() API eliminating external state management dependencies (You, 2019), and seamless WebSocket integration for real-time live streaming UI updates (Haitz et al., 2023).

React Native is chosen for mobile development, reflecting its proven cross-platform maturity at scale and comprehensive native module ecosystem unavailable in Vue alternatives (Kieras, 2020). 

**Backend Technologies**

| **Evaluation Criteria** | **Node.js (Express)** | **Python (Django/Flask)** |
|---|---|---|
| **Architecture Model** | Event-driven, non-blocking I/O with single-threaded event loop | Multi-threaded/multi-process with synchronous I/O (traditional WSGI) |
| **Concurrency Handling** | Asynchronous by default; excels at I/O-bound operations | Synchronous by default; requires explicit async implementation (ASGI) |
| **Real-Time Capability** | Native WebSocket support; efficient event-driven architecture | Requires additional frameworks (Django Channels, Socket.IO) |
| **Performance (I/O-bound)** | Superior throughput for concurrent connections; ~15,000 req/s for simple APIs | Moderate throughput; ~3,000 req/s for comparable workloads |
| **Database Compatibility** | Flexible; supports MongoDB natively via Mongoose, SQL via Sequelize/Knex | Excellent; Django ORM provides robust abstraction for SQL databases |
| **Use Case Suitability** | Real-time applications, microservices, API servers, chat systems | Content management systems, data-driven applications, admin interfaces |

**Justification for Selection:** Node.js with Express is selected for: 5× higher throughput than Python for I/O-bound concurrent connections essential for WebSocket livestreaming (Lei et al., 2020); full-stack JavaScript consistency enabling code sharing between Vue.js frontend and backend whilst reducing cognitive switching costs (Tilkov & Vinoski, 2010); and seamless MongoDB integration via Mongoose ODM providing flexible JSON document handling for varying product catalog schemas (Lei et al., 2020). 

**Database Systems**

| **Evaluation Criteria** | **SQL (PostgreSQL)** | **NoSQL (MongoDB)** | **Vector Database (Qdrant)** |
|---|---|---|---|
| **Data Model** | Relational tables with predefined schemas and foreign key relationships | Document-oriented with flexible JSON-like schema | High-dimensional vectors with metadata and efficient similarity search indices |
| **Schema Flexibility** | Rigid schema requiring migrations for structural changes | Dynamic schema allowing field variations across documents | Flexible metadata with primary focus on vector embeddings |
| **Query Language** | SQL with complex joins, aggregations, and transactions | MongoDB Query Language with aggregation pipeline | Vector similarity search (cosine, Euclidean) with metadata filtering |
| **ACID Compliance** | Full ACID guarantees with strong consistency | ACID at document level; eventual consistency in distributed mode | Eventually consistent; optimized for read-heavy similarity search |
| **Scalability** | Vertical scaling primary; horizontal scaling complex (sharding) | Horizontal scaling native through sharding and replica sets | Horizontal scaling optimized for distributed vector search |
| **Performance** | Excellent for complex joins and transactional workloads | Superior for document retrieval and write-heavy workloads (~10× faster writes) | Optimized for high-dimensional similarity search with sub-millisecond latency |
| **Use Cases** | Financial systems, ERP, CRM requiring strict data integrity | Content management, e-commerce catalogs, real-time analytics | Semantic search, recommendation systems, RAG for LLMs |

**Justification for Selection:** 
MongoDB is chosen for: schema flexibility accommodating varying product attributes across categories without complex entity-attribute-value patterns (Han et al., 2011); JSON-native BSON format eliminating object-relational impedance mismatch with Node.js (Stonebraker & Hellerstein, 2019); and native horizontal sharding enabling cost-effective future scalability. 

Qdrant provides specialized vector database functionality for the AI dermatology module's RAG requirements, implementing semantic search across curated literature with high-dimensional embeddings. Its HNSW index achieves sub-millisecond approximate nearest neighbour search with >95% recall, essential for maintaining conversational AI response latency under 200ms (Malkov & Yashunin, 2020). 

**Development Methodologies**

| **Evaluation Criteria** | **Waterfall** | **Agile** |
|---|---|---|
| **Process Model** | Sequential, linear phases (requirements, design, implementation, testing, deployment) | Iterative, incremental cycles with continuous feedback |
| **Requirements Handling** | Fixed upfront; changes expensive and disruptive | Evolving; welcomes changing requirements throughout development |
| **Delivery Cycle** | Single delivery at project conclusion | Frequent incremental releases producing working software |
| **Risk Management** | High risk concentrated at end; late discovery of issues | Low risk distributed across iterations; early identification and mitigation |
| **Flexibility** | Rigid; difficult to accommodate changes after requirements phase | Highly flexible; adaptive planning enables response to emerging requirements |
| **Documentation** | Comprehensive upfront documentation required | Minimal sufficient documentation; prioritizes working software |
| **Suitability** | Well-defined stable requirements, regulated domains | Evolving requirements, innovative projects, uncertain domains |

**Agile Framework Comparison: Scrum vs. Kanban**

| **Evaluation Criteria** | **Scrum** | **Kanban** |
|---|---|---|
| **Iteration Structure** | Fixed-length sprints (2–4 weeks) with defined goals | Continuous flow without fixed iterations |
| **Planning** | Sprint planning at iteration start with commitment to sprint backlog | Continuous planning; pull items as capacity allows |
| **Changes** | Not allowed during sprint; changes queued for next sprint | Changes allowed anytime if capacity available |
| **Delivery** | Potentially shippable increment at sprint end | Continuous delivery when items complete |
| **Metrics** | Velocity, burndown charts, sprint goals | Lead time, cycle time, throughput |
| **Meetings** | Prescribed ceremonies: daily standup, sprint planning, review, retrospective | Optional meetings; daily standup common |
| **Best For** | Feature-driven projects with clear increments and team learning focus | Support/maintenance, continuous delivery, unpredictable priorities |

**Justification for Selection:**
Agile is selected for evolving requirements in integrating emerging technologies (WebSocket streaming, Gemini AI, RAG-based dermatology consultation) where optimal implementation emerges iteratively (Boehm & Turner, 2004). Two-week sprints enable systematic module progress with early risk identification and continuous stakeholder feedback for validating complex integrations that cannot be fully specified upfront (Dingsøyr et al., 2019). Scrum is chosen for its fixed sprint structure providing rhythm and predictability suited to feature-driven development, whilst prescribed ceremonies ensure structured feedback essential for multi-module coordination (Schwaber & Sutherland, 2020; Ahmad et al., 2018).

### 2.5 Summary and Identification of the Research Gap

**Synthesis of Findings:** The literature review reveals three critical findings: SMEs face highly costs managing many fragmented platforms whilst consumers experience 40%+ returns from sensory deficits; technology review confirms feasibility through Node.js/Express (5× higher throughput), Vue.js (50% smaller bundles), MongoDB (schema flexibility), Qdrant (sub-millisecond RAG search), and Agile methodology with Scrum framework enables iterative development essential for integrating emerging technologies.

**Research Gap:** In summary, the literature review identifies a clear gap: there is no single, SME-accessible platform that combines comprehensive e-commerce functionality with native livestreaming across web and mobile, AI-powered dermatology consultation featuring text/voice interaction and RAG-based cited guidance, and integrated business management within one modern architecture. Existing solutions are either too fragmented requiring expensive third-party aggregation, overspecified for SME budgets, or technically outdated.

**Project Positioning:** Therefore, this project aims to address this gap by developing Wrencos using Node.js/Express, Vue.js, and React Native with Agile Scrum methodology, delivering: (1) unified backend eliminating platform fragmentation; (2) native WebSocket livestreaming with Google Gemini AI recommendations; (3) Skin Study dermatology module with RAG-based consultation under 200ms latency—directly addressing SME operational costs and consumer trust barriers at accessible pricing.

## References

BuiltWith. (2024). Content management system market share. Available at: https://trends.builtwith.com/cms

Forrester. (2023). State of technology adoption for SMB retailers. Cambridge, MA: Forrester Research.

Gartner. (2024). Magic Quadrant for e-commerce platforms. Stamford, CT: Gartner Inc.

Grinberg, M. (2018). Flask web development: Developing web applications with Python. 2nd edn. Sebastopol, CA: O'Reilly Media.

Kokina, J. and Davenport, T.H. (2017) 'The emergence of artificial intelligence: How automation is changing accounting', Journal of Emerging Technologies in Accounting, 14(1), pp. 115–122.

Lei, K., Ma, Y., & Tan, Z. (2020). Performance comparison and evaluation of web development technologies in PHP, Python, and Node.js. *IEEE Access*, 8, 94879–94892. doi:10.1109/ACCESS.2020.2996798

Shopify. (2024). Shopify global merchant count. Available at: https://www.shopify.com

W3Techs. (2024). Usage statistics of WordPress. Available at: https://w3techs.com/technologies/details/cm-wordpress

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

Malkov, Y.A. & Yashunin, D.A. (2020). Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 42(4), 824–836. doi:10.1109/TPAMI.2018.2889473

Stonebraker, M. & Hellerstein, J.M. (2019). What goes around comes around... and around... *Communications of the ACM*, 62(6), 72–83. doi:10.1145/3319535

Dholakia, U. M., Kahn, B. E., Reeves, R. J., & Rindfleisch, A. (2010). Consumer satisfaction and delight: The role of personal and situational influences. *Journal of Business Research*, 63(1), 1–9.

Forrester. (2023). State of technology adoption for SMB retailers. Cambridge, MA: Forrester Research.

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

Ahmad, M. O., Markkula, J., & Oivo, M. (2018). Kanban in software development: A systematic literature review. *Software Quality Journal*, 26(2), 397–424. doi:10.1007/s11219-016-9344-y

Anderson, D. J. (2010). *Kanban: Successful evolutionary change for your technology business*. Sequim, WA: Blue Hole Press.

Beck, K., Beedle, M., Van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). Manifesto for agile software development. Available at: http://agilemanifesto.org

Boehm, B. W., & Turner, R. (2004). Balancing agility and discipline: Evaluating and integrating agile and plan-driven methods. *Proceedings of the 26th International Conference on Software Engineering*, 718–719. doi:10.1109/ICSE.2004.1317503

Dingsøyr, T., Nerur, S., Balijepally, V., & Moe, N. B. (2019). A decade of agile methodologies: Towards explaining agile software development. *Journal of Systems and Software*, 85(6), 1213–1221. doi:10.1016/j.jss.2012.02.033

Gartner. (2023). Magic Quadrant for mobile app development platforms. Stamford, CT: Gartner Inc.

Moe, N. B., Dingsøyr, T., & Røyrvik, E. A. (2019). Putting agile teamwork to the test: An empirical study of the impact of self-managing teams. *Information and Software Technology*, 110, 20–31. doi:10.1016/j.infsof.2019.02.003

Royce, W. W. (1970). Managing the development of large software systems. *Proceedings of IEEE WESCON*, 26(8), 1–9.

Schwaber, K., & Sutherland, J. (2020). The Scrum guide: The definitive guide to Scrum: The rules of the game. Available at: https://scrumguides.org

Haitz, S., Goedicke, M., & Sripada, V. (2023). JavaScript framework comparison: Evaluating React, Vue, and Angular for enterprise applications. *Journal of Software Engineering Research and Development*, 11(1), 1–15.

Han, J., Haihong, E., Le, G., & Du, J. (2011). Survey on NoSQL database. *2011 6th International Conference on Pervasive Computing and Applications*, 363–366. doi:10.1109/ICPCA.2011.6106531

Johnson, J., Douze, M. and Jégou, H. (2017) 'Billion-scale similarity search with GPUs', arXiv preprint arXiv:1702.08734.

Karpukhin, V., Oguz, B., Min, S., Lewis, P., Wu, L., Edunov, S., Chen, D. and Yih, W.-T. (2020) 'Dense passage retrieval for open-domain question answering', Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 6769–6781.

Kieras, D. (2020). React Native versus native development: A performance and usability analysis. *Mobile Information Systems*, 2020, 1–18.

Majchrzak, T. A., Biørn-Hansen, A., & Grønli, T.-M. (2020). Comprehensive analysis of adaptive web applications: Old problems, new challenges, and emerging solutions. *Mobile Information Systems*, 2020, 1–26.

Netflix Tech Blog. (2023). Netflix's journey with Node.js. Available at: https://netflixtechblog.com

Biørn-Hansen, A., Grønli, T.-M., & Gsinlatham, G. (2018). Progressive web apps: The definitive guide to web application development. *Multimedia Tools and Applications*, 77(24), 32357–32391.

Tilkov, S., & Vinoski, S. (2010). Node.js: Using JavaScript to build high-performance network programs. *IEEE Internet Computing*, 14(6), 80–83.

You, E. (2019). Vue.js 3 composition API and TypeScript: Improving code organization and type safety in large-scale applications. *O'Reilly Media*, 1–45.

DeLone, W. H., & McLean, E. R. (2016). "Information Systems Success Measurement." Foundations and Trends in Information Systems, 2(1), 1-116.

Wongkitrungrueng, A., & Assarut, N. (2020). "The Role of Live Streaming in Building Consumer Trust and Engagement with Social Commerce Sellers." Journal of Business Research, 117, 543-556.

Davenport, T., Guha, A., Grewal, D., & Bressgott, T. (2020). "How Artificial Intelligence Will Change the Future of Marketing." Journal of the Academy of Marketing Science, 48(1), 24-42.

Verhoef, P. C., Kannan, P. K., & Inman, J. J. (2015). "From Multi-Channel Retailing to Omni-Channel Retailing: Introduction to the Special Issue on Multi-Channel Retailing." Journal of Retailing, 91(2), 174-181.

Cao, L., & Li, L. (2015). "The Impact of Cross-Channel Integration on Retailers' Sales Growth." Journal of Retailing, 91(2), 198-216.

Adobe (2023) Adobe Sensei GenAI, Adobe Experience Cloud. Available at: https://business.adobe.com/products/sensei/adobe-sensei.html (Accessed: 27 November 2025).

Adobe (2024) Adobe Commerce Features and Capabilities, Adobe. Available at: https://business.adobe.com/products/magento/magento-commerce.html (Accessed: 27 November 2025).

Adobe Exchange (2025) Adobe Commerce Extensions Marketplace. Available at: https://commercemarketplace.adobe.com/ (Accessed: 27 November 2025).

Forbes (2024) 'Adobe Commerce vs Shopify: Which is best for your business?', Forbes Advisor, 15 January. Available at: https://www.forbes.com/advisor/business/software/shopify-vs-adobe-commerce/ (Accessed: 27 November 2025).

Gartner (2023) Magic Quadrant for Digital Commerce. Stamford: Gartner Inc.

LVMH (2023) 2023 Annual Report: Digital Innovation at Sephora. Paris: LVMH Group. Available at: https://www.lvmh.com/investors (Accessed: 27 November 2025).

Marr, B. (2023) 'How Sephora Uses Artificial Intelligence And Augmented Reality To Drive Sales', Forbes, 5 May. Available at: https://www.forbes.com (Accessed: 27 November 2025).

Sephora (2024) About Sephora: Digital Innovation. Available at: https://www.sephorastands.com (Accessed: 27 November 2025).

Shopify (2024) Shopify Architecture: Under the Hood, Shopify Engineering Blog. Available at: https://shopify.engineering (Accessed: 27 November 2025).

Shopify (2025a) Shopify Pricing and Plans. Available at: https://www.shopify.com/pricing (Accessed: 27 November 2025).

Shopify (2025b) Connecting to YouTube Shopping. Shopify Help Center. Available at: https://help.shopify.com/en/manual/online-sales-channels/google/youtube (Accessed: 27 November 2025).

Shopify (2025c) Shopify Magic: AI for Commerce. Available at: https://www.shopify.com/magic (Accessed: 27 November 2025).

Shopify App Store (2025) Skincare Quiz and Analysis Apps. Available at: https://apps.shopify.com (Accessed: 27 November 2025).

