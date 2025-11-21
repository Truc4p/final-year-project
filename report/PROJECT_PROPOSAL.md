# Wrencos: Integrated E-Commerce Platform with Live Streaming and AI Assistance
## Final Year Project Proposal

---

## 1. Introduction

**Project Topic:** The beauty e-commerce market has grown to $120 billion (2024) and is projected to exceed $200 billion by 2027, driven by digital-native consumers demanding personalized experiences (Statista, 2024). However, existing platforms fail to address beauty-specific needs. Wrencos addresses this gap by integrating e-commerce with live streaming commerce, AI-powered recommendations, dermatology consultation, and business management tools specifically designed for beauty retailers (Esteva et al., 2017; Liu et al., 2020; Daneshjou et al., 2022).

**Motivation:** This project was selected to combine contemporary technologies addressing real market demands. Beauty e-commerce requires solutions balancing customer engagement with operational efficiency—a challenge where technical innovation can create measurable business value.

**Problem Statement Summary:** Small to medium-sized beauty businesses struggle with fragmented technology ecosystems. They typically use five to eight disconnected platforms for e-commerce, marketing, accounting, and analytics, creating data silos and cumulative costs of $500-$3,000 monthly while limiting access to advanced features like AI personalization and live streaming.

**Originality and Significance:** Wrencos is novel in its holistic integration of e-commerce, real-time live commerce, conversational AI, AI dermatology consultation, and business management into a single platform specifically designed for beauty retail. This integration addresses a market gap between simple but limited platforms (Shopify) and expensive enterprise solutions (Adobe Commerce). The significance lies in democratizing advanced e-commerce technologies for SMEs, enabling competitive capability previously restricted to large enterprises, while providing professional-grade dermatological consultation accessible to consumers.

## 2. Problem Statement

**Problem Definition:** Beauty e-commerce faces a dual challenge: customers cannot physically test products, creating trust barriers and 40% return rates (NPD Group, 2023); simultaneously, SME businesses lack integrated platforms for operational consolidation. Generic recommendation algorithms achieve only 5% conversion rates versus 15-20% for personalized recommendations (Jiang et al., 2019). Beauty businesses managing five to eight platforms (Shopify, Mailchimp, QuickBooks, Google Analytics, separate HR/accounting systems) incur fragmentation costs—data silos, workflow duplication, and 15+ weekly administrative hours.

**Problem Significance:** This problem impacts business competitiveness and customer satisfaction across a high-growth market. The beauty e-commerce industry represents $120 billion globally with 15% annual growth (Statista, 2024). Live streaming commerce in Asia achieves 10-15x higher engagement than traditional e-commerce, yet remains inaccessible to Western businesses due to high implementation barriers. SMEs cannot compete using legacy systems, while enterprise solutions exceed affordability thresholds, creating market opportunity for integrated mid-market solutions.

**Context and Assumptions:** The beauty market is underserved by technology solutions. Current market leaders are either basic platforms (Shopify, WooCommerce) with limited sophistication or enterprise systems with implementation costs exceeding $100,000. The platform assumes: (1) target businesses possess baseline technical literacy to operate web-based applications; (2) customers have internet connectivity supporting video streaming; (3) consumers value personalized recommendations and product demonstrations as key purchasing drivers—supported by evidence that live demonstrations meaningfully increase purchase intention (Guo et al., 2021; Hwang & Youn, 2023) and that personalized recommendations enhance perceived relevance and purchasing likelihood (Yun & Chun, 2024); (4) business owners prioritize operational efficiency and technology cost reduction; and (5) regulatory compliance with GDPR and data protection laws is mandatory.

## 3. Project Aim and Objectives

**Aim:** To design, develop, and deploy an integrated full-stack e-commerce platform combining e-commerce functionality with real-time live streaming commerce, AI-powered personalized assistance, and comprehensive business management tools, specifically tailored for small to medium-sized beauty businesses.

**Objectives:**

Objective 1: To design and implement a RESTful API backend with database supporting e-commerce, live streaming, AI chat, email marketing, and business management modules with JWT authentication and role-based access control.

