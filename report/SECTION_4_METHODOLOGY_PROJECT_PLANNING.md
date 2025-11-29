# 4. Methodology and Project Planning

## 4.1 Development Methodology

This project adopted the Agile Scrum methodology for its suitability to full-stack development. This approach enabled iterative development and incremental delivery, allowing for adaptive planning and effective risk mitigation. Systematic delivery of functional increments were ensured by incorporating continuous feedback from supervisor reviews and user validation sessions, which required frequent integration testing and user input.

**Sprint Structure and Ceremonies:** Development was organized into 2-week sprints, each comprising sprint planning, daily standups (self-directed progress tracking), sprint reviews, and retrospectives. Sprint reviews and retrospectives were hosted by the project supervisor to evaluate feature completeness, provide technical guidance, and assess alignment with project objectives. This cadence enabled regular checkpoint validation while maintaining development momentum.

**Requirements Prioritization:** Requirements derived from Section 3.3 were prioritized using the MoSCoW framework, ensuring critical e-commerce and authentication functionality shipped first, followed by differentiating features, and optional enhancements in later sprints.

**Sprint Planning and Feature Allocation:** The table below maps functional requirements to 20 development sprints across the 10-month project timeline, demonstrating progression from foundational backend infrastructure through customer-facing interfaces and advanced AI features.

| Sprint | Duration | Focus Area | Requirements Covered | Deliverables |
|---|---|---|---|---|
| **Sprint 1** | Weeks 1–2 | Project Setup & Backend Foundation | — | Development environment setup, Git repository, MongoDB database schema, Node.js/Express API structure, Mongoose ODM configuration |
| **Sprint 2** | Weeks 3–4 | Authentication & Authorization | ADMIN_01 (partial) | JWT authentication, RBAC implementation, user registration/login endpoints, password hashing |
| **Sprint 3** | Weeks 5–6 | Product Catalog Management (Backend) | ADMIN_01 | Product CRUD endpoints, category management, inventory tracking, image upload functionality |
| **Sprint 4** | Weeks 7–8 | E-Commerce Core (Backend) | CUSTOMER_02, CUSTOMER_03 (partial) | Shopping cart endpoints, checkout flow, order creation, payment integration structure |
| **Sprint 5** | Weeks 9–10 | Order Management System | ADMIN_02, CUSTOMER_03 | Order status tracking, order processing endpoints, refund logic, order export functionality |
| **Sprint 6** | Weeks 11–12 | Web Customer UI (Product & Shopping) | CUSTOMER_01, CUSTOMER_02 | Vue.js customer frontend, product browsing, search/filter, shopping cart UI, checkout interface |
| **Sprint 7** | Weeks 13–14 | Web Admin UI (Product & Order Management) | ADMIN_01, ADMIN_02 | Vue.js admin dashboard, product management UI, order management interface, inventory monitoring |
| **Sprint 8** | Weeks 15–16 | Analytics Dashboard | ADMIN_03 | Real-time sales analytics, revenue tracking, top products reporting, conversion metrics, chart visualizations |
| **Sprint 9** | Weeks 17–18 | Financial Management Module | ADMIN_06 | Cash flow tracking, expense recording, financial reporting, profitability analysis by product |
| **Sprint 10** | Weeks 19–20 | AI Chat Foundation | CUSTOMER_04 (partial) | Google Gemini API integration, basic conversational interface, product recommendation logic |
| **Sprint 11** | Weeks 21–22 | AI Chat Enhancement | CUSTOMER_04, ADMIN_09 | Context-aware dialogue, conversation history, FAQ management, staff escalation mechanism |
| **Sprint 12** | Weeks 23–24 | Live Streaming Backend | CUSTOMER_05 (partial), ADMIN_08 (partial) | WebSocket server, real-time video streaming infrastructure, product pinning logic, viewer tracking |
| **Sprint 13** | Weeks 25–26 | Live Streaming Frontend (Web) | CUSTOMER_05, CUSTOMER_06 (partial), ADMIN_05 (partial) | Web livestream viewer interface, real-time chat UI, product display during streams, host controls |
| **Sprint 14** | Weeks 27–28 | Skin Study Module (Backend & RAG) | CUSTOMER_08 (partial), ADMIN_07 (partial) | Qdrant vector database setup, knowledge base curation (500+ entries), RAG implementation, text chat endpoints |
| **Sprint 15** | Weeks 29–30 | Skin Study Module (Voice & Image Analysis) | CUSTOMER_08, ADMIN_07 | Voice integration, real-time audio streaming, skin image analysis AI, multi-language support |
| **Sprint 16** | Weeks 31–32 | Mobile App (Customer) - Core Features | CUSTOMER_01, CUSTOMER_02, CUSTOMER_06 (partial) | React Native customer app, product browsing, shopping cart, checkout, order tracking |
| **Sprint 17** | Weeks 33–34 | Mobile App (Customer) - Skin Study Integration | CUSTOMER_08 | Skin Study module in mobile app, text chat, live chat, multi-languages integration, image upload, chat history management |
| **Sprint 18** | Weeks 35–36 | Mobile App (Admin) - Livestream Management | ADMIN_05, CUSTOMER_06 | React Native admin app, livestream scheduling, stream management, viewer analytics, cross-platform deployment (iOS/Android) |
| **Sprint 19** | Weeks 37–38 | Email Marketing & HR Features | ADMIN_04, CUSTOMER_10, CUSTOMER_07, CUSTOMER_09, ADMIN_10 (Could) | Email campaign management, customer segmentation, newsletter templates, staff chat, purchase history, HR module (optional) |
| **Sprint 20** | Weeks 39–40 | Testing, Documentation & Deployment | All requirements validation | UAT execution, bug fixes, Swagger API documentation, performance optimization, deployment pipeline, final demo preparation |