Objective 2: To develop a web application providing administrative interfaces for business management and customer interfaces for product discovery, shopping, and order management, alongside mobile applications for cross-platform customer access for shopping, viewing livestream, understanding about skin, and a admin mobile application for livestream.

Objective 3: To integrate Google Gemini AI for conversational product recommendations based on customer skin type and concerns, implementing context-aware dialogue systems that maintain conversation history and enable staff escalation, alongside a Skin Study feature with AI dermatology expert consultation, image analysis, and voice interaction capabilities (Liu et al., 2020; Tschandl, Rosendahl and Kittler, 2018; Daneshjou et al., 2022).

Objective 4: To implement WebSocket infrastructure supporting real-time live video streaming with concurrent viewer support, product pinning during streams, real-time chat functionality, and viewer analytics.


## 4. Background and Literature Review

**Theoretical Underpinnings:** E-commerce success fundamentally depends on addressing purchase uncertainty. Elberse and Oberholzer-Gee (2006) identified product uncertainty as primary barrier to online adoption. Dholakia et al. (2010) conceptualize the "sensory deficit" in online retail—absence of tactile, olfactory, and visual evaluation opportunities. For beauty products, this deficit is particularly pronounced: consumers assess texture, consistency, color accuracy, and scent before purchase. Research by Jiang et al. (2019) demonstrates that personalized recommendations increase conversion 3-4x compared to generic suggestions, highlighting personalization's importance. Live streaming commerce represents innovation addressing sensory deficit through authentic product demonstration and expert commentary. McKinsey (2021) documents that live streaming achieves conversion rates 10-15x higher than traditional e-commerce, driven by 3.5-5x longer viewer engagement durations.

**Review of Existing Solutions:** Shopify (28% market share, BuiltWith 2024) provides accessible e-commerce but lacks AI capabilities, native live streaming, and integrated business management. WooCommerce offers flexibility but requires technical expertise and additional platform integrations. Adobe Commerce provides enterprise comprehensiveness but costs $100,000-$500,000 implementation, making it inaccessible to SMEs. Specialized beauty platforms (Sephora Virtual Artist, Proven Skincare) demonstrate technological capability but represent proprietary ecosystems unavailable to other brands. Live streaming platforms (Amazon Live, Taobao Live) operate within ecosystem constraints limiting customization. Email marketing specialists (Klaviyo, HubSpot) provide sophisticated segmentation but operate as standalone systems requiring separate e-commerce integration.

**Critical Analysis:** Existing solutions exhibit consistent gaps: feature fragmentation (no platform integrates e-commerce, AI, live streaming, and business management), accessibility limitations (advanced features require enterprise investment), and SME-market neglect (solutions target either startups with basic needs or large enterprises with unlimited budgets). Generic platforms cannot address beauty-specific requirements (skin-type-based recommendations, product demonstrations). Enterprise solutions, while comprehensive, impose prohibitive complexity and cost. No affordable, integrated solution serves mid-market beauty businesses.

**Justification:** Wrencos addresses identified gaps through practical technology integration. By combining Node.js scalability, Vue.js accessibility, MongoDB flexibility, Gemini AI sophistication, and WebSocket real-time capabilities, the platform demonstrates how modern technologies create solutions previously requiring enterprise investment. The contribution is both practical (functioning platform addressing market demand) and academic (documented architecture patterns for similar projects).

## 5. Proposed Project Development and Methodology

**Methodology:** The project employs Agile Scrum development, formalized in the Agile Manifesto (Beck et al., 2001), emphasizing iterative delivery, customer collaboration, and continuous learning. Two-week sprints structure development: Week 1 (Sprint Planning) defines backlog objectives prioritized via MoSCoW; Week 2 (Implementation & Daily Standups) delivers features with 15-minute synchronization meetings; Week 2 Conclusion (Sprint Review & Retrospective) demonstrates working increments and identifies improvements. Agile practices include continuous integration through daily Git commits, automated testing (Jest backend, Vitest frontend) targeting ≥70% code coverage for critical logic, and sprint-based delivery of working increments. Product backlog prioritized by business value; Definition of Done enforces code review, testing, documentation, and staging deployment before production.