**Rationale for Sprint Allocation:** Sprints 1–5 established foundational infrastructure required for all subsequent features. Sprints 6–7 delivered web interfaces enabling early user validation. Sprints 8–9 implemented business management modules for supervisor review. Sprints 10–11 added AI chat personalization. Sprints 12–13 introduced live streaming commerce. Sprints 14–15 implemented the complex Skin Study module with RAG knowledge base and voice/image analysis. Sprints 16–18 extended platform reach via mobile applications for both customer and admin users. Sprint 19 completed secondary features and optional modules. Sprint 20 ensured production readiness through comprehensive testing and deployment preparation.

**Risk Mitigation Through Agile:** Agile Scrum enabled early identification and resolution of technical risks. For example, Sprint 5 livestreaming implementation revealed WebSocket scalability challenges, addressed through architecture refinement before Sprint 7 mobile integration. Sprint 6 Skin Study RAG implementation required knowledge base curation, identified during sprint planning and mitigated through parallel documentation effort.

**Tools and Collaboration:** Version control via Git/GitHub enabled collaborative development and supervisor code review. API documentation via Swagger ensured contract-driven development between frontend and backend. Issue tracking and sprint planning via GitHub Projects maintained visibility into progress and blockers.

## 4.2 Project Plan & Timeline

### Timeline Overview (10 Months, 20 Sprints)

| Phase | Sprints | Weeks | Key Activities | Milestones |
|---|---|---|---|---|
| **Phase 1: Discovery & Planning** | Sprint 1 | Weeks 1–2 (Mar) | Requirements analysis, technology stack selection, environment setup, database schema design | M1: Development environment ready |
| **Phase 2: Foundation Development** | Sprints 2–5 | Weeks 3–10 (Mar–Apr) | Authentication, product catalog, e-commerce backend, order management | M2: Core backend APIs functional |
| **Phase 3: Feature Development (Core)** | Sprints 6–13 | Weeks 11–26 (May–Jul) | Web UIs, analytics, financial module, AI chat, live streaming | M3: Web platform MVP complete |
| **Phase 4: Feature Development (Advanced)** | Sprints 14–18 | Weeks 27–36 (Aug–Oct) | Skin Study module (RAG, voice, image), mobile apps (customer & admin) | M4: Mobile apps deployed |
| **Phase 5: Integration & Finalization** | Sprints 19–20 | Weeks 37–40 (Nov–Dec) | Marketing, HR features, UAT, documentation, deployment | M5: Production deployment |