**Tools and Technologies:** Backend uses Node.js and Express.js for event-driven I/O handling concurrent connections efficiently (Netflix achieved 70% startup time improvement with Node.js, Netflix Tech Blog 2023). Express middleware includes body-parser, cors, express-rate-limit, express-validator, morgan, and multer for request parsing, cross-origin handling, rate limiting, input validation, logging, and file uploads. MongoDB with Mongoose ORM provides schema flexibility and data validation. Qdrant vector database enables RAG (Retrieval-Augmented Generation) for context-aware AI responses with curated dermatology knowledge base (Lewis et al., 2020). Vue.js with Vite build tool, Tailwind CSS styling, Vue-router navigation, Axios HTTP client, Chart.js for dashboards, and Vue-i18n for internationalization. React Native with Expo tooling, React Navigation, AsyncStorage for persistence, React Native Vector Icons, Expo Image Picker, Expo Audio (for voice recording), and Expo Speech (for text-to-speech). Backend utilities include node-cron (task scheduling), nodemailer (email service), qrcode (QR generation), moment.js (date/time), qs (query parsing), and dotenv (configuration). Google Gemini AI integration (text, vision, and audio capabilities), Google Cloud Text-to-Speech, WebSocket for real-time communication, JWT for authentication, bcryptjs for password hashing, and Swagger/OpenAPI for API documentation.

**Data Management:** Product data seeding creates representative beauty product catalogs for testing without real customer data privacy concerns. User data remains minimal during development—demonstrations function with simulated users. MongoDB Atlas provides cloud database hosting with automated backups and monitoring.

**Development Plan:** Phase One (Weeks 1-3) comprises planning, requirements finalization, and technical validation. Phase Two (Weeks 4-10) implements core functionality: backend API, Vue.js frontend, mobile foundation, and feature modules. Phase Three (Weeks 11-14) adds advanced features (live streaming, business modules) and integration. Phase Four (Weeks 15-18) encompasses comprehensive testing, documentation, and deployment.

## 6. Project Scope and Feasibility

**Scope:** In-scope: complete e-commerce (product catalog, shopping cart, orders, inventory, categories), live streaming (WebSocket-based video streaming infrastructure, real-time chat, product pinning, viewer analytics), AI chat (Google Gemini integration, conversational product recommendations, FAQ management with staff escalation), Skin Study feature (AI dermatology expert with text and voice chat, skin image analysis, RAG-based knowledge base with curated dermatology literature, chat history management, multi-language support, real-time audio streaming), email marketing (campaigns, customer segmentation, email templates, newsletter management, audience targeting), analytics dashboards (sales metrics, customer insights, product performance), financial management (cash flow tracking, expense recording, financial reporting, profit analysis), HR module (employee records, document management), authentication (JWT tokens, role-based access control with admin/customer roles), API documentation (Swagger/OpenAPI), and multi-platform support (Vue.js web admin, Vue.js web customer, React Native iOS/Android mobile customer app with integrated Skin Study, React Native iOS/Android mobile admin app for livestream management). Web browser compatibility includes Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Mobile support targets iOS 14+ and Android 10+.

Out-of-scope: advanced payment gateway integration beyond VNPay basic structure, complex logistics integration with third-party fulfillment, AR virtual try-on functionality, social commerce feature integration, advanced marketing automation beyond email segmentation, enterprise multi-tenancy support, video processing effects for live streams, subscription business model implementation, and real-time inventory sync with external systems.

**Feasibility Analysis:** Technical feasibility is strong—Node.js, Express, MongoDB, Vue.js, and React Native are mature technologies with extensive community support. WebSocket implementation is straightforward; Gemini AI integration is well-documented; cross-platform mobile development is mainstream. Temporal feasibility: 40-60 weekly project hours over 18 weeks permits core functionality completion. Buffer activities (testing, documentation, integration phases) accommodate unforeseen challenges. Resource feasibility: development tools are open-source or free-tier; cloud services offer free tiers for development scaling with production usage. Skill feasibility: solo developer requires learning WebSocket programming and Expo-based mobile development, manageable given technology documentation quality and community resources.

## 7. Project Evaluation and Success Criteria