### Gantt Chart (Visual Timeline)

### Key Milestones

| Milestone | Week | Description | Success Criteria |
|---|---|---|---|
| **M1: Development Environment Ready** | Week 2 | Infrastructure and tooling setup complete | Git repository configured, MongoDB Atlas connected, API framework running, development environment documented |
| **M2: Core Backend APIs Functional** | Week 10 | E-commerce backend operational | Authentication working, product CRUD operational, shopping cart and checkout endpoints tested, order management functional |
| **M3: Web Platform MVP Complete** | Week 26 | Full-featured web application deployed | Customer frontend enables product browsing and purchasing, admin dashboard manages products/orders/analytics, AI chat provides recommendations, live streaming functional on web |
| **M4: Mobile Apps Deployed** | Week 36 | Cross-platform mobile applications launched | Customer app (iOS/Android) with Skin Study module published, admin app with livestream management deployed, mobile-web feature parity achieved |
| **M5: Production Deployment** | Week 40 | Platform production-ready with documentation | UAT completed with stakeholder sign-off, Swagger API documentation finalized, deployment pipeline operational, performance metrics met, final demonstration delivered |

### Phase Descriptions

**Phase 1: Discovery & Planning (Weeks 1–2)** — Established project foundation through requirements finalization, technology stack selection (Node.js, MongoDB, Vue.js, React Native), development environment configuration, and database schema design. This phase ensured alignment between project objectives and technical architecture.

**Phase 2: Foundation Development (Weeks 3–10)** — Implemented core backend infrastructure including JWT authentication with RBAC, product catalog management, e-commerce transaction logic, and order processing systems. This phase delivered the foundational APIs required for all customer-facing and administrative features.

**Phase 3: Feature Development Core (Weeks 11–26)** — Developed customer and admin web interfaces, business management modules (analytics, financial reporting), AI-powered chat with product recommendations, and live streaming commerce infrastructure. This phase delivered the web platform MVP enabling stakeholder validation.

**Phase 4: Feature Development Advanced (Weeks 27–36)** — Implemented advanced AI capabilities (Skin Study module with RAG knowledge base, voice chat, image analysis) and cross-platform mobile applications. This phase extended platform reach and differentiation through specialized dermatology consultation and mobile accessibility.

**Phase 5: Integration & Finalization (Weeks 37–40)** — Completed secondary features (email marketing, staff chat, HR module), conducted comprehensive User Acceptance Testing (UAT), finalized technical documentation, optimized performance, and deployed production infrastructure. This phase ensured production readiness and stakeholder satisfaction.

### Risk Buffer and Contingency Planning

The timeline incorporates buffer time through strategic phase overlap and Sprint 20's dedicated testing period. Should technical risks materialize (e.g., WebSocket scalability issues, RAG knowledge base curation delays), the project plan prioritizes Must-have requirements (Section 3.3) with Should-have and Could-have features deferrable to post-deployment iterations. Weekly supervisor reviews enable early risk identification and adaptive re-planning within 2-week sprint boundaries.


## 4.3 Feasibility Analysis


## 4.4 Evaluation Plan & Success Metrics

**Success Criteria Definition:** Quantitative metrics assess technical performance and functional completeness. Qualitative metrics assess user experience and business value perception. Metrics defined upfront before implementation begins, enabling objective post-project evaluation.