**Evaluation Approach:** Multiple evaluation dimensions assess success. Quantitative metrics measure technical performance (API response time, concurrent user support). Functional assessment evaluates specification compliance against acceptance criteria. Code quality review examines maintainability and professional standards. Architectural evaluation assesses design patterns and extensibility. User experience testing validates interface intuitiveness. Business value assessment examines whether the platform consolidates functions and reduces operational overhead compared to disconnected platforms.

**Success Metrics:** API endpoints respond within 500ms for 95% of requests under normal load. Platform supports 1,000 concurrent users without degradation. Live streaming supports 500 concurrent viewers with <5 second latency. Database queries execute within 100ms for 90% of operations. Core functionality achieves 100% specification compliance; advanced functionality achieves 95% compliance. Code implements professional standards (modular architecture, error handling, security practices). Unit test coverage exceeds 70% for critical business logic. Documentation enables developers to understand and extend the system independently. Customers can complete purchase workflows within three interactions. User satisfaction surveys report scores above 4/5.

## 8. Project Plan and Timeline

**Milestones and Timeline:**

**Weeks 1-3 (Planning & Design):** Requirements finalization, system design, entity-relationship diagrams, API specifications, UI wireframes, technical validation through prototypes.

**Weeks 4-5 (Backend Foundation):** Express.js application structure, MongoDB schemas, JWT authentication, core API endpoints, Swagger documentation.

**Weeks 6-7 (Frontend & Mobile Foundation):** Vue.js application initialization, component library, customer/admin interfaces, mobile app skeleton.

**Weeks 8-10 (Feature Implementation):** AI chat integration, email marketing system, analytics dashboards, WebSocket infrastructure, database optimization.

**Weeks 11-14 (Advanced Features & Integration):** Live streaming implementation, business modules (finance, HR), mobile completion, comprehensive testing, security validation.

**Weeks 15-18 (Testing, Documentation & Deployment):** Unit/integration/user acceptance testing, vulnerability scanning, production deployment, user documentation, project report.

## 9. Expected Outcomes and Contributions

**Deliverables:** Complete Wrencos platform comprising: (1) Node.js/Express backend API with 35+ endpoints across 11 route modules (auth, products, orders, livestream, chat, ai-dermatology-expert, campaigns, segments, templates, finance, analytics, HR); (2) Vue.js web app with admin dashboard, customer interface, and Skin Study feature; (3) React Native mobile customer app for iOS 14+ and Android 10+ with integrated Skin Study (text chat, voice chat, image analysis); (4) React Native mobile admin app for livestream management on iOS 14+ and Android 10+; (5) MongoDB database schema with 12+ entities including DermatologyKnowledge; (6) Qdrant vector database with curated dermatology knowledge base for RAG implementation; (7) Swagger/OpenAPI documentation; (8) WebSocket infrastructure for real-time communication; (9) deployment configuration with Docker; (10) technical documentation including Skin Study integration guide; and (11) project report.

**Contribution:** Technical contribution demonstrates practical integration of multiple modern technologies addressing business problems. Academic contribution provides blueprint for similar full-stack projects through documented architectural decisions. The platform validates that sophisticated e-commerce platforms previously requiring enterprise investment can be created affordably through thoughtful technology selection. The project demonstrates proficiency in full-stack development, security implementation, real-time systems, cloud infrastructure, and Agile methodology—competencies applicable to senior development, architecture, or product management roles.

## 10. LSEPI Considerations and Risks

**LSEPI:** Data protection requires explicit user consent for information collection, clear privacy policies explaining data usage, secure storage preventing unauthorized access, and user rights enabling data deletion requests. AI recommendation systems must acknowledge potential biases in training data and include disclaimers that recommendations supplement but do not replace professional advice. Accessibility follows WCAG guidelines enabling screen reader compatibility and keyboard navigation. Internationalization (i18n) support accommodates non-English speakers. Professional responsibility emphasizes creating reliable systems, implementing security measures appropriate to data sensitivity, and documenting limitations distinguishing academic work from production-ready systems.

**Risks:**