### Quantitative Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| **API Performance** | 500ms response time for 95% of requests under 100 concurrent users | Industry standard for user experience; users perceive <500ms as immediate |
| **Database Performance** | 100ms query execution for 90% of operations | Enables rapid dashboard updates and real-time data display |
| **Concurrent Users** | Platform supports 1,000 concurrent users without >10% performance degradation | Validates scalability for SME growth trajectory |
| **Live Streaming Latency** | <5 second latency for 500 concurrent viewers | Enables real-time interaction feeling; >5s creates awkward conversation gaps |
| **Voice Chat Latency (Skin Study)** | <2 second latency for voice interactions | Enables natural conversation flow; >2s creates awkward pauses in dialogue |
| **Image Analysis Response Time** | <3 seconds for AI skin image analysis | Acceptable for user experience; enables real-time feedback on skin analysis |
| **Feature Completeness** | 100% of Must-have requirements (E-commerce, AI Chat, Skin Study, Live Streaming, Business Modules); 95% of Should-have features; 50% of Could-have features | Prioritization ensures critical functionality ships on time; secondary features may defer |
| **Code Quality** | Modular architecture with clear separation of concerns; unit test coverage ≥70% for critical business logic; zero critical security vulnerabilities in vulnerability scanning | Enables future maintenance and reduces operational risk |
| **Specification Compliance** | All acceptance criteria for user stories met; all 35+ API endpoints documented in Swagger | Validates delivery against requirements |
| **Browser/Device Coverage** | Functional on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+; iOS 14+, Android 10+ | Covers 95%+ of target user devices |
| **Mobile App Performance** | Customer and admin React Native apps functional on iOS 14+ and Android 10+ with <3 second load time | Ensures cross-platform accessibility and performance |
| **Uptime During Testing** | 99.5% availability (≤3.6 hours downtime monthly) | Acceptable for production launch; demonstrates reliability |
| **Skin Study Accuracy** | ≥80% test users perceive AI dermatology recommendations as "accurate" or "very accurate" | Validates core Skin Study feature value; critical for user trust |
| **RAG Knowledge Base** | Qdrant vector database with ≥500 curated dermatology knowledge entries indexed | Ensures comprehensive knowledge base for context-aware responses |

### Qualitative Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| **User Satisfaction (UAT Survey)** | 4.0/5.0 average satisfaction; ≥70% users rate platform "Good" or "Excellent" | Subjective user experience perception; 4/5 indicates platform meets expectations |
| **Ease of Use (System Usability Scale)** | SUS score ≥68 (above average); ≥80% users can complete core workflows without assistance | SUS 68+ indicates good usability; workflow completion validates accessibility |
| **AI Chat Personalization Perceived Value** | ≥80% test users perceive AI chat recommendations as "relevant" or "very relevant" | Validates AI Chat core value proposition; if recommendations perceived as generic, feature fails |
| **Skin Study Feature Satisfaction** | ≥80% test users rate Skin Study feature as "helpful" or "very helpful"; ≥75% perceive voice chat as "natural" or "very natural" | Validates Skin Study core value proposition; critical for dermatology consultation credibility |
| **Live Streaming Engagement** | ≥70% live stream viewers maintain attention >10 minutes; ≥30% viewers purchase products during/within 5 minutes of stream | Validates live streaming engagement; conversion rate benchmarks against e-commerce industry 2-3% baseline |
| **Feature Usefulness (Admin Feedback)** | ≥75% admin users rate analytics dashboard, business modules, and consolidated management as "valuable" or "very valuable" | Validates operational consolidation value proposition; if admins still use multiple systems, platform fails core goal |
| **Mobile App User Experience** | ≥75% mobile app users rate app usability as "good" or "excellent"; ≥80% can complete shopping and Skin Study workflows on mobile | Validates cross-platform accessibility and mobile-first design |
| **Developer Documentation Quality** | ≥75% of developers can deploy code changes using documentation without additional assistance; ≥70% comprehension on first reading; Skin Study integration guide enables independent implementation | Enables future development team independence and reduces support burden |
| **Architecture Clarity** | Technical review finds modular design with appropriate separation of concerns; no circular dependencies or God objects; clear separation between AI modules and core platform | Validates codebase maintainability and extensibility |
| **Performance Under Load Satisfaction** | ≥80% test users perceive platform responsiveness as "fast" or "very fast" during normal load; ≥75% perceive live streaming as "smooth" | Subjective performance perception; important for user retention |
| **Business Module Consolidation Value** | ≥80% admin users report reduced time managing multiple platforms; ≥70% report improved operational efficiency | Validates core SME business value proposition; consolidation of 5-8 platforms into one |
| **AI Dermatology Consultation Trust** | ≥85% Skin Study users perceive recommendations as "trustworthy"; ≥80% cite "evidence-based" and "professional" as key satisfaction factors | Validates Skin Study credibility; critical for health-related feature adoption |