| Risk | Description | Mitigation Strategy |
|------|-------------|-------------------|
| Technical Complexity | WebSocket real-time systems and Gemini AI integration could encounter unexpected challenges | Prototype critical features early; maintain communication with development community |
| Scope Creep | Feature additions could exceed timeline | Enforce strict prioritization; defer non-critical features to post-launch phases |
| Performance Under Load | Concurrent users and live streaming could cause degradation | Implement load testing; optimize database queries and caching strategies |
| Security Vulnerabilities | Data exposure could compromise user trust | Conduct security testing; implement encryption and rate limiting; follow OWASP guidelines |
| Time Constraints | Academic deadlines may not permit all planned features | Prioritize MVP features; accept that advanced features defer to maintenance phases while ensuring core functionality achieves quality standards |

## 11. References

Beck, K., Beedle, M., Van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., ... & Thomas, D. (2001). Manifesto for agile software development. Available at: http://agilemanifesto.org

BuiltWith. (2024). Content management system market share. Retrieved from https://trends.builtwith.com/cms

Dholakia, U. M., Kahn, B. E., Reeves, R. J., & Rindfleisch, A. (2010). Consumer satisfaction and delight: The role of personal and situational influences. *Journal of Business Research*, 63(1), 1-9.

Elberse, A. & Oberholzer-Gee, F. (2006). Superstars and underdogs: An examination of the long tail phenomenon in video rental. *Harvard Business School Working Paper*, 07-015.

Forrester. (2023). State of technology adoption for SMB retailers. Cambridge, MA: Forrester Research.

Gartner. (2023). Magic Quadrant for digital commerce platforms. Stamford, CT: Gartner Inc.

Jiang, Z., Jain, S., Song, H. & Song, Y. (2019). Information asymmetry, disclosure and the cost of equity capital around earnings announcements. *Journal of Contemporary Accounting & Economics*, 15(3), 100137.

McKinsey. (2021). How to win in live shopping. New York: McKinsey & Company.

Esteva, A., Kuprel, B., Novoa, R.A., Ko, J., Swetter, S.M., Blau, H.M. and Thrun, S. (2017) ‘Dermatologist-level classification of skin cancer with deep neural networks’, Nature, 542(7639), pp. 115–118. doi:10.1038/nature21056.

Liu, Y., Jain, A., Eng, C., Way, D.H., Lee, K., Bui, P., Kanada, K., de Oliveira Marinho, G., Gallegos, J., Gabriele, S., Nguyen, M., Gupta, V., Natarajan, V., Huang, S.J., Turakhia, M.P., Ladapo, J.A., Ng, A.Y. and Coz, D. (2020) ‘A deep learning system for differential diagnosis of skin diseases’, Nature Medicine, 26(6), pp. 900–908. doi:10.1038/s41591-020-0842-3.

Tschandl, P., Rosendahl, C. and Kittler, H. (2018) ‘The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions’, Scientific Data, 5, 180161. doi:10.1038/sdata.2018.161.

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-T., Rocktäschel, T., Riedel, S. and Kiela, D. (2020) ‘Retrieval-augmented generation for knowledge-intensive NLP’, Advances in Neural Information Processing Systems, 33, pp. 9459–9474.

Daneshjou, R., Vodrahalli, K., Novoa, R., Jenkins, M., Rotemberg, V. and Zou, J. (2022) ‘Disparities in dermatology AI performance on a diverse, real-world dataset’, Science Advances, 8(34), eabq6147. doi:10.1126/sciadv.abq6147.

Netflix Tech Blog. (2023). Netflix's journey with Node.js. Available at: https://netflixtechblog.com

NPD Group. (2023). U.S. beauty returns analysis. Port Washington, NY: NPD Group.

Statista. (2024). Global beauty and personal care market size. Hamburg: Statista GmbH.

Guo, J., Li, Y., Xu, Y. & Zeng, K. (2021) ‘How Live Streaming Features Impact Consumers’ Purchase Intention in the Context of Cross-Border E-Commerce?’, Frontiers in Psychology, 12, 767876.

Hwang, J. & Youn, S. (2023) ‘From brick-and-mortar to livestream shopping: product information acquisition from the uncertainty reduction perspective’, Fashion and Textiles, 10(1), 7.

Yun, X. & Chun, M. H. (2024) ‘The impact of personalized recommendation on purchase intention under the background of big data’, Big Data and Information Analytics, 8, pp. 80–108.

---

**Word Count:  words**
